"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { ReadyChecklist } from "@/components/support/ReadyChecklist";
import { track } from "@/content/track";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";

/* "No AWB or tracking number?" (Prompt 12): a disclosure that opens onto the
   booking-or-invoice-reference guidance and the four things to keep ready.
   Motion owns the height and fade (AnimatePresence); the button carries
   `aria-expanded` and `aria-controls`. Zero duration under reduced motion. */
export function NoNumberPanel() {
  const reduced = useReducedMotionSafe();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const copy = track.noNumber;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-ink-2 max-w-measure leading-body text-sm font-light">{copy.body}</p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="text-accent-ink hover:text-ink inline-flex min-h-11 items-center gap-2 self-start font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
      >
        {open ? copy.toggleClose : copy.toggleOpen}
        <span aria-hidden="true" className="text-accent">
          {open ? "−" : "+"}
        </span>
      </button>
      <div id={panelId}>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="checklist"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: reduced ? 0 : MOTION_DURATIONS.sm,
                ease: MOTION_EASES.out,
              }}
              className="overflow-hidden"
            >
              <ReadyChecklist label={copy.checklistLabel} items={copy.checklist} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
