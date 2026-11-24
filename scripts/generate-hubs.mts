/* One-shot generator: projects the 78 verbatim Maa Sheetla nodes into
   viewBox x/y and writes src/content/hubs.ts. Reproducible — run with
   `npm run generate:hubs`. Raw table copied verbatim from Maa Sheetla
   `components/IndiaReachMap.tsx` (SHA-16 fbe8cad93af096a0); `hub` market
   copy and `since` years have no field in the Hub interface (see map-port.md).
   Region mapping: source tabs verbatim, extended so every hub is covered —
   ncr-north += haryana/uttarakhand/jammu-and-kashmir, central-others +=
   west-bengal/andhra-pradesh. Gujarat holds only the origin (catch-all).
   `primary` is the source's `isPrimary` flag (21 nodes); `stateId` is the
   source state slug, used to tint served states; `distanceKm` is the
   great-circle distance from Surat, rounded to 10 km and always labelled as
   straight-line in the UI (it is geometry, not a road or transit figure). */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { projectPoint } from "../src/components/map/projection";

interface RawNode {
  id: string;
  name: string;
  state: string;
  stateId: string;
  lat: number;
  lng: number;
}

const RAW_NODES: readonly RawNode[] = [
  {
    id: "delhi",
    name: "Delhi NCR",
    state: "Delhi NCR",
    stateId: "delhi",
    lat: 28.6139,
    lng: 77.209,
  },
  {
    id: "kanpur",
    name: "Kanpur",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.4499,
    lng: 80.3319,
  },
  {
    id: "lucknow",
    name: "Lucknow",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.8467,
    lng: 80.9462,
  },
  {
    id: "varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 25.3176,
    lng: 82.9739,
  },
  { id: "patna", name: "Patna", state: "Bihar", stateId: "bihar", lat: 25.5941, lng: 85.1376 },
  {
    id: "gorakhpur",
    name: "Gorakhpur",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.7606,
    lng: 83.3732,
  },
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    stateId: "rajasthan",
    lat: 26.9124,
    lng: 75.7873,
  },
  {
    id: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    stateId: "west-bengal",
    lat: 22.5726,
    lng: 88.3639,
  },
  {
    id: "ranchi",
    name: "Ranchi",
    state: "Jharkhand",
    stateId: "jharkhand",
    lat: 23.3441,
    lng: 85.3096,
  },
  {
    id: "dhanbad",
    name: "Dhanbad",
    state: "Jharkhand",
    stateId: "jharkhand",
    lat: 23.7957,
    lng: 86.4304,
  },
  {
    id: "ludhiana",
    name: "Ludhiana",
    state: "Punjab",
    stateId: "punjab",
    lat: 30.901,
    lng: 75.8573,
  },
  {
    id: "indore",
    name: "Indore",
    state: "Madhya Pradesh",
    stateId: "madhya-pradesh",
    lat: 22.7196,
    lng: 75.8577,
  },
  {
    id: "bhopal",
    name: "Bhopal",
    state: "Madhya Pradesh",
    stateId: "madhya-pradesh",
    lat: 23.2599,
    lng: 77.4126,
  },
  {
    id: "raipur",
    name: "Raipur",
    state: "Chhattisgarh",
    stateId: "chhattisgarh",
    lat: 21.2514,
    lng: 81.6296,
  },
  {
    id: "meerut",
    name: "Meerut",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 28.9845,
    lng: 77.7064,
  },
  {
    id: "muzaffarnagar",
    name: "Muzaffarnagar",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 29.4727,
    lng: 77.706,
  },
  {
    id: "bareilly",
    name: "Bareilly",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 28.367,
    lng: 79.4304,
  },
  {
    id: "allahabad",
    name: "Allahabad",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 25.4358,
    lng: 81.8463,
  },
  {
    id: "muzaffarpur",
    name: "Muzaffarpur",
    state: "Bihar",
    stateId: "bihar",
    lat: 26.1209,
    lng: 85.391,
  },
  {
    id: "saharanpur",
    name: "Saharanpur",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 29.9679,
    lng: 77.541,
  },
  {
    id: "jammu",
    name: "Jammu",
    state: "Jammu & Kashmir",
    stateId: "jammu-and-kashmir",
    lat: 32.7266,
    lng: 74.857,
  },
  {
    id: "akbarpur",
    name: "Akbarpur",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.4339,
    lng: 82.5348,
  },
  {
    id: "azamgarh",
    name: "Azamgarh",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.0738,
    lng: 83.1859,
  },
  {
    id: "babhnan",
    name: "Babhnan",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.9667,
    lng: 82.47,
  },
  {
    id: "bhadohi",
    name: "Bhadohi",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 25.3956,
    lng: 82.5714,
  },
  {
    id: "bahraich",
    name: "Bahraich",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.5705,
    lng: 81.5977,
  },
  {
    id: "baliya",
    name: "Ballia",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 25.7583,
    lng: 84.1489,
  },
  {
    id: "balrampur",
    name: "Balrampur",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.43,
    lng: 82.1798,
  },
  {
    id: "barabanki",
    name: "Barabanki",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.9272,
    lng: 81.1895,
  },
  {
    id: "barhalganj",
    name: "Barhalganj",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.2825,
    lng: 83.5042,
  },
  {
    id: "bashkhari",
    name: "Bashkhari",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.4719,
    lng: 82.7212,
  },
  {
    id: "basti",
    name: "Basti",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.7995,
    lng: 82.7483,
  },
  {
    id: "belthara",
    name: "Belthara Road",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.1558,
    lng: 83.8647,
  },
  {
    id: "colonelganj",
    name: "Colonelganj",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.1333,
    lng: 81.7,
  },
  {
    id: "dalmau",
    name: "Dalmau",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.0667,
    lng: 81.0333,
  },
  {
    id: "faizabad",
    name: "Faizabad (Ayodhya)",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.773,
    lng: 82.1409,
  },
  {
    id: "gilaula",
    name: "Gilaula",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.64,
    lng: 81.936,
  },
  {
    id: "gonda",
    name: "Gonda",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.1306,
    lng: 81.9619,
  },
  {
    id: "gosaiganj",
    name: "Gosaiganj (Ayodhya)",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.5778,
    lng: 82.3789,
  },
  {
    id: "gosaiganj-lucknow",
    name: "Gosaiganj (Lucknow)",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.7719,
    lng: 81.1219,
  },
  {
    id: "ikauna",
    name: "Ikauna",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.5456,
    lng: 81.9697,
  },
  {
    id: "itiyathok",
    name: "Itiyathok",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.2917,
    lng: 82.0461,
  },
  {
    id: "jalalabad",
    name: "Jalalabad",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.7275,
    lng: 79.6644,
  },
  {
    id: "jalalpur",
    name: "Jalalpur",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.3156,
    lng: 82.7417,
  },
  {
    id: "jaunpur",
    name: "Jaunpur",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 25.7464,
    lng: 82.6837,
  },
  {
    id: "kaptanganj",
    name: "Kaptanganj",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.9333,
    lng: 83.7167,
  },
  {
    id: "katra-bazar",
    name: "Katra Bazar",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.2,
    lng: 81.8167,
  },
  {
    id: "khalilabad",
    name: "Khalilabad",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.7797,
    lng: 83.0719,
  },
  {
    id: "lakhimpur-kheri",
    name: "Lakhimpur Kheri",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.9481,
    lng: 80.7777,
  },
  {
    id: "meerganj",
    name: "Meerganj",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 28.55,
    lng: 79.2167,
  },
  {
    id: "mohammadabad",
    name: "Mohammadabad",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 25.6178,
    lng: 83.7539,
  },
  {
    id: "nanpara",
    name: "Nanpara",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.8667,
    lng: 81.5,
  },
  {
    id: "nawabganj",
    name: "Nawabganj",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 28.5333,
    lng: 79.6333,
  },
  {
    id: "paraspur",
    name: "Paraspur",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.05,
    lng: 81.8,
  },
  {
    id: "phoolpur",
    name: "Phoolpur",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 25.55,
    lng: 82.0833,
  },
  {
    id: "rai-barelly",
    name: "Rae Bareli",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.2236,
    lng: 81.2409,
  },
  {
    id: "rudauli",
    name: "Rudauli",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.75,
    lng: 81.75,
  },
  {
    id: "sandila",
    name: "Sandila",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.0833,
    lng: 80.5,
  },
  {
    id: "shahjahanpur",
    name: "Shahjahanpur",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.8804,
    lng: 79.9122,
  },
  {
    id: "sitapur",
    name: "Sitapur",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.5667,
    lng: 80.6833,
  },
  {
    id: "sultanpur",
    name: "Sultanpur",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.2648,
    lng: 82.0727,
  },
  {
    id: "unnao",
    name: "Unnao",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 26.5393,
    lng: 80.4879,
  },
  {
    id: "uttraula",
    name: "Utraula",
    state: "Uttar Pradesh",
    stateId: "uttar-pradesh",
    lat: 27.3167,
    lng: 82.4167,
  },
  { id: "arrah", name: "Arrah", state: "Bihar", stateId: "bihar", lat: 25.5541, lng: 84.6637 },
  {
    id: "aurangabad-bihar",
    name: "Aurangabad",
    state: "Bihar",
    stateId: "bihar",
    lat: 24.7539,
    lng: 84.3756,
  },
  { id: "bagaha", name: "Bagaha", state: "Bihar", stateId: "bihar", lat: 27.0989, lng: 84.0911 },
  {
    id: "bihar-sharif",
    name: "Bihar Sharif",
    state: "Bihar",
    stateId: "bihar",
    lat: 25.1982,
    lng: 85.5186,
  },
  {
    id: "kishanganj",
    name: "Kishanganj",
    state: "Bihar",
    stateId: "bihar",
    lat: 26.1042,
    lng: 87.9408,
  },
  {
    id: "lakhisarai",
    name: "Lakhisarai",
    state: "Bihar",
    stateId: "bihar",
    lat: 25.1764,
    lng: 86.0947,
  },
  {
    id: "daltonganj",
    name: "Daltonganj",
    state: "Jharkhand",
    stateId: "jharkhand",
    lat: 24.0416,
    lng: 84.0718,
  },
  {
    id: "garhwa",
    name: "Garhwa",
    state: "Jharkhand",
    stateId: "jharkhand",
    lat: 24.1614,
    lng: 83.8117,
  },
  {
    id: "deoghar",
    name: "Deoghar",
    state: "Jharkhand",
    stateId: "jharkhand",
    lat: 24.4854,
    lng: 86.6947,
  },
  {
    id: "kirkend-bazar",
    name: "Kirkend Bazar",
    state: "Jharkhand",
    stateId: "jharkhand",
    lat: 23.7667,
    lng: 86.3833,
  },
  {
    id: "gurgaon",
    name: "Gurgaon",
    state: "Haryana",
    stateId: "haryana",
    lat: 28.4595,
    lng: 77.0266,
  },
  {
    id: "panipat",
    name: "Panipat",
    state: "Haryana",
    stateId: "haryana",
    lat: 29.3909,
    lng: 76.9635,
  },
  {
    id: "ambala",
    name: "Ambala",
    state: "Haryana",
    stateId: "haryana",
    lat: 30.3782,
    lng: 76.7767,
  },
  {
    id: "jwalapur",
    name: "Jwalapur (Haridwar)",
    state: "Uttarakhand",
    stateId: "uttarakhand",
    lat: 29.9328,
    lng: 78.1256,
  },
  {
    id: "vijaynagaram",
    name: "Vizianagaram",
    state: "Andhra Pradesh",
    stateId: "andhra-pradesh",
    lat: 18.1067,
    lng: 83.4163,
  },
];

/* Source `isPrimary: true` nodes, verbatim (IndiaReachMap.tsx). */
const PRIMARY_IDS = new Set<string>([
  "delhi",
  "kanpur",
  "lucknow",
  "varanasi",
  "patna",
  "gorakhpur",
  "jaipur",
  "kolkata",
  "ranchi",
  "dhanbad",
  "ludhiana",
  "indore",
  "bhopal",
  "raipur",
  "meerut",
  "muzaffarnagar",
  "bareilly",
  "allahabad",
  "muzaffarpur",
  "saharanpur",
  "jammu",
]);

const ORIGIN_LAT = 21.1702;
const ORIGIN_LNG = 72.8311;
const EARTH_RADIUS_KM = 6371;

/* Haversine great-circle distance from Surat, rounded to the nearest 10 km. */
function distanceFromOriginKm(lat: number, lng: number): number {
  const rad = (deg: number): number => (deg * Math.PI) / 180;
  const dLat = rad(lat - ORIGIN_LAT);
  const dLng = rad(lng - ORIGIN_LNG);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(ORIGIN_LAT)) * Math.cos(rad(lat)) * Math.sin(dLng / 2) ** 2;
  const km = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
  return Math.round(km / 10) * 10;
}

const REGION_BY_STATE: Record<string, string> = {
  "uttar-pradesh": "uttar-pradesh",
  bihar: "bihar-jharkhand",
  jharkhand: "bihar-jharkhand",
  delhi: "ncr-north",
  punjab: "ncr-north",
  haryana: "ncr-north",
  uttarakhand: "ncr-north",
  "jammu-and-kashmir": "ncr-north",
  "madhya-pradesh": "central-others",
  rajasthan: "central-others",
  chhattisgarh: "central-others",
  "west-bengal": "central-others",
  "andhra-pradesh": "central-others",
};

function main(): void {
  const q = (value: string): string => JSON.stringify(value);
  const r2 = (value: number): string => (Math.round(value * 100) / 100).toFixed(2);
  const lines: string[] = [];
  lines.push("/* GENERATED by scripts/generate-hubs.mts — do not edit by hand. */");
  lines.push("");
  lines.push(
    'export type RegionId = "uttar-pradesh" | "bihar-jharkhand" | "ncr-north" | "central-others";',
  );
  lines.push("");
  lines.push("export interface Hub {");
  lines.push("  id: string;");
  lines.push("  name: string;");
  lines.push("  state: string;");
  lines.push("  region: RegionId;");
  lines.push("  /** Source state slug (matches `INDIA_STATES` ids). */");
  lines.push("  stateId: string;");
  lines.push("  /** Source `isPrimary`: a principal market, labelled first on the map. */");
  lines.push("  primary: boolean;");
  lines.push("  /** Great-circle km from Surat, rounded to 10. Straight-line, not road. */");
  lines.push("  distanceKm: number;");
  lines.push("  x: number;");
  lines.push("  y: number;");
  lines.push("  verifiedOn: string | null;");
  lines.push("  transitDays: { min: number; max: number } | null;");
  lines.push("}");
  lines.push("");
  const origin = projectPoint(ORIGIN_LAT, ORIGIN_LNG);
  lines.push("export const ORIGIN: Hub = {");
  lines.push('  id: "surat",');
  lines.push('  name: "Surat",');
  lines.push('  state: "Gujarat",');
  lines.push('  region: "central-others",');
  lines.push('  stateId: "gujarat",');
  lines.push("  primary: true,");
  lines.push("  distanceKm: 0,");
  lines.push(`  x: ${r2(origin.x)},`);
  lines.push(`  y: ${r2(origin.y)},`);
  lines.push("  verifiedOn: null,");
  lines.push("  transitDays: null,");
  lines.push("};");
  lines.push("");
  lines.push("export const HUBS: readonly Hub[] = [");
  for (const node of RAW_NODES) {
    const region = REGION_BY_STATE[node.stateId];
    if (region === undefined) throw new Error(`unmapped state ${node.stateId}`);
    const pt = projectPoint(node.lat, node.lng);
    lines.push(
      `  { id: ${q(node.id)}, name: ${q(node.name)}, state: ${q(node.state)}, region: "${region}", stateId: ${q(node.stateId)}, primary: ${String(PRIMARY_IDS.has(node.id))}, distanceKm: ${String(distanceFromOriginKm(node.lat, node.lng))}, x: ${r2(pt.x)}, y: ${r2(pt.y)}, verifiedOn: null, transitDays: null },`,
    );
  }
  lines.push("];");
  lines.push("");
  lines.push('export const REGIONS: readonly { id: RegionId | "all"; label: string }[] = [');
  lines.push('  { id: "all", label: "All Hubs" },');
  lines.push('  { id: "uttar-pradesh", label: "Uttar Pradesh" },');
  lines.push('  { id: "bihar-jharkhand", label: "Bihar & Jharkhand" },');
  lines.push('  { id: "ncr-north", label: "NCR & North" },');
  lines.push('  { id: "central-others", label: "Central & Others" },');
  lines.push("];");
  lines.push("");
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  writeFileSync(join(root, "src/content/hubs.ts"), `${lines.join("\n")}\n`);
  console.log(`wrote src/content/hubs.ts with ${RAW_NODES.length} hubs`);
}

main();
