"use client";

import { useRef, type RefObject } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { processSteps, sectionHeadings, type ProcessStep } from "@/content/home";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/* H4 · How a consignment moves. From `lg` up the section pins and a scrubbed
   timeline walks the four steps: the giant number crossfades, the step text
   slides in, the accent rail draws and each node fills. Below 1024px — and
   whenever reduced motion is on — there is no pin at all: the same steps
   stack, reveal on scroll, and the rail stays a plain hairline.

   GSAP owns every animated node here, so those elements carry no Tailwind
   transform/opacity utilities of their own: v4 writes the standalone `scale`
   and `translate` properties, which would fight the tweened `transform`. The
   rail is built inline rather than with `DrawLine` because it is
   scrub-positioned, not entry-drawn — the same reasoning the map used instead
   of `CorridorTrace`. */

const DESKTOP_QUERY = "(min-width: 64rem)";
const PIN_RANGE = "+=250%";
/** Timeline units spent on each step. */
const STEP_UNIT = 1;
/** Crossfade length, in timeline units. */
const CROSSFADE = 0.3;
/** Mobile step stagger — the hero's rhythm, tightened. */
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

export function ProcessSection() {
  const reduced = useReducedMotionSafe();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const pinned = isDesktop && !reduced;

  const heading = sectionHeadings.process;
  const stageRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const numberRefs = useRef<(HTMLElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLElement | null)[]>([]);
  const fillRef = useRef<HTMLSpanElement>(null);

  /* The longest step holds the stage open while the others sit absolutely on
     top of it, so nothing clips and nothing has to be measured. */
  const tallest = processSteps.reduce<ProcessStep | null>(
    (tallest, step) =>
      tallest === null || step.body.length > tallest.body.length ? step : tallest,
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
        const number = picked([numberRefs.current[index] ?? null]);
        const entering = [...step, ...number];
        timeline.set(entering, { autoAlpha: 0, y: 22 }, 0);
        timeline.to(
          entering,
          { autoAlpha: 1, y: 0, duration: CROSSFADE, ease: "power2.out" },
          at + CROSSFADE,
        );
        timeline.to(
          picked([stepRefs.current[index - 1] ?? null, numberRefs.current[index - 1] ?? null]),
          { autoAlpha: 0, y: -20, duration: CROSSFADE, ease: "power1.in" },
          at,
        );
      });

      /* No cleanup here on purpose: the trigger and the timeline are created
         inside useGSAP's context, so reverting it (on a deps change or
         unmount) is what un-pins the section and restores every inline style
         — same contract `Reveal`/`DrawLine` rely on. */
    },
    { scope: stageRef, dependencies: [pinned] },
  );

  return (
    <section className="border-line border-t py-24 sm:py-28 lg:py-32">
      <div className="wrap">
        <div ref={stageRef} className="flex flex-col gap-12">
          <SectionHeading
            index={heading.index}
            title={heading.title}
            titleClassName="font-display text-headline text-ink leading-headline font-light tracking-display"
          />

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
            {pinned && (
              <div className="relative lg:col-span-4" aria-hidden="true">
                {/* The grid cell is stretched to the row height, so the
                    absolutely stacked numbers need no sizer of their own. */}
                {processSteps.map((_, index) => (
                  <span
                    key={`number-${index}`}
                    ref={refAt(numberRefs, index)}
                    className={cn(
                      "font-display text-display text-ink leading-display tracking-display absolute inset-0 block font-light",
                      index > 0 && "opacity-0",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                ))}
              </div>
            )}

            <div className={pinned ? "lg:col-span-5" : "lg:col-span-8"}>
              {pinned && tallest !== null ? (
                <div className="relative">
                  <div aria-hidden="true" className="invisible">
                    <p className="section-index">01</p>
                    <div className="font-display leading-headline tracking-display mt-3 text-3xl font-light">
                      {tallest.title}
                    </div>
                    <p className="text-ink-2 max-w-measure mt-4 text-base font-light">
                      {tallest.body}
                    </p>
                  </div>
                  {processSteps.map((step, index) => (
                    <div
                      key={step.title}
                      ref={refAt(stepRefs, index)}
                      className={cn("absolute inset-0 flex flex-col", index > 0 && "opacity-0")}
                    >
                      <p className="section-index">{String(index + 1).padStart(2, "0")}</p>
                      <h3 className="font-display text-ink leading-headline tracking-display mt-3 text-3xl font-light">
                        {step.title}
                      </h3>
                      <p className="text-ink-2 max-w-measure mt-4 text-base font-light">
                        {step.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <ol className="border-line flex flex-col gap-10 border-l pl-8">
                  {processSteps.map((step, index) => (
                    <li key={step.title} className="relative">
                      <span
                        aria-hidden="true"
                        className="border-line-strong bg-paper absolute top-2 -left-[calc(2rem+5px)] size-2.5 rounded-full border"
                      />
                      <Reveal delay={index * STEP_REVEAL_STAGGER}>
                        <p className="section-index">{String(index + 1).padStart(2, "0")}</p>
                        <h3 className="font-display text-ink leading-headline tracking-display mt-2 text-2xl font-light">
                          {step.title}
                        </h3>
                        <p className="text-ink-2 max-w-measure mt-3 text-sm font-light">
                          {step.body}
                        </p>
                      </Reveal>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {pinned && (
              <div className="lg:col-span-3" aria-hidden="true">
                <div className="relative flex h-full flex-col justify-between py-1">
                  <span className="bg-line absolute inset-y-0 left-[4.5px] w-px" />
                  <span
                    ref={fillRef}
                    className="bg-accent absolute inset-y-0 left-[4.5px] w-px origin-top"
                  />
                  {processSteps.map((step, index) => (
                    <span key={`rail-${step.title}`} className="relative block size-2.5">
                      <span className="border-line-strong bg-paper absolute inset-0 rounded-full border" />
                      <span
                        ref={refAt(nodeRefs, index)}
                        /* GSAP writes inline `opacity`, which wins over this
                           class, so it only sets the pre-tween state. */
                        className={cn(
                          "bg-accent absolute inset-0 rounded-full",
                          index > 0 && "opacity-0",
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
