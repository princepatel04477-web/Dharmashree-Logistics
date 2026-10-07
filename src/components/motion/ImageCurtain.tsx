"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS } from "@/lib/motion-tokens";

interface ImageCurtainProps {
  children: ReactNode;
  className?: string;
}

/* Curtain reveal: a clip-path wipe opens downward while the image settles
   from a 1.08 counter-scale. Clip + transform only — no layout shift.
   Renders open when reduced. */
export function ImageCurtain({ children, className = "" }: ImageCurtainProps) {
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (reduced || root === null) return;
      const curtain = root.querySelector("[data-curtain]");
      const inner = root.querySelector("[data-curtain-inner]");
      if (curtain === null || inner === null) return;
      const trigger = { trigger: root, start: "top 85%", once: true } as const;
      gsap.fromTo(
        curtain,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: MOTION_DURATIONS.lg,
          ease: GSAP_EASES.reveal,
          scrollTrigger: trigger,
        },
      );
      gsap.fromTo(
        inner,
        { scale: 1.08 },
        {
          scale: 1,
          duration: MOTION_DURATIONS.lg,
          ease: GSAP_EASES.reveal,
          scrollTrigger: trigger,
        },
      );
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div data-curtain className="h-full w-full will-change-[clip-path]">
        <div data-curtain-inner className="h-full w-full will-change-transform">
          {children}
        </div>
      </div>
    </div>
  );
}
