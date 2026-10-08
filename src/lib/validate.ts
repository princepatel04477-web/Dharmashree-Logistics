/* Field rules for the quote form and the track page (Prompt 08), hand-written
   and typed — the rules are short enough to read, and every sentence the UI
   shows lives in `src/content/quote.ts` / `src/content/track.ts`, keyed by the
   code returned here. Nothing in this file is copy.

   House rule: the client validates the same fields `apps-script/Code.gs`
   requires, so a `Missing …` reply from the script means the request did not
   come from the site. */

import type { QuotePayload } from "./quote";

/* ——— Quote fields ——— */

export const QUOTE_FIELD_CODES = [
  "Required",
  "Phone",
  "Email",
  "Weight",
  "DatePast",
  "DateInvalid",
  "Consent",
] as const;

export type QuoteFieldCode = (typeof QUOTE_FIELD_CODES)[number];

/** Named for the field the message sits under — the same names the payload
    uses, so a validator cannot silently target a field that does not exist. */
export type QuoteFieldName =
  | "name"
  | "company"
  | "phone"
  | "email"
  | "service"
  | "from"
  | "to"
  | "loadType"
  | "weightKg"
  | "vehicle"
  | "pickupDate"
  | "notes"
  | "consent";

export type QuoteFieldErrors = Partial<Record<QuoteFieldName, QuoteFieldCode>>;

export const QUOTE_STEPS = [1, 2, 3] as const;

export type QuoteStep = (typeof QUOTE_STEPS)[number];

export function isQuoteStep(value: unknown): value is QuoteStep {
  return QUOTE_STEPS.some((step) => step === value);
}

/** Which fields each step owns. Asking for the step's own fields (rather than
    validating everything) is what makes "Continue" honest about what it knows. */
const STEP_FIELDS: Record<QuoteStep, readonly QuoteFieldName[]> = {
  1: ["service", "from", "to"],
  2: ["loadType", "weightKg", "pickupDate"],
  3: ["name", "phone", "email", "consent"],
};

/* ——— Primitives ——— */

/** Strips an optional `+91`, `91` or leading `0`, then keeps the digits. */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/** Indian mobile: ten digits, first one 6–9. Landlines are a desk call, not a
    form field — the number is how the rate comes back. */
export function isIndianMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizePhone(value));
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export type WeightReading = { kind: "empty" } | { kind: "invalid" } | { kind: "kg"; kg: number };

/** Weight is optional, but if it is typed it has to be a number above zero. */
export function readWeightKg(value: string): WeightReading {
  const trimmed = value.trim();
  if (trimmed === "") return { kind: "empty" };
  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) return { kind: "invalid" };
  const kg = Number(trimmed);
  return kg > 0 ? { kind: "kg", kg } : { kind: "invalid" };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Today in the visitor's own timezone: a pickup date is a local calendar
    question, so it is compared against a local calendar date. */
export function todayISODate(now: Date = new Date()): string {
  return `${String(now.getFullYear())}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** `YYYY-MM-DD`, and a date that exists (`2026-02-31` is not one). */
export function isISODate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match === null) return false;
  const [, year, month, day] = match;
  if (year === undefined || month === undefined || day === undefined) return false;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return todayISODate(date) === value;
}

/* ——— The step rules ——— */

function validateField(
  field: QuoteFieldName,
  values: Readonly<QuotePayload>,
  consent: boolean,
  today: string,
): QuoteFieldCode | null {
  switch (field) {
    case "service":
      return values.service.trim() === "" ? "Required" : null;
    case "from":
      return values.from.trim() === "" ? "Required" : null;
    case "to":
      return values.to.trim() === "" ? "Required" : null;
    case "loadType":
      return values.loadType.trim() === "" ? "Required" : null;
    case "weightKg": {
      const reading = readWeightKg(values.weightKg);
      return reading.kind === "invalid" ? "Weight" : null;
    }
    case "pickupDate": {
      const value = values.pickupDate.trim();
      if (value === "") return null;
      if (!isISODate(value)) return "DateInvalid";
      return value < today ? "DatePast" : null;
    }
    case "name":
      return values.name.trim() === "" ? "Required" : null;
    case "company":
      return null;
    case "phone":
      return values.phone.trim() === ""
        ? "Required"
        : isIndianMobile(values.phone)
          ? null
          : "Phone";
    case "email": {
      const value = values.email.trim();
      if (value === "") return null;
      return isEmail(value) ? null : "Email";
    }
    case "consent":
      return consent ? null : "Consent";
    case "vehicle":
    case "notes":
      /* Never invalid: the vehicle has a "let the desk decide" option and the
         notes are free text. */
      return null;
  }
}

function collect(
  fields: readonly QuoteFieldName[],
  values: Readonly<QuotePayload>,
  consent: boolean,
  today: string,
): QuoteFieldErrors {
  const errors: QuoteFieldErrors = {};
  for (const field of fields) {
    const code = validateField(field, values, consent, today);
    if (code !== null) errors[field] = code;
  }
  return errors;
}

/** Only the fields this step owns. `today` is passed in so a form open across
    midnight still compares against the date it started the step with. */
export function validateQuoteStep(
  step: QuoteStep,
  values: Readonly<QuotePayload>,
  consent: boolean,
  today: string,
): QuoteFieldErrors {
  return collect(STEP_FIELDS[step], values, consent, today);
}

/** Every rule at once — the last gate before anything is sent. */
export function validateQuote(
  values: Readonly<QuotePayload>,
  consent: boolean,
  today: string,
): QuoteFieldErrors {
  return collect(
    [
      "service",
      "from",
      "to",
      "loadType",
      "weightKg",
      "pickupDate",
      "name",
      "phone",
      "email",
      "consent",
    ],
    values,
    consent,
    today,
  );
}

/** The step a field belongs to, so an invalid field can send the form back to
    the step that owns it. */
export function stepOfField(field: QuoteFieldName): QuoteStep {
  for (const step of QUOTE_STEPS) {
    if (STEP_FIELDS[step].includes(field)) return step;
  }
  return 1;
}

/** In form order, which is also the order the visitor meets them. */
export const QUOTE_FIELD_ORDER: readonly QuoteFieldName[] = [
  "service",
  "from",
  "to",
  "loadType",
  "weightKg",
  "pickupDate",
  "name",
  "phone",
  "email",
  "consent",
];

/** The first field to put focus on, in form order — never the object's own key
    order, which would depend on which check happened to run first. */
export function firstInvalidField(errors: QuoteFieldErrors): QuoteFieldName | null {
  for (const field of QUOTE_FIELD_ORDER) {
    if (errors[field] !== undefined) return field;
  }
  return null;
}

/* ——— Track (LR) ——— */

export const LR_CODES = ["LrRequired", "LrFormat"] as const;

export type LrCode = (typeof LR_CODES)[number];

/** LR numbers are quoted in upper case, sometimes with a hyphen or a slash:
    `normalizeLr` upper-cases and drops whitespace but keeps the separators, so
    the number the desk reads is the number the visitor typed. */
export function normalizeLr(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

/** The characters that count towards "4 to 20": separators are allowed but are
    not themselves digits or letters. */
export function lrLength(value: string): number {
  return normalizeLr(value).replace(/[^A-Z0-9]/g, "").length;
}

export function validateLr(value: string): LrCode | null {
  const lr = normalizeLr(value);
  if (lr === "") return "LrRequired";
  if (!/^[A-Z0-9/-]+$/.test(lr)) return "LrFormat";
  const length = lrLength(lr);
  return length >= 4 && length <= 20 ? null : "LrFormat";
}
