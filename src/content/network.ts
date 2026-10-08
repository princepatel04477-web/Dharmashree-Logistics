import { company } from "./company";
import { ORIGIN } from "./hubs";

/* Network map + /network page copy. Counts are always passed in from
   `hubs.ts` so a sentence can never disagree with the map it describes. The
   one figure the map computes — straight-line distance — is labelled as
   such everywhere it appears; it is geometry, not a road or transit claim. */

export const networkMap = {
  ariaLabel: `${company.name} network map from ${ORIGIN.name}`,
  hubsLabel: "Hubs",
  srNote: "Use the arrow keys to move between hubs. A full list of hubs follows the map.",
  instruction: `Tap any hub to see its corridor from ${ORIGIN.name}.`,
  filterLabel: "Filter hubs by region",
  originLabel: ORIGIN.name,
  originTag: "Dispatch desk",
  tropicLabel: "Tropic of Cancer",
  readoutIdle: `${ORIGIN.name} · dispatch desk`,
  readoutDistance: (km: string): string => `${km} km straight-line`,

  overview: {
    eyebrow: `From ${ORIGIN.name}`,
    title: (count: number): string => `${String(count)} hubs. One desk.`,
    body: `Every corridor on this map starts at the ${ORIGIN.name} desk. Pick a region to bring its hubs closer, or find your city.`,
    searchLabel: "Find your city",
    searchPlaceholder: "City or state",
    resultsLabel: "Matching hubs",
    noMatch: (query: string): string => `No hub matches “${query}”.`,
    noMatchAction: "Ask about this lane",
    regionsTitle: "By region",
    regionCount: (count: number): string => `${String(count)} hubs`,
  },

  panel: {
    eyebrow: "Corridor",
    backLabel: "All hubs",
    closeLabel: "Close corridor panel",
    route: `${ORIGIN.name} →`,
    primaryTag: "Principal market",
    distanceLabel: `Straight-line from ${ORIGIN.name}`,
    distanceValue: (km: string): string => `${km} km`,
    transit: (min: number, max: number): string => `${String(min)}–${String(max)} days`,
    transitLabel: "Transit",
    verified: (date: string): string => `Verified ${date}`,
    quote: (name: string): string => `Request a quote to ${name}`,
    whatsapp: "Ask on WhatsApp",
    whatsappMessage: (name: string): string =>
      `Hello ${company.name}, I'd like a rate from ${ORIGIN.name} to ${name}.`,
  },
};

/* ——— /network page ——— */
export const networkPage = {
  metaTitle: "Network",
  metaDescription: `Every hub ${company.name} dispatches to from ${ORIGIN.name}, by region, with the corridor from the desk.`,
  eyebrow: "Network",
  title: "Where Surat’s freight goes.",
  lede: `One dispatch desk in ${ORIGIN.name}, corridors into the markets that buy what Surat makes. Select a hub to see its lane, or search for your city.`,
  countLine: (hubs: number, regions: number): string =>
    `${String(hubs)} hubs across ${String(regions)} regions`,
  directoryIndex: "Directory",
  directoryTitle: "Every hub, by region",
};
