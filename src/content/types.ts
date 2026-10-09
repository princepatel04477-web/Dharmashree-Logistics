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

/** Sign-in pages of the company's billing portal. A `null` URL hides that
   button on `/track`. */
export interface Portals {
  /** Customers and suppliers (the consignor side). */
  customer: string | null;
  /** Consignees (the receiving side). */
  consignee: string | null;
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
  /** Support desk hours as the company publishes them, e.g. "Mon–Sat, 9:30–7".
     `null` hides the row on `/support` and `/contact`. */
  supportHours: string | null;
  gstin: string | null;
  foundedYear: number | null;
  fleetSize: number | null;
  hubsServed: number | null;
  monthlyConsignments: number | null;
  services: string[];
  industries: string[];
  social: SocialLinks;
  portals: Portals;
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
  /** The display line under the H1 — the service's own promise, verbatim from
     the company profile. */
  readonly headline: string;
  /** Longer-form sections from the company profile that the signature block
     does not already carry. `[]` drops the "In detail" block. */
  readonly sections: readonly ServiceSection[];
  /** Whether the "Lanes from Surat" map block belongs on this page. Intra-city
     and storage services have no corridor to show, so they leave it out. */
  readonly showLanes: boolean;
  /** The one interactive block the detail page puts between the hero and the
     numbered blocks (Prompt 11). The template switches on `kind`. */
  readonly signature: ServiceSignature;
}

export interface ServiceSection {
  readonly title: string;
  readonly body: readonly string[];
}

/** One stop, stage or leg inside a signature block. */
export interface SignatureStep {
  readonly title: string;
  readonly body: string;
}

/** One choice inside a signature block's switch or selector. */
export interface SignatureOption {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly body: string;
}

/** Express parcel: a scroll-drawn pickup-to-door journey, then a B2B / B2C /
   bulk switch. */
export interface JourneySignature {
  readonly kind: "journey";
  readonly title: string;
  readonly lede: string;
  readonly stops: readonly SignatureStep[];
  readonly segmentsLabel: string;
  readonly segments: readonly SignatureOption[];
}

/** Full truckload: dedicated-versus-shared toggle over a drawn truck body,
   then the supply-chain legs on a pinned horizontal band. */
export interface DedicatedSignature {
  readonly kind: "dedicated";
  readonly title: string;
  readonly lede: string;
  readonly toggleLabel: string;
  readonly dedicated: SignatureOption;
  readonly shared: SignatureOption;
  /** Accessible description of the truck drawing. */
  readonly figureCaption: string;
  readonly flowTitle: string;
  readonly flow: readonly SignatureStep[];
}

/** Local on-demand: "what are you sending?" picks a vehicle class, and a
   scheduled / urgent switch. */
export interface SelectorSignature {
  readonly kind: "selector";
  readonly title: string;
  readonly lede: string;
  readonly questionLabel: string;
  readonly options: readonly (SignatureOption & { readonly vehicle: string })[];
  readonly vehicleLabel: string;
  readonly modesLabel: string;
  readonly modes: readonly SignatureOption[];
}

/** Warehousing: a pinned walk through the fulfilment stages with the returns
   arc drawn back into stock, then the four capabilities as cards. */
export interface LoopSignature {
  readonly kind: "loop";
  readonly title: string;
  readonly lede: string;
  readonly stages: readonly SignatureStep[];
  readonly returnLabel: string;
  readonly capabilitiesTitle: string;
  readonly capabilities: readonly SignatureStep[];
}

export type ServiceSignature =
  JourneySignature | DedicatedSignature | SelectorSignature | LoopSignature;

/** A transport partner from the company profile (Prompt 13). Phones are E.164;
   `hubId` names the network hub in the same city, or null when the city is not
   a hub — the pin then sits at `latLng`, which is geography, not a claim. */
export interface Partner {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly addressLines: readonly string[];
  readonly phones: readonly string[];
  readonly hubId: string | null;
  readonly latLng: readonly [number, number];
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
