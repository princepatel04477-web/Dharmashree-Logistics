"use client";

import { useLenis } from "lenis/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { company } from "@/content/company";
import { contactLinks, contactLines, primaryNav, secondaryNav } from "@/content/navigation";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { ScrollTrigger } from "@/lib/gsap";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

/* Full-screen mobile sheet (<1024px). Framer Motion owns the panel: a
   clip-path circle grows from the trigger while the links stagger in behind
   it. The trigger doubles as the close control (hamburger ⇄ ×), so the sheet
   stays non-modal for AT — `aria-modal` would hide the header that holds it.
   Focus is trapped by hand and returned to the trigger on close.

   The panel is portaled to <body>: the header is translated by GSAP, and a
   transformed ancestor would capture this `position: fixed` sheet. */

/** Width at which the desktop nav takes over (Tailwind `lg`). */
const MENU_BREAKPOINT = "(min-width: 64rem)";
const FOCUSABLE = "a[href], button:not([disabled])";
/** Panel reveal per the brief; dismissal snaps back faster. */
const REVEAL_SECONDS = 0.5;
/** Corner distance multiplier so the circle always clears the viewport. */
const REVEAL_PAD = 1.1;
const LINK_STAGGER = 0.06;

/* Client-mounted probe, built on the same `useSyncExternalStore` trick as the
   media-query hooks: the portal needs a `document`, and the prerender has
   none, so the sheet only enters the DOM after hydration. */
function neverChanges(): () => void {
  return () => {};
}
const mountedOnClient = (): boolean => true;
const prerendered = (): boolean => false;

interface CircleOrigin {
  x: number;
  y: number;
  radius: number;
}

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const savedScrollY = useRef(0);
  const pathnameRef = useRef("");
  const reduced = useReducedMotionSafe();
  const pathname = usePathname();
  const lenis = useLenis();
  const [origin, setOrigin] = useState<CircleOrigin | null>(null);
  const mounted = useSyncExternalStore(neverChanges, mountedOnClient, prerendered);

  /* Remember where the trigger sits so the reveal can grow from its centre. */
  const measure = useCallback((): void => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect === undefined) return;
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius =
      Math.max(
        Math.hypot(x, y),
        Math.hypot(window.innerWidth - x, y),
        Math.hypot(x, window.innerHeight - y),
        Math.hypot(window.innerWidth - x, window.innerHeight - y),
      ) * REVEAL_PAD;
    setOrigin({ x, y, radius });
  }, []);

  const close = useCallback((): void => {
    onOpenChange(false);
  }, [onOpenChange]);

  const toggle = useCallback((): void => {
    if (open) {
      onOpenChange(false);
      return;
    }
    measure();
    onOpenChange(true);
  }, [measure, onOpenChange, open]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  /* Scroll lock: lenis.stop() plus the pinned-body rule ported into
     globals.css. Closing the sheet on the same page restores the offset;
     closing it because a link navigated opens the new page at its top. The
     sheet covers the viewport the whole time, so neither is visible. */
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const openedOn = pathnameRef.current;
    savedScrollY.current = window.scrollY;
    body.classList.add("nav-locked");
    body.style.top = `-${savedScrollY.current}px`;
    lenis?.stop();
    return () => {
      body.classList.remove("nav-locked");
      body.style.top = "";
      lenis?.start();
      const target = pathnameRef.current === openedOn ? savedScrollY.current : 0;
      if (lenis !== undefined && lenis !== null) {
        /* Lenis measured the page while the body was pinned (one viewport
           tall), so its scroll limit is 0 and any target would clamp to the
           top. Re-measure before restoring. */
        lenis.resize();
        lenis.scrollTo(target, { immediate: true, force: true });
      } else {
        window.scrollTo(0, target);
      }
      ScrollTrigger.refresh();
    };
  }, [lenis, open]);

  /* Move focus into the sheet once it is in the DOM, trap Tab while it is
     open, close on Escape, hand focus back to the trigger on unmount. */
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const frame = requestAnimationFrame((): void => {
      panelRef.current?.focus({ preventScroll: true });
    });

    const focusables = (): HTMLElement[] => {
      const nodes: HTMLElement[] = [];
      if (trigger !== null) nodes.push(trigger);
      const panel = panelRef.current;
      if (panel !== null) nodes.push(...panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      return nodes;
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = focusables();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (first === undefined || last === undefined) return;
      const active = document.activeElement;
      const onPanel = active === panelRef.current;
      if (event.shiftKey && (onPanel || active === first)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && (onPanel || active === last)) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown, true);
      trigger?.focus({ preventScroll: true });
    };
  }, [close, open]);

  /* A navigation closes the sheet, and so does widening past `lg`. */
  useEffect(() => {
    close();
  }, [close, pathname]);

  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia(MENU_BREAKPOINT);
    const onChange = (event: MediaQueryListEvent): void => {
      if (event.matches) close();
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [close, open]);

  const centre = `${origin?.x ?? 0}px ${origin?.y ?? 0}px`;
  const closedClip = `circle(0px at ${centre})`;
  const openClip = `circle(${origin?.radius ?? 0}px at ${centre})`;

  const panelVariants: Variants = {
    hidden: {
      clipPath: closedClip,
      transition: { duration: reduced ? 0 : MOTION_DURATIONS.xs, ease: MOTION_EASES.inOut },
    },
    visible: {
      clipPath: openClip,
      transition: {
        duration: reduced ? 0 : REVEAL_SECONDS,
        ease: MOTION_EASES.inOut,
        when: "beforeChildren",
        delayChildren: reduced ? 0 : 0.12,
        staggerChildren: reduced ? 0 : LINK_STAGGER,
      },
    },
    exit: {
      clipPath: closedClip,
      transition: { duration: reduced ? 0 : MOTION_DURATIONS.xs, ease: MOTION_EASES.inOut },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : MOTION_DURATIONS.sm, ease: MOTION_EASES.out },
    },
    exit: { opacity: 0, transition: { duration: reduced ? 0 : MOTION_DURATIONS.xs } },
  };

  const links = contactLinks();
  const lines = contactLines();

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className={cn(
          "border-line text-ink hover:border-brand hover:text-brand-deep",
          "inline-flex size-11 shrink-0 items-center justify-center rounded-xs border transition-colors duration-200",
        )}
      >
        <span aria-hidden="true" className="relative block h-3 w-5">
          <motion.span
            className="absolute top-0 left-0 h-px w-full bg-current"
            initial={false}
            animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            transition={{
              duration: reduced ? 0 : MOTION_DURATIONS.xs + 0.1,
              ease: MOTION_EASES.inOut,
            }}
          />
          <motion.span
            className="absolute top-3 left-0 h-px w-full bg-current"
            initial={false}
            animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            transition={{
              duration: reduced ? 0 : MOTION_DURATIONS.xs + 0.1,
              ease: MOTION_EASES.inOut,
            }}
          />
        </span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="mobile-menu"
                id="mobile-menu"
                ref={panelRef}
                role="dialog"
                aria-label={`${company.name} menu`}
                tabIndex={-1}
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  /* pt matches the 64px header so the trigger stays clickable. */
                  "bg-paper safe-b fixed inset-0 z-40 flex flex-col justify-between gap-10",
                  "overflow-y-auto overscroll-contain pt-16 pb-8 outline-none lg:hidden",
                )}
              >
                <div className="wrap flex flex-col gap-8">
                  <motion.p variants={itemVariants} className="section-index">
                    Menu · {company.headquarters.city}
                  </motion.p>

                  <nav aria-label="Primary, mobile">
                    <ul className="flex flex-col">
                      {primaryNav.map((item, index) => {
                        const active =
                          pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                          <motion.li key={item.href} variants={itemVariants}>
                            <Link
                              href={item.href}
                              onClick={close}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "font-display relative flex items-baseline justify-between gap-4 py-3",
                                "leading-headline tracking-display text-4xl",
                                active ? "text-brand" : "text-ink-2 hover:text-ink",
                                "transition-colors duration-200",
                              )}
                            >
                              <span className="relative">
                                {item.label}
                                {active && (
                                  <span
                                    aria-hidden="true"
                                    className="bg-brand absolute -bottom-1 left-0 h-0.5 w-full"
                                  />
                                )}
                              </span>
                              <span className="label-caps shrink-0">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </nav>

                  <motion.nav
                    variants={itemVariants}
                    aria-label="More, mobile"
                    className="border-line flex flex-wrap gap-x-8 gap-y-1 border-t pt-4"
                  >
                    {secondaryNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                        className="text-ink-2 hover:text-brand-deep inline-flex min-h-11 items-center font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.nav>
                </div>

                {(links.length > 0 || lines.length > 0) && (
                  <motion.div
                    variants={itemVariants}
                    className="wrap border-line flex flex-col gap-3 border-t pt-6"
                  >
                    {lines.map((line) =>
                      line.href === null ? (
                        <p key={line.text} className="text-ink-2 text-sm font-light">
                          {line.text}
                        </p>
                      ) : (
                        <a
                          key={line.text}
                          href={line.href}
                          target="_blank"
                          rel="noopener"
                          className="text-ink-2 hover:text-brand-deep text-sm font-light transition-colors duration-200"
                        >
                          {line.text}
                        </a>
                      ),
                    )}
                    {links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target={link.kind === "whatsapp" ? "_blank" : undefined}
                        rel={link.kind === "whatsapp" ? "noopener" : undefined}
                        className="font-display text-ink hover:text-brand-deep text-lg transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
