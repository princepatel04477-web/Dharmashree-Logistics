import { company } from "./company";
import { quoteCta, whatsapp } from "./navigation";

/* Home page copy (Prompt 05). The wording is final, except where a line
   carries a fact: those read from `company.ts` so the page can never state
   something the content file doesn't have. A null fact removes its element —
   see `homeStats()` and the null guards in the section components. */

/* ——— H0 · Hero ——— */
export const hero = {
  eyebrow: `Freight & transport · ${company.headquarters.city}, ${company.headquarters.state}`,
  title: "Freight that moves the way Surat trades.",
  body: "Full loads, part loads and textile dispatch from Surat to the markets that matter — booked by people who answer the phone.",
  cta: quoteCta,
  trackLabel: "Track a consignment",
  trackHref: "/track",
  /** Rendered only when `company.branches` has an entry (ShinyText label). */
  branchPrefix: "Now also dispatching from",
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

/* ——— H1 · Stats strip ——— */
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

/* ——— H4 · Pinned process ——— */
export interface ProcessStep {
  readonly title: string;
  readonly body: string;
}

export const processSteps: readonly ProcessStep[] = [
  {
    title: "Enquiry",
    body: "Tell us the load, the lane and the date. WhatsApp, phone or the quote form.",
  },
  {
    title: "Rate & pickup",
    body: "We confirm the rate and vehicle, then pick up from your godown or shop.",
  },
  {
    title: "In transit",
    body: "Your LR number is your reference. Our desk shares status on request.",
  },
  {
    title: "Delivered",
    body: "Proof of delivery is shared once the consignee signs.",
  },
];

/* ——— H6 · Commitments ——— */
export const commitments: readonly string[] = [
  "One desk, one number. You speak to the same people from booking to delivery.",
  "Rates confirmed before pickup. No revisions after the truck leaves.",
  "Every consignment has an LR number from day one.",
];

/* ——— H7 · Quote band ——— */
export const quoteBand = {
  line: `Have a load leaving ${company.headquarters.city}?`,
  ctaLabel: quoteCta.label,
  ctaHref: quoteCta.href,
  whatsappLabel: `Message the desk on ${whatsapp.label}`,
};
