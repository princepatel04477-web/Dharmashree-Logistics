/* Photography slots (redesign Phase 2). Every photograph on the site is named
   here once: its manifest key (`<group>/<name>`, the path of the original under
   `assets/originals/` without the extension; `npm run images` builds the
   derivatives and `ResponsiveImage` resolves the key) and its alt text.
   Components take both from this file and never from string literals, so
   swapping a generated photo for a real one is a file replacement with the
   same name and no code change.

   Alt text says what is in the picture. It never names DharmaShree as the
   owner of the vehicle, the premises or the people shown: the photographs are
   illustrative, not records of the company's own fleet or sites (house rule 7).

   A slot whose original has not been produced yet renders a quiet branded
   ground from `ResponsiveImage` (never a label); `hasImage(key)` lets a section
   choose its own ground, for example `--brand-deep` under white text. */

export interface ImageSlot {
  /** Manifest key: "<group>/<name>". */
  readonly key: string;
  readonly alt: string;
}

export type ServiceImageSlug =
  | "express-parcel"
  | "full-truckload"
  | "local-on-demand"
  | "warehousing-fulfilment";

export type IndustryImageId =
  | "textiles"
  | "diamonds-jewellery"
  | "fmcg-retail"
  | "pharma"
  | "engineering";

export type ProcessImageStep = "enquiry" | "pickup" | "in-transit" | "delivered";

export type PageImageId = "network" | "about" | "track" | "partners" | "support" | "quote";

export interface ImageLibrary {
  /** Home hero. `desktop` is 16:9, `mobile` is 4:5 (use below 768 px). */
  readonly hero: Readonly<Record<"desktop" | "mobile", ImageSlot>>;
  /** Keyed by the service slug in `services.ts`. */
  readonly services: Readonly<Record<ServiceImageSlug, ImageSlot>>;
  /** Keyed by a short industry id; `industryImage(name)` maps the industry
     names in `company.industries` to these ids. */
  readonly industries: Readonly<Record<IndustryImageId, ImageSlot>>;
  /** The four steps of "How a consignment moves", in order. */
  readonly process: Readonly<Record<ProcessImageStep, ImageSlot>>;
  /** Page intro bands (21:9) and the /track intro (3:2). */
  readonly pages: Readonly<Record<PageImageId, ImageSlot>>;
  /** Link-preview image, 1200 x 630. */
  readonly social: Readonly<Record<"og", ImageSlot>>;
}

export const images: ImageLibrary = {
  hero: {
    desktop: {
      key: "hero/highway-golden-hour",
      alt: "A cobalt-blue closed-container truck driving along a wide expressway at golden hour, with open farmland and a low sun behind it.",
    },
    mobile: {
      key: "hero/highway-portrait",
      alt: "A cobalt-blue container truck coming towards the camera on an expressway at sunset, under a wide warm sky.",
    },
  },

  services: {
    "express-parcel": {
      key: "services/express-parcel",
      alt: "Brown cartons and blue poly mailers moving along a conveyor in a parcel sorting hub, with workers in orange hi-vis vests sorting by hand.",
    },
    "full-truckload": {
      key: "services/full-truckload",
      alt: "Two workers seen from behind loading wrapped bales of fabric into the open rear of a blue closed-body truck at a loading dock.",
    },
    "local-on-demand": {
      key: "services/local-on-demand",
      alt: "A compact blue electric cargo three-wheeler moving through a busy textile market street, past shops stacked with fabric rolls.",
    },
    "warehousing-fulfilment": {
      key: "services/warehousing",
      alt: "The aisle of a clean high-bay warehouse with blue steel racking, palletised cartons, an orange forklift and yellow lane markings on the floor.",
    },
  },

  industries: {
    textiles: {
      key: "industries/textiles",
      alt: "Rolls of bright saree and dress fabric in saffron, magenta, emerald and blue, stacked on a warehouse shelf, some wrapped in clear plastic.",
    },
    "diamonds-jewellery": {
      key: "industries/diamonds-jewellery",
      alt: "Gloved hands placing a small sealed courier pouch into a steel lockbox inside a dimly lit secure vehicle.",
    },
    "fmcg-retail": {
      key: "industries/fmcg-retail",
      alt: "Shrink-wrapped pallets of plain brown cartons waiting in a distribution centre staging lane, with a blue pallet jack alongside.",
    },
    pharma: {
      key: "industries/pharma",
      alt: "Plain white medicine cartons on clean steel shelving, with a gloved hand scanning one using a handheld barcode scanner.",
    },
    engineering: {
      key: "industries/engineering",
      alt: "Steel machine parts strapped onto wooden pallets on a flatbed trailer, with a blue tarpaulin half pulled back in an industrial yard.",
    },
  },

  process: {
    enquiry: {
      key: "process/enquiry",
      alt: "A booking desk seen over a shoulder: a hand holding a phone beside a laptop showing a route map, a printed consignment slip and a blue pen.",
    },
    pickup: {
      key: "process/pickup",
      alt: "Workers seen from behind lifting cartons into a blue light commercial truck outside a warehouse shutter in morning light.",
    },
    "in-transit": {
      key: "process/in-transit",
      alt: "An aerial view of a blue truck on a long straight highway running diagonally through green fields.",
    },
    delivered: {
      key: "process/delivered",
      alt: "One pair of hands passing a sealed carton to another across a shop counter, with a handheld scanner and a signed slip beside them.",
    },
  },

  pages: {
    network: {
      key: "pages/network-night",
      alt: "An aerial long exposure of a large highway interchange at dusk, with white and red light trails under a deep-blue sky.",
    },
    about: {
      key: "pages/about-surat",
      alt: "The Surat skyline and the Tapi river at blue hour, with traffic light trails on a bridge and calm water reflections.",
    },
    track: {
      key: "pages/track-scan",
      alt: "A hand scanning the barcode on a blank parcel label with a handheld scanner, in front of a blurred blue warehouse.",
    },
    partners: {
      key: "pages/partners-fleet",
      alt: "Three blue trucks parked side by side at a highway truck stop at sunrise, with drivers walking away in the distance.",
    },
    support: {
      key: "pages/support-desk",
      alt: "A person in a headset at a support desk with two monitors, seen from behind in a bright office with blue accents.",
    },
    quote: {
      key: "pages/quote-yard",
      alt: "A top-down view of a truck loading yard, with rows of blue and white trucks at loading bays and cartons on pallets.",
    },
  },

  social: {
    og: {
      key: "social/og-default",
      alt: "A cobalt-blue container truck on an expressway at golden hour, with open sky to the left.",
    },
  },
};

/** Public path of the link-preview JPEG derivative (1200 x 630). Open Graph
   needs an absolute URL: pair it with a `metadataBase` once the production
   domain is published. */
export const ogImagePath = "/img/social/og-default-1200.jpg";

/* `company.industries` holds display names; the photo ids are shorter. The
   match is on the name's leading words, so a wording change in the fact that
   keeps the first word still resolves. */
const industryIdByLeadingWord: Readonly<Record<string, IndustryImageId>> = {
  textiles: "textiles",
  diamonds: "diamonds-jewellery",
  fmcg: "fmcg-retail",
  pharma: "pharma",
  engineering: "engineering",
};

/** The photo for an industry name from `company.industries`, or `null` when
   the name has no photo (the card then renders name-only). */
export function industryImage(name: string): ImageSlot | null {
  const leadingWord = name.trim().toLowerCase().split(/[^a-z]+/)[0] ?? "";
  const id = industryIdByLeadingWord[leadingWord];
  return id === undefined ? null : images.industries[id];
}

/** The photo for a service slug from `services.ts`, or `null` for an unknown slug. */
export function serviceImage(slug: string): ImageSlot | null {
  const known = (Object.keys(images.services) as ServiceImageSlug[]).find(
    (candidate) => candidate === slug,
  );
  return known === undefined ? null : images.services[known];
}
