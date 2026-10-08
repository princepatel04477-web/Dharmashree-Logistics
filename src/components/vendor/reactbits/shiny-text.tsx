"use client";

import type { CSSProperties } from "react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

/* Sheen sweep across deep-gold text. Single production use: the branch
   announcement label (rendered only when company.branches is non-empty).
   Static solid text when disabled or under reduced motion. */
export function ShinyText({ text, disabled = false, speed = 4, className = "" }: ShinyTextProps) {
  const prefersReduced = useReducedMotionSafe();
  const static_ = disabled || prefersReduced === true;

  if (static_) {
    return <span className={`text-gold-deep inline-block ${className}`}>{text}</span>;
  }

  const style: CSSProperties = {
    backgroundImage:
      "linear-gradient(120deg, var(--gold-deep) 0%, var(--gold-deep) 40%, color-mix(in srgb, var(--gold-deep) 20%, var(--paper-2)) 50%, var(--gold-deep) 60%, var(--gold-deep) 100%)",
    backgroundSize: "200% 100%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    animationDuration: `${speed}s`,
  };

  return (
    <span className={`animate-shimmer inline-block ${className}`} style={style}>
      {text}
    </span>
  );
}
