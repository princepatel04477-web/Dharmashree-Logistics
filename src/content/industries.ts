import { company } from "./company";
import type { Industry } from "./types";

/* Industry notes for the home industries tiles (Prompt 05). The photo for each
   industry comes from `images.ts` (`industryImage(name)`). The list itself is a fact
   (`company.industries`), so it stays there; only the one-line note lives
   here, keyed by that exact name. An industry with no note still renders — as
   a name-only card — and a note with no matching fact never appears. */
const notes: Readonly<Record<string, string>> = {
  "Textiles & apparel":
    "Bales, rolls and parcels to wholesale markets, scheduled around market days.",
  "Diamonds & jewellery (secure)": "Insured, sealed and handled by a named desk contact.",
  "FMCG & retail": "Stock moved to distributor points and retail stores.",
  "Pharma (non-cold-chain)": "Documented handling with batch-wise paperwork.",
  "Engineering & industrial": "Machinery and parts on open-body or container vehicles.",
};

export function industries(): Industry[] {
  return company.industries.map((name) => ({ name, note: notes[name] ?? "" }));
}
