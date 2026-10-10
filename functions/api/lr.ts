/* POST /api/lr  { "no": "SRT-3230", "mobile": "9876543210" } — the LR lookup
   behind /track in "direct" mode.

   A Cloudflare Pages Function: `wrangler pages deploy` bundles everything under
   `functions/` beside the static export, so this runs on the same origin as the
   site (no CORS) and is the only code here that ever runs on a server.

   LR numbers run in sequence, so a number alone must never open a booking: the
   caller also gives the mobile number on the booking, and the record is returned
   only when that is one of the consignor's / consignee's mobiles in the LR
   itself (`mobileMatchesBooking`). The delivery station's numbers are public and
   are never accepted. Every way of not being verified — an unknown LR, a wrong
   mobile, a booking with no customer mobile on file — gets the *same* answer
   (404 NOT_VERIFIED), so the reply cannot be used to find which LRs exist. The
   mobile is in the body, not the address, so it is not left in a URL log.

   It calls the client's E-Transport API —
     {DSL_LR_API_BASE}/LRInquiry.ashx?apiname=lrinquiry&code=BRANCH&lrno=NUMBER
   — with the vendor's key in the `Authorization` header (checked 2026-10-10: the
   raw key and `Bearer <key>` are both accepted; a wrong or missing one is 401) and
   answers with the shape `parseLrRecord` reads (src/lib/backend/adapter.ts, built
   by src/lib/backend/vendor-lr.ts). Only that shape is returned: the vendor's raw
   record never reaches the browser.

   Answers:
     200 the LR · 400 not an LR number / not a mobile · 403 called from another site
     404 NOT_VERIFIED · 405 not a POST · 429 too many lookups, or too many misses,
     from one address · 502 the API answered with something unreadable ·
     503 the API refused us · 504 the API did not answer in time

   Environment (Cloudflare Pages › Settings › Variables):
     DSL_LR_API_BASE   optional; defaults to https://dharmashreegroup.in/api
     DSL_LR_API_KEY    the vendor's key — set it as an *encrypted* variable
                       (`wrangler pages secret put DSL_LR_API_KEY`), never in the
                       repo and never in a NEXT_PUBLIC_* variable

   The limits here are per Cloudflare isolate and best effort; a Cloudflare
   rate-limiting rule on /api/lr is the durable one (docs/backend-integration.md). */

import {
  bareMobile,
  mobileMatchesBooking,
  parseLrQuery,
  readVendorLr,
  vendorLrUrl,
} from "../../src/lib/backend/vendor-lr";

interface Env {
  DSL_LR_API_BASE?: string;
  DSL_LR_API_KEY?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const DEFAULT_BASE = "https://dharmashreegroup.in/api";
const UPSTREAM_TIMEOUT_MS = 12_000;
const WINDOW_MS = 5 * 60 * 1000;
const MAX_LOOKUPS_PER_WINDOW = 30;
/* A wrong mobile is a guess, so misses are limited far harder than lookups. */
const MISS_WINDOW_MS = 15 * 60 * 1000;
const MAX_MISSES_PER_WINDOW = 8;

const lookups = new Map<string, number[]>();
const misses = new Map<string, number[]>();

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/** True when this address has used up its lookups for the window. */
function overLimit(address: string, now: number): boolean {
  const recent = (lookups.get(address) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  lookups.set(address, recent);
  if (lookups.size > 5000) lookups.clear();
  return recent.length > MAX_LOOKUPS_PER_WINDOW;
}

function recentMisses(address: string, now: number): number[] {
  return (misses.get(address) ?? []).filter((at) => now - at < MISS_WINDOW_MS);
}

/** True when this address has already missed as often as it is allowed to. */
function hasUsedUpMisses(address: string, now: number): boolean {
  return recentMisses(address, now).length >= MAX_MISSES_PER_WINDOW;
}

/** The one answer for "not verified", whatever the reason — and one more miss
    against this address. */
function notVerified(address: string): Response {
  const now = Date.now();
  const recent = recentMisses(address, now);
  recent.push(now);
  misses.set(address, recent);
  if (misses.size > 5000) misses.clear();
  return json(404, { code: "NOT_VERIFIED" });
}

/** Reads `{ no, mobile }` from the body; null when it is not that. */
async function readBody(request: Request): Promise<{ no: string; mobile: string } | null> {
  try {
    const body = (await request.json()) as unknown;
    if (typeof body !== "object" || body === null) return null;
    const { no, mobile } = body as Record<string, unknown>;
    if (typeof no !== "string" || typeof mobile !== "string") return null;
    if (no.length > 40 || mobile.length > 30) return null;
    return { no, mobile };
  } catch {
    return null;
  }
}

export function onRequestGet(): Response {
  return json(405, { code: "METHOD_NOT_ALLOWED" });
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  /* Browsers mark a request from another site; the page itself is same-origin. */
  const site = request.headers.get("Sec-Fetch-Site");
  if (site === "cross-site") return json(403, { code: "FORBIDDEN" });

  const address = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const now = Date.now();
  if (overLimit(address, now) || hasUsedUpMisses(address, now)) {
    return json(429, { code: "RATE_LIMITED" });
  }

  const body = await readBody(request);
  if (body === null) return json(400, { code: "BAD_REQUEST" });

  const query = parseLrQuery(body.no);
  if (query === null) return json(400, { code: "LR_FORMAT" });
  const mobile = bareMobile(body.mobile);
  if (!/^[6-9]\d{9}$/.test(mobile)) return json(400, { code: "MOBILE_FORMAT" });

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, UPSTREAM_TIMEOUT_MS);

  const headers: Record<string, string> = { Accept: "application/json" };
  const key = env.DSL_LR_API_KEY?.trim();
  if (key !== undefined && key !== "") headers["Authorization"] = key;

  let upstream: Response;
  try {
    upstream = await fetch(vendorLrUrl(env.DSL_LR_API_BASE ?? DEFAULT_BASE, query), {
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return json(timedOut ? 504 : 502, { code: timedOut ? "UPSTREAM_TIMEOUT" : "UPSTREAM_DOWN" });
  } finally {
    clearTimeout(timer);
  }

  /* The vendor's server answers 401/403 with an HTML page when the key is
     missing, wrong or revoked. */
  if (upstream.status === 401 || upstream.status === 403) {
    return json(503, { code: "UPSTREAM_LOCKED" });
  }
  if (!upstream.ok) return json(502, { code: "UPSTREAM_ERROR" });

  let vendorBody: unknown;
  try {
    /* It sends JSON as text/plain, so the text is parsed whatever the type says. */
    vendorBody = JSON.parse(await upstream.text()) as unknown;
  } catch {
    return json(502, { code: "UPSTREAM_UNREADABLE" });
  }

  const reading = readVendorLr(vendorBody, query);
  if (reading.kind === "unreadable") return json(502, { code: "UPSTREAM_UNREADABLE" });
  /* Unknown LR, wrong mobile, no customer mobile on file: one answer. */
  if (reading.kind === "not-found") return notVerified(address);
  if (!mobileMatchesBooking(reading.record.details, mobile)) return notVerified(address);
  return json(200, reading.record);
}
