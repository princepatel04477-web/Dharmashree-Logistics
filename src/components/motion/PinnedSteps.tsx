"use client";

import { useRef, type RefObject } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/* A scrubbed, pinned walk through a short list of titled steps — the same
   timeline the home page's "How a consignment moves" uses (Prompt 05), made
   reusable for the About commitments (Prompt 10). From `lg` up the section
   pins and one scrub timeline crossfades the big numeral and the step text
   while an accent rail fills and its nodes light. Below 1024px, and whenever
   reduced motion is on, there is no pin at all: the same steps stack, reveal on
   scroll, and the rail stays a plain hairline.

   GSAP owns every animated node, so those elements carry no Tailwind
   transform/opacity utilities of their own (v4 writes the standalone `scale`
   and `translate` properties, which would fight the tweened `transform`). */

export interface PinnedStep {
  readonly title: string;
  readonly body: readonly string[];
}

interface PinnedStepsProps {
  index: string;
  title: string;
  /** One line under the heading, outside the pinned stage's travel. */
  lede?: string;
  steps: readonly PinnedStep[];
}

const DESKTOP_QUERY = "(min-width: 64rem)";
const PIN_RANGE = "+=300%";
/** Timeline units spent on each step. */
const STEP_UNIT = 1;
/** Crossfade length, in timeline units. */
const CROSSFADE = 0.3;
const STEP_REVEAL_STAGGER = 0.06;

type ElementList = RefObject<(HTMLElement | null)[]>;

function refAt(list: ElementList, index: number): (node: HTMLElement | null) => void {
  return (node: HTMLElement | null): void => {
    list.current[index] = node;
  };
}

/** GSAP warns on null targets, so every tween gets a filtered list. */
function picked(nodes: (HTMLElement | null)[]): HTMLElement[] {
  return nodes.filter((node): node is HTMLElement => node !== null);
}

function numeral(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/** The step with the most text sizes the stage; the others sit on top of it. */
function weight(step: PinnedStep): number {
  return step.body.reduce((sum, paragraph) => sum + paragraph.length, step.title.length);
}

export function PinnedSteps({ index, title, lede, steps }: PinnedStepsProps) {
  const reduced = useReducedMotionSafe();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const pinned = isDesktop && !reduced;

  const stageRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const numberRefs = useRef<(HTMLElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLElement | null)[]>([]);
  const fillRef = useRef<HTMLSpanElement>(null);

  const tallest = steps.reduce<PinnedStep | null>(
    (best, step) => (best === null || weight(step) > weight(best) ? step : best),
    null,
  );

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!pinned || stage === null) return;

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: PIN_RANGE,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const fill = fillRef.current;
      if (fill !== null) {
        timeline.fromTo(fill, { scaleY: 0 }, { scaleY: 1, duration: steps.length * STEP_UNIT }, 0);
      }

      steps.forEach((_, position) => {
        const at = position * STEP_UNIT;
        const node = picked([nodeRefs.current[position] ?? null]);
        if (node.length > 0) {
          timeline.to(node, { opacity: 1, duration: 0.15 }, at + 0.04);
        }
        if (position === 0) return;

        const step = picked([stepRefs.current[position] ?? null]);
        const number = picked([numberRefs.current[position] ?? null]);
        const entering = [...step, ...number];
        timeline.set(entering, { autoAlpha: 0, y: 22 }, 0);
        timeline.to(
          entering,
          { autoAlpha: 1, y: 0, duration: CROSSFADE, ease: "power2.out" },
          at + CROSSFADE,
        );
        timeline.to(
          picked([
            stepRefs.current[position - 1] ?? null,
            numberRefs.current[position - 1] ?? null,
          ]),
          { autoAlpha: 0, y: -20, duration: CROSSFADE, ease: "power1.in" },
          at,
        );
      });

      /* No cleanup on purpose: the trigger and the timeline live in useGSAP's
         context, so reverting it (deps change or unmount) un-pins the section
         and restores every inline style. */
    },
    { scope: stageRef, dependencies: [pinned] },
  );

  return (
    <section className="border-line border-t py-24 sm:py-28 lg:py-32">
      <div className="wrap">
        <div ref={stageRef} className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <SectionHeading
              index={index}
              title={title}
              titleClassName="font-display text-headline text-ink leading-headline font-light tracking-display"
            />
            {lede !== undefined && (
              <Reveal as="p" className="text-ink-2 max-w-measure leading-body text-base font-light">
                {lede}
              </Reveal>
            )}
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
            {pinned && (
              <div className="relative lg:col-span-4" aria-hidden="true">
                {steps.map((step, position) => (
                  <span
                    key={`number-${step.title}`}
                    ref={refAt(numberRefs, position)}
                    /* A template string, not `cn`: tailwind-merge reads `text-display` as
                       a colour and drops it in favour of `text-ink`, which left the
                       numeral at body size. */
                    className={`font-display text-display text-ink leading-display tracking-display absolute inset-0 block font-light ${position > 0 ? "opacity-0" : ""}`}
                  >
                    {numeral(position)}
                  </span>
                ))}
              </div>
            )}

            <div className={pinned ? "lg:col-span-6" : "lg:col-span-8"}>
              {pinned && tallest !== null ? (
                <div className="relative">
                  <div aria-hidden="true" className="invisible">
                    <p className="section-index">01</p>
                    <div className="font-display leading-headline tracking-display mt-3 text-3xl font-light">
                      {tallest.title}
                    </div>
                    {tallest.body.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-ink-2 max-w-measure mt-4 text-base font-light"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {steps.map((step, position) => (
                    <div
                      key={step.title}
                      ref={refAt(stepRefs, position)}
                      className={cn("absolute inset-0 flex flex-col", position > 0 && "opacity-0")}
                    >
                      <p className="section-index">{numeral(position)}</p>
                      <h3 className="font-display text-ink leading-headline tracking-display mt-3 text-3xl font-light">
                        {step.title}
                      </h3>
                      {step.body.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-ink-2 max-w-measure mt-4 text-base font-light"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <ol className="border-line flex flex-col gap-10 border-l pl-8">
                  {steps.map((step, position) => (
                    <li key={step.title} className="relative">
                      <span
                        aria-hidden="true"
                        className="border-line-strong bg-paper absolute top-2 -left-[calc(2rem+5px)] size-2.5 rounded-full border"
                      />
                      <Reveal delay={position * STEP_REVEAL_STAGGER}>
                        <p className="section-index">{numeral(position)}</p>
                        <h3 className="font-display text-ink leading-headline tracking-display mt-2 text-2xl font-light">
                          {step.title}
                        </h3>
                        {step.body.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-ink-2 max-w-measure mt-3 text-sm font-light"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </Reveal>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {pinned && (
              <div className="lg:col-span-2" aria-hidden="true">
                <div className="relative flex h-full flex-col justify-between py-1">
                  <span className="bg-line absolute inset-y-0 left-[4.5px] w-px" />
                  <span
                    ref={fillRef}
                    className="bg-accent absolute inset-y-0 left-[4.5px] w-px origin-top"
                  />
                  {steps.map((step, position) => (
                    <span key={`rail-${step.title}`} className="relative block size-2.5">
                      <span className="border-line-strong bg-paper absolute inset-0 rounded-full border" />
                      <span
                        ref={refAt(nodeRefs, position)}
                        className={cn(
                          "bg-accent absolute inset-0 rounded-full",
                          position > 0 && "opacity-0",
                        )}
                      />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
