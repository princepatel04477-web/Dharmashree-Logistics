"use client";

import type { LenisOptions } from "lenis";
import { ReactLenis, type LenisRef } from "lenis/react";
import { MotionConfig } from "motion/react";
import { useRef, type ReactNode } from "react";
import "lenis/dist/lenis.css";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";

const LENIS_OPTIONS: LenisOptions = {
  lerp: 0.1,
  smoothWheel: true,
  autoRaf: false,
};

/* One motion system: Lenis drives scroll, GSAP's ticker drives Lenis's rAF,
   ScrollTrigger reads scroll position from Lenis, and Motion handles the
   finishing layer. Under reduced motion Lenis never mounts and the page
   scrolls natively. */
export function MotionProviders({ children }: { children: ReactNode }) {
  const reduced = useReducedMotionSafe();
  const lenisRef = useRef<LenisRef>(null);

  useGSAP(
    () => {
      if (reduced) {
        document.documentElement.setAttribute("data-reduced-motion", "true");
        ScrollTrigger.config({ ignoreMobileResize: true });
        return;
      }
      document.documentElement.removeAttribute("data-reduced-motion");
      const lenis = lenisRef.current?.lenis;
      if (lenis === undefined || lenis === null) return;
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
    },
    { dependencies: [reduced] },
  );

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: MOTION_DURATIONS.sm, ease: MOTION_EASES.out }}
    >
      {reduced ? (
        children
      ) : (
        <ReactLenis root ref={lenisRef} options={LENIS_OPTIONS}>
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
