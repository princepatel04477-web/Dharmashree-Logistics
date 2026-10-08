"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { SegmentedSwitch } from "@/components/services/signature/SegmentedSwitch";
import { serviceDetail } from "@/content/services";
import type { JourneySignature } from "@/content/types";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { numbered } from "@/lib/utils";

/* Express parcel's signature (Prompt 11): a journey line that the scroll draws
   from the visitor's door to the delivery, then a B2B / B2C / Bulk switch.

   GSAP owns the line, the nodes and the stop captions (one scrubbed timeline);
   Motion owns the switch bar and the swap of the segment panel. They never
   touch the same element. Wide viewports get the horizontal line; below 640px
   — and whenever reduced motion is on — the stops are a plain list with the
   line already drawn. */

const WIDE_QUERY = "(min-width: 40rem)";

export function JourneyBlock({ signature }: { signature: JourneySignature }) {
  const reduced = useReducedMotionSafe();
  const wide = useMediaQuery(WIDE_QUERY);
  const rootRef = useRef<HTMLDivElement>(null);
  const [segmentId, setSegmentId] = useState<string>(signature.segments[0]?.id ?? "");
  const segment = signature.segments.find((entry) => entry.id === segmentId);
  const animated = wide && !reduced;
  const count = signature.stops.length;
  const inset = `${String(50 / count)}%`;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!animated || root === null) return;
      const line = root.querySelector<HTMLElement>("[data-line]");
      const nodes = root.querySelectorAll<HTMLElement>("[data-node]");
      const stops = root.querySelectorAll<HTMLElement>("[data-stop]");
      if (line === null) return;

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root, start: "top 78%", end: "bottom 58%", scrub: 0.6 },
      });
      timeline.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: count - 1 }, 0);
      nodes.forEach((node, position) => {
        timeline.fromTo(node, { opacity: 0 }, { opacity: 1, duration: 0.2 }, position);
      });
      stops.forEach((stop, position) => {
        timeline.fromTo(
          stop,
          { autoAlpha: 0.3, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
          Math.max(0, position - 0.2),
        );
      });
    },
    { scope: rootRef, dependencies: [animated, count] },
  );

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

        <div ref={rootRef}>
          {wide ? (
            <ol
              className="relative grid gap-6"
              style={{ gridTemplateColumns: `repeat(${String(count)}, minmax(0, 1fr))` }}
            >
              <span
                aria-hidden="true"
                className="bg-line absolute top-[5px] h-px"
                style={{ left: inset, right: inset }}
              />
              <span
                aria-hidden="true"
                data-line=""
                className="bg-accent absolute top-[5px] h-px origin-left"
                style={{ left: inset, right: inset }}
              />
              {signature.stops.map((stop, position) => (
                <li key={stop.title} className="flex flex-col items-center gap-4 text-center">
                  <span className="relative block size-2.5">
                    <span className="border-line-strong bg-paper absolute inset-0 rounded-full border" />
                    <span data-node="" className="bg-accent absolute inset-0 rounded-full" />
                  </span>
                  <div data-stop="" className="flex flex-col gap-2">
                    <p className="section-index">{numbered(position)}</p>
                    <h3 className="font-display text-ink leading-headline tracking-display text-2xl font-light">
                      {stop.title}
                    </h3>
                    <p className="text-ink-2 leading-body mx-auto max-w-[16rem] text-sm font-light">
                      {stop.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <ol className="border-line flex flex-col gap-8 border-l pl-8">
              {signature.stops.map((stop, position) => (
                <li key={stop.title} className="relative">
                  <span
                    aria-hidden="true"
                    className="border-line-strong bg-paper absolute top-2 -left-[calc(2rem+5px)] size-2.5 rounded-full border"
                  />
                  <p className="section-index">{numbered(position)}</p>
                  <h3 className="font-display text-ink leading-headline tracking-display mt-2 text-2xl font-light">
                    {stop.title}
                  </h3>
                  <p className="text-ink-2 leading-body mt-2 text-sm font-light">{stop.body}</p>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <SegmentedSwitch
            label={signature.segmentsLabel}
            options={signature.segments}
            value={segmentId}
            onChange={setSegmentId}
            className="lg:col-span-5"
          />
          <div className="lg:col-span-6 lg:col-start-7" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {segment !== undefined && (
                <motion.div
                  key={segment.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: reduced ? 0 : MOTION_DURATIONS.xs,
                    ease: MOTION_EASES.out,
                  }}
                  className="flex flex-col gap-3"
                >
                  <h3 className="font-display text-ink leading-headline tracking-display text-3xl font-light">
                    {segment.title}
                  </h3>
                  <p className="text-ink-2 max-w-measure leading-body text-base font-light">
                    {segment.body}
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
