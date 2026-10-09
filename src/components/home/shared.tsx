import type { LucideProps } from "lucide-react";
import {
  BikeIcon,
  ClipboardListIcon,
  CogIcon,
  GemIcon,
  HandshakeIcon,
  LayersIcon,
  MessagesSquareIcon,
  PackageCheckIcon,
  PackageIcon,
  PillIcon,
  RouteIcon,
  ShieldCheckIcon,
  ShirtIcon,
  ShoppingBasketIcon,
  TruckIcon,
  WarehouseIcon,
} from "lucide-react";
import { images, type ProcessImageStep } from "@/content/images";

/* Shared by the home sections: one title style for every section heading, and
   the icon for each service, industry, process step and commitment. Icons are
   chosen here, by the same ids and keys `images.ts` uses, so a section never
   carries its own lookup. They travel as plain names (`HomeIconName`), because
   a server section cannot hand a component function to a client tile. */

/** Section titles are set at 36 / 48 px in the display face. */
export const SECTION_TITLE_CLASS =
  "font-display text-step-4 sm:text-5xl text-ink leading-headline tracking-display";

/** Colours the numbered index label (`01`) in the brand blue. */
export const SECTION_INDEX_CLASS = "[&_.section-index]:text-brand";

export type HomeIconName =
  | "package"
  | "truck"
  | "bike"
  | "warehouse"
  | "shirt"
  | "gem"
  | "basket"
  | "pill"
  | "cog"
  | "clipboard"
  | "route"
  | "package-check"
  | "shield"
  | "messages"
  | "handshake"
  | "layers";

export function HomeIcon({ name, ...props }: { name: HomeIconName } & LucideProps) {
  switch (name) {
    case "truck":
      return <TruckIcon {...props} />;
    case "bike":
      return <BikeIcon {...props} />;
    case "warehouse":
      return <WarehouseIcon {...props} />;
    case "shirt":
      return <ShirtIcon {...props} />;
    case "gem":
      return <GemIcon {...props} />;
    case "basket":
      return <ShoppingBasketIcon {...props} />;
    case "pill":
      return <PillIcon {...props} />;
    case "cog":
      return <CogIcon {...props} />;
    case "clipboard":
      return <ClipboardListIcon {...props} />;
    case "route":
      return <RouteIcon {...props} />;
    case "package-check":
      return <PackageCheckIcon {...props} />;
    case "shield":
      return <ShieldCheckIcon {...props} />;
    case "messages":
      return <MessagesSquareIcon {...props} />;
    case "handshake":
      return <HandshakeIcon {...props} />;
    case "layers":
      return <LayersIcon {...props} />;
    case "package":
      return <PackageIcon {...props} />;
  }
}

const serviceIcons: Readonly<Record<string, HomeIconName>> = {
  "express-parcel": "package",
  "full-truckload": "truck",
  "local-on-demand": "bike",
  "warehousing-fulfilment": "warehouse",
};

export function serviceIcon(slug: string): HomeIconName {
  return serviceIcons[slug] ?? "package";
}

/* Keyed by the manifest key of the industry slot, so the pairing follows
   `images.ts` and not the display name. */
const industryIcons: Readonly<Record<string, HomeIconName>> = {
  [images.industries.textiles.key]: "shirt",
  [images.industries["diamonds-jewellery"].key]: "gem",
  [images.industries["fmcg-retail"].key]: "basket",
  [images.industries.pharma.key]: "pill",
  [images.industries.engineering.key]: "cog",
};

export function industryIcon(imageKey: string | null): HomeIconName {
  return (imageKey === null ? undefined : industryIcons[imageKey]) ?? "package";
}

const processIcons: Readonly<Record<ProcessImageStep, HomeIconName>> = {
  enquiry: "clipboard",
  pickup: "package",
  "in-transit": "route",
  delivered: "package-check",
};

export function processIcon(step: ProcessImageStep): HomeIconName {
  return processIcons[step];
}

/* The four commitments in `about.ts`, in order. */
const commitmentIcons: readonly HomeIconName[] = ["shield", "messages", "handshake", "layers"];

export function commitmentIcon(index: number): HomeIconName {
  return commitmentIcons[index] ?? "shield";
}
