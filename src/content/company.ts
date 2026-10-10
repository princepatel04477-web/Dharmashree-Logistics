import type { Company } from "./types";

/* ===== Company facts (filled once — the single source of truth) =====
   Unknown values are `null`: the UI hides those elements. Never invent. */
export const company: Company = {
  name: "DharmaShree Logistics",
  legalName: null,
  tagline: "Hum sirf shipments nahi, bharosa move karte hain.",
  headquarters: { city: "Surat", state: "Gujarat", addressLines: null, mapsUrl: null },
  contactAddress: {
    city: "Sandila",
    state: "Uttar Pradesh",
    lines: [
      "Sandila-Bangarmau Road, near Best Furniture",
      "Hardoi district, Uttar Pradesh - 241204",
    ],
    /* A Maps search for the printed address — a link, not a pinned location. */
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Sandila-Bangarmau%20Road%20near%20Best%20Furniture%20Sandila%20Hardoi%20Uttar%20Pradesh%20241204",
  },
  branches: [],
  phone: "+919807829071",
  whatsapp: "+919807829071",
  email: "admin@dharmashreegroup.com",
  website: "https://dharmashreegroup.in",
  givingPercent: 2.5,
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
  portals: {
    customer: "https://dharmashreegroup.in/Customer/BillOnUserLogin.aspx",
    consignee: "https://dharmashreegroup.in/Consignee/BillOnConsigneeLogin.aspx",
  },
};
