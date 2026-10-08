"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useRef, type ReactNode } from "react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

interface ScrollCarouselProps {
  children: ReactNode;
  className?: string;
}

/* Pinned horizontal scroll: vertical page scroll scrubs the card track
   sideways. Under reduced motion (or without JS scroll) the same cards fall
   back to a native swipeable strip — every card stays reachable.
   NOTE (Prompt 02): when Lenis lands, wire ScrollTrigger to the Lenis
   scroller here instead of the default viewport scroller. */
export function ScrollCarousel({ children, className = "" }: ScrollCarouselProps) {
  const wrapRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotionSafe();

  useGSAP(
    () => {
      if (prefersReduced === true) return;
      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (wrap === null || track === null) return;

      gsap.registerPlugin(ScrollTrigger);
      const distance = (): number => Math.max(0, track.scrollWidth - wrap.clientWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: wrapRef, dependencies: [prefersReduced] },
  );

  return (
    <section
      ref={wrapRef}
      className={`relative flex min-h-[80svh] flex-col justify-center overflow-hidden ${className}`}
    >
      <div className={prefersReduced === true ? "overflow-x-auto" : "overflow-hidden"}>
        <div ref={trackRef} className="flex w-max items-stretch gap-6 px-6 sm:px-12">
          {children}
        </div>
      </div>
    </section>
  );
}
