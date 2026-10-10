import type { CSSProperties } from "react";
import manifestJson from "@/content/image-manifest.json";
import type { ImageManifest } from "@/content/types";

const manifest = manifestJson as unknown as ImageManifest;

/** True when the build produced a real file set for this key. Sections use it
   to choose their own ground (for example `--brand-deep` under white text)
   instead of the neutral fallback this component renders. */
export function hasImage(imageKey: string): boolean {
  const entry = manifest[imageKey];
  return entry !== undefined && entry.width > 0 && entry.height > 0;
}

/** Art direction: below `below` px of viewport width the browser uses another
   photo (for example a portrait crop on phones). Ignored when that key has no
   files yet, so the base photo is used at every width. */
export interface ArtDirection {
  imageKey: string;
  below: number;
}

interface ResponsiveImageProps {
  /** Manifest key: "<group>/<name>", e.g. "fleet/linehaul-novabus". */
  imageKey: string;
  alt: string;
  /** Required: describes rendered width across breakpoints, e.g. "(max-width: 640px) 100vw, 50vw". */
  sizes: string;
  priority?: boolean;
  art?: ArtDirection;
  className?: string;
  imgClassName?: string;
}

function srcSet(group: string, file: string, widths: number[], ext: string): string {
  const base = `/img/${group}/${file}`;
  return widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");
}

export default function ResponsiveImage({
  imageKey,
  alt,
  sizes,
  priority = false,
  art,
  className = "",
  imgClassName = "",
}: ResponsiveImageProps) {
  const entry = manifest[imageKey];

  /* A slot whose file has not been produced yet is a quiet branded ground, never
     a label or a broken frame: the visitor sees a finished page either way, and
     the real photo drops in under the same key. */
  if (entry === undefined || entry.width === 0 || entry.height === 0) {
    return (
      <div
        aria-hidden="true"
        data-photo-pending
        className={`bg-brand-tint relative block h-full w-full overflow-hidden ${className}`}
      />
    );
  }

  const widths = entry.widths.length > 0 ? entry.widths : [entry.width];
  const largest = widths.reduce<number>(
    (best, w) => (w > best ? w : best),
    widths[0] ?? entry.width,
  );

  const placeholder: CSSProperties = {
    backgroundImage: `url("${entry.blurDataURL}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const artEntry = art === undefined ? undefined : manifest[art.imageKey];
  const artWidths =
    art !== undefined && artEntry !== undefined && artEntry.width > 0 && artEntry.height > 0
      ? artEntry.widths.length > 0
        ? artEntry.widths
        : [artEntry.width]
      : null;

  return (
    <picture className={`block h-full w-full overflow-hidden ${className}`} style={placeholder}>
      {art !== undefined && artEntry !== undefined && artWidths !== null && (
        <>
          <source
            media={`(max-width: ${String(art.below - 1)}px)`}
            type="image/avif"
            srcSet={srcSet(artEntry.group, artEntry.file, artWidths, "avif")}
            sizes={sizes}
          />
          <source
            media={`(max-width: ${String(art.below - 1)}px)`}
            type="image/webp"
            srcSet={srcSet(artEntry.group, artEntry.file, artWidths, "webp")}
            sizes={sizes}
          />
          <source
            media={`(max-width: ${String(art.below - 1)}px)`}
            type="image/jpeg"
            srcSet={srcSet(artEntry.group, artEntry.file, artWidths, "jpg")}
            sizes={sizes}
          />
        </>
      )}
      <source
        type="image/avif"
        srcSet={srcSet(entry.group, entry.file, widths, "avif")}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={srcSet(entry.group, entry.file, widths, "webp")}
        sizes={sizes}
      />
      <img
        src={`/img/${entry.group}/${entry.file}-${largest}.jpg`}
        srcSet={srcSet(entry.group, entry.file, widths, "jpg")}
        sizes={sizes}
        width={entry.width}
        height={entry.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={`h-full w-full object-cover object-center ${imgClassName}`}
      />
    </picture>
  );
}
