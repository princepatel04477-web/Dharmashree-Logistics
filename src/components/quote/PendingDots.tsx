"use client";

import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/** The submit button's waiting state: three dots while the request is with the
    desk. The label is a separate `sr-only` line, so the button always has an
    accessible name — "Sending" is announced, not three empty spans. */
export function PendingDots({ label }: { label: string }) {
  const reduced = useReducedMotionSafe();

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          aria-hidden="true"
          className="size-1 rounded-full bg-current"
          animate={reduced ? { opacity: 1 } : { opacity: [0.25, 1, 0.25] }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 1, repeat: Infinity, delay: index * 0.15, ease: "easeInOut" }
          }
        />
      ))}
    </span>
  );
}
