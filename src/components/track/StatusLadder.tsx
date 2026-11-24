"use client";

import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Faq } from "@/content/types";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS } from "@/lib/motion-tokens";

/** One status. `attention` marks the one that needs the sender to act. */
export type StatusItem = Faq & { readonly attention?: boolean };

interface StatusLadderProps {
  items: readonly StatusItem[];
}

/* The seven shipment statuses as a ladder (Prompt 12). This is an explainer, not
   a result: no shipment is shown against it, so nothing on the page can claim to
   know where a consignment is. GSAP owns the brand rail beside the list — it
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
        className="bg-brand absolute inset-y-0 left-0 w-px origin-top"
      />
      {/* Each status sits on the rail as a dot: --brand, and --signal-red for
          the one that needs attention (a small mark, never text). */}
      <Accordion type="single" collapsible>
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`status-${String(index)}`} className="relative">
            <span
              aria-hidden="true"
              className={`${
                item.attention === true ? "bg-signal-red" : "bg-brand"
              } border-paper absolute top-[1.4rem] -left-[calc(1.5rem+6px)] size-3 rounded-full border-2 sm:-left-[calc(2rem+6px)]`}
            />
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
