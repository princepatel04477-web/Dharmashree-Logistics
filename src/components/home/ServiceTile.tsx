"use client";

import { ArrowRightIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { sectionLinks } from "@/content/home";
import { images, serviceImage, type ImageSlot } from "@/content/images";
import type { Service } from "@/content/types";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { HomeIcon, serviceIcon } from "./shared";
import { SlotPhoto } from "./SlotPhoto";

/* One service card. Two owners, on different elements: GSAP's `Reveal` wraps
   the card and runs the scroll reveal; Motion owns the hover, lifting the card
   4px and zooming the photo to 1.04 (a `whileHover` variant on the card, read by
   the photo and the arrow). Motion's reduced-motion setting drops those
   transforms. The title link is stretched over the whole card, so the card is
   one focus stop and one click target. */

interface ServiceTileProps {
  service: Service;
  index: number;
}

const HOVER_TRANSITION = { duration: MOTION_DURATIONS.sm, ease: MOTION_EASES.out };

/* The slot for the service's slug; an unknown slug falls back to the first
   service's slot so the card still has a ground. */
function slotFor(slug: string): ImageSlot {
  return serviceImage(slug) ?? images.services["express-parcel"];
}

export function ServiceTile({ service, index }: ServiceTileProps) {
  const icon = serviceIcon(service.slug);
  const slot = slotFor(service.slug);

  return (
    <li className="flex">
      <Reveal delay={(index % 2) * 0.08} className="flex w-full">
        <motion.article
          initial="rest"
          whileHover="hover"
          variants={{ rest: { y: 0 }, hover: { y: -4 } }}
          transition={HOVER_TRANSITION}
          className="group/tile border-line bg-paper shadow-card hover:shadow-card-lift focus-within:shadow-card-lift relative flex w-full flex-col overflow-hidden rounded-md border transition-shadow duration-300"
        >
          <div className="bg-brand-tint aspect-[16/10] overflow-hidden">
            <motion.div
              variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
              transition={{ duration: MOTION_DURATIONS.md, ease: MOTION_EASES.out }}
              className="h-full w-full"
            >
              <SlotPhoto
                slot={slot}
                icon={icon}
                sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 560px"
              />
            </motion.div>
          </div>

          <div className="flex flex-1 flex-col gap-4 p-6 sm:p-7">
            <span className="bg-brand-tint text-brand flex size-11 items-center justify-center rounded-full">
              <HomeIcon name={icon} aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </span>
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-ink leading-headline tracking-display text-2xl sm:text-3xl">
                {service.name}
              </h3>
              <p className="text-ink/75 max-w-measure text-sm font-light sm:text-base">
                {service.summary}
              </p>
            </div>
            <Link
              href={`/services/${service.slug}`}
              className="text-brand mt-auto inline-flex items-center gap-2 pt-1 font-mono text-[11px] tracking-[0.14em] uppercase after:absolute after:inset-0 after:content-['']"
            >
              <span>
                {sectionLinks.tileCta}
                <span className="sr-only"> {service.name}</span>
              </span>
              <motion.span
                aria-hidden="true"
                variants={{ rest: { x: 0 }, hover: { x: 4 } }}
                transition={HOVER_TRANSITION}
                className="inline-flex"
              >
                <ArrowRightIcon className="size-4" />
              </motion.span>
            </Link>
          </div>
        </motion.article>
      </Reveal>
    </li>
  );
}
