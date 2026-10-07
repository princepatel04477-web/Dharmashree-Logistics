import { company } from "./company";
import type { Industry } from "./types";

/* Industry notes for the home carousel (Prompt 05). The list itself is a fact
   (`company.industries`), so it stays there; only the one-line note lives
   here, keyed by that exact name. An industry with no note still renders — as
   a name-only card — and a note with no matching fact never appears. */
const notes: Readonly<Record<string, string>> = {
  "Textiles & apparel":
    "Bales, rolls and parcels to wholesale markets, scheduled around market days.",
  "Diamonds & jewellery (secure)": "Insured, sealed and handled by a named desk contact.",
  "FMCG & retail": "Part loads consolidated to distributor points.",
  "Pharma (non-cold-chain)": "Documented handling with batch-wise paperwork.",
  "Engineering & industrial": "Machinery and parts on open-body or container vehicles.",
};

/** Manifest key for an industry photo, matching the `assets/originals/<group>/
   <name>` convention: drop `industries/textiles-apparel.png` in and the card
   picks it up. Absent keys render a name-only card. */
export function industryImageKey(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `industries/${slug}`;
}

export function industries(): Industry[] {
  return company.industries.map((name) => ({ name, note: notes[name] ?? "" }));
}
