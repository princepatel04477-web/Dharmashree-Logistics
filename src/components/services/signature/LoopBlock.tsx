"use client";

import { useRef } from "react";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { InteractiveCard } from "@/components/vendor/lightswind";
import { serviceDetail } from "@/content/services";
import type { LoopSignature } from "@/content/types";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, numbered } from "@/lib/utils";

/* Warehousing's signature (Prompt 11), two parts.

   1. The fulfilment loop. From `lg` up the stage pins and one scrub timeline
      draws the pipeline Storage → Inventory → Pick & pack → Dispatch, lights each
      node, crossfades the stage caption, then draws the returns arc from Dispatch
      back into Inventory. Below 1024px, and under reduced motion, nothing pins:
      the drawing is complete and the stages are a stacked list.
   2. The four capabilities as Lightswind cards in an asymmetric 7/5 · 5/7
      layout — never an equal row (house rule 7). The vendored tilt stays; the
      hover elevation is off, as on the fleet grid.

   GSAP owns the drawing and the captions; the cards are Lightswind's own. */

const DESKTOP_QUERY = "(min-width: 64rem)";
const PIN_RANGE = "+=220%";
const VIEW_W = 640;
const VIEW_H = 190;
const LINE_Y = 60;
const RETURN_Y = 168;

/** x of each node, spread evenly with a margin for the arrowhead. */
function nodeX(position: number, count: number): number {
  const margin = 56;
  const span = VIEW_W - margin * 2;
  return margin + (span * position) / Math.max(1, count - 1);
}

export function LoopBlock({ signature }: { signature: LoopSignature }) {
  const reduced = useReducedMotionSafe();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const pinned = isDesktop && !reduced;
  const stageRef = useRef<HTMLDivElement>(null);
  const count = signature.stages.length;

  /* Returns: from the last node, down and back along the bottom to the second. */
  const lastX = nodeX(count - 1, count);
  const backX = nodeX(1, count);
  const returnPath = `M ${String(lastX)} ${String(LINE_Y + 12)} C ${String(lastX)} ${String(RETURN_Y)}, ${String(backX)} ${String(RETURN_Y)}, ${String(backX)} ${String(LINE_Y + 14)}`;

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!pinned || stage === null) return;
      const line = stage.querySelector<SVGLineElement>("[data-line]");
      const arc = stage.querySelector<SVGPathElement>("[data-return]");
      const nodes = stage.querySelectorAll<SVGElement>("[data-node]");
      const captions = stage.querySelectorAll<HTMLElement>("[data-caption]");
      const tail = stage.querySelectorAll<SVGElement>("[data-return-head], [data-return-label]");
      if (line === null || arc === null) return;

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

      timeline.fromTo(line, { drawSVG: "0%" }, { drawSVG: "100%", duration: count - 1 }, 0);
      nodes.forEach((node, position) => {
        timeline.fromTo(node, { opacity: 0 }, { opacity: 1, duration: 0.2 }, position);
      });
      captions.forEach((caption, position) => {
        if (position === 0) return;
        timeline.set(caption, { autoAlpha: 0, y: 16 }, 0);
        timeline.to(
          captions[position - 1] ?? caption,
          { autoAlpha: 0, y: -14, duration: 0.25, ease: "power1.in" },
          position - 0.3,
        );
        timeline.to(
          caption,
          { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
          position - 0.1,
        );
      });
      timeline.fromTo(arc, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1 }, count - 1);
      timeline.fromTo(tail, { opacity: 0 }, { opacity: 1, duration: 0.4 }, count - 0.4);
    },
    { scope: stageRef, dependencies: [pinned, count] },
  );

  return (
    <>
      <section>
        <div ref={stageRef} className="py-14 sm:py-16 lg:py-20">
          <div className="wrap flex flex-col gap-10">
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

            <svg
              viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}
              role="presentation"
              aria-hidden="true"
              className="text-ink-2 mx-auto w-full max-w-3xl"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line
                x1={nodeX(0, count)}
                y1={LINE_Y}
                x2={lastX}
                y2={LINE_Y}
                className="stroke-line-strong"
                strokeWidth="1"
              />
              <line
                data-line=""
                x1={nodeX(0, count)}
                y1={LINE_Y}
                x2={lastX}
                y2={LINE_Y}
                className="stroke-accent"
                strokeWidth="1"
              />
              <path
                data-return=""
                d={returnPath}
                className="stroke-accent"
                strokeWidth="1"
                strokeDasharray="none"
              />
              <path
                data-return-head=""
                d={`M ${String(backX - 5)} ${String(LINE_Y + 24)} L ${String(backX)} ${String(LINE_Y + 14)} L ${String(backX + 5)} ${String(LINE_Y + 24)}`}
                className="stroke-accent"
                strokeWidth="1"
              />
              {signature.stages.map((stage, position) => (
                <g key={stage.title}>
                  <circle
                    cx={nodeX(position, count)}
                    cy={LINE_Y}
                    r="6"
                    className="fill-paper stroke-line-strong"
                    strokeWidth="1"
                  />
                  <circle
                    data-node=""
                    cx={nodeX(position, count)}
                    cy={LINE_Y}
                    r="3"
                    className="fill-accent stroke-none"
                  />
                  <text
                    x={nodeX(position, count)}
                    y={LINE_Y - 20}
                    textAnchor="middle"
                    className="fill-ink-2 font-mono"
                    fontSize="11"
                    letterSpacing="1.4"
                  >
                    {stage.title.toUpperCase()}
                  </text>
                </g>
              ))}
              <text
                data-return-label=""
                x={(lastX + backX) / 2}
                y={RETURN_Y - 8}
                textAnchor="middle"
                className="fill-muted font-mono"
                fontSize="10"
                letterSpacing="1.2"
              >
                {signature.returnLabel.toUpperCase()}
              </text>
            </svg>

            {pinned ? (
              <div className="relative mx-auto h-28 w-full max-w-xl text-center">
                {signature.stages.map((stage, position) => (
                  <div
                    key={stage.title}
                    data-caption=""
                    className={cn(
                      "absolute inset-0 flex flex-col items-center gap-2",
                      position > 0 && "opacity-0",
                    )}
                  >
                    <p className="section-index">{numbered(position)}</p>
                    <h3 className="font-display text-ink leading-headline tracking-display text-2xl font-light">
                      {stage.title}
                    </h3>
                    <p className="text-ink-2 leading-body text-sm font-light">{stage.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <ol className="border-line flex flex-col gap-6 border-l pl-8">
                {signature.stages.map((stage, position) => (
                  <li key={stage.title} className="relative">
                    <span
                      aria-hidden="true"
                      className="border-line-strong bg-paper absolute top-2 -left-[calc(2rem+5px)] size-2.5 rounded-full border"
                    />
                    <p className="section-index">{numbered(position)}</p>
                    <h3 className="font-display text-ink leading-headline tracking-display mt-1 text-xl font-light">
                      {stage.title}
                    </h3>
                    <p className="text-ink-2 leading-body mt-1 text-sm font-light">{stage.body}</p>
                  </li>
                ))}
                <li className="text-muted font-mono text-[11px] tracking-[0.08em]">
                  {signature.returnLabel}
                </li>
              </ol>
            )}
          </div>
        </div>
      </section>

      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap flex flex-col gap-10">
          <SectionHeading
            index={serviceDetail.signatureEyebrow}
            title={signature.capabilitiesTitle}
            titleClassName="font-display text-ink text-step-3 leading-headline tracking-display font-light"
          />
          <ul className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {signature.capabilities.map((item, position) => {
              /* 7 · 5 on the first row, 5 · 7 on the second. */
              const wide = position % 4 === 0 || position % 4 === 3;
              return (
                <li key={item.title} className={wide ? "lg:col-span-7" : "lg:col-span-5"}>
                  <InteractiveCard shadow={false} className="h-full p-6 sm:p-8">
                    <div className="flex h-full flex-col gap-4">
                      <p className="section-index">{numbered(position)}</p>
                      <h3 className="font-display text-ink leading-headline tracking-display text-2xl font-light">
                        {item.title}
                      </h3>
                      <p className="text-ink-2 max-w-measure leading-body text-sm font-light">
                        {item.body}
                      </p>
                    </div>
                  </InteractiveCard>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
