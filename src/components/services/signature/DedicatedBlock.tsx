"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { SegmentedSwitch } from "@/components/services/signature/SegmentedSwitch";
import { ScrollCarousel } from "@/components/vendor/lightswind";
import { serviceDetail } from "@/content/services";
import type { DedicatedSignature } from "@/content/types";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { numbered } from "@/lib/utils";

/* Full truckload's signature (Prompt 11), two parts.

   1. A truck body drawn in hairline. GSAP draws the outline on entry; Motion
      owns the cargo outlines inside it. "Shared" shows four consignments, one of
      them the visitor's (accent outline); "Dedicated" fades the other three and
      lets the visitor's grow to fill the body. Outlines only — the accent never
      becomes a fill (house rule 6).
   2. The supply-chain legs on Lightswind's pinned horizontal carousel, which
      owns its own GSAP pin and falls back to a native swipeable strip. */

type Mode = "dedicated" | "shared";

interface Box {
  readonly x: number;
  readonly width: number;
}

/* Body interior: x 30–244, y 30–94. Four equal bays with a 6-unit gutter. */
const BODY_X = 30;
const BODY_W = 214;
const BODY_Y = 30;
const BODY_H = 64;
const GUTTER = 6;
const BAYS = 4;
const BAY_W = (BODY_W - GUTTER * (BAYS - 1)) / BAYS;
const YOURS_BAY = 1;

const sharedBoxes: readonly Box[] = Array.from({ length: BAYS }, (_, bay) => ({
  x: BODY_X + bay * (BAY_W + GUTTER),
  width: BAY_W,
}));
const dedicatedBox: Box = { x: BODY_X, width: BODY_W };

const WHEELS: readonly number[] = [64, 108, 292];

export function DedicatedBlock({ signature }: { signature: DedicatedSignature }) {
  const reduced = useReducedMotionSafe();
  const figureRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<Mode>("dedicated");
  const active = mode === "dedicated" ? signature.dedicated : signature.shared;
  const transition = {
    duration: reduced ? 0 : MOTION_DURATIONS.md,
    ease: MOTION_EASES.inOut,
  };

  useGSAP(
    () => {
      const figure = figureRef.current;
      if (reduced || figure === null) return;
      gsap.fromTo(
        figure.querySelectorAll("[data-draw]"),
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: MOTION_DURATIONS.md,
          ease: GSAP_EASES.draw,
          stagger: 0.08,
          scrollTrigger: { trigger: figure, start: "top 85%", once: true },
        },
      );
    },
    { scope: figureRef, dependencies: [reduced] },
  );

  return (
    <>
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <SectionHeading
              index={serviceDetail.signatureEyebrow}
              title={signature.title}
              titleClassName="font-display text-ink text-step-3 leading-headline tracking-display"
            />
            <p className="text-ink-2 max-w-measure leading-body text-base font-light">
              {signature.lede}
            </p>
            <SegmentedSwitch
              label={signature.toggleLabel}
              options={[
                { id: "dedicated", label: signature.dedicated.label },
                { id: "shared", label: signature.shared.label },
              ]}
              value={mode}
              onChange={(next) => setMode(next === "shared" ? "shared" : "dedicated")}
            />
            <div className="flex flex-col gap-3" aria-live="polite">
              <h3 className="font-display text-ink leading-headline tracking-display text-2xl">
                {active.title}
              </h3>
              <p className="text-ink-2 max-w-measure leading-body text-sm font-light">
                {active.body}
              </p>
            </div>
          </div>

          <figure className="flex flex-col gap-3 lg:col-span-7">
            <svg
              ref={figureRef}
              viewBox="0 0 360 140"
              role="img"
              aria-label={signature.figureCaption}
              className="text-ink-2 w-full"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Trailer, cab and wheels: hairlines in the ink, drawn on entry. */}
              <rect
                data-draw=""
                x="22"
                y="22"
                width="230"
                height="80"
                rx="2"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path
                data-draw=""
                d="M252 46 H300 L330 72 V102 H252 Z"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path
                data-draw=""
                d="M284 52 H298 L316 72 H284 Z"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line
                data-draw=""
                x1="14"
                y1="102"
                x2="338"
                y2="102"
                stroke="currentColor"
                strokeWidth="1"
              />
              {WHEELS.map((cx) => (
                <circle
                  key={cx}
                  data-draw=""
                  cx={cx}
                  cy="112"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              ))}

              {/* Cargo: three other consignments fade out in the dedicated view;
                  the visitor's own grows to fill the body. */}
              {sharedBoxes.map((box, bay) => {
                const yours = bay === YOURS_BAY;
                const target = mode === "dedicated" && yours ? dedicatedBox : box;
                return (
                  <motion.rect
                    key={box.x}
                    y={BODY_Y}
                    height={BODY_H}
                    rx="1"
                    strokeWidth="1"
                    className={yours ? "stroke-brand" : "stroke-line-strong"}
                    initial={false}
                    animate={{
                      x: target.x,
                      width: target.width,
                      opacity: mode === "dedicated" && !yours ? 0 : 1,
                    }}
                    transition={transition}
                  />
                );
              })}
            </svg>
            <figcaption className="text-muted font-mono text-[11px] tracking-[0.08em]">
              {signature.figureCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-line border-t">
        <div className="wrap pt-14 pb-6 sm:pt-16 lg:pt-20">
          <SectionHeading
            index={serviceDetail.signatureEyebrow}
            title={signature.flowTitle}
            titleClassName="font-display text-ink text-step-3 leading-headline tracking-display"
          />
        </div>
        <ScrollCarousel className="pb-14 sm:pb-16 lg:pb-20">
          {signature.flow.map((leg, position) => (
            <article
              key={leg.title}
              className="border-line bg-paper-2 flex w-72 shrink-0 flex-col gap-4 rounded-xs border p-6 sm:w-80 sm:p-8"
            >
              <p className="section-index">{numbered(position)}</p>
              <h3 className="font-display text-ink leading-headline tracking-display text-2xl">
                {leg.title}
              </h3>
              <p className="text-ink-2 leading-body text-sm font-light">{leg.body}</p>
            </article>
          ))}
        </ScrollCarousel>
      </section>
    </>
  );
}
