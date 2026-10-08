import type { Company } from "./types";

/* ===== Company facts (filled once — the single source of truth) =====
   Unknown values are `null`: the UI hides those elements. Never invent. */
export const company: Company = {
  name: "DharmaShree Logistics",
  legalName: null,
  tagline: "Hum sirf shipments nahi, bharosa move karte hain.",
  headquarters: { city: "Surat", state: "Gujarat", addressLines: null, mapsUrl: null },
  branches: [],
  phone: null,
  whatsapp: null,
  email: "hello@dharmashreelogistics.com",
  supportHours: null,
  gstin: null,
  foundedYear: null,
  fleetSize: null,
  hubsServed: null,
  monthlyConsignments: null,
  services: [
    "Express parcel",
    "Full truckload",
    "Local on-demand delivery",
    "Warehousing & fulfilment",
  ],
  industries: [
    "Textiles & apparel",
    "Diamonds & jewellery (secure)",
    "FMCG & retail",
    "Pharma (non-cold-chain)",
    "Engineering & industrial",
  ],
  social: { instagram: null, linkedin: null },
  credit: { name: "Varunya Technologies", url: null },
};
