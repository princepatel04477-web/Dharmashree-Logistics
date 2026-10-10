/* The "Send us a message" box (contact page and footer). It travels the same road
   as the quote form and the partner application — `postToDesk` in `./quote`, the
   same Apps Script endpoint and workbook — and lands on the `Messages` tab
   (`kind: "message"` is what tells `apps-script/Code.gs` which tab). The field
   rules are short and typed; every sentence the UI shows lives in
   `src/content/message.ts`, keyed by the code returned here. */

import { postToDesk, type QuoteResult } from "./quote";
import { isEmail, isIndianMobile, normalizePhone } from "./validate";

/** The longest message the box takes. Mirrored by the textarea's own limit and by
    the 1,000-character cap `clean_()` puts on every cell in `Code.gs`. */
export const MESSAGE_MAX_LENGTH = 600;

export interface MessagePayload {
  kind: "message";
  name: string;
  /** E.164 once it leaves the form (`+91XXXXXXXXXX`), whatever the visitor typed. */
  phone: string;
  /** Optional: `""` when left blank (and always blank in the footer's compact box). */
  email: string;
  message: string;
  sourcePage: string;
  /** Honeypot — never filled by a person. */
  website: string;
}

export const EMPTY_MESSAGE: MessagePayload = {
  kind: "message",
  name: "",
  phone: "",
  email: "",
  message: "",
  sourcePage: "",
  website: "",
};

export type MessageFieldName = "name" | "phone" | "email" | "message" | "consent";

export type MessageFieldCode = "Required" | "Phone" | "Email" | "Consent";

export type MessageFieldErrors = Partial<Record<MessageFieldName, MessageFieldCode>>;

/** In form order, which is also the order the visitor meets them. */
export const MESSAGE_FIELD_ORDER: readonly MessageFieldName[] = [
  "name",
  "phone",
  "email",
  "message",
  "consent",
];

/** Mirrors the `messageRequired` list in `apps-script/Code.gs`. */
export const REQUIRED_MESSAGE_FIELDS: readonly (keyof MessagePayload)[] = [
  "name",
  "phone",
  "message",
];

/** `98765 43210`, `+91 98765 43210` or `098765 43210` → `+919876543210`. A value
    that is not a mobile is returned as typed; `validateMessage` has already
    refused it by then. */
export function toE164(value: string): string {
  return isIndianMobile(value) ? `+91${normalizePhone(value)}` : value.trim();
}

export function validateMessage(
  values: Readonly<MessagePayload>,
  consent: boolean,
): MessageFieldErrors {
  const errors: MessageFieldErrors = {};
  if (values.name.trim() === "") errors.name = "Required";
  if (values.phone.trim() === "") errors.phone = "Required";
  else if (!isIndianMobile(values.phone)) errors.phone = "Phone";
  const email = values.email.trim();
  if (email !== "" && !isEmail(email)) errors.email = "Email";
  if (values.message.trim() === "") errors.message = "Required";
  if (!consent) errors.consent = "Consent";
  return errors;
}

export function firstInvalidMessageField(errors: MessageFieldErrors): MessageFieldName | null {
  for (const field of MESSAGE_FIELD_ORDER) {
    if (errors[field] !== undefined) return field;
  }
  return null;
}

/** True when this build knows where to send a message. `NEXT_PUBLIC_*` is inlined
    at build time (`output: "export"`), so this is decided before the page ever
    loads and is the same on the server render and on the client. */
export function isDeskConnected(): boolean {
  const endpoint = process.env.NEXT_PUBLIC_QUOTE_ENDPOINT;
  return endpoint !== undefined && endpoint.trim() !== "";
}

export function submitMessage(payload: MessagePayload): Promise<QuoteResult> {
  return postToDesk({
    ...payload,
    name: payload.name.trim(),
    phone: toE164(payload.phone),
    email: payload.email.trim(),
    message: payload.message.trim(),
  });
}
