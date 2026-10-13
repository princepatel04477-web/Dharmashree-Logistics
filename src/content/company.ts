import type { Company } from "./types";

/* ===== Company facts (filled once — the single source of truth) =====
   Unknown values are `null`: the UI hides those elements. Never invent. */
export const company: Company = {
  name: "DharmaShree Logistics",
  legalName: null,
  tagline: "Hum sirf shipments nahi, bharosa move karte hain.",
  headquarters: {
    city: "Surat",
    state: "Gujarat",
    addressLines: ["G/No. 50, Niyol Transport Nagar", "Surat, Gujarat - 394325"],
    /* A Maps search for the printed address — a link, not a pinned location. */
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=G%2FNo.%2050%20Niyol%20Transport%20Nagar%20Surat%20Gujarat%20394325",
  },
  contactAddress: null,
  branches: [],
  phone: "+919424092450",
  otherPhones: ["+919838838676", "+919875065144"],
  whatsapp: null,
  email: "admin@dharmashreegroup.com",
  website: "https://dharmashreegroup.in",
  givingPercent: 2.5,
  supportHours: null,
  gstin: null,
  llpin: "ADB7030",
  transporterId: "09ABAFD3081H1ZK",
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
