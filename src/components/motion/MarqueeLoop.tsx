"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS } from "@/lib/motion-tokens";

interface MarqueeLoopProps {
  children: ReactNode;
  className?: string;
}

/* Seamless ticker: the content is rendered twice and the track loops
   xPercent 0 → −50 forever. No gap, no jump. Static under reduced motion. */
export function MarqueeLoop({ children, className = "" }: MarqueeLoopProps) {
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (reduced || root === null) return;
      const track = root.querySelector("[data-marquee-track]");
      if (track === null) return;
      const tween = gsap.to(track, {
        xPercent: -50,
        duration: MOTION_DURATIONS.xl * 12,
        ease: GSAP_EASES.loop,
        repeat: -1,
      });
      return () => {
        tween.kill();
      };
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div data-marquee-track className="flex w-max will-change-transform">
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden="true" className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
