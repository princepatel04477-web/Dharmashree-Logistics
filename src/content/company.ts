import type { Company } from "./types";

/* ===== Company facts (filled once — the single source of truth) =====
   Unknown values are `null`: the UI hides those elements. Never invent. */
export const company: Company = {
  name: "DharmaShree Logistics",
  legalName: null,
  tagline: null,
  headquarters: { city: "Surat", state: "Gujarat", addressLines: null, mapsUrl: null },
  branches: [],
  phone: null,
  whatsapp: null,
  email: null,
  gstin: null,
  foundedYear: null,
  fleetSize: null,
  hubsServed: null,
  monthlyConsignments: null,
  services: [
    "Full truckload (FTL)",
    "Part load (PTL)",
    "Textile parcel & bale dispatch",
    "Warehousing & cross-dock",
    "Last-mile delivery",
  ],
  industries: [
    "Textiles & apparel",
    "Diamonds & jewellery (secure)",
    "FMCG & retail",
    "Pharma (non-cold-chain)",
    "Engineering & industrial",
  ],
  social: { instagram: null, linkedin: null },
};
