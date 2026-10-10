import { formatNumberIN } from "@/lib/format";
import { about } from "./about";
import { company } from "./company";
import { HUBS, ORIGIN } from "./hubs";
import type { ProcessImageStep } from "./images";
import { quoteCta, whatsapp } from "./navigation";

/* Home page copy (Prompt 05). The wording is final, except where a line
   carries a fact: those read from `company.ts` so the page can never state
   something the content file doesn't have. A null fact removes its element —
   see `homeStats()` and the null guards in the section components. */

/* ——— H0 · Hero ——— */
export const hero = {
  /** The company's own line when it has one; the plain claim otherwise. */
  eyebrow: company.tagline ?? "Freight & transport across India",
  title: "Freight that moves the way India trades.",
  body: "Express parcels, full truckloads, local delivery and warehousing across India's busiest trade lanes — booked by people who answer the phone.",
  /** Rendered only when `company.branches` has an entry. */
  branchPrefix: "Now also dispatching from",
};

/* The track / quote card beside the hero text. The Track tab renders the
   shared `TrackPanel` (its own copy lives in `track.ts`); the Quote tab is a
   two-field lane form that hands its values to `/quote/` as `?from=` and `?to=`. */
export const heroTabs = {
  ariaLabel: "Track a shipment or start a quote",
  /** The accessible name of the announcement bar the admin panel sets. */
  announcementLabel: "Announcement",
  track: { id: "track", label: "Track shipment" },
  quote: {
    id: "quote",
    label: "Get a quote",
    intro: "Tell us the lane. You add the load and your contact details on the next page.",
    fromLabel: "From",
    fromPlaceholder: "Pickup city",
    toLabel: "To",
    toPlaceholder: "Destination city or hub",
    submitLabel: "Continue to the quote form",
    hubListLabel: "Hubs on the map",
  },
};

/* ——— Section headings (fed to `SectionHeading`) ——— */
export interface SectionHeadingContent {
  readonly index: string;
  readonly title: string;
}

export const sectionHeadings = {
  services: { index: "01", title: "What we move" },
  network: { index: "02", title: "The network" },
  process: { index: "03", title: "How a consignment moves" },
  industries: { index: "04", title: "Industries we carry for" },
  commitments: { index: "05", title: "How we work" },
} satisfies Record<string, SectionHeadingContent>;

/* ——— Section links and small labels ——— */
export const sectionLinks = {
  services: { label: "All services", href: "/services" },
  tileCta: "Explore",
  network: { label: "See every hub", href: "/network", directoryLabel: "Directory" },
  commitments: { label: "Read how we work", href: "/about" },
};

/* ——— H1 · Stats strip ——— */
/* The strip shows the company facts that exist. With fewer than two of them it
   shows the four services as icon chips instead: never a placeholder number. */
export const servicesStrip = {
  ariaLabel: "Our services",
};

export interface StatCell {
  readonly id: string;
  /** Small-caps row under the figure; `""` means the cell carries no label. */
  readonly label: string;
  /** Animated figure (en-IN), or null when the cell shows `staticText`. */
  readonly count: number | null;
  /** Non-counting figure, e.g. a year — never counted, never digit-grouped. */
  readonly staticText: string | null;
}

/* Only facts that exist are rendered, and one number is not a strip: with
   fewer than two non-null values the whole band is dropped. */
export function homeStats(): StatCell[] {
  const cells: StatCell[] = [];

  if (company.foundedYear !== null) {
    cells.push({
      id: "since",
      label: "",
      count: null,
      staticText: `Since ${company.foundedYear}`,
    });
  }
  if (company.fleetSize !== null) {
    cells.push({
      id: "fleet",
      label: "Vehicles on contract",
      count: company.fleetSize,
      staticText: null,
    });
  }
  if (company.hubsServed !== null) {
    cells.push({
      id: "hubs",
      label: "Hubs served",
      count: company.hubsServed,
      staticText: null,
    });
  }
  if (company.monthlyConsignments !== null) {
    cells.push({
      id: "consignments",
      label: "Consignments a month",
      count: company.monthlyConsignments,
      staticText: null,
    });
  }

  return cells.length >= 2 ? cells : [];
}

/* ——— H1b · Scale trail ———
   "Flexibility, reliability and reach": a row of figures joined by one line
   that winds over and under them. Every figure is a fact — from `company.ts`
   when it has one, otherwise counted from the content files themselves (the hub
   list, the services, the industries) — so the trail can never state a number
   the site doesn't hold (house rule 4). A null fact drops its stop; fewer than
   three stops drop the section. */
export const scaleSection = {
  lead: "Flexibility, reliability and reach",
  title: `The answer is ${company.name.replace(/ Logistics$/, "")}.`,
  listLabel: `${company.name} in figures`,
};

export type ScaleIcon =
  "hub" | "map" | "layers" | "factory" | "giving" | "truck" | "package" | "calendar";

export interface ScaleStop {
  readonly id: string;
  readonly icon: ScaleIcon;
  /** Counted up on entry (en-IN), or null when the stop shows `staticText`. */
  readonly count: number | null;
  /** A figure that is not counted: a year, a percentage with a decimal. */
  readonly staticText: string | null;
  readonly suffix: string;
  readonly label: string;
}

const MAX_SCALE_STOPS = 5;

export function scaleStops(): ScaleStop[] {
  const stops: ScaleStop[] = [];
  const hubCount = company.hubsServed ?? HUBS.length;
  const states = new Set([ORIGIN, ...HUBS].map((hub) => hub.stateId)).size;

  if (company.foundedYear !== null) {
    stops.push({
      id: "since",
      icon: "calendar",
      count: null,
      staticText: String(company.foundedYear),
      suffix: "",
      label: "Moving freight since",
    });
  }
  if (company.fleetSize !== null) {
    stops.push({
      id: "fleet",
      icon: "truck",
      count: company.fleetSize,
      staticText: null,
      suffix: "+",
      label: "Vehicles on contract",
    });
  }
  if (company.monthlyConsignments !== null) {
    stops.push({
      id: "consignments",
      icon: "package",
      count: company.monthlyConsignments,
      staticText: null,
      suffix: "+",
      label: "Consignments every month",
    });
  }
  stops.push({
    id: "hubs",
    icon: "hub",
    count: hubCount,
    staticText: null,
    suffix: "",
    label: `Hubs on corridors from ${ORIGIN.name}`,
  });
  stops.push({
    id: "states",
    icon: "map",
    count: states,
    staticText: null,
    suffix: "",
    label: "States and union territories reached",
  });
  if (company.services.length > 0) {
    stops.push({
      id: "services",
      icon: "layers",
      count: company.services.length,
      staticText: null,
      suffix: "",
      label: "Services booked through one desk",
    });
  }
  if (company.industries.length > 0) {
    stops.push({
      id: "industries",
      icon: "factory",
      count: company.industries.length,
      staticText: null,
      suffix: "",
      label: "Industries we move for",
    });
  }
  if (company.givingPercent !== null) {
    stops.push({
      id: "giving",
      icon: "giving",
      count: null,
      staticText: `${formatNumberIN(company.givingPercent)}%`,
      suffix: "",
      label: "Of our earnings set aside for good causes",
    });
  }

  /* The trail holds five stops. Company facts come first, so once they are
     filled in they push the counted ones off the end, the giving line last. */
  const giving = stops.find((stop) => stop.id === "giving");
  const rest = stops.filter((stop) => stop.id !== "giving");
  const kept =
    giving === undefined
      ? rest.slice(0, MAX_SCALE_STOPS)
      : [...rest.slice(0, MAX_SCALE_STOPS - 1), giving];
  return kept.length >= 3 ? kept : [];
}

/* ——— H4 · Pinned process ——— */
export interface ProcessStep {
  /** Which `images.process` slot illustrates the step. */
  readonly id: ProcessImageStep;
  readonly title: string;
  readonly body: string;
}

export const processSteps: readonly ProcessStep[] = [
  {
    id: "enquiry",
    title: "Enquiry",
    body: "Tell us the load, the lane and the date. WhatsApp, phone or the quote form.",
  },
  {
    id: "pickup",
    title: "Rate & pickup",
    body: "We confirm the rate and vehicle, then pick up from your godown or shop.",
  },
  {
    id: "in-transit",
    title: "In transit",
    body: "Your LR number is your reference. Our desk shares status on request.",
  },
  {
    id: "delivered",
    title: "Delivered",
    body: "Proof of delivery is shared once the consignee signs.",
  },
];

/* ——— H6 · Commitments ——— */
/* The commitments from the company profile, by title; the full text lives on
   `/about`, which owns it, so the two pages cannot say different things. The
   giving line is one more item, present only while `company.givingPercent` is
   set (`about.giving` is null otherwise). */
export const commitments: readonly string[] = [
  ...about.drives.commitments.map((commitment) => commitment.title),
  ...(about.giving === null ? [] : [about.giving.commitmentTitle]),
];

/* ——— H7 · Quote band ——— */
export const quoteBand = {
  line: "Have a load ready to move?",
  ctaLabel: quoteCta.label,
  ctaHref: quoteCta.href,
  whatsappLabel: `Message the desk on ${whatsapp.label}`,
};
