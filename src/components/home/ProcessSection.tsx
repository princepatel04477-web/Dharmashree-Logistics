"use client";

import { useRef, type RefObject } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { processSteps, sectionHeadings, type ProcessStep } from "@/content/home";
import { images } from "@/content/images";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, settleScrollTriggers, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { processIcon, SECTION_TITLE_CLASS } from "./shared";
import { SlotPhoto } from "./SlotPhoto";

/* H4 · How a consignment moves, on white. From `lg` up the section pins and a
   scrubbed timeline walks the four steps: the photo and the step text crossfade,
   the brand rail draws and each node fills. Below 1024px, and whenever reduced
   motion is on, there is no pin at all: the same steps stack as photo + text
   rows and reveal on scroll.

   GSAP owns every animated node here, so those elements carry no Tailwind
   transform/opacity utilities of their own beyond the pre-tween state: v4
   writes the standalone `scale` and `translate` properties, which would fight
   the tweened `transform`. Each step's large number sits on an amber badge with
   ink text (text on `--highway` is always `--ink`). */

const DESKTOP_QUERY = "(min-width: 64rem)";
const PIN_RANGE = "+=250%";
/** Timeline units spent on each step. */
const STEP_UNIT = 1;
/** Crossfade length, in timeline units. */
const CROSSFADE = 0.3;
/** Stacked-step stagger. */
const STEP_REVEAL_STAGGER = 0.06;

const PHOTO_SIZES = "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 456px";

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

function StepNumber({ index }: { index: number }) {
  return (
    <span
      aria-hidden="true"
      className="bg-highway text-ink font-display tracking-display inline-flex w-fit rounded-md px-4 py-2 text-4xl leading-none sm:text-5xl"
    >
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

function StepCopy({
  step,
  index,
  compact,
}: {
  step: ProcessStep;
  index: number;
  compact: boolean;
}) {
  return (
    <>
      <StepNumber index={index} />
      <h3
        className={cn(
          "font-display text-ink leading-headline tracking-display mt-5",
          compact ? "text-2xl" : "text-3xl",
        )}
      >
        {step.title}
      </h3>
      <p className="text-ink/75 max-w-measure mt-3 text-base font-light">{step.body}</p>
    </>
  );
}

export function ProcessSection() {
  const reduced = useReducedMotionSafe();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const pinned = isDesktop && !reduced;

  const heading = sectionHeadings.process;
  const stageRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const photoRefs = useRef<(HTMLElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLElement | null)[]>([]);
  const fillRef = useRef<HTMLSpanElement>(null);

  /* The longest step holds the stage open while the others sit absolutely on
     top of it, so nothing clips and nothing has to be measured. */
  const tallest = processSteps.reduce<ProcessStep | null>(
    (best, step) => (best === null || step.body.length > best.body.length ? step : best),
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
          start: "center center",
          end: PIN_RANGE,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const fill = fillRef.current;
      if (fill !== null) {
        timeline.fromTo(
          fill,
          { scaleY: 0 },
          { scaleY: 1, duration: processSteps.length * STEP_UNIT },
          0,
        );
      }

      processSteps.forEach((_, index) => {
        const at = index * STEP_UNIT;
        const node = picked([nodeRefs.current[index] ?? null]);
        if (node.length > 0) {
          timeline.to(node, { opacity: 1, duration: 0.15 }, at + 0.04);
        }
        if (index === 0) return;

        const step = picked([stepRefs.current[index] ?? null]);
        const photo = picked([photoRefs.current[index] ?? null]);
        timeline.set(step, { autoAlpha: 0, y: 22 }, 0);
        timeline.set(photo, { autoAlpha: 0 }, 0);
        timeline.to(
          step,
          { autoAlpha: 1, y: 0, duration: CROSSFADE, ease: "power2.out" },
          at + CROSSFADE,
        );
        /* Later photos sit above earlier ones, so a fade-in is the crossfade. */
        timeline.to(photo, { autoAlpha: 1, duration: CROSSFADE * 1.5 }, at + CROSSFADE * 0.5);
        timeline.to(
          picked([stepRefs.current[index - 1] ?? null]),
          { autoAlpha: 0, y: -20, duration: CROSSFADE, ease: "power1.in" },
          at,
        );
      });

      settleScrollTriggers();

      /* No cleanup here on purpose: the trigger and the timeline are created
         inside useGSAP's context, so reverting it (on a deps change or
         unmount) is what un-pins the section and restores every inline style. */
    },
    { scope: stageRef, dependencies: [pinned] },
  );

  return (
    <section className="bg-paper py-20 sm:py-24 lg:py-28">
      <div className="wrap">
        <div ref={stageRef} className="flex flex-col gap-10 sm:gap-12">
          <SectionHeading
            index={heading.index}
            title={heading.title}
            titleClassName={SECTION_TITLE_CLASS}
          />

          {pinned && tallest !== null ? (
            <div className="grid grid-cols-12 items-stretch gap-10">
              {/* The four photographs, stacked; later ones fade in on top. */}
              <div className="bg-brand-tint relative col-span-5 aspect-[4/3] overflow-hidden rounded-md">
                {processSteps.map((step, index) => (
                  <div
                    key={step.id}
                    ref={refAt(photoRefs, index)}
                    className={cn("absolute inset-0", index > 0 && "opacity-0")}
                  >
                    <SlotPhoto
                      slot={images.process[step.id]}
                      icon={processIcon(step.id)}
                      sizes={PHOTO_SIZES}
                    />
                  </div>
                ))}
              </div>

              <div className="relative col-span-1 flex justify-center" aria-hidden="true">
                <div className="relative flex h-full flex-col items-center justify-between py-1">
                  <span className="bg-line-strong absolute inset-y-0 left-1/2 w-px -translate-x-1/2" />
                  <span
                    ref={fillRef}
                    className="bg-brand absolute inset-y-0 left-1/2 w-px origin-top -translate-x-1/2"
                  />
                  {processSteps.map((step, index) => (
                    <span key={`rail-${step.id}`} className="relative block size-3">
                      <span className="border-line-strong bg-paper absolute inset-0 rounded-full border" />
                      <span
                        ref={refAt(nodeRefs, index)}
                        /* GSAP writes inline opacity, which wins over this
                           class, so it only sets the pre-tween state. */
                        className={cn(
                          "bg-brand absolute inset-0 rounded-full",
                          index > 0 && "opacity-0",
                        )}
                      />
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative col-span-6 flex items-center">
                <div className="relative w-full">
                  <div aria-hidden="true" className="invisible flex flex-col">
                    <StepCopy step={tallest} index={0} compact={false} />
                  </div>
                  {processSteps.map((step, index) => (
                    <div
                      key={step.id}
                      ref={refAt(stepRefs, index)}
                      className={cn("absolute inset-0 flex flex-col", index > 0 && "opacity-0")}
                    >
                      <StepCopy step={step} index={index} compact={false} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ol className="flex flex-col gap-12 sm:gap-14">
              {processSteps.map((step, index) => (
                <li key={step.id}>
                  <Reveal
                    delay={index * STEP_REVEAL_STAGGER}
                    className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10"
                  >
                    <div className="bg-brand-tint aspect-[4/3] overflow-hidden rounded-md">
                      <SlotPhoto
                        slot={images.process[step.id]}
                        icon={processIcon(step.id)}
                        sizes={PHOTO_SIZES}
                      />
                    </div>
                    <div className="flex flex-col">
                      <StepCopy step={step} index={index} compact />
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
