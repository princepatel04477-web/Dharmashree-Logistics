"use client";

import { useRef } from "react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS } from "@/lib/motion-tokens";

interface DrawLineProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/* Section divider: an accent hairline (60% opacity) that draws itself on
   entry. Fully drawn when reduced. Vertical lines fill the parent height. */
export function DrawLine({ orientation = "horizontal", className = "" }: DrawLineProps) {
  const reduced = useReducedMotionSafe();
  const lineRef = useRef<SVGLineElement>(null);

  useGSAP(
    () => {
      const line = lineRef.current;
      if (reduced || line === null) return;
      gsap.fromTo(
        line,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: MOTION_DURATIONS.md,
          ease: GSAP_EASES.draw,
          scrollTrigger: { trigger: line, start: "top 90%", once: true },
        },
      );
    },
    { dependencies: [reduced, orientation] },
  );

  if (orientation === "vertical") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 1 100"
        preserveAspectRatio="none"
        className={`block h-full w-px ${className}`}
      >
        <line
          ref={lineRef}
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="100"
          stroke="var(--brand)"
          strokeOpacity={0.6}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 1"
      preserveAspectRatio="none"
      className={`block h-px w-full ${className}`}
    >
      <line
        ref={lineRef}
        x1="0"
        y1="0.5"
        x2="100"
        y2="0.5"
        stroke="var(--brand)"
        strokeOpacity={0.6}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
