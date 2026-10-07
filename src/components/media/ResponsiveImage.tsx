import type { CSSProperties } from "react";
import manifestJson from "@/content/image-manifest.json";
import type { ImageManifest } from "@/content/types";

const manifest = manifestJson as unknown as ImageManifest;

interface ResponsiveImageProps {
  /** Manifest key: "<group>/<name>", e.g. "fleet/linehaul-novabus". */
  imageKey: string;
  alt: string;
  /** Required: describes rendered width across breakpoints, e.g. "(max-width: 640px) 100vw, 50vw". */
  sizes: string;
  priority?: boolean;
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
  className = "",
  imgClassName = "",
}: ResponsiveImageProps) {
  const entry = manifest[imageKey];

  if (entry === undefined || entry.width === 0 || entry.height === 0) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`media-frame bg-paper-3 flex items-center justify-center p-6 ${className}`}
      >
        <p className="label-caps text-center">{alt}</p>
      </div>
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

  return (
    <picture className={`block h-full w-full overflow-hidden ${className}`} style={placeholder}>
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
