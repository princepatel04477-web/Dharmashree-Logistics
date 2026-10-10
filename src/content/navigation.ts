import { formatNumberIN, formatPhoneIN } from "@/lib/format";
import { company } from "./company";
import { HUBS, ORIGIN } from "./hubs";
import { services } from "./services";
import { track } from "./track";

/* Site chrome copy and link data (Prompt 04). Every string here is either a
   label for a route or derived from a fact in `company.ts` — no invented
   claims, and every `null` fact drops its element instead of rendering an
   empty row (house rules 3 and 4). */

export interface NavItem {
  readonly href: string;
  readonly label: string;
}

/** `route` → next/link · the rest are plain `<a>` (house rule 10). */
export type FooterLinkKind = "route" | "phone" | "email" | "whatsapp" | "website";

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

/* ——— Logo ———
   The supplied logo (`assets/brand/`, built into `public/brand/` by
   `npm run brand`). The dimensions are the trimmed file's own, so the header can
   reserve its box before the image loads. */
export const logo = {
  src: "/brand/dharmashree-logo.png",
  width: 420,
  height: 98,
};

/* The footer wordmark (`assets/brand/dharmashree-footer-logo-source.png`, built
   by `npm run brand`). Only the footer uses it, and always the white `light`
   file, because the footer sits on `--brand-deep`. */
export const footerLogo = {
  src: "/brand/dharmashree-footer-logo.png",
  lightSrc: "/brand/dharmashree-footer-logo-light.png",
  width: 2400,
  height: 210,
};

/* ——— Primary navigation (desktop centre cluster, ≥1024px) ——— */
export const primaryNav: readonly NavItem[] = [
  { href: "/services", label: "Services" },
  { href: "/network", label: "Network" },
  { href: "/track", label: "Track" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Pages the primary bar has no room for. The mobile menu lists them under the
    five main links; the footer carries them in its own columns. */
export const secondaryNav: readonly NavItem[] = [
  { href: "/support", label: "Support & FAQ" },
  { href: "/partners", label: "Delivery partners" },
  { href: "/attach-truck", label: "Attach your truck" },
];

/* ——— The one filled CTA on every page ——— */
export const quoteCta = {
  href: "/quote",
  label: "Enquire now",
  /** Narrow-viewport label — same intent, fits 360px next to the hamburger. */
  compactLabel: "Enquire",
};

/* ——— Portal sign-ins (header on lg+, mobile sheet below) ———
   Outline buttons beside the filled "Enquire now" (house rule 6). The labels are
   the ones /track already uses, so the same portal has one name everywhere; a
   `null` portal URL drops its button (house rule 4). The portals live on another
   host, so they open in a new tab. `compactLabel` is the shorter wording the
   header uses between 1024px and 1279px, where the full labels would not fit. */
export interface PortalLink {
  readonly id: "customer" | "consignee";
  readonly label: string;
  readonly compactLabel: string;
  readonly href: string;
}

export interface PortalNav {
  readonly links: readonly PortalLink[];
  /** Read after each label by screen readers: the link leaves this site. */
  readonly newTabHint: string;
  readonly ariaLabel: string;
}

function buildPortalNav(): PortalNav {
  const links: PortalLink[] = [];
  if (company.portals.customer !== null) {
    links.push({
      id: "customer",
      label: track.portals.customerLabel,
      compactLabel: "Customer login",
      href: company.portals.customer,
    });
  }
  if (company.portals.consignee !== null) {
    links.push({
      id: "consignee",
      label: track.portals.consigneeLabel,
      compactLabel: track.portals.consigneeLabel,
      href: company.portals.consignee,
    });
  }
  return {
    links,
    newTabHint: track.portals.newTabHint,
    ariaLabel: "Portal sign-in",
  };
}

export const portalNav: PortalNav = buildPortalNav();

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

/* ——— Website ———
   Shown as the bare domain ("dharmashreegroup.in"), linked to the full URL.
   `null` when the fact is `null`. */
export function websiteDomain(): string | null {
  if (company.website === null) return null;
  const domain = company.website.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  return domain === "" ? null : domain;
}

/* ——— Giving ———
   The percentage is deliberately not tied to a base ("profits", "revenue"): the
   source fact only says what share of earnings is set aside. `null` hides it. */
function givingPercentText(): string | null {
  return company.givingPercent === null ? null : `${formatNumberIN(company.givingPercent)}%`;
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
  const domain = websiteDomain();
  if (company.website !== null && domain !== null) {
    links.push({ label: domain, href: company.website, kind: "website" });
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
      links: [
        route("/about", "About"),
        route("/network", "Network"),
        route("/partners", "Delivery partners"),
        route("/attach-truck", "Attach your truck"),
        route("/contact", "Contact"),
      ],
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
        route("/support", "Support & FAQ"),
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

/* ——— Utility bar (lg+, above the header) ———
   Contact facts on the left, the giving line on the right. The portal sign-ins
   moved into the header itself (`portalNav`). Every item is dropped when its
   fact is `null` (house rule 4). */
export interface UtilityLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind: "email" | "phone";
}

export interface UtilityBar {
  readonly contact: readonly UtilityLink[];
  /** Plain text, not a link. `null` when `company.givingPercent` is `null`. */
  readonly giving: string | null;
  readonly ariaLabel: string;
}

function buildUtilityBar(): UtilityBar {
  const contact: UtilityLink[] = [];
  if (company.email !== null) {
    contact.push({
      id: "email",
      label: company.email,
      href: `mailto:${company.email}`,
      kind: "email",
    });
  }
  if (company.phone !== null) {
    contact.push({
      id: "phone",
      label: formatPhoneIN(company.phone),
      href: `tel:${company.phone}`,
      kind: "phone",
    });
  }
  const percent = givingPercentText();
  return {
    contact,
    giving: percent === null ? null : `${percent} of our earnings are set aside for good causes`,
    ariaLabel: "Contact details",
  };
}

export const utilityBar: UtilityBar = buildUtilityBar();
export const hasUtilityBar: boolean = utilityBar.contact.length > 0 || utilityBar.giving !== null;

/** Used when `company.tagline` is `null`. Brand-level: no city, no numbers. */
const FALLBACK_SLOGAN = "Freight you can trust, across India.";

function buildGiving(): string | null {
  const percent = givingPercentText();
  return percent === null
    ? null
    : `${company.name} sets aside ${percent} of its earnings for good causes.`;
}

export const footer = {
  /** The single display line in the top band: the company's own tagline. */
  slogan: company.tagline ?? FALLBACK_SLOGAN,
  /** The giving statement; `null` when the fact is `null`. */
  giving: buildGiving(),
  columns: footerColumns(),
  /** Decorative band; the real, keyboard-reachable list lives on /network. */
  hubBand: [ORIGIN.name, ...HUBS.map((hub) => hub.name)],
};
