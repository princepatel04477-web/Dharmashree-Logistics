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
}

/** One printed entry in a contact group: a number, an address, an ID. */
export interface ContactEntry {
  /** Printed rows; an address keeps its own line breaks. */
  readonly rows: readonly string[];
  /** `tel:` / `mailto:` / `wa.me` / Maps / the website; `null` is plain text. */
  readonly href: string | null;
  /** Leaves the site (WhatsApp, the website, Maps), so it opens in a new tab. */
  readonly external: boolean;
}

/** A labelled block of contact facts ("Phone", "Corporate office", …).
    `channels` are ways to reach the desk; `places` are where it is and who it is. */
export interface ContactGroup {
  readonly id: "phone" | "email" | "whatsapp" | "website" | "office" | "desk" | "registration";
  readonly label: string;
  readonly side: "channels" | "places";
  readonly entries: readonly ContactEntry[];
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
  { href: "/attach-truck", label: "Attach truck" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Pages the primary bar has no room for. The mobile menu lists them under the
    main links; the footer carries them in its own columns. */
export const secondaryNav: readonly NavItem[] = [
  { href: "/support", label: "Support & FAQ" },
  { href: "/partners", label: "Delivery partners" },
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
  /** The floating button's label, shown beside the mark from `sm` up. */
  floatingLabel: "Chat with us",
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

/* ——— Announcement strip ———
   The notice itself is written in the admin panel and read at runtime; this is
   the strip's own copy. */
export const announcement = {
  label: "Announcement",
  badge: "New",
} as const;

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
  const phones =
    company.phone === null ? company.otherPhones : [company.phone, ...company.otherPhones];
  for (const phone of phones) {
    links.push({ label: formatPhoneIN(phone), href: `tel:${phone}`, kind: "phone" });
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

/* Addresses render as one line each (Maa Sheetla's footer treatment), so the
   optional Maps link wraps the whole address instead of just its first row. */
export const addressLabels = {
  corporateOffice: "Corporate office",
  contactAddress: "Desk",
  llpin: "CIN/LLP",
  transporterId: "Transporter ID",
  gstin: "GSTIN",
};

/** The Surat corporate office as one line; `null` when no address lines are set. */
export function corporateOfficeLine(): FooterLine | null {
  const lines = company.headquarters.addressLines;
  if (lines === null || lines.length === 0) return null;
  return { text: lines.join(", "), href: company.headquarters.mapsUrl };
}

/** The contact (postal) address as one line; `null` when it is not set. */
export function contactAddressLine(): FooterLine | null {
  const contact = company.contactAddress;
  if (contact === null || contact.lines.length === 0) return null;
  return { text: contact.lines.join(", "), href: contact.mapsUrl };
}

/** Registration numbers, plain text, each dropped when its fact is `null`. */
export function registrationLines(): FooterLine[] {
  const lines: FooterLine[] = [];
  if (company.llpin !== null) {
    lines.push({ text: `${addressLabels.llpin} ${company.llpin}`, href: null });
  }
  if (company.transporterId !== null) {
    lines.push({ text: `${addressLabels.transporterId} ${company.transporterId}`, href: null });
  }
  if (company.gstin !== null) {
    lines.push({ text: `${addressLabels.gstin} ${company.gstin}`, href: null });
  }
  return lines;
}

export const contactGroupLabels: Record<ContactGroup["id"], string> = {
  phone: "Phone",
  email: "Email",
  whatsapp: "WhatsApp",
  website: "Website",
  office: addressLabels.corporateOffice,
  desk: addressLabels.contactAddress,
  registration: "Registration",
};

/* ——— Contact groups shared by the footer and the mobile menu ———
   Each fact sits under its own label: every phone number together, then email,
   WhatsApp and the website; then the addresses, each printed on its own lines;
   then the registration numbers. A group whose facts are all `null` is
   dropped, not rendered as an empty label. */
export function contactGroups(): ContactGroup[] {
  const groups: ContactGroup[] = [];
  const add = (id: ContactGroup["id"], side: ContactGroup["side"], entries: ContactEntry[]) => {
    if (entries.length > 0) groups.push({ id, label: contactGroupLabels[id], side, entries });
  };

  const phones =
    company.phone === null ? company.otherPhones : [company.phone, ...company.otherPhones];
  add(
    "phone",
    "channels",
    phones.map((phone) => ({
      rows: [formatPhoneIN(phone)],
      href: `tel:${phone}`,
      external: false,
    })),
  );
  add(
    "email",
    "channels",
    company.email === null
      ? []
      : [{ rows: [company.email], href: `mailto:${company.email}`, external: false }],
  );
  const wa = whatsappLink();
  add(
    "whatsapp",
    "channels",
    wa === null ? [] : [{ rows: [whatsapp.floatingLabel], href: wa, external: true }],
  );
  const domain = websiteDomain();
  add(
    "website",
    "channels",
    company.website === null || domain === null
      ? []
      : [{ rows: [domain], href: company.website, external: true }],
  );

  const office = company.headquarters.addressLines;
  add(
    "office",
    "places",
    office === null || office.length === 0
      ? []
      : [{ rows: office, href: company.headquarters.mapsUrl, external: true }],
  );
  const desk = company.contactAddress;
  add(
    "desk",
    "places",
    desk === null || desk.lines.length === 0
      ? []
      : [{ rows: desk.lines, href: desk.mapsUrl, external: true }],
  );
  add(
    "registration",
    "places",
    registrationLines().map((line) => ({ rows: [line.text], href: null, external: false })),
  );
  return groups;
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
    },
    {
      id: "services",
      title: "Services",
      links: services.map((service) => route(`/services/${service.slug}`, service.name)),
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
    },
  ];

  /* A column with nothing to say is dropped, not rendered as an empty shell. */
  return columns.filter((column) => column.links.length > 0);
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
  /** The "Reach us" block: labelled contact groups, dropped when empty. */
  reach: { title: "Reach us", groups: contactGroups() },
  /** Decorative band; the real, keyboard-reachable list lives on /network. */
  hubBand: [ORIGIN.name, ...HUBS.map((hub) => hub.name)],
  /** Where the copyright line leads: the admin panel's sign-in. */
  adminHref: "/admin/",
};
