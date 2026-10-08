/* The quote form's draft (Prompt 08): a refresh must not cost the visitor the
   load description they just typed, so the form is mirrored into
   `sessionStorage` — per tab, gone when the tab closes, and never sent
   anywhere. Every call is wrapped: storage throws when it is blocked (private
   windows, storage disabled), and a form that cannot persist a draft still has
   to work. */

import { EMPTY_QUOTE, QUOTE_FIELDS, type QuotePayload } from "./quote";
import { isQuoteStep, type QuoteStep } from "./validate";

const STORAGE_KEY = "dsl.quote.draft.v1";

export interface QuoteDraft {
  values: QuotePayload;
  consent: boolean;
  step: QuoteStep;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Rebuilds a payload field by field from `EMPTY_QUOTE`, so a stored draft can
    only ever contribute strings this version of the form knows about — a draft
    written by an older build cannot inject a field. */
function readValues(source: Record<string, unknown>): QuotePayload {
  const values: QuotePayload = { ...EMPTY_QUOTE };
  for (const field of QUOTE_FIELDS) {
    const value = source[field];
    if (typeof value === "string") values[field] = value;
  }
  return values;
}

export function readQuoteDraft(): QuoteDraft | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isRecord(parsed["values"])) return null;
    return {
      values: readValues(parsed["values"]),
      consent: parsed["consent"] === true,
      step: isQuoteStep(parsed["step"]) ? parsed["step"] : 1,
    };
  } catch {
    return null;
  }
}

/** An untouched form is not worth storing. */
function isBlank(draft: QuoteDraft): boolean {
  if (draft.consent) return false;
  return QUOTE_FIELDS.every((field) => draft.values[field] === EMPTY_QUOTE[field]);
}

export function writeQuoteDraft(draft: QuoteDraft): void {
  if (isBlank(draft)) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* Storage blocked or full: the form keeps working without a draft. */
  }
}

/** Called once the desk has the request: the draft has done its job. */
export function clearQuoteDraft(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Nothing to do — there was no draft to clear. */
  }
}
