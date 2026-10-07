/* Unit check for the ported hub data: count equals the Maa Sheetla source
   count (78), ids unique, every hub inside the viewBox, every region valid.
   Run with `npm run verify:hubs`. */

import { HUBS, ORIGIN, REGIONS, type Hub, type RegionId } from "../src/content/hubs";
import { INDIA_VIEWBOX } from "../src/components/map/india-outline";

function fail(message: string): never {
  console.error(`verify:hubs FAILED — ${message}`);
  process.exit(1);
}

function main(): void {
  const parts = INDIA_VIEWBOX.split(" ").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
    fail(`unparseable INDIA_VIEWBOX ${INDIA_VIEWBOX}`);
  }
  const [minX, minY, width, height] = parts as [number, number, number, number];

  if (HUBS.length !== 78) fail(`expected 78 hubs, found ${HUBS.length}`);

  const ids = new Set<string>();
  const all: Hub[] = [ORIGIN, ...HUBS];
  for (const hub of all) {
    if (ids.has(hub.id)) fail(`duplicate id ${hub.id}`);
    ids.add(hub.id);
    if (!(hub.x >= minX && hub.x <= minX + width && hub.y >= minY && hub.y <= minY + height)) {
      fail(`hub ${hub.id} outside viewBox at (${hub.x}, ${hub.y})`);
    }
  }

  const validRegions = new Set<RegionId>([
    "uttar-pradesh",
    "bihar-jharkhand",
    "ncr-north",
    "central-others",
  ]);
  for (const hub of all) {
    if (!validRegions.has(hub.region)) fail(`hub ${hub.id} has invalid region ${hub.region}`);
  }

  const expectedLabels: Record<string, string> = {
    all: "All Hubs",
    "uttar-pradesh": "Uttar Pradesh",
    "bihar-jharkhand": "Bihar & Jharkhand",
    "ncr-north": "NCR & North",
    "central-others": "Central & Others",
  };
  if (REGIONS.length !== 5) fail(`expected 5 region entries, found ${REGIONS.length}`);
  for (const region of REGIONS) {
    if (expectedLabels[region.id] !== region.label) {
      fail(`region ${region.id} label mismatch: ${region.label}`);
    }
  }

  const covered = new Set(HUBS.map((hub) => hub.region));
  for (const region of validRegions) {
    if (!covered.has(region)) fail(`region ${region} has no hubs`);
  }

  console.log(
    `verify:hubs OK — 78 hubs + origin, ids unique, all inside ${INDIA_VIEWBOX}, 5 region labels verbatim`,
  );
}

main();
