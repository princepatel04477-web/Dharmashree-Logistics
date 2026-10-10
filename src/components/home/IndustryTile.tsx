"use client";

import { motion } from "motion/react";
import ResponsiveImage, { hasImage } from "@/components/media/ResponsiveImage";
import { Reveal } from "@/components/motion/Reveal";
import type { ImageSlot } from "@/content/images";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { HomeIcon, type HomeIconName } from "./shared";

/* One industry tile. GSAP's `Reveal` wraps the tile for the scroll reveal;
   Motion owns the photo zoom on hover (a `whileHover` variant), a different
   element. The tile's ground is `--brand-deep`, so white text is always on a
   blue band, with or without a photo. */

interface IndustryTileProps {
  name: string;
  /** One line under the name; `""` renders a name-only tile. */
  note: string;
  slot: ImageSlot | null;
  icon: HomeIconName;
  index: number;
}

export function IndustryTile({ name, note, slot, icon, index }: IndustryTileProps) {
  const photo = slot !== null && hasImage(slot.key) ? slot : null;

  return (
    <li className="w-64 shrink-0 snap-start sm:w-72 lg:w-auto">
      <Reveal delay={index * 0.06} className="h-full">
        <motion.article
          initial="rest"
          whileHover="hover"
          className="bg-brand-deep shadow-card relative isolate flex aspect-[3/4] h-full w-full flex-col justify-end overflow-hidden rounded-md"
        >
          {photo !== null ? (
            <motion.div
              variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
              transition={{ duration: MOTION_DURATIONS.md, ease: MOTION_EASES.out }}
              className="absolute inset-0 -z-20"
            >
              <ResponsiveImage
                imageKey={photo.key}
                alt={photo.alt}
                sizes="(max-width: 1023px) 288px, 232px"
              />
            </motion.div>
          ) : (
            <HomeIcon
              name={icon}
              aria-hidden="true"
              strokeWidth={1.25}
              className="text-on-deep/25 absolute top-8 left-1/2 -z-20 size-16 -translate-x-1/2"
            />
          )}

          {/* One hue: --brand-deep, solid at the foot and clear by the top third. */}
          <div
            aria-hidden="true"
            className="from-brand-deep via-brand-deep/80 absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-linear-to-t to-transparent"
          />

          <div className="flex flex-col gap-2 p-5">
            <h3 className="font-display text-on-deep leading-headline tracking-display text-xl">
              {name}
            </h3>
            {note !== "" && <p className="text-on-deep-text text-sm font-light">{note}</p>}
          </div>
        </motion.article>
      </Reveal>
    </li>
  );
}
