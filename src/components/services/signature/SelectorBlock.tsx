"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowLink } from "@/components/layout/ArrowLink";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { SegmentedSwitch } from "@/components/services/signature/SegmentedSwitch";
import { RadioCards, type RadioCardOption } from "@/components/vendor/origin";
import { quoteCta, quoteHrefForService } from "@/content/navigation";
import { serviceDetail } from "@/content/services";
import type { SelectorSignature } from "@/content/types";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";

/* Local on-demand's signature (Prompt 11): "What are you sending?" and
   "When does it have to move?". Origin UI's radio cards take the choice; Motion
   owns the swap of each answer (one keyed child under AnimatePresence) and the
   scheduled / urgent bar. The vehicle line only ever repeats what the profile
   says — a two-wheeler for a document or small parcel, a larger vehicle for
   cartons, inventory or supplies — and ends in the quote link for this service. */

interface SelectorBlockProps {
  signature: SelectorSignature;
  serviceSlug: string;
}

export function SelectorBlock({ signature, serviceSlug }: SelectorBlockProps) {
  const reduced = useReducedMotionSafe();
  const [optionId, setOptionId] = useState<string>(signature.options[0]?.id ?? "");
  const [modeId, setModeId] = useState<string>(signature.modes[0]?.id ?? "");
  const option = signature.options.find((entry) => entry.id === optionId);
  const mode = signature.modes.find((entry) => entry.id === modeId);
  const swap = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: reduced ? 0 : MOTION_DURATIONS.xs, ease: MOTION_EASES.out },
  };

  const cards: RadioCardOption[] = signature.options.map((entry) => ({
    value: entry.id,
    title: entry.label,
  }));

  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <div className="wrap flex flex-col gap-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <SectionHeading
              index={serviceDetail.signatureEyebrow}
              title={signature.title}
              titleClassName="font-display text-ink text-step-3 leading-headline tracking-display font-light"
            />
          </div>
          <p className="text-ink-2 max-w-measure leading-body text-base font-light lg:col-span-5 lg:col-start-8 lg:pt-8">
            {signature.lede}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <RadioCards
              label={signature.questionLabel}
              options={cards}
              value={optionId}
              onValueChange={setOptionId}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1"
            />
          </div>

          <div className="border-line lg:col-span-7 lg:border-l lg:pl-10" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {option !== undefined && (
                <motion.div key={option.id} {...swap} className="flex flex-col gap-5">
                  <p className="label-caps">{signature.vehicleLabel}</p>
                  <p className="font-display text-ink leading-display tracking-display text-4xl font-light sm:text-5xl">
                    {option.vehicle}
                  </p>
                  <p className="text-ink-2 max-w-measure leading-body text-base font-light">
                    {option.body}
                  </p>
                  <ArrowLink href={quoteHrefForService(serviceSlug)} label={quoteCta.label} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="border-line grid grid-cols-1 gap-8 border-t pt-10 lg:grid-cols-12 lg:gap-10">
          <SegmentedSwitch
            label={signature.modesLabel}
            options={signature.modes}
            value={modeId}
            onChange={setModeId}
            className="lg:col-span-5"
          />
          <div className="lg:col-span-6 lg:col-start-7" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {mode !== undefined && (
                <motion.div key={mode.id} {...swap} className="flex flex-col gap-3">
                  <h3 className="font-display text-ink leading-headline tracking-display text-3xl font-light">
                    {mode.title}
                  </h3>
                  <p className="text-ink-2 max-w-measure leading-body text-base font-light">
                    {mode.body}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
