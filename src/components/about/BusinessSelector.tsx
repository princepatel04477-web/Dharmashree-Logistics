"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { RadioCards, type RadioCardOption } from "@/components/vendor/origin";
import { about, type BusinessKind } from "@/content/about";
import { findService } from "@/content/services";
import type { Service } from "@/content/types";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";

/* "Which business are you?" (Prompt 10). Origin UI's radio cards pick the kind
   of business; Motion owns the swap of the answer panel (one keyed child under
   AnimatePresence, mode "wait"). The mapping is `about.kinds.list`, written
   from the profile's own sentences — a service slug that does not exist is
   skipped here and fails `npm run verify:services`. Under reduced motion the
   panel swaps with zero duration. */

const options: RadioCardOption[] = about.kinds.list.map((kind) => ({
  value: kind.id,
  title: kind.label,
  description: kind.description,
}));

function servicesOf(kind: BusinessKind): Service[] {
  return kind.services
    .map((slug) => findService(slug))
    .filter((service): service is Service => service !== undefined);
}

export function BusinessSelector() {
  const reduced = useReducedMotionSafe();
  const [selectedId, setSelectedId] = useState<string>(about.kinds.list[0]?.id ?? "");
  const selected = about.kinds.list.find((kind) => kind.id === selectedId);
  const duration = reduced ? 0 : MOTION_DURATIONS.xs;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <RadioCards
          label={about.kinds.label}
          options={options}
          value={selectedId}
          onValueChange={setSelectedId}
          className="grid grid-cols-1 gap-3"
        />
      </div>

      <div className="lg:col-span-7" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {selected !== undefined && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration, ease: MOTION_EASES.out }}
              className="border-line flex flex-col gap-6 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10"
            >
              <p className="font-display text-ink leading-headline tracking-display text-2xl sm:text-3xl">
                {selected.note}
              </p>
              <div className="flex flex-col gap-3">
                <p className="label-caps">{about.kinds.servicesLabel}</p>
                <ul className="divide-line border-line divide-y border-y">
                  {servicesOf(selected).map((service) => (
                    <li key={service.slug}>
                      <Link
                        href={`/services/${service.slug}`}
                        className="group/svc flex min-h-14 items-center justify-between gap-4 py-3"
                      >
                        <span>
                          <span className="font-display text-ink group-hover/svc:text-brand-deep block text-xl transition-colors">
                            {service.name}
                          </span>
                          <span className="text-ink-2 block text-sm font-light">
                            {service.summary}
                          </span>
                        </span>
                        <ArrowRightIcon
                          aria-hidden="true"
                          className="text-brand size-4 shrink-0 transition-transform duration-200 group-hover/svc:translate-x-0.5"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
