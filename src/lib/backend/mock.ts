/* A stand-in for the client's backend, for local QA only.

   Reached only when `NEXT_PUBLIC_DSL_API_BASE=mock` in a non-production build
   (`config.ts`); `client.ts` cannot reach it in a production build. Nothing here
   is shown to a real customer, which is why the names, places and numbers below
   may be made up — they exist so every screen of the flow can be walked.

   It speaks the assumed wire contract (adapter.ts) and its replies go through
   the adapter's own parsers, so a QA pass exercises the real mapping code, not a
   shortcut around it.

   Triggers, all documented here so a tester needs no source reading:
     LR            DSL12345 is found; any other LR is NotFound.
     Mobile        9999999999  MobileMismatch (it is not the number on the LR)
                   9000000000  RateLimited
                   9000000001  Network failure
                   9000000002  Timeout
                   9000000003  Server error
                   9000000004  an unreadable reply (BadResponse)
                   anything else (a valid Indian mobile) receives a code.
     Code          123456  accepted
                   000000  OtpExpired
                   111111  TooManyAttempts
                   anything else  OtpInvalid; the third wrong code in a row is
                   TooManyAttempts.
   The resend timer is 10 seconds, so it can be watched. */

import {
  mapErrorResponse,
  parseLrRecord,
  parseOtpChallenge,
  parseVerifiedSession,
} from "./adapter";
import type {
  BackendErrorCode,
  BackendOperation,
  BackendResult,
  LrRecord,
  OtpChallenge,
  VerifiedSession,
} from "./types";

const DELAY_MS = 700;
const KNOWN_LR = "DSL12345";
const TOKEN_PREFIX = "mock-session-";
const MAX_WRONG_CODES = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

interface PendingChallenge {
  lr: string;
  wrongCodes: number;
}

const pending = new Map<string, PendingChallenge>();
let counter = 0;

function pause(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, DELAY_MS);
  });
}

/** A reply as the adapter would meet it over HTTP: a status and a JSON body. */
interface WireReply {
  status: number;
  body: unknown;
}

function fail(operation: BackendOperation, reply: WireReply): BackendResult<never> {
  const error: BackendErrorCode = mapErrorResponse(operation, reply.status, reply.body);
  return { ok: false, error };
}

function maskOf(mobile: string): string {
  return `XXXXXX${mobile.slice(-4)}`;
}

export async function requestOtp(lr: string, mobile: string): Promise<BackendResult<OtpChallenge>> {
  await pause();

  if (mobile === "9000000001") return { ok: false, error: "Network" };
  if (mobile === "9000000002") return { ok: false, error: "Timeout" };
  if (mobile === "9000000003") return fail("sendOtp", { status: 503, body: null });
  if (mobile === "9000000000") {
    return fail("sendOtp", { status: 429, body: { code: "RATE_LIMITED" } });
  }
  if (lr !== KNOWN_LR) return fail("sendOtp", { status: 404, body: { code: "LR_NOT_FOUND" } });
  if (mobile === "9999999999") {
    return fail("sendOtp", { status: 403, body: { code: "MOBILE_MISMATCH" } });
  }

  counter += 1;
  const requestId = `mock-request-${String(counter)}`;
  pending.set(requestId, { lr, wrongCodes: 0 });

  const body: unknown =
    mobile === "9000000004"
      ? { unexpected: true }
      : { requestId, maskedMobile: maskOf(mobile), expiresIn: 120, resendAfter: 10 };
  const challenge = parseOtpChallenge(body, maskOf(mobile));
  return challenge === null ? { ok: false, error: "BadResponse" } : { ok: true, data: challenge };
}

export async function verifyOtp(
  requestId: string,
  otp: string,
): Promise<BackendResult<VerifiedSession>> {
  await pause();

  const challenge = pending.get(requestId);
  if (challenge === undefined) {
    return fail("verifyOtp", { status: 404, body: { code: "OTP_EXPIRED" } });
  }
  if (otp === "000000") {
    pending.delete(requestId);
    return fail("verifyOtp", { status: 410, body: { code: "OTP_EXPIRED" } });
  }
  if (otp === "111111") {
    pending.delete(requestId);
    return fail("verifyOtp", { status: 429, body: { code: "TOO_MANY_ATTEMPTS" } });
  }
  if (otp !== "123456") {
    challenge.wrongCodes += 1;
    if (challenge.wrongCodes >= MAX_WRONG_CODES) {
      pending.delete(requestId);
      return fail("verifyOtp", { status: 429, body: { code: "TOO_MANY_ATTEMPTS" } });
    }
    return fail("verifyOtp", { status: 401, body: { code: "OTP_INVALID" } });
  }

  pending.delete(requestId);
  const session = parseVerifiedSession(
    { token: `${TOKEN_PREFIX}${requestId}`, expiresIn: 900 },
    Date.now(),
  );
  return session === null ? { ok: false, error: "BadResponse" } : { ok: true, data: session };
}

/** An ISO instant `days` ago (negative: ahead), at the given India time. */
function istMoment(days: number, hour: number, minute: number): string {
  const day = new Date(Date.now() - days * DAY_MS + 5.5 * 60 * 60 * 1000);
  const date = day.toISOString().slice(0, 10);
  return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+05:30`;
}

/** The sample consignment, in the wire format, events oldest first (the
    adapter sorts them newest first). */
function sampleLr(): unknown {
  return {
    lrNumber: KNOWN_LR,
    bookedOn: istMoment(4, 11, 0),
    origin: "Surat",
    destination: "Jaipur",
    consignor: "Sample Textiles",
    consignee: "Sample Garments",
    packages: 24,
    weightKg: "1180.50",
    status: "IN_TRANSIT",
    currentLocation: "Ahmedabad hub",
    expectedDelivery: istMoment(-2, 18, 0).slice(0, 10),
    deliveredOn: null,
    events: [
      { at: istMoment(4, 11, 0), location: "Surat", status: "BOOKED", note: "LR booked" },
      {
        at: istMoment(4, 16, 30),
        location: "Surat",
        status: "PICKED_UP",
        note: "Collected from the consignor",
      },
      { at: istMoment(3, 21, 15), location: "Surat hub", status: "IN_TRANSIT", note: null },
      {
        at: istMoment(2, 7, 40),
        location: "Ahmedabad hub",
        status: "AT_FACILITY",
        note: "Sorted for onward movement",
      },
      {
        at: istMoment(1, 6, 10),
        location: "Ahmedabad hub",
        status: "IN_TRANSIT",
        note: "Left for Jaipur",
      },
    ],
  };
}

export async function fetchLr(
  lr: string,
  session: VerifiedSession,
): Promise<BackendResult<LrRecord>> {
  await pause();

  if (!session.token.startsWith(TOKEN_PREFIX)) {
    return fail("fetchLr", { status: 401, body: null });
  }
  if (lr !== KNOWN_LR) return fail("fetchLr", { status: 404, body: { code: "LR_NOT_FOUND" } });

  const record = parseLrRecord(sampleLr(), lr);
  return record === null ? { ok: false, error: "BadResponse" } : { ok: true, data: record };
}
