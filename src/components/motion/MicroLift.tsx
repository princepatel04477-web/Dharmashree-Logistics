"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";

interface MicroLiftProps {
  children: ReactNode;
  className?: string;
}

/* Finishing layer (Motion, not GSAP): fades up into view once at 85%
   viewport, lifts 2px on hover, presses to 0.99 on tap. MotionConfig's
   reducedMotion="user" strips the movement when the OS asks for it. */
export function MicroLift({ children, className = "" }: MicroLiftProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: MOTION_DURATIONS.sm, ease: MOTION_EASES.out }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      {children}
    </motion.div>
  );
}
