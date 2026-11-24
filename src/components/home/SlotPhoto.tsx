import ResponsiveImage, { hasImage } from "@/components/media/ResponsiveImage";
import type { ImageSlot } from "@/content/images";
import { cn } from "@/lib/utils";
import { HomeIcon, type HomeIconName } from "./shared";

/* A photo slot from `images.ts`. When the file exists it is the photo; when it
   has not been produced yet the slot is a quiet branded ground with the
   section's icon on it (never a label, never a broken frame), so the page
   reads as finished either way and the real photo drops in under the same key.
   `tone="deep"` is for slots that sit under white text. */

interface SlotPhotoProps {
  slot: ImageSlot;
  icon: HomeIconName;
  sizes: string;
  tone?: "tint" | "deep";
  className?: string;
  imgClassName?: string;
}

export function SlotPhoto({
  slot,
  icon,
  sizes,
  tone = "tint",
  className,
  imgClassName,
}: SlotPhotoProps) {
  if (hasImage(slot.key)) {
    return (
      <ResponsiveImage
        imageKey={slot.key}
        alt={slot.alt}
        sizes={sizes}
        className={className}
        imgClassName={imgClassName}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      data-photo-pending
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        tone === "deep" ? "bg-brand-deep" : "bg-brand-tint",
        className,
      )}
    >
      <HomeIcon
        name={icon}
        strokeWidth={1.25}
        className={cn("size-16 sm:size-20", tone === "deep" ? "text-on-deep/25" : "text-brand/30")}
      />
    </div>
  );
}
