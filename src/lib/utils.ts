import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/* Manifest keys are slugs of the human-readable name (house rule 5 keeps the
   copy files free of hand-typed ids), so `Textiles & apparel` and
   `19 ft mxl` map to `textiles-apparel` and `19-ft-mxl`. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** `01`, `02`, … — the house numbering style for catalogue and section labels. */
export function numbered(index: number): string {
  return String(index + 1).padStart(2, "0");
}
