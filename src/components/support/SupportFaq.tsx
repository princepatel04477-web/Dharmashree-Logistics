"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { SegmentedSwitch } from "@/components/services/signature/SegmentedSwitch";
import { FaqAccordion } from "@/components/vendor/origin";
import { support, supportFaqs, supportTopics, type SupportTopic } from "@/content/support";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";

/* The support FAQ with its topic filter (Prompt 12). Motion owns the filter bar
   (the shared 1px accent bar slides between topics) and the swap of the list —
   `layout` lets the container follow the height of whatever the filter leaves,
   and the keyed child fades. Origin UI's accordion owns each question's
   open/close; it is remounted per topic, so the open question resets with the
   list instead of pointing at an item that is no longer there. */

type Filter = SupportTopic | "all";

const options: readonly { readonly id: Filter; readonly label: string }[] = [
  { id: "all", label: support.faq.allLabel },
  ...supportTopics,
];

function isFilter(value: string): value is Filter {
  return options.some((option) => option.id === value);
}

export function SupportFaq() {
  const reduced = useReducedMotionSafe();
  const [filter, setFilter] = useState<Filter>("all");

  const shown = useMemo(
    () =>
      filter === "all" ? [...supportFaqs] : supportFaqs.filter((entry) => entry.topic === filter),
    [filter],
  );

  return (
    <div className="flex flex-col gap-8">
      <SegmentedSwitch
        label={support.faq.filterLabel}
        options={options}
        value={filter}
        onChange={(next) => {
          if (isFilter(next)) setFilter(next);
        }}
      />
      <p className="text-muted font-mono text-[11px] tracking-[0.08em]" aria-live="polite">
        {support.faq.resultsLine(shown.length, supportFaqs.length)}
      </p>
      <motion.div layout={!reduced} transition={{ duration: reduced ? 0 : MOTION_DURATIONS.sm }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: reduced ? 0 : MOTION_DURATIONS.xs,
              ease: MOTION_EASES.out,
            }}
          >
            {shown.length > 0 ? (
              <FaqAccordion items={shown.map(({ question, answer }) => ({ question, answer }))} />
            ) : (
              <p className="text-ink-2 text-sm font-light">{support.faq.emptyLine}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
