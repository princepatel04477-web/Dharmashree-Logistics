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
}

export interface Service {
  slug: string;
  name: string;
  summary: string;
  body: string[];
  bullets: string[];
  bestFor: string[];
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
