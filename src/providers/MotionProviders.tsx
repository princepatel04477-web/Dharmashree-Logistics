"use client";

import type { LenisOptions } from "lenis";
import { ReactLenis, useLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import "lenis/dist/lenis.css";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, ScrollTrigger, settleScrollTriggers } from "@/lib/gsap";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";

const LENIS_OPTIONS: LenisOptions = {
  lerp: 0.1,
  smoothWheel: true,
  autoRaf: false,
};

/* The bridge lives *inside* `ReactLenis` and reads the instance through
   `useLenis()`. That is the only reliable way to get it: `ReactLenis` creates
   the Lenis instance in its own effect and publishes it through state, so a ref
   read from the parent's effect is still `undefined` on the first run — the
   ticker was then never registered, `autoRaf` is off, and Lenis swallowed every
   wheel / trackpad gesture without ever moving the page (the scrollbar and the
   keyboard kept working, which is how it slipped through). Depending on the
   instance re-runs this once it exists. */
function LenisBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (lenis === undefined) return;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number): void => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(tick);
    };
  }, [lenis]);

  return null;
}

/* Every navigation opens the new page at its top. Next's own scroll-to-top
   measures the page's first box, and the route template wraps each page in a
   `display: contents` element that has none, so Next decides the page is
   already in view and leaves the old offset in place (and Lenis keeps it).
   The first run is the initial load, which keeps the browser's restored
   position; a hash link keeps its anchor. The instance is read through a ref
   so its arrival after hydration does not count as a navigation. */
function RouteScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const firstRun = useRef(true);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (window.location.hash !== "") return;
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}

/* One motion system: Lenis drives scroll, GSAP's ticker drives Lenis's rAF,
   ScrollTrigger reads scroll position from Lenis, and Motion handles the
   finishing layer. Under reduced motion Lenis never mounts and the page
   scrolls natively. */
export function MotionProviders({ children }: { children: ReactNode }) {
  const reduced = useReducedMotionSafe();

  /* Every pin position depends on the height of everything above it, and that
     height is still changing after hydration: web fonts swap in, the lazy map
     mounts, images decode. Without a re-measure the pins keep the numbers they
     took on the first paint and a pinned stage ends up drawn over the band below
     it. Re-measure when the fonts are ready, when the page has loaded and
     whenever the document's own height changes. */
  useEffect(() => {
    const settle = (): void => {
      settleScrollTriggers(150);
    };
    window.addEventListener("load", settle);
    void document.fonts.ready.then(settle);
    let lastHeight = Math.round(document.body.getBoundingClientRect().height);
    const observer = new ResizeObserver((entries) => {
      const height = Math.round(entries[0]?.contentRect.height ?? lastHeight);
      if (height === lastHeight) return;
      lastHeight = height;
      settle();
    });
    observer.observe(document.body);
    return () => {
      window.removeEventListener("load", settle);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduced) {
      document.documentElement.setAttribute("data-reduced-motion", "true");
      ScrollTrigger.config({ ignoreMobileResize: true });
    } else {
      document.documentElement.removeAttribute("data-reduced-motion");
    }
  }, [reduced]);

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: MOTION_DURATIONS.sm, ease: MOTION_EASES.out }}
    >
      {reduced ? (
        <>
          <RouteScrollReset />
          {children}
        </>
      ) : (
        <ReactLenis root options={LENIS_OPTIONS}>
          <LenisBridge />
          <RouteScrollReset />
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
