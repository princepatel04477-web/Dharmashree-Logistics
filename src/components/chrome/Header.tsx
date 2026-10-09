"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Magnet } from "@/components/vendor/reactbits";
import { company } from "@/content/company";
import { logo, primaryNav, quoteCta } from "@/content/navigation";
import { UtilityBar } from "./UtilityBar";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_EASES } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { WhatsAppButton } from "./WhatsAppButton";

/* Site header (Prompt 04) — 64px on mobile, 72px from `lg` up, paper ground,
   fixed so the page scrolls beneath it. From `lg` a 32px utility bar sits above
   it inside the same fixed element, so the two hide and reveal together.

   Scroll behaviour is GSAP's (house rule 8): a ScrollTrigger toggles the
   `is-scrolled` class past 24px, which fades the bottom hairline in, and a
   second one hides the bar on scroll-down past 120px and reveals it on
   scroll-up. Motion owns the shared `layoutId` underline. While the mobile
   sheet is open or focus sits inside the header, it never hides. */

const NAV_UNDERLINE_ID = "nav-underline";
/** Scroll distance before the bottom hairline appears (px). */
const HAIRLINE_AFTER_PX = 24;
/** Scroll distance before the bar may hide (px). */
const HIDE_AFTER_PX = 120;
/** Per-frame movement needed to count as a deliberate direction change. */
const DIRECTION_DEAD_ZONE_PX = 4;
const HEADER_TRAVEL_SECONDS = 0.35;
/** Shared `layoutId` slide + hover draw, per the brief. */
const UNDERLINE_SECONDS = 0.3;

export function Header() {
  const pathname = usePathname();
  const reduced = useReducedMotionSafe();
  const headerRef = useRef<HTMLElement>(null);
  const shownRef = useRef(true);
  const lockedRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const setShown = useCallback(
    (show: boolean): void => {
      const header = headerRef.current;
      if (header === null || shownRef.current === show) return;
      shownRef.current = show;
      gsap.to(header, {
        yPercent: show ? 0 : -100,
        duration: reduced ? 0 : HEADER_TRAVEL_SECONDS,
        ease: GSAP_EASES.reveal,
        overwrite: "auto",
      });
    },
    [reduced],
  );

  useGSAP(
    () => {
      const header = headerRef.current;
      if (header === null) return;

      const hairline = ScrollTrigger.create({
        start: HAIRLINE_AFTER_PX,
        end: "max",
        toggleClass: { className: "is-scrolled", targets: header },
      });

      let last = window.scrollY;
      const travel = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self): void => {
          const y = self.scroll();
          const delta = y - last;
          last = y;
          if (lockedRef.current || header.contains(document.activeElement)) {
            setShown(true);
            return;
          }
          if (delta > DIRECTION_DEAD_ZONE_PX && y > HIDE_AFTER_PX) setShown(false);
          else if (delta < -DIRECTION_DEAD_ZONE_PX) setShown(true);
        },
      });

      return () => {
        hairline.kill();
        travel.kill();
      };
    },
    { dependencies: [setShown] },
  );

  /* The sheet, and the focus ring, both pin the header in place. */
  useEffect(() => {
    lockedRef.current = menuOpen;
    if (menuOpen) setShown(true);
  }, [menuOpen, setShown]);

  /* Every navigation starts at the top of the page with the bar visible. */
  useEffect(() => {
    setShown(true);
  }, [pathname, setShown]);

  return (
    <header ref={headerRef} className="bg-paper group fixed inset-x-0 top-0 z-50">
      <UtilityBar />
      <span
        aria-hidden="true"
        className="bg-line pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity duration-300 group-[.is-scrolled]:opacity-100"
      />

      <div className="wrap flex h-16 items-center justify-between gap-3 lg:h-18 lg:gap-8">
        <Link
          href="/"
          aria-label={`${company.name} — home`}
          className="flex shrink-0 flex-col justify-center transition-opacity duration-200 hover:opacity-70"
        >
          {/* The Link's aria-label names it, so the image itself is decorative. */}
          <Image
            src={logo.src}
            alt=""
            width={logo.width}
            height={logo.height}
            priority
            className="h-8 w-auto lg:h-10"
          />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-9">
            {primaryNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group/nav relative inline-flex py-1 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200",
                      active ? "text-brand" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {item.label}
                    {active ? (
                      <motion.span
                        layoutId={NAV_UNDERLINE_ID}
                        aria-hidden="true"
                        className="bg-brand pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5"
                        transition={{ duration: UNDERLINE_SECONDS, ease: MOTION_EASES.out }}
                      />
                    ) : (
                      /* Hover draws the same hairline left → right. */
                      <span
                        aria-hidden="true"
                        className="bg-brand pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover/nav:scale-x-100"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Renders nothing at all when company.whatsapp is null; the
              hairline chip only shows from `lg`, where the FAB variant
              stands down. */}
          <WhatsAppButton className="hidden lg:inline-flex" />

          <Magnet strength={10}>
            <Button asChild variant="default">
              <Link href={quoteCta.href}>
                <span className="sm:hidden">{quoteCta.compactLabel}</span>
                <span className="hidden sm:inline">{quoteCta.label}</span>
              </Link>
            </Button>
          </Magnet>

          <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
        </div>
      </div>
    </header>
  );
}
