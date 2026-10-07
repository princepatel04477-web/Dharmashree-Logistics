"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import ResponsiveImage, { hasImage } from "@/components/media/ResponsiveImage";
import { serviceImageKey } from "@/content/services";
import type { Service } from "@/content/types";
import { useHoverCapable } from "@/hooks/use-hover-capable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { ServiceRow } from "./ServiceRow";

/* The `/services` index list (Prompt 06): one `<ol>` of hairline rows, plus the
   cursor preview. Motion owns the preview; the rows own their own hover state.

   The preview is deliberately expensive to earn: it mounts only when the
   viewport is `lg`, the pointer can hover, reduced motion is off, and at least
   one service actually has a photo in the manifest. With `image-manifest.json`
   empty that is never — so the list is just a list, at zero cost.

   One pointer listener on the list, not one per row: it hit-tests the row under
   the cursor, so moving from row to row swaps the picture inside a single frame
   instead of blinking a frame off and on. The frame is cleared only when the
   pointer leaves the list, and its travel is clamped to the list's own box, so
   it can never widen the document or open a horizontal scrollbar. */

/** Edge length of the preview frame, in px. The frame itself is sized with a
   literal utility (`w-[280px]`) because Tailwind cannot see a computed one —
   keep the two in step. */
const PREVIEW_SIZE = 280;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

interface ServicesIndexListProps {
  services: Service[];
}

export function ServicesIndexList({ services }: ServicesIndexListProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 30, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 220, damping: 30, mass: 0.35 });

  const reduced = useReducedMotionSafe();
  const canHover = useHoverCapable();
  const isWide = useMediaQuery("(min-width: 64rem)");
  const anyPhotos = services.some((service) => hasImage(serviceImageKey(service)));
  const previewReady = isWide && canHover && !reduced && anyPhotos;

  const handlePointerMove = (event: ReactPointerEvent<HTMLOListElement>): void => {
    /* Only a real mouse drives this: pointermove is the sole writer, so
       keyboard focus on a row never moves or reveals the frame — it stays a
       pointer flourish and nothing more. */
    if (!previewReady || event.pointerType !== "mouse") return;

    const list = listRef.current;
    if (list === null) return;

    const row = (event.target as HTMLElement).closest("[data-service-index]");
    const rawIndex = row?.getAttribute("data-service-index");
    if (rawIndex !== null && rawIndex !== undefined) {
      const index = Number(rawIndex);
      if (Number.isInteger(index)) setActiveIndex(index);
    }

    /* Position and clamp inside the list, not the viewport: the frame belongs to
       the rows it is describing. */
    const box = list.getBoundingClientRect();
    const limitX = box.width - PREVIEW_SIZE;
    const limitY = box.height - PREVIEW_SIZE;
    x.set(clamp(event.clientX - box.left - PREVIEW_SIZE / 2, 0, limitX));
    y.set(clamp(event.clientY - box.top - PREVIEW_SIZE / 2, 0, limitY));
  };

  const handlePointerLeave = (): void => {
    setActiveIndex(null);
  };

  const active = activeIndex === null ? undefined : services[activeIndex];

  return (
    <div className="relative">
      {/* Both listeners bind only when the preview can exist at all, so a
          touch device or an empty manifest pays nothing for the flourish. */}
      <ol
        ref={listRef}
        onPointerMove={previewReady ? handlePointerMove : undefined}
        onPointerLeave={previewReady ? handlePointerLeave : undefined}
        className="flex flex-col"
      >
        {services.map((service, index) => (
          <ServiceRow key={service.slug} service={service} index={index} />
        ))}
      </ol>

      {previewReady && (
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ opacity: active === undefined ? 0 : 1 }}
          transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
          style={{ x: springX, y: springY }}
          className="pointer-events-none absolute top-0 left-0 z-10 hidden lg:block"
        >
          <div className="border-line bg-paper-2 aspect-[4/5] w-[280px] overflow-hidden rounded-xs border">
            {active !== undefined && (
              <ResponsiveImage imageKey={serviceImageKey(active)} alt={active.name} sizes="280px" />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
