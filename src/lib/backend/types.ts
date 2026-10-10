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
  currentLocation: string | null;
  /** `YYYY-MM-DD`, India time. */
  expectedDelivery: string | null;
  /** `YYYY-MM-DD`, India time. */
  deliveredOn: string | null;
  events: readonly LrEvent[];
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

/** The three calls, named so the adapter can map a failure per operation. */
export type BackendOperation = "sendOtp" | "verifyOtp" | "fetchLr";
