"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Magnet } from "@/components/vendor/reactbits";
import { company } from "@/content/company";
import { logo, portalNav, primaryNav, quoteCta } from "@/content/navigation";
import { UtilityBar } from "./UtilityBar";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MOTION_EASES } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

/* Site header (Prompt 04) — 64px on mobile, 72px from `lg` up, paper ground,
   fixed so the page scrolls beneath it. From `lg` a 32px utility bar sits above
   it inside the same fixed element. The header is frozen: always visible, never
   hides on scroll.

   The one scroll behaviour is GSAP's (house rule 8): a ScrollTrigger toggles
   the `is-scrolled` class past 24px, which fades the bottom hairline in. Motion
   owns the shared `layoutId` underline.

   The right-hand cluster, from `lg`: the two portal sign-ins as outline buttons,
   then the one filled "Enquire now". There is no room left for the WhatsApp
   chip at any width (the container is capped), so on desktop WhatsApp lives in
   the footer and on /contact; the floating button covers mobile. Between
   1024px and 1279px the portal buttons use their shorter `compactLabel`s, and
   the logo and nav gaps tighten (logo from 1120px), so the bar neither wraps
   nor overflows; from 1280px they carry the full labels. Below `lg` the
   portals move into the mobile sheet. */

const NAV_UNDERLINE_ID = "nav-underline";
/** Scroll distance before the bottom hairline appears (px). */
const HAIRLINE_AFTER_PX = 24;
/** Shared `layoutId` slide + hover draw, per the brief. */
const UNDERLINE_SECONDS = 0.3;

export function Header() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(() => {
    const header = headerRef.current;
    if (header === null) return;

    const hairline = ScrollTrigger.create({
      start: HAIRLINE_AFTER_PX,
      end: "max",
      toggleClass: { className: "is-scrolled", targets: header },
    });

    return () => {
      hairline.kill();
    };
  });

  return (
    <header ref={headerRef} className="bg-paper group fixed inset-x-0 top-0 z-50">
      <UtilityBar />
      <span
        aria-hidden="true"
        className="bg-line pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity duration-300 group-[.is-scrolled]:opacity-100"
      />

      <div className="wrap flex h-16 items-center justify-between gap-3 lg:h-18 lg:gap-4 xl:gap-8">
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
            className="h-8 w-auto min-[1120px]:h-10"
          />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-2 min-[1120px]:gap-5 min-[1440px]:gap-8">
            {primaryNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group/nav nav-link relative inline-flex py-1 whitespace-nowrap transition-colors duration-200",
                      active ? "text-brand" : "text-brand-deep hover:text-brand",
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

        <div className="flex shrink-0 items-center gap-2 min-[1440px]:gap-3">
          {/* Portal sign-ins: outline, so "Enquire now" stays the only filled
              button. A null portal URL never reaches this list. */}
          {portalNav.links.length > 0 && (
            <nav aria-label={portalNav.ariaLabel} className="hidden lg:block">
              <ul className="flex items-center gap-2">
                {portalNav.links.map((link) => (
                  <li key={link.id}>
                    <Button asChild variant="outline" size="sm">
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        <span className="min-[1440px]:hidden">{link.compactLabel}</span>
                        <span className="hidden min-[1440px]:inline">{link.label}</span>
                        <span className="sr-only"> {portalNav.newTabHint}</span>
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

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
