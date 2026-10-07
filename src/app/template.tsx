"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { ScrollTrigger } from "@/lib/gsap";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";

/* Route transition: the outgoing page is covered by an accent wipe rising
   from the bottom, the incoming page is revealed as the wipe lifts away,
   and content crossfades underneath. After the swap, dead ScrollTriggers
   are killed, scroll returns to top, and ScrollTrigger re-measures.
   No transition at all under reduced motion. */
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotionSafe();
  const lenis = useLenis();

  if (reduced) return <>{children}</>;

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => {
        for (const trigger of ScrollTrigger.getAll()) {
          if (trigger.trigger === undefined || !document.contains(trigger.trigger)) {
            trigger.kill();
          }
        }
        if (lenis === undefined || lenis === null) {
          window.scrollTo(0, 0);
        } else {
          lenis.scrollTo(0, { immediate: true });
        }
        ScrollTrigger.refresh();
      }}
    >
      <motion.div
        key={`page-${pathname}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
      >
        {children}
      </motion.div>
      <motion.div
        key={`wipe-${pathname}`}
        aria-hidden="true"
        className="bg-ink pointer-events-none fixed inset-0 z-[90]"
        initial={{ scaleY: 1, transformOrigin: "top" }}
        animate={{ scaleY: 0, transformOrigin: "top" }}
        exit={{ scaleY: 1, transformOrigin: "bottom" }}
        transition={{ duration: MOTION_DURATIONS.sm, ease: MOTION_EASES.inOut }}
      />
    </AnimatePresence>
  );
}
