import { AMBIGUOUS_CITIES, CITY_STATES, INDIAN_STATES } from "@/content/india-places";

/* City → state, for the truck form's State field (src/content/india-places.ts
   holds the data). Matching ignores case, spaces, dots and hyphens, so
   "rae bareli", "Raebareli" and "RAE-BARELI" are one city. */

/** `Rae Bareli` → `raebareli`; `&` reads as "and". */
function placeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z]/g, "");
}

const STATE_BY_CITY: ReadonlyMap<string, string> = new Map(
  CITY_STATES.map(([city, state]) => [placeKey(city), state] as const),
);
const AMBIGUOUS: ReadonlySet<string> = new Set(AMBIGUOUS_CITIES.map(placeKey));
const STATE_BY_KEY: ReadonlyMap<string, string> = new Map(
  INDIAN_STATES.map((state) => [placeKey(state), state] as const),
);

function lookup(candidate: string): string | null {
  const key = placeKey(candidate);
  if (key === "" || AMBIGUOUS.has(key)) return null;
  return STATE_BY_CITY.get(key) ?? STATE_BY_KEY.get(key) ?? null;
}

/** The state a typed city is in, or `null` when it is unknown or is a name
    several states share. Reads "Faizabad (Ayodhya)" as itself, then as
    "Faizabad"; and "Kim, Gujarat" by its state. */
export function stateForCity(input: string): string | null {
  const typed = input.trim();
  if (typed === "") return null;

  const whole = lookup(typed);
  if (whole !== null) return whole;

  const beforeBracket = typed.split("(")[0] ?? "";
  if (beforeBracket !== typed) {
    const found = lookup(beforeBracket);
    if (found !== null) return found;
  }

  /* "City, State" or "City, District, State": the last part that is a state. */
  const parts = typed.split(",").map((part) => part.trim());
  if (parts.length > 1) {
    for (const part of [...parts].reverse()) {
      const state = STATE_BY_KEY.get(placeKey(part));
      if (state !== undefined) return state;
    }
    return lookup(parts[0] ?? "");
  }
  return null;
}
