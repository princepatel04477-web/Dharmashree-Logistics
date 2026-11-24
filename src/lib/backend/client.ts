/* The tracking flow's calls: send a code, verify it, read the LR — and, in
   "direct" mode, look an LR up by its number alone.

   Transport only. What to send and how to read the reply is `adapter.ts`; this
   file adds the base URL, a timeout, and the rules every call shares:

   - it never throws: every outcome is a `BackendResult`, so the UI has one
     branch per error code and no try/catch of its own;
   - the browser calls the client's API directly (there is no server of ours in
     a static export), so the request is `cors`, carries no cookies, and holds
     no secret — see docs/backend-integration.md for what that rules out;
   - in "mock" mode (local QA only) the calls go to `mock.ts` instead. The mock
     is behind a `NODE_ENV` check the bundler resolves at build time, so a
     production build has no path to it and drops it from the bundle. */

import { formatMaskedMobileIN } from "@/lib/format";
import { normalizeLr, normalizePhone } from "@/lib/validate";
import {
  buildFetchLrRequest,
  buildLookupLrRequest,
  buildSendOtpRequest,
  buildVerifyOtpRequest,
  mapErrorResponse,
  parseLrRecord,
  parseOtpChallenge,
  parseVerifiedSession,
  type ApiRequest,
} from "./adapter";
import { apiBase, backendMode, trackDemo } from "./config";
import { demoLookupLr, isDemoLr } from "./demo";
import type {
  BackendOperation,
  BackendResult,
  LrRecord,
  OtpChallenge,
  VerifiedSession,
} from "./types";

const TIMEOUT_MS = 15_000;

const UNCONFIGURED = { ok: false, error: "Unconfigured" } as const;

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

/** Sends one request and hands the parsed JSON to `parse`. A `null` from `parse`
    means the reply was not in the shape the adapter expects. */
async function send<T>(
  operation: BackendOperation,
  request: ApiRequest,
  parse: (body: unknown) => T | null,
): Promise<BackendResult<T>> {
  if (apiBase === null) return UNCONFIGURED;

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (request.body !== undefined) headers["Content-Type"] = "application/json";
    if (request.bearerToken !== undefined)
      headers["Authorization"] = `Bearer ${request.bearerToken}`;

    const response = await fetch(`${apiBase}${request.path}`, {
      method: request.method,
      headers,
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal,
    });

    const body = await readJson(response);
    if (!response.ok) {
      return { ok: false, error: mapErrorResponse(operation, response.status, body) };
    }

    const data = parse(body);
    return data === null ? { ok: false, error: "BadResponse" } : { ok: true, data };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, error: "Timeout" };
    }
    /* Offline, DNS, a blocked request or a CORS refusal all land here; the UI
       offers a retry. */
    return { ok: false, error: "Network" };
  } finally {
    clearTimeout(timer);
  }
}

/** The simulator, or `null` in a production build (see the header comment). */
async function loadMock(): Promise<typeof import("./mock") | null> {
  if (process.env.NODE_ENV === "production") return null;
  return import("./mock");
}

/** Asks the backend to SMS a one-time code to `mobile` for this LR. */
export async function requestOtp(lr: string, mobile: string): Promise<BackendResult<OtpChallenge>> {
  const lrNumber = normalizeLr(lr);
  const national = normalizePhone(mobile);

  if (backendMode === "mock") {
    const mock = await loadMock();
    return mock === null ? UNCONFIGURED : mock.requestOtp(lrNumber, national);
  }
  if (backendMode !== "live") return UNCONFIGURED;

  const fallbackMasked = formatMaskedMobileIN(national) ?? "";
  return send("sendOtp", buildSendOtpRequest(lrNumber, national), (body) =>
    parseOtpChallenge(body, fallbackMasked),
  );
}

/** Checks the code the customer typed against the challenge it answers. */
export async function verifyOtp(
  requestId: string,
  otp: string,
): Promise<BackendResult<VerifiedSession>> {
  if (backendMode === "mock") {
    const mock = await loadMock();
    return mock === null ? UNCONFIGURED : mock.verifyOtp(requestId, otp);
  }
  if (backendMode !== "live") return UNCONFIGURED;

  return send("verifyOtp", buildVerifyOtpRequest(requestId, otp), (body) =>
    parseVerifiedSession(body, Date.now()),
  );
}

/** Reads the LR, once a code has been verified. */
export async function fetchLr(
  lr: string,
  session: VerifiedSession,
): Promise<BackendResult<LrRecord>> {
  const lrNumber = normalizeLr(lr);
  if (session.expiresAt <= Date.now()) return { ok: false, error: "SessionExpired" };

  if (backendMode === "mock") {
    const mock = await loadMock();
    return mock === null ? UNCONFIGURED : mock.fetchLr(lrNumber, session);
  }
  if (backendMode !== "live") return UNCONFIGURED;

  return send("fetchLr", buildFetchLrRequest(lrNumber, session), (body) =>
    parseLrRecord(body, lrNumber),
  );
}

/** The direct lookup ("direct" mode): the LR number and the mobile number on the
    booking. The server answers with the LR only when the mobile is one the
    booking carries; for a wrong number, an unknown LR and a booking with no
    number on file alike it answers `NotVerified`, so the reply never tells a
    stranger whether an LR exists. */
export async function lookupLr(lr: string, mobile: string): Promise<BackendResult<LrRecord>> {
  const lrNumber = normalizeLr(lr);

  /* The prototype's sample bookings, answered here and labelled as samples. */
  if (trackDemo && isDemoLr(lrNumber)) return demoLookupLr(lrNumber, mobile);

  if (backendMode === "mock-direct") {
    const mock = await loadMock();
    return mock === null ? UNCONFIGURED : mock.lookupLr(lrNumber, mobile);
  }
  if (backendMode !== "direct") return UNCONFIGURED;

  return send("lookupLr", buildLookupLrRequest(lrNumber, mobile), (body) =>
    parseLrRecord(body, lrNumber),
  );
}
