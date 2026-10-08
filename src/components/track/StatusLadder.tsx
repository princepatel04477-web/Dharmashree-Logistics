"use client";

import { useRef } from "react";
import { FaqAccordion } from "@/components/vendor/origin";
import type { Faq } from "@/content/types";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS } from "@/lib/motion-tokens";

interface StatusLadderProps {
  items: readonly Faq[];
}

/* The seven shipment statuses as a ladder (Prompt 12). This is an explainer, not
   a result: no shipment is shown against it, so nothing on the page can claim to
   know where a consignment is. GSAP owns the accent rail beside the list — it
   draws down the list's height on entry — and Origin UI's accordion owns the
   open/close of each status. Under reduced motion the rail is already drawn. */
export function StatusLadder({ items }: StatusLadderProps) {
  const reduced = useReducedMotionSafe();
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const rail = railRef.current;
      const root = rootRef.current;
      if (reduced || rail === null || root === null) return;
      gsap.fromTo(
        rail,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: MOTION_DURATIONS.lg,
          ease: GSAP_EASES.draw,
          scrollTrigger: { trigger: root, start: "top 80%", once: true },
        },
      );
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <div ref={rootRef} className="relative pl-6 sm:pl-8">
      <span aria-hidden="true" className="bg-line absolute inset-y-0 left-0 w-px" />
      <span
        ref={railRef}
        aria-hidden="true"
        className="bg-accent absolute inset-y-0 left-0 w-px origin-top"
      />
      <FaqAccordion items={[...items]} />
    </div>
  );
}
