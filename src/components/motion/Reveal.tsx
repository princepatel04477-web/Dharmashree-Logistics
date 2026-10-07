"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS } from "@/lib/motion-tokens";

type RevealTag = "div" | "section" | "span" | "p";

interface RevealProps {
  as?: RevealTag;
  delay?: number;
  className?: string;
  children: ReactNode;
}

/* Scroll reveal: rises 24px while fading in, once, at 85% viewport.
   Transform + opacity only — never shifts layout. Static when reduced. */
export function Reveal({ as = "div", delay = 0, className = "", children }: RevealProps) {
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLElement | null>(null);
  const Tag = as;

  useGSAP(
    () => {
      if (reduced || ref.current === null) return;
      gsap.from(ref.current, {
        y: 24,
        opacity: 0,
        duration: MOTION_DURATIONS.md,
        ease: GSAP_EASES.reveal,
        delay,
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      });
    },
    { scope: ref, dependencies: [reduced, delay] },
  );

  return (
    <Tag
      ref={(node: HTMLElement | null): void => {
        ref.current = node;
      }}
      className={className}
    >
      {children}
    </Tag>
  );
}
