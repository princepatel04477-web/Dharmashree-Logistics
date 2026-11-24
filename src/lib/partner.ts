/* The delivery-partner application (Prompt 13). It travels the same road as the
   quote form — `postToDesk` in `./quote` — and lands on the `Partners` tab of the
   same workbook (`kind: "partner"` is what tells `apps-script/Code.gs` which
   tab). The field rules are short and typed; every sentence the UI shows lives in
   `src/content/partners.ts`, keyed by the code returned here. */

import { postToDesk, type QuoteResult } from "./quote";
import { isIndianMobile } from "./validate";

export interface PartnerPayload {
  kind: "partner";
  name: string;
  phone: string;
  city: string;
  vehicle: string;
  availability: string;
  sourcePage: string;
  /** Honeypot — never filled by a person. */
  website: string;
}

export const EMPTY_PARTNER: PartnerPayload = {
  kind: "partner",
  name: "",
  phone: "",
  city: "",
  vehicle: "",
  availability: "",
  sourcePage: "",
  website: "",
};

export type PartnerFieldName = "name" | "phone" | "city" | "availability" | "consent";

export type PartnerFieldCode = "Required" | "Phone" | "Consent";

export type PartnerFieldErrors = Partial<Record<PartnerFieldName, PartnerFieldCode>>;

/** In form order, which is also the order the visitor meets them. */
export const PARTNER_FIELD_ORDER: readonly PartnerFieldName[] = [
  "name",
  "phone",
  "city",
  "availability",
  "consent",
];

/** Mirrors the `partnerRequired` list in `apps-script/Code.gs`. */
export const REQUIRED_PARTNER_FIELDS: readonly (keyof PartnerPayload)[] = [
  "name",
  "phone",
  "city",
  "availability",
];

export function validatePartner(
  values: Readonly<PartnerPayload>,
  consent: boolean,
): PartnerFieldErrors {
  const errors: PartnerFieldErrors = {};
  if (values.name.trim() === "") errors.name = "Required";
  if (values.phone.trim() === "") errors.phone = "Required";
  else if (!isIndianMobile(values.phone)) errors.phone = "Phone";
  if (values.city.trim() === "") errors.city = "Required";
  if (values.availability.trim() === "") errors.availability = "Required";
  if (!consent) errors.consent = "Consent";
  return errors;
}

export function firstInvalidPartnerField(errors: PartnerFieldErrors): PartnerFieldName | null {
  for (const field of PARTNER_FIELD_ORDER) {
    if (errors[field] !== undefined) return field;
  }
  return null;
}

export function submitPartner(payload: PartnerPayload): Promise<QuoteResult> {
  return postToDesk({ ...payload });
}
