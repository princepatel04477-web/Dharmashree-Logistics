"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { useHoverCapable } from "@/hooks/use-hover-capable";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  /** Hover elevation (`--shadow-card`). On by default; a dense grid of cards
     turns it off and keeps the tilt, the lift and the border response. */
  shadow?: boolean;
}

/* Hover-tilt card: ±3.5° follow, 4px lift, hairline-to-strong border. No
   gradients, no glows — motion stays within the 12px / 1.02 budget. Static
   on touch devices and under reduced motion. */
export function InteractiveCard({ children, className = "", shadow = true }: InteractiveCardProps) {
  const canHover = useHoverCapable();
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [3.5, -3.5]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-3.5, 3.5]), {
    stiffness: 200,
    damping: 20,
  });

  const enabled = canHover && prefersReduced !== true;

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>): void => {
    if (ref.current === null) return;
    const rect = ref.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = (): void => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  /* Written out in both branches: Tailwind has to see the literal utility. */
  const elevation = shadow ? "hover:shadow-card" : "";

  return (
    <motion.div
      ref={ref}
      onMouseMove={enabled ? handleMouseMove : undefined}
      onMouseLeave={enabled ? handleMouseLeave : undefined}
      style={enabled ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      whileHover={enabled ? { y: -4, scale: 1.005 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`border-line bg-paper-2 hover:border-line-strong rounded-xs border transition-colors duration-200 ${elevation} ${className}`}
    >
      {children}
    </motion.div>
  );
}
