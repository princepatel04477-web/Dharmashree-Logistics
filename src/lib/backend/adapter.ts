/* THE ADAPTER — the only file the client's API needs to change.

   Everything that depends on how the client's backend talks lives here: the
   endpoint paths, the request bodies, how the responses are read into our
   domain types (`types.ts`), and how a failure is turned into an error code.
   `client.ts` (transport, timeout, status handling) and the UI never see a wire
   format, so confirming the real API means editing this file and setting
   `NEXT_PUBLIC_DSL_API_BASE` — nothing else.

   ———————————————————————————————————————————————————————————————————————————
   ASSUMED CONTRACT — assumed until the client's API is confirmed.
   This is the integration point, not unfinished work: every line below is what
   the rest of the code is written against, and docs/backend-integration.md
   lists the same shapes as the questions for the client's backend team.

   Base URL: `NEXT_PUBLIC_DSL_API_BASE` (https), CORS-enabled for this site.
   Bodies and replies are JSON (`Content-Type: application/json`).

   1. Send the SMS code
        POST {base}/otp/send
        { "lrNumber": "DSL12345", "mobile": "9876543210" }      (10 digits, no +91)
        200 { "requestId": "…", "maskedMobile": "XXXXXX3210",
              "expiresIn": 300, "resendAfter": 30 }              (seconds)
      The backend sends the SMS only if the mobile is the one on the LR.

   2. Verify the code
        POST {base}/otp/verify
        { "requestId": "…", "otp": "123456" }
        200 { "token": "…", "expiresIn": 900 }                   (seconds)

   3. Read the LR
        GET {base}/lr/{lrNumber}          Authorization: Bearer {token}
        200 {
          "lrNumber": "DSL12345",
          "bookedOn": "2026-10-03",                       (date, or date-time)
          "origin": "Surat", "destination": "Jaipur",
          "consignor": "…", "consignee": "…",
          "packages": 24, "weightKg": 1180.5,             (either may be null)
          "status": "IN_TRANSIT",                         (see STATUS_BY_KEY)
          "currentLocation": "Ahmedabad hub",             (may be null)
          "expectedDelivery": "2026-10-08", "deliveredOn": null,
          "events": [
            { "at": "2026-10-05T18:40:00+05:30", "location": "Ahmedabad hub",
              "status": "AT_FACILITY", "note": null }
          ]
        }

   4. Direct lookup, no SMS code (`NEXT_PUBLIC_DSL_API_BASE=direct`)
        GET /api/lr?no={lrNumber}                      (this site's own Pages Function)
        200 the same LR body as call 3, plus "statusText" (the backend's own
            words for the status) and "details" (the printed slip's sections:
            see `parseDetails`). The function reads the client's E-Transport API
            and writes this shape — functions/api/lr.ts, src/lib/backend/vendor-lr.ts.
        404 not found · 429 rate limited · 502 / 503 / 504 the client's API failed

   Failures: the HTTP status, and optionally `{ "code": "…", "message": "…" }`.
     404 → NotFound            (the LR; on /otp/verify, an unknown requestId)
     403 on /otp/send → MobileMismatch   (mobile is not the one on the LR)
     401 on /otp/verify → OtpInvalid     410 → OtpExpired
     401 / 403 on /lr → SessionExpired
     429 → RateLimited         (TooManyAttempts when `code` says so)
     5xx → Server
   Date-times with no offset are read as India time (what .NET writes for local
   time); dates are kept as India calendar dates.
   ——————————————————————————————————————————————————————————————————————————— */

import { isRecord, readArray, readInstant, readIstDate, readNumber, readString } from "./guards";
import {
  EMPTY_LR_DETAILS,
  isLrChargeKey,
  type BackendErrorCode,
  type BackendOperation,
  type LrCharge,
  type LrDetails,
  type LrEvent,
  type LrRecord,
  type LrStatus,
  type OtpChallenge,
  type VerifiedSession,
} from "./types";

/* ——— Requests ——— */

/** One HTTP call, described without a base URL: `client.ts` adds that, applies
    the timeout and sends it. */
export interface ApiRequest {
  method: "GET" | "POST";
  /** Starts with `/`; appended to the base URL. */
  path: string;
  body?: Record<string, string>;
  /** Sent as `Authorization: Bearer …` when present. */
  bearerToken?: string;
}

/** `lrNumber` is the normalised LR (`normalizeLr`); `mobile` is the ten national
    digits (`normalizePhone`). If the backend wants `+91…` or a different key,
    this is where it changes. */
export function buildSendOtpRequest(lrNumber: string, mobile: string): ApiRequest {
  return { method: "POST", path: "/otp/send", body: { lrNumber, mobile } };
}

export function buildVerifyOtpRequest(requestId: string, otp: string): ApiRequest {
  return { method: "POST", path: "/otp/verify", body: { requestId, otp } };
}

export function buildFetchLrRequest(lrNumber: string, session: VerifiedSession): ApiRequest {
  return {
    method: "GET",
    // LR numbers may carry `/` or `-`, so the segment is encoded.
    path: `/lr/${encodeURIComponent(lrNumber)}`,
    bearerToken: session.token,
  };
}

/** The direct lookup: same-origin, no token. */
export function buildLookupLrRequest(lrNumber: string): ApiRequest {
  return { method: "GET", path: `/lr?no=${encodeURIComponent(lrNumber)}` };
}

/* ——— Responses ——— */

/** Used when the backend does not say how soon a new code may be requested. */
const DEFAULT_RESEND_AFTER_SEC = 30;

/** Used when the backend does not say how long a code lives. */
const DEFAULT_EXPIRES_IN_SEC = 300;

function positiveSeconds(record: Record<string, unknown>, keys: readonly string[]): number | null {
  const value = readNumber(record, keys);
  return value !== null && value >= 0 ? Math.round(value) : null;
}

/** `fallbackMasked` is the mask this side builds from the number the visitor
    typed, used when the reply carries none. */
export function parseOtpChallenge(raw: unknown, fallbackMasked: string): OtpChallenge | null {
  if (!isRecord(raw)) return null;
  const requestId = readString(raw, ["requestId", "request_id", "otpRequestId", "id"]);
  if (requestId === null) return null;
  return {
    requestId,
    maskedMobile: readString(raw, ["maskedMobile", "masked_mobile", "mobile"]) ?? fallbackMasked,
    expiresInSec: positiveSeconds(raw, ["expiresIn", "expires_in"]) ?? DEFAULT_EXPIRES_IN_SEC,
    resendAfterSec:
      positiveSeconds(raw, ["resendAfter", "resend_after"]) ?? DEFAULT_RESEND_AFTER_SEC,
  };
}

/** `now` is injected so the expiry is a pure function of the reply. */
export function parseVerifiedSession(raw: unknown, now: number): VerifiedSession | null {
  if (!isRecord(raw)) return null;
  const token = readString(raw, ["token", "accessToken", "access_token"]);
  if (token === null) return null;
  const expiresIn = positiveSeconds(raw, ["expiresIn", "expires_in"]);
  // No lifetime in the reply: the session is trusted for the length of one visit
  // and the LR call is what decides (a 401 becomes SessionExpired).
  const lifetimeSec = expiresIn ?? 15 * 60;
  return { token, expiresAt: now + lifetimeSec * 1000 };
}

/* The backend's status words → our ladder. Keys are the backend's word with
   everything but letters and digits removed and upper-cased, so `In Transit`,
   `IN_TRANSIT` and `in-transit` all read as `INTRANSIT`. A word that is not
   listed fails the whole reply (BadResponse) instead of being guessed at: a
   wrong status shown to a customer is worse than an error. Add the client's own
   vocabulary here. */
const STATUS_BY_KEY: ReadonlyMap<string, LrStatus> = new Map<string, LrStatus>([
  ["BOOKED", "booked"],
  ["PICKEDUP", "picked-up"],
  ["INTRANSIT", "in-transit"],
  ["ATFACILITY", "at-facility"],
  ["ARRIVEDATFACILITY", "at-facility"],
  ["OUTFORDELIVERY", "out-for-delivery"],
  ["DELIVERED", "delivered"],
  ["ATTENTION", "attention"],
  ["REQUIRESATTENTION", "attention"],
]);

function readStatus(record: Record<string, unknown>): LrStatus | null {
  const word = readString(record, ["status", "state"]);
  if (word === null) return null;
  return STATUS_BY_KEY.get(word.toUpperCase().replace(/[^A-Z0-9]/g, "")) ?? null;
}

function parseEvent(raw: unknown): LrEvent | null {
  if (!isRecord(raw)) return null;
  const atRaw = readString(raw, ["at", "timestamp", "dateTime", "time"]);
  const at = atRaw === null ? null : readInstant(atRaw);
  const status = readStatus(raw);
  if (at === null || status === null) return null;
  return {
    at,
    location: readString(raw, ["location", "place", "hub"]) ?? "",
    status,
    note: readString(raw, ["note", "remarks", "remark"]),
  };
}

/** `null` when the field is absent; `undefined` marks one that is present but is
    not a date, so the caller can fail the reply instead of dropping it. */
function optionalDate(
  record: Record<string, unknown>,
  keys: readonly string[],
): string | null | undefined {
  const value = readString(record, keys);
  if (value === null) return null;
  return readIstDate(value) ?? undefined;
}

/** A list of ten-digit mobiles; anything else in the list is skipped. */
function readMobiles(record: Record<string, unknown>, keys: readonly string[]): string[] {
  const list = readArray(record, keys) ?? [];
  return list.filter(
    (item): item is string => typeof item === "string" && /^[6-9]\d{9}$/.test(item),
  );
}

function parseCharges(record: Record<string, unknown>): LrCharge[] {
  const list = readArray(record, ["charges"]) ?? [];
  const charges: LrCharge[] = [];
  for (const item of list) {
    if (!isRecord(item)) continue;
    const key = item["key"];
    const amount = readNumber(item, ["amount"]);
    if (isLrChargeKey(key) && amount !== null) charges.push({ key, amount });
  }
  return charges;
}

/** The slip's sections. Lenient by design: a field that is missing or not the
    right kind is simply absent, never a failed reply — the core of the LR
    (route, dates, status) is what `parseLrRecord` insists on. */
export function parseDetails(raw: unknown): LrDetails {
  if (!isRecord(raw)) return EMPTY_LR_DETAILS;
  const invoiceDateRaw = readString(raw, ["invoiceDate"]);
  return {
    vehicleNo: readString(raw, ["vehicleNo"]),
    deliveryType: readString(raw, ["deliveryType"]),
    paymentMode: readString(raw, ["paymentMode"]),
    consignorGstin: readString(raw, ["consignorGstin"]),
    consignorContact: readString(raw, ["consignorContact"]),
    consigneeGstin: readString(raw, ["consigneeGstin"]),
    consigneeContact: readString(raw, ["consigneeContact"]),
    invoiceNo: readString(raw, ["invoiceNo"]),
    invoiceDate: invoiceDateRaw === null ? null : readIstDate(invoiceDateRaw),
    invoiceValue: readNumber(raw, ["invoiceValue"]),
    privateMark: readString(raw, ["privateMark"]),
    contains: readString(raw, ["contains"]),
    ewayBill: readString(raw, ["ewayBill"]),
    packageType: readString(raw, ["packageType"]),
    chargeWeightKg: readNumber(raw, ["chargeWeightKg"]),
    rateType: readString(raw, ["rateType"]),
    charges: parseCharges(raw),
    total: readNumber(raw, ["total"]),
    advance: readNumber(raw, ["advance"]),
    balance: readNumber(raw, ["balance"]),
    supplier: readString(raw, ["supplier"]),
    deliveryAddress: readString(raw, ["deliveryAddress"]),
    deliveryContacts: readMobiles(raw, ["deliveryContacts"]),
  };
}

export function parseLrRecord(raw: unknown, requestedLr: string): LrRecord | null {
  if (!isRecord(raw)) return null;

  const origin = readString(raw, ["origin", "from", "source"]);
  const destination = readString(raw, ["destination", "to"]);
  const bookedRaw = readString(raw, ["bookedOn", "booked_on", "bookingDate", "lrDate"]);
  const bookedOn = bookedRaw === null ? null : readIstDate(bookedRaw);
  if (origin === null || destination === null || bookedOn === null) return null;

  const expectedDelivery = optionalDate(raw, ["expectedDelivery", "expected_delivery", "eta"]);
  const deliveredOn = optionalDate(raw, ["deliveredOn", "delivered_on", "deliveryDate"]);
  if (expectedDelivery === undefined || deliveredOn === undefined) return null;

  const rawEvents = readArray(raw, ["events", "history", "tracking"]) ?? [];
  const events: LrEvent[] = [];
  for (const item of rawEvents) {
    const event = parseEvent(item);
    if (event === null) return null;
    events.push(event);
  }
  // Newest first, whatever order the backend used.
  events.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  // The top-level status wins; a reply without one is read from the newest event.
  const status = readStatus(raw) ?? events[0]?.status ?? null;
  if (status === null) return null;

  return {
    lrNumber: readString(raw, ["lrNumber", "lr_number", "lrNo"]) ?? requestedLr,
    bookedOn,
    origin,
    destination,
    consignor: readString(raw, ["consignor", "sender"]) ?? "",
    consignee: readString(raw, ["consignee", "receiver"]) ?? "",
    packages: readNumber(raw, ["packages", "noOfPackages", "pkgs"]),
    weightKg: readNumber(raw, ["weightKg", "weight_kg", "weight"]),
    status,
    statusText: readString(raw, ["statusText", "status_text"]),
    currentLocation: readString(raw, ["currentLocation", "current_location", "location"]),
    expectedDelivery,
    deliveredOn,
    events,
    details: parseDetails(raw["details"]),
  };
}

/* ——— Failures ——— */

/* A backend's own `code` outranks the HTTP status when it names one of these.
   Keys are upper-cased with everything but letters and digits removed. */
const ERROR_CODE_BY_KEY: ReadonlyMap<string, BackendErrorCode> = new Map<string, BackendErrorCode>([
  ["LRNOTFOUND", "NotFound"],
  ["NOTFOUND", "NotFound"],
  ["MOBILEMISMATCH", "MobileMismatch"],
  ["OTPINVALID", "OtpInvalid"],
  ["INVALIDOTP", "OtpInvalid"],
  ["OTPEXPIRED", "OtpExpired"],
  ["TOOMANYATTEMPTS", "TooManyAttempts"],
  ["RATELIMITED", "RateLimited"],
  ["SESSIONEXPIRED", "SessionExpired"],
]);

function readErrorCode(body: unknown): BackendErrorCode | null {
  if (!isRecord(body)) return null;
  const word = readString(body, ["code", "errorCode", "error"]);
  if (word === null) return null;
  return ERROR_CODE_BY_KEY.get(word.toUpperCase().replace(/[^A-Z0-9]/g, "")) ?? null;
}

/** An HTTP failure → one of our codes. `body` is the parsed JSON reply, or
    `null` when there was none. */
export function mapErrorResponse(
  operation: BackendOperation,
  status: number,
  body: unknown,
): BackendErrorCode {
  const named = readErrorCode(body);
  if (named !== null) return named;

  if (status === 404) return "NotFound";
  if (status === 410) return "OtpExpired";
  if (status === 429) return "RateLimited";
  if (status >= 500) return "Server";
  if (operation === "sendOtp" && status === 403) return "MobileMismatch";
  if (operation === "verifyOtp" && (status === 400 || status === 401 || status === 422)) {
    return "OtpInvalid";
  }
  if (operation === "fetchLr" && (status === 401 || status === 403)) return "SessionExpired";
  if (operation === "lookupLr" && status === 400) return "NotFound";
  return "Server";
}
