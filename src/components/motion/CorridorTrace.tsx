"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS } from "@/lib/motion-tokens";

interface CorridorTraceProps {
  children: ReactNode;
  className?: string;
}

/* Scroll-linked corridor tracer. Descendant `path[data-trace]` elements draw
   while the section is the active corridor (top 70% → bottom 40%) and
   reverse out when it leaves. `data-corridor-active` mirrors the state for
   styling and E2E assertions. No paths, no tween — never an orphan. */
export function CorridorTrace({ children, className = "" }: CorridorTraceProps) {
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (root === null) return;
      if (reduced) {
        root.setAttribute("data-corridor-active", "false");
        return;
      }
      const paths = root.querySelectorAll<SVGPathElement>("path[data-trace]");
      if (paths.length === 0) return;
      root.setAttribute("data-corridor-active", "false");
      const tween = gsap.fromTo(
        paths,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: MOTION_DURATIONS.lg,
          ease: GSAP_EASES.draw,
          scrollTrigger: {
            trigger: root,
            start: "top 70%",
            end: "bottom 40%",
            toggleActions: "play reverse play reverse",
            onToggle: (self) => {
              root.setAttribute("data-corridor-active", String(self.isActive));
            },
          },
        },
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        root.setAttribute("data-corridor-active", "false");
      };
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <div ref={ref} data-corridor-active="false" className={className}>
      {children}
    </div>
  );
}
