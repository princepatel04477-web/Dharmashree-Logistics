/* The tracking flow's domain types.

   These are OURS: the UI is written against them and never sees the client's
   wire format. `adapter.ts` is the one place that turns the backend's JSON into
   these shapes, so a different API means a different adapter and no UI change. */

/** The shipment statuses, in the order the ladder on /track explains them. The
    labels and meanings live in `track.statuses.items` (matched by `key`). */
export const LR_STATUSES = [
  "booked",
  "picked-up",
  "in-transit",
  "at-facility",
  "out-for-delivery",
  "delivered",
  "attention",
] as const;

export type LrStatus = (typeof LR_STATUSES)[number];

export function isLrStatus(value: unknown): value is LrStatus {
  return LR_STATUSES.some((status) => status === value);
}

/** One movement on the consignment's journey. */
export interface LrEvent {
  /** ISO 8601 instant. */
  at: string;
  /** Where it happened; empty when the backend does not say. */
  location: string;
  status: LrStatus;
  note: string | null;
}

/** The charge lines of the slip's freight block, in the order it prints them. */
export const LR_CHARGE_KEYS = [
  "freight",
  "pickup",
  "stCharge",
  "insurance",
  "doorDelivery",
  "loading",
  "unloading",
  "other",
] as const;

export type LrChargeKey = (typeof LR_CHARGE_KEYS)[number];

export function isLrChargeKey(value: unknown): value is LrChargeKey {
  return LR_CHARGE_KEYS.some((key) => key === value);
}

export interface LrCharge {
  key: LrChargeKey;
  /** Rupees. */
  amount: number;
}

/** The rest of the printed LR: the parties' registrations, the invoice, the
    freight and where it is delivered. Every field is optional — a booking
    carries what was entered — and the UI shows only what is present. */
export interface LrDetails {
  vehicleNo: string | null;
  /** "Door delivery", "Godown delivery". */
  deliveryType: string | null;
  /** "To pay", "Paid", "TBB". */
  paymentMode: string | null;
  consignorGstin: string | null;
  consignorContact: string | null;
  consigneeGstin: string | null;
  consigneeContact: string | null;
  invoiceNo: string | null;
  /** `YYYY-MM-DD`, India time. */
  invoiceDate: string | null;
  invoiceValue: number | null;
  privateMark: string | null;
  contains: string | null;
  ewayBill: string | null;
  packageType: string | null;
  chargeWeightKg: number | null;
  rateType: string | null;
  charges: readonly LrCharge[];
  total: number | null;
  advance: number | null;
  balance: number | null;
  supplier: string | null;
  deliveryAddress: string | null;
  /** Ten-digit mobiles, without +91. */
  deliveryContacts: readonly string[];
}

export const EMPTY_LR_DETAILS: LrDetails = {
  vehicleNo: null,
  deliveryType: null,
  paymentMode: null,
  consignorGstin: null,
  consignorContact: null,
  consigneeGstin: null,
  consigneeContact: null,
  invoiceNo: null,
  invoiceDate: null,
  invoiceValue: null,
  privateMark: null,
  contains: null,
  ewayBill: null,
  packageType: null,
  chargeWeightKg: null,
  rateType: null,
  charges: [],
  total: null,
  advance: null,
  balance: null,
  supplier: null,
  deliveryAddress: null,
  deliveryContacts: [],
};

/** A lorry receipt, as the customer sees it. `events` are newest first. */
export interface LrRecord {
  lrNumber: string;
  /** `YYYY-MM-DD`, India time. */
  bookedOn: string;
  origin: string;
  destination: string;
  consignor: string;
  consignee: string;
  packages: number | null;
  weightKg: number | null;
  status: LrStatus;
  /** The backend's own words for the status ("Stock available at booking
      location"), shown under the ladder label; `null` when it sends none. */
  statusText: string | null;
  currentLocation: string | null;
  /** `YYYY-MM-DD`, India time. */
  expectedDelivery: string | null;
  /** `YYYY-MM-DD`, India time. */
  deliveredOn: string | null;
  events: readonly LrEvent[];
  details: LrDetails;
}

/** An SMS code that has been sent and is waiting to be entered. */
export interface OtpChallenge {
  /** Echoed back with the code so the backend knows which SMS it answers. */
  requestId: string;
  /** The number as the backend masks it (for example `XXXXXX1234`). */
  maskedMobile: string;
  expiresInSec: number;
  resendAfterSec: number;
}

/** The proof that a code was verified. Held in memory only. */
export interface VerifiedSession {
  token: string;
  /** Epoch milliseconds. */
  expiresAt: number;
}

export const BACKEND_ERROR_CODES = [
  "Network",
  "Timeout",
  "NotFound",
  "NotVerified",
  "MobileMismatch",
  "OtpInvalid",
  "OtpExpired",
  "TooManyAttempts",
  "RateLimited",
  "SessionExpired",
  "Server",
  "Unconfigured",
  "BadResponse",
] as const;

/** Why a call failed, as a code. The sentence for each lives in
    `track.live.errors` — no user-facing text in `src/lib` (house rule 3). */
export type BackendErrorCode = (typeof BACKEND_ERROR_CODES)[number];

export type BackendResult<T> = { ok: true; data: T } | { ok: false; error: BackendErrorCode };

/** The calls, named so the adapter can map a failure per operation.
    `lookupLr` is the direct LR-number lookup (no SMS code). */
export type BackendOperation = "sendOtp" | "verifyOtp" | "fetchLr" | "lookupLr";
