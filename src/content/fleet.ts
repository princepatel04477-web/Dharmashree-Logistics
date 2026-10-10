import { slugify } from "@/lib/utils";
import { services } from "./services";
import type { FleetVehicle, Service } from "./types";

/* The fleet grid is derived, never listed (Prompt 06). `services.ts` owns the
   vehicle names — a vehicle string appears there and nowhere else — and this
   file owns only the one-line note, keyed by that exact name. The union across
   every service is the fleet page's list; one service's slice is its own
   block. A vehicle with no note still renders, as a name-only card; a note with
   no service listing that vehicle never appears. Same shape as
   `content/industries.ts`. */

const notes: Readonly<Record<string, string>> = {
  "12 ft pickup":
    "Cartons and business supplies inside the city, and any lane a truck cannot turn into.",
  "Two-wheeler": "Documents and small parcels across the city, picked up and delivered directly.",
  "19 ft mxl": "The workhorse on the shorter corridors — dedicated body, tail loading.",
  "32 ft multi-axle": "Full loads on the long lanes: Delhi NCR, Lucknow, Kanpur, Kolkata.",
  "Open-body lorry": "Machinery, oversize and anything loaded from the side or the top.",
  "Three-wheeler load carrier": "A few cartons into a lane no van can enter.",
};

/** Manifest key for a vehicle photo: `fleet/<name-slug>`. Absent keys render a
   text-only card rather than a placeholder frame. */
export function vehicleImageKey(name: string): string {
  return `fleet/${slugify(name)}`;
}

export function vehicleFor(name: string): FleetVehicle {
  return { name, note: notes[name] ?? "" };
}

/** Every name this file has a note for — `scripts/verify-services.mts` fails on
   a note whose vehicle no service lists, which is drift rather than content. */
export function notedVehicleNames(): string[] {
  return Object.keys(notes);
}

/** Every vehicle listed by any service, in catalogue order, without repeats. */
export function fleetVehicles(): FleetVehicle[] {
  const seen = new Set<string>();
  const fleet: FleetVehicle[] = [];
  for (const service of services) {
    for (const name of service.vehicles) {
      if (seen.has(name)) continue;
      seen.add(name);
      fleet.push(vehicleFor(name));
    }
  }
  return fleet;
}

/** The vehicles one service actually names — empty for a service that moves
   nothing itself (warehousing), which drops the block on its page. */
export function fleetForService(service: Service): FleetVehicle[] {
  return service.vehicles.map(vehicleFor);
}
