"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { ImageCurtain } from "@/components/motion/ImageCurtain";
import ResponsiveImage, { hasImage } from "@/components/media/ResponsiveImage";
import { SpotlightCard } from "@/components/vendor/reactbits";
import { serviceImageKey } from "@/content/services";
import type { Service } from "@/content/types";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

/* One service tile. The card itself is the vendored SpotlightCard (already
   restyled to `--paper-2` + hairline); Motion owns only the arrow, which
   nudges 4px right on hover. The card never scales. */

interface ServiceTileProps {
  service: Service;
  index: number;
  total: number;
}

/* Asymmetric spans for the 12-column grid. Tailwind has to see the literals,
   so they are written out per position rather than computed. */
function spanClass(index: number, total: number): string {
  if (index === 0) return "lg:col-span-7 lg:row-span-2";
  if (index <= 2) return "lg:col-span-5";
  /* A lone leftover fills the last row instead of leaving a hole. */
  return total - index === 1 ? "lg:col-span-12" : "lg:col-span-6";
}

export function ServiceTile({ service, index, total }: ServiceTileProps) {
  /* The tile asks the content layer for its manifest key, so `Service.image`
     can point anywhere in the manifest. */
  const imageKey = serviceImageKey(service);
  const hasPhoto = hasImage(imageKey);

  return (
    <li className={cn("col-span-1 flex", spanClass(index, total))}>
      {/* The li is a flex row so the card stretches to the grid cell; the
          vendor's inner wrapper is pinned to that height so the tall first
          tile can push its link to the bottom. */}
      <SpotlightCard className="w-full [&>div]:h-full">
        {/* Hover source for the arrow; the vendor card owns its own spotlight. */}
        <motion.div
          whileHover="arrow"
          initial={false}
          className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-ink leading-headline tracking-display text-3xl font-light">
              {service.name}
            </h3>
            <p className="text-ink-2 max-w-measure text-sm font-light">{service.summary}</p>
          </div>

          <div className="flex flex-col gap-6">
            {hasPhoto && (
              <ImageCurtain className="aspect-video w-full rounded-xs">
                <ResponsiveImage
                  imageKey={imageKey}
                  alt={service.name}
                  sizes="(max-width: 64rem) 100vw, 40vw"
                />
              </ImageCurtain>
            )}

            <Link
              href={`/services/${service.slug}`}
              className="group/tile text-accent-ink inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase"
            >
              <span className="relative">
                Explore
                <span
                  aria-hidden="true"
                  className="bg-accent absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/tile:scale-x-100"
                />
              </span>
              <motion.span
                aria-hidden="true"
                variants={{ arrow: { x: 4 } }}
                transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
                className="inline-flex"
              >
                <ArrowRightIcon className="size-4" />
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </SpotlightCard>
    </li>
  );
}
