/* Shared plumbing for the quote wizard (Prompt 08).

   Field ids are stable strings rather than refs: the form hands focus around by
   id (`focusQuoteField`), which works across the step swap and through the
   vendored field components without threading a ref through each one. */

import { quote } from "@/content/quote";
import type { QuotePayload } from "@/lib/quote";
import type { QuoteFieldErrors, QuoteFieldName, QuoteStep } from "@/lib/validate";

export interface QuoteFieldsProps {
  values: QuotePayload;
  onChange: (field: keyof QuotePayload, value: string) => void;
  errors: QuoteFieldErrors;
}

export interface QuoteContactProps extends QuoteFieldsProps {
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
}

export const FIELD_IDS: Record<QuoteFieldName, string> = {
  service: "quote-service",
  from: "quote-from",
  to: "quote-to",
  loadType: "quote-load-type",
  weightKg: "quote-weight",
  vehicle: "quote-vehicle",
  pickupDate: "quote-pickup-date",
  notes: "quote-notes",
  name: "quote-name",
  company: "quote-company",
  phone: "quote-phone",
  email: "quote-email",
  consent: "quote-consent",
};

/** Honeypot: not one of the visitor's fields, so it is not in `FIELD_IDS`. */
export const HONEYPOT_ID = "quote-website";

export const HUB_LIST_ID = "quote-hub-list";

const STEP_HEADING_IDS: Record<QuoteStep, string> = {
  1: "quote-step-lane",
  2: "quote-step-load",
  3: "quote-step-contact",
};

export function stepHeadingId(step: QuoteStep): string {
  return STEP_HEADING_IDS[step];
}

/** One message per field, or `undefined` when the field is clean. */
export function errorText(errors: QuoteFieldErrors, field: QuoteFieldName): string | undefined {
  const code = errors[field];
  return code === undefined ? undefined : quote.errors[code];
}

/** Focuses the first radio of an unanswered service question, or the control
    itself. The group is a container, so `[role="radio"]` is what can take
    focus. */
export function focusQuoteField(field: QuoteFieldName): void {
  const node = document.getElementById(FIELD_IDS[field]);
  if (node === null) return;
  if (node instanceof HTMLInputElement || node instanceof HTMLSelectElement) {
    node.focus();
    return;
  }
  if (node instanceof HTMLTextAreaElement || node instanceof HTMLButtonElement) {
    node.focus();
    return;
  }
  const firstOption = node.querySelector<HTMLElement>('[role="radio"]');
  if (firstOption !== null) {
    firstOption.focus();
    return;
  }
  node.focus();
}

/** Announce the new step: the heading is the region's label, and it is
    focusable for exactly this reason. */
export function focusQuoteStep(step: QuoteStep): void {
  document.getElementById(stepHeadingId(step))?.focus();
}
