import { formatPhoneIN } from "@/lib/format";
import { company } from "./company";
import { HUBS, ORIGIN } from "./hubs";
import { services } from "./services";

/* Site chrome copy and link data (Prompt 04). Every string here is either a
   label for a route or derived from a fact in `company.ts` — no invented
   claims, and every `null` fact drops its element instead of rendering an
   empty row (house rules 3 and 4). */

export interface NavItem {
  readonly href: string;
  readonly label: string;
}

/** `route` → next/link · the rest are plain `<a>` (house rule 10). */
export type FooterLinkKind = "route" | "phone" | "email" | "whatsapp";

export interface FooterLink {
  readonly label: string;
  readonly href: string;
  readonly kind: FooterLinkKind;
}

export interface FooterLine {
  readonly text: string;
  /** Address lines link to Maps when `mapsUrl` is set; otherwise plain text. */
  readonly href: string | null;
}

export interface FooterColumn {
  readonly id: string;
  readonly title: string;
  readonly links: readonly FooterLink[];
  readonly lines: readonly FooterLine[];
}

/* ——— Wordmark ———
   Split from company.name so the header never carries a second spelling of the
   firm: the face renders as display text, the remainder as the small-caps
   lockup (Maa Sheetla's `.logo` + `.logo small`). */
const nameParts = company.name.split(" ");

export const wordmark = {
  primary: nameParts[0] ?? company.name,
  secondary: nameParts.slice(1).join(" "),
};

/* ——— Primary navigation (desktop centre cluster, ≥1024px) ——— */
export const primaryNav: readonly NavItem[] = [
  { href: "/services", label: "Services" },
  { href: "/network", label: "Network" },
  { href: "/track", label: "Track" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/* ——— The one filled CTA on every page ——— */
export const quoteCta = {
  href: "/quote",
  label: "Request a quote",
  /** Narrow-viewport label — same intent, fits 360px next to the hamburger. */
  compactLabel: "Quote",
};

export const skipLink = {
  href: "#main",
  label: "Skip to main content",
};

/** The same CTA, carrying the service the visitor was reading (Prompt 06).
    `trailingSlash: true` means internal routes resolve as `/quote/`, so the
    slash is written here rather than left to a redirect. */
export function quoteHrefForService(serviceSlug: string): string {
  return `${quoteCta.href}/?service=${encodeURIComponent(serviceSlug)}`;
}

/* ——— WhatsApp ———
   `wa.me` wants the bare number, so E.164 is stripped of its `+`. When
   company.whatsapp is null every WhatsApp affordance is absent, not empty. */
export const whatsapp = {
  label: "WhatsApp",
  defaultMessage: `Hello ${company.name}, I'd like a freight rate.`,
};

export function whatsappNumber(): string | null {
  const raw = company.whatsapp;
  if (raw === null) return null;
  const digits = raw.replace(/\D/g, "");
  return digits === "" ? null : digits;
}

export function whatsappLink(message: string = whatsapp.defaultMessage): string | null {
  const number = whatsappNumber();
  if (number === null) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/* ——— Contact rows shared by the mobile menu and the footer ——— */
export function contactLinks(): FooterLink[] {
  const links: FooterLink[] = [];
  if (company.phone !== null) {
    links.push({
      label: formatPhoneIN(company.phone),
      href: `tel:${company.phone}`,
      kind: "phone",
    });
  }
  if (company.email !== null) {
    links.push({ label: company.email, href: `mailto:${company.email}`, kind: "email" });
  }
  const wa = whatsappLink();
  if (wa !== null) {
    links.push({ label: whatsapp.label, href: wa, kind: "whatsapp" });
  }
  return links;
}

/* The HQ address renders as one line (Maa Sheetla's footer treatment), so the
   optional Maps link wraps the whole address instead of just its first row. */
export function contactLines(): FooterLine[] {
  const lines: FooterLine[] = [];
  const address = company.headquarters.addressLines ?? [];
  if (address.length > 0) {
    lines.push({ text: address.join(", "), href: company.headquarters.mapsUrl });
  }
  if (company.gstin !== null) {
    lines.push({ text: `GSTIN ${company.gstin}`, href: null });
  }
  return lines;
}

/* ——— Footer ——— */
function route(href: string, label: string): FooterLink {
  return { href, label, kind: "route" };
}

function footerColumns(): FooterColumn[] {
  const columns: FooterColumn[] = [
    {
      id: "company",
      title: "Company",
      links: [route("/about", "About"), route("/network", "Network"), route("/contact", "Contact")],
      lines: [],
    },
    {
      id: "services",
      title: "Services",
      links: services.map((service) => route(`/services/${service.slug}`, service.name)),
      lines: [],
    },
    {
      id: "help",
      title: "Help",
      links: [
        route("/track", "Track"),
        route("/contact#faq", "FAQ"),
        route("/privacy", "Privacy"),
        route("/terms", "Terms"),
      ],
      lines: [],
    },
    {
      id: "reach",
      title: "Reach us",
      links: contactLinks(),
      lines: contactLines(),
    },
  ];

  /* A column with nothing to say is dropped, not rendered as an empty shell. */
  return columns.filter((column) => column.links.length > 0 || column.lines.length > 0);
}

export const credit = {
  prefix: "Site by",
  name: company.credit.name,
  url: company.credit.url,
};

export const footer = {
  /** The single display line in the top band — a fact, not a slogan. */
  slogan: `Move it from ${company.headquarters.city}.`,
  ctaLabel: quoteCta.label,
  columns: footerColumns(),
  /** Decorative band; the real, keyboard-reachable list lives on /network. */
  hubBand: [ORIGIN.name, ...HUBS.map((hub) => hub.name)],
};
