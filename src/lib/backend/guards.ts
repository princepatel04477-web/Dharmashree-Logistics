/* Runtime checks for JSON that has not been validated yet.

   Everything off the wire arrives as `unknown`. These helpers narrow it without
   a cast, so a field is only used after it has been proved to be the right
   kind. No type assertions on unvalidated data anywhere in `src/lib/backend`. */

import { isISODate } from "@/lib/validate";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The first of `keys` that holds a non-blank string, trimmed. Several keys let
    one reader accept the spellings a backend might use (`lrNumber`, `lr_no`). */
export function readString(
  record: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return null;
}

/** The first of `keys` that holds a finite number, or a string that is one
    (ASP.NET services often serialise decimals as strings). */
export function readNumber(
  record: Record<string, unknown>,
  keys: readonly string[],
): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && /^\s*-?\d+(?:\.\d+)?\s*$/.test(value)) return Number(value);
  }
  return null;
}

/** The first of `keys` that holds an array. */
export function readArray(
  record: Record<string, unknown>,
  keys: readonly string[],
): readonly unknown[] | null {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return null;
}

const IST_OFFSET = "+05:30";

/** An ISO date-time as a normalised UTC instant, or `null`. A value with no
    offset (`2026-10-03T14:30:00`, what .NET writes for local time) is read as
    India time — the business runs on IST, whatever the visitor's clock says. A
    bare date is midnight IST. */
export function readInstant(value: string): string | null {
  const match =
    /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/.exec(
      value.trim(),
    );
  if (match === null) return null;
  const [, date, hm, seconds, zone] = match;
  if (date === undefined || !isISODate(date)) return null;
  const time = `${hm ?? "00:00"}:${seconds ?? "00"}`;
  let offset = IST_OFFSET;
  if (zone === "Z") offset = "Z";
  else if (zone !== undefined)
    offset = zone.includes(":") ? zone : `${zone.slice(0, 3)}:${zone.slice(3)}`;
  const ms = Date.parse(`${date}T${time}${offset}`);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

/** A calendar date (`YYYY-MM-DD`) in India time, from a date or a date-time. */
export function readIstDate(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return isISODate(trimmed) ? trimmed : null;
  const instant = readInstant(trimmed);
  if (instant === null) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(instant));
  const pick = (type: string): string | undefined =>
    parts.find((part) => part.type === type)?.value;
  const year = pick("year");
  const month = pick("month");
  const day = pick("day");
  if (year === undefined || month === undefined || day === undefined) return null;
  return `${year}-${month}-${day}`;
}
