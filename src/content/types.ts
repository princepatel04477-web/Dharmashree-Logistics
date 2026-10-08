/* Shared content types. Unknown facts are `null` — the UI hides them
   (house rule 4). Never invent a value to fill these shapes. */

export interface Headquarters {
  city: string;
  state: string;
  addressLines: string[] | null;
  mapsUrl: string | null;
}

export interface Branch {
  city: string;
  state: string;
  addressLines: string[] | null;
  mapsUrl: string | null;
}

export interface SocialLinks {
  instagram: string | null;
  linkedin: string | null;
}

/** Builder credit in the footer bottom row. With no `url` set the credit
   renders as plain text — never as a dead link. */
export interface Credit {
  name: string;
  url: string | null;
}

export interface Company {
  name: string;
  legalName: string | null;
  tagline: string | null;
  headquarters: Headquarters;
  branches: Branch[];
  /** E.164, e.g. "+919876543210". */
  phone: string | null;
  /** E.164, used for wa.me links. */
  whatsapp: string | null;
  email: string | null;
  gstin: string | null;
  foundedYear: number | null;
  fleetSize: number | null;
  hubsServed: number | null;
  monthlyConsignments: number | null;
  services: string[];
  industries: string[];
  social: SocialLinks;
  credit: Credit;
}

/* One service in the catalogue (Prompt 06). `name` is the fact — it mirrors an
   entry in `company.services` and must stay one-for-one with it. Everything
   else is copy for `/services` and `/services/[slug]`. An empty array removes
   its block from the detail page; the block is never rendered as an empty shell
   and the numbering closes over it (house rule 4). */
export interface Service {
  readonly slug: string;
  readonly name: string;
  /** One line, used on the index row and the home tile. */
  readonly summary: string;
  /** Detail-page intro paragraphs, in order. */
  readonly body: readonly string[];
  /** "What's included" rows. */
  readonly bullets: readonly string[];
  /** Loads and lanes the service suits. */
  readonly bestFor: readonly string[];
  /** Exact vehicle names from `fleet.ts`; `[]` drops the block entirely. */
  readonly vehicles: readonly string[];
  /** Per-service questions for the detail page's accordion. */
  readonly questions: readonly Faq[];
  /** Manifest key for the photo, or null for the `services/<slug>` default. */
  readonly image: string | null;
}

/** One vehicle on the fleet grid. The name comes from a service's `vehicles`
   list — never from this shape — and `note` is `""` when no note is written
   yet, which renders a name-only card. */
export interface FleetVehicle {
  readonly name: string;
  readonly note: string;
}

/** One industry on the home page's capability carousel (Prompt 05). The name
   is a fact from `company.industries`; the note is copy in `industries.ts`. */
export interface Industry {
  name: string;
  note: string;
}

export interface Hub {
  id: string;
  name: string;
  state: string;
  stateId: string;
  region: string;
  market: string;
  since: number | null;
  major: boolean;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface TimelineEntry {
  year: string;
  tagline: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  badge: string;
}

export interface ImageManifestEntry {
  group: string;
  file: string;
  width: number;
  height: number;
  blurDataURL: string;
  widths: number[];
}

export type ImageManifest = Record<string, ImageManifestEntry>;
