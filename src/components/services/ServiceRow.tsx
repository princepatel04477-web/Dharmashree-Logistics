"use client";

import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { hasImage } from "@/components/media/ResponsiveImage";
import { serviceImageKey } from "@/content/services";
import type { Service } from "@/content/types";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { numbered } from "@/lib/utils";

/* One row of the `/services` index (Prompt 06). A full-width line rather than
   a card: number, name at `--step-4`, the one-line summary, an arrow. Motion
   owns the hover state — one `whileHover` label on the row drives both the
   `--paper-2` wash and the 6px arrow travel, so nothing about the content is
   hover-only and the whole row is a single link.

   Reduced motion drops the label entirely: the row's rest state *is* its final
   state, and `MotionConfig reducedMotion="user"` alone would still let the
   wash's opacity animate (only transforms are frozen there).

   `data-service-index` is what the list's pointer listener reads to decide
   which picture to chase the cursor with; the row never touches the preview. */

const WASH_VARIANTS: Variants = {
  hover: { opacity: 1 },
};

const ARROW_VARIANTS: Variants = {
  hover: { x: 6 },
};

interface ServiceRowProps {
  service: Service;
  index: number;
}

export function ServiceRow({ service, index }: ServiceRowProps) {
  const reduced = useReducedMotionSafe();
  /* The row renders no picture — it only says whether the list should chase the
     cursor at all. No photo in the manifest, no preview. */
  const previewable = hasImage(serviceImageKey(service));

  return (
    <li
      data-service-index={previewable ? String(index) : undefined}
      className="border-line border-b first:border-t"
    >
      <motion.div initial={false} whileHover={reduced ? undefined : "hover"}>
        <Link href={`/services/${service.slug}`} className="relative block py-7 sm:py-9">
          {/* The wash has to sit behind the text: a positioned sibling would
              otherwise paint over it, hence `z-0` here and `z-10` on the
              content. Motion owns its opacity — no transition class as well. */}
          <motion.span
            aria-hidden="true"
            variants={WASH_VARIANTS}
            transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
            className="bg-paper-2 border-line pointer-events-none absolute -inset-x-3 inset-y-0 z-0 rounded-xs border opacity-0 md:-inset-x-6"
          />

          {/* A div, not a span: the row carries an h2 and a p, and phrasing
              content cannot hold flow content inside the link. */}
          <div className="relative z-10 grid grid-cols-1 items-start gap-x-8 gap-y-2 sm:grid-cols-[2.5rem_minmax(0,1fr)] lg:grid-cols-[2.5rem_minmax(0,26rem)_minmax(0,1fr)_1.5rem]">
            <span className="section-index pt-2 lg:pt-4">{numbered(index)}</span>

            <h2 className="font-display text-ink text-step-4 leading-headline tracking-display">
              {service.name}
            </h2>

            <p className="text-ink-2 max-w-measure leading-body text-sm font-light lg:pt-4">
              {service.summary}
            </p>

            <motion.span
              aria-hidden="true"
              variants={ARROW_VARIANTS}
              transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
              className="text-accent hidden justify-self-end pt-4 lg:inline-flex"
            >
              <ArrowUpRightIcon className="size-5" />
            </motion.span>
          </div>
        </Link>
      </motion.div>
    </li>
  );
}
