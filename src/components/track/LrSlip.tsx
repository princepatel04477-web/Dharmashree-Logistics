"use client";

import { useRef } from "react";
import { company } from "@/content/company";
import { track } from "@/content/track";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS, MOTION_STAGGER } from "@/lib/motion-tokens";

/* The LR slip, drawn rather than photographed: inline SVG line art, hairlines
   in the house ink, and the one thing worth pointing at — the number field — in
   --brand. It is GSAP's, because it draws itself on entry (house rule 8), and
   it is decoration: the caption under it carries the meaning, so the drawing is
   `aria-hidden` and no text inside it is read out.

   Nothing here is a real LR: the rows are blank lines and the field is empty, so
   the illustration cannot be mistaken for a consignment number. The desk's name
   and city are facts from `company.ts`. */

export function LrSlip() {
  const reduced = useReducedMotionSafe();
  const rootRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (reduced || root === null) return;
      const strokes = root.querySelectorAll("[data-draw]");
      const labels = root.querySelectorAll("[data-label]");
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 85%", once: true },
      });
      timeline.fromTo(
        strokes,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: MOTION_DURATIONS.md,
          ease: GSAP_EASES.draw,
          stagger: MOTION_STAGGER.items,
        },
      );
      timeline.fromTo(
        labels,
        { opacity: 0 },
        { opacity: 1, duration: MOTION_DURATIONS.sm, ease: GSAP_EASES.reveal, stagger: 0.02 },
        "<0.2",
      );
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <figure className="flex flex-col gap-3">
      <svg
        ref={rootRef}
        viewBox="0 0 340 224"
        role="presentation"
        aria-hidden="true"
        className="w-full"
        fill="none"
      >
        {/* ——— The slip ——— */}
        <rect
          data-draw
          x="4.5"
          y="4.5"
          width="331"
          height="215"
          rx="2"
          className="stroke-line-strong"
          strokeWidth="1"
        />

        <text
          data-label
          x="20"
          y="34"
          className="fill-ink font-mono text-[9px] tracking-[0.18em] uppercase"
        >
          {company.name}
        </text>
        <text
          data-label
          x="320"
          y="34"
          textAnchor="end"
          className="fill-muted font-mono text-[8px]"
        >
          {company.headquarters.city}, {company.headquarters.state}
        </text>

        <line data-draw x1="20" y1="44" x2="320" y2="44" className="stroke-line" strokeWidth="1" />

        {/* ——— The fields, and the number to read out ——— */}
        <text data-label x="20" y="66" className="fill-muted font-mono text-[8px] uppercase">
          {track.explainer.slipConsignorLabel}
        </text>
        <line data-draw x1="20" y1="76" x2="176" y2="76" className="stroke-line" strokeWidth="1" />

        <text data-label x="20" y="98" className="fill-muted font-mono text-[8px] uppercase">
          {track.explainer.slipConsigneeLabel}
        </text>
        <line
          data-draw
          x1="20"
          y1="108"
          x2="176"
          y2="108"
          className="stroke-line"
          strokeWidth="1"
        />

        <text data-label x="20" y="130" className="fill-muted font-mono text-[8px] uppercase">
          {track.explainer.slipRouteLabel}
        </text>
        <line
          data-draw
          x1="20"
          y1="140"
          x2="176"
          y2="140"
          className="stroke-line"
          strokeWidth="1"
        />

        <line
          data-draw
          x1="20"
          y1="164"
          x2="176"
          y2="164"
          className="stroke-line"
          strokeWidth="1"
        />
        <line
          data-draw
          x1="20"
          y1="178"
          x2="120"
          y2="178"
          className="stroke-line"
          strokeWidth="1"
        />

        <text
          data-label
          x="200"
          y="62"
          className="fill-ink font-mono text-[9px] tracking-[0.18em] uppercase"
        >
          {track.explainer.slipNumberLabel}
        </text>
        <rect
          data-draw
          x="198.5"
          y="70.5"
          width="122"
          height="34"
          rx="2"
          className="stroke-brand"
          strokeWidth="1"
        />
        {/* The line the number sits on: the only soft --brand stroke inside the slip. */}
        <line
          data-draw
          x1="206"
          y1="94"
          x2="313"
          y2="94"
          className="stroke-brand/60"
          strokeWidth="1"
        />
        <line
          data-draw
          x1="198"
          y1="132"
          x2="320"
          y2="132"
          className="stroke-line"
          strokeWidth="1"
        />
        <line
          data-draw
          x1="198"
          y1="146"
          x2="280"
          y2="146"
          className="stroke-line"
          strokeWidth="1"
        />

        {/* ——— Footer rule ——— */}
        <line
          data-draw
          x1="20"
          y1="196"
          x2="320"
          y2="196"
          className="stroke-line"
          strokeWidth="1"
        />
        <line data-draw x1="20" y1="206" x2="96" y2="206" className="stroke-line" strokeWidth="1" />
      </svg>

      <figcaption className="text-muted text-xs font-light">
        {track.explainer.slipCaption}
      </figcaption>
    </figure>
  );
}
