"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { useHoverCapable } from "@/hooks/use-hover-capable";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

interface MagnetProps {
  children: ReactNode;
  className?: string;
  /** Maximum pull toward the cursor, in px. */
  strength?: number;
}

/* Magnetic wrapper: drifts its child toward the cursor on hover-capable
   pointers. Reserved for the primary CTA and the WhatsApp button. */
export function Magnet({ children, className = "", strength = 18 }: MagnetProps) {
  const canHover = useHoverCapable();
  const prefersReduced = useReducedMotionSafe();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 15, stiffness: 150, mass: 0.1 });
  const springY = useSpring(y, { damping: 15, stiffness: 150, mass: 0.1 });

  const enabled = canHover && prefersReduced !== true;

  const handleMouseMove = (event: MouseEvent<HTMLSpanElement>): void => {
    if (!enabled || ref.current === null) return;
    const { clientX, clientY } = event;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    x.set(((clientX - (left + width / 2)) / (width / 2)) * strength);
    y.set(((clientY - (top + height / 2)) / (height / 2)) * strength);
  };

  const handleMouseLeave = (): void => {
    x.set(0);
    y.set(0);
  };

  if (!enabled) {
    return (
      <span ref={ref} className={`relative inline-flex items-center justify-center ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      {children}
    </motion.span>
  );
}
