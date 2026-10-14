import { company } from "./company";
import { HUBS, ORIGIN, REGIONS, type RegionId } from "./hubs";
import { formatNumberIN } from "@/lib/format";

/* `/about` copy (Prompts 05 and 10). The words are the company profile's
   (`Company_Profile/ABOUT DHARMASHREE.md`); the only derived lines are the
   network counts, which come from `hubs.ts`. Nothing here states a year, a
   fleet size or a volume — those arrive through `company.ts` and the
   data-gated stats strip / timeline, or not at all (house rule 4). */

const regionCount = REGIONS.filter((entry) => entry.id !== "all").length;

function countIn(region: RegionId): number {
  return HUBS.filter((hub) => hub.region === region).length;
}

/* The giving section sits straight after the commitments (section 02), so with
   it present every later section moves down one place. Its figure is the only
   number it states, and it comes from `company.ts`: a null removes the whole
   section and the numbering closes over it (house rule 4). */
const givingShare =
  company.givingPercent === null ? null : `${formatNumberIN(company.givingPercent)}%`;

function sectionIndex(position: number): string {
  const shift = givingShare !== null && position > 2 ? 1 : 0;
  return String(position + shift).padStart(2, "0");
}

/** The slug of a service in `services.ts`; `verify:services` fails on a typo. */
export interface BusinessKind {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  /** What the profile says this kind of business tends to need. */
  readonly note: string;
  readonly services: readonly string[];
}

export const about = {
  metaTitle: "About",
  metaDescription: `${company.name} is a customer-focused logistics company: express parcels, full truckloads, local on-demand delivery and warehousing, with reliable, efficient and transparent service.`,
  eyebrow: "About Dharmashree",
  /** The H1 is the company's own line; `null` falls back to the plain claim. */
  title: company.tagline ?? "Reliable, efficient and transparent logistics.",
  lede: `${company.name} is a customer-focused logistics company committed to moving businesses forward with reliable, efficient and transparent transportation solutions.`,

  intro: {
    index: "01",
    title: "More than moving goods",
    paragraphs: [
      "From express parcel delivery and local distribution to warehousing and road freight, we support businesses at every stage of their supply chain. Our approach combines responsive service, dependable operations and a strong delivery network — so every shipment reaches its destination with care.",
    ],
    /** The three things the profile says logistics is about, set large. */
    statements: [
      "Keeping promises.",
      "Enabling growth.",
      "Building long-term partnerships with the businesses we serve.",
    ],
  },

  drives: {
    index: "02",
    title: "What drives Dharmashree Logistics",
    lede: "Logistics is not simply about moving goods. It is about delivering confidence, supporting business continuity, and building relationships that last. Every service we provide is shaped by four commitments.",
    commitments: [
      {
        title: "Reliability in every movement",
        body: [
          "Every shipment carries more than products — it carries a business promise. Whether it is a time-sensitive parcel, a full truckload, local delivery, or inventory moving from a warehouse, we focus on dependable execution at every stage.",
          "Our team works to ensure that collections, handling, transit and delivery are managed with care and consistency. By keeping operations organised and responsive, we help businesses reduce uncertainty and stay confident that their goods are moving in the right direction.",
        ],
      },
      {
        title: "Transparency and clear communication",
        body: [
          "Businesses need to know what is happening with their shipments, when they can expect delivery, and who to contact when they need support. We are committed to keeping communication simple, timely and clear.",
          "From shipment updates to service coordination, we aim to provide the information our customers need to make informed decisions. When challenges arise, we believe in honest communication and quick action — not unnecessary complexity.",
        ],
      },
      {
        title: "Partnership for long-term growth",
        body: [
          "We do not see logistics as a one-time transaction. We see it as a long-term partnership that grows alongside your business.",
          "Our team takes time to understand your operational needs, delivery expectations and growth plans. That lets us give practical support that goes beyond transportation — whether you are serving a new region, managing higher order volumes or improving your supply chain.",
        ],
      },
      {
        title: "Flexible solutions for growing businesses",
        body: [
          "Every business has different logistics needs. A growing online seller may need fast parcel deliveries, while a manufacturer may need dependable freight movement, warehousing or local distribution. A single standard solution cannot serve every requirement.",
          "That is why we offer flexible logistics support that can adapt to your business — from small and frequent shipments to large-scale movement, on services that fit your needs today and can scale as you grow.",
        ],
      },
    ],
  },

  /** Deliberately silent on what the share is of, and on who receives it. */
  giving:
    givingShare === null
      ? null
      : {
          index: "03",
          title: "Giving back",
          body: [
            `${company.name} sets aside ${givingShare} of its earnings for good causes.`,
            "It is a standing commitment, not a campaign — part of how we run the business.",
          ],
          /** The one-line form of the same commitment, for the home page list. */
          commitmentTitle: `${givingShare} of earnings set aside for good causes`,
        },

  kinds: {
    index: sectionIndex(3),
    title: "Which business are you?",
    note: "Every business has different logistics needs. Pick yours and see which services the profile pairs with it.",
    label: "Type of business",
    servicesLabel: "Services that fit",
    list: [
      {
        id: "seller",
        label: "Online seller",
        description: "Customer orders going out every day.",
        note: "A growing online seller may need fast parcel deliveries — and warehousing to store, pack and dispatch the orders behind them.",
        services: ["express-parcel", "warehousing-fulfilment", "local-on-demand"],
      },
      {
        id: "manufacturer",
        label: "Manufacturer",
        description: "Finished goods leaving the factory.",
        note: "A manufacturer may need dependable freight movement, warehousing or local distribution.",
        services: ["full-truckload", "warehousing-fulfilment", "local-on-demand"],
      },
      {
        id: "retailer",
        label: "Retailer",
        description: "Stock moving to shelves and stores.",
        note: "Retailers need reliable freight to replenish stock, parcel delivery for customer orders, and warehousing to keep inventory organised.",
        services: ["full-truckload", "express-parcel", "warehousing-fulfilment"],
      },
      {
        id: "distributor",
        label: "Distributor",
        description: "Goods moving between locations and partners.",
        note: "Distributors move goods between warehouses, partners and stores, and can store and dispatch inventory from one trusted partner.",
        services: ["full-truckload", "warehousing-fulfilment", "express-parcel"],
      },
    ] satisfies readonly BusinessKind[],
  },

  moves: {
    index: sectionIndex(4),
    title: "What we move",
    linkLabel: "All services",
  },

  carries: {
    index: sectionIndex(5),
    title: "Who we carry for",
  },

  reach: {
    index: sectionIndex(6),
    title: "Where it goes",
    body: `${String(HUBS.length)} hubs across ${String(regionCount)} regions, every one of them a corridor from the ${ORIGIN.name} desk. Most of the network sits north and east: ${String(countIn("uttar-pradesh"))} hubs in Uttar Pradesh alone, and ${String(countIn("bihar-jharkhand"))} across Bihar and Jharkhand.`,
    linkLabel: "Open the network map",
  },

  timeline: {
    index: sectionIndex(7),
    title: "Along the way",
  },
};
