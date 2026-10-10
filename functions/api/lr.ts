/* GET /api/lr?no=SRT-3230 — the LR lookup behind /track in "direct" mode.

   A Cloudflare Pages Function: `wrangler pages deploy` bundles everything under
   `functions/` beside the static export, so this runs on the same origin as the
   site (no CORS) and is the only code here that ever runs on a server.

   It calls the client's E-Transport API —
     {DSL_LR_API_BASE}/LRInquiry.ashx?apiname=lrinquiry&code=BRANCH&lrno=NUMBER
   — and answers with the shape `parseLrRecord` reads (src/lib/backend/adapter.ts,
   built by src/lib/backend/vendor-lr.ts). Only that shape is returned: the
   vendor's raw record never reaches the browser.

   Answers:
     200 the LR · 400 not an LR number · 403 called from another site
     404 not found · 429 too many lookups from one address
     502 the API answered with something unreadable · 503 the API refused us
     504 the API did not answer in time

   Environment (Cloudflare Pages › Settings › Variables):
     DSL_LR_API_BASE   optional; defaults to https://dharmashreegroup.in/api

   LR numbers run in sequence, so a lookup is limited per address. The limit
   here is per Cloudflare isolate and best effort; a Cloudflare rate-limiting
   rule on /api/lr is the durable one (docs/backend-integration.md). */

import { parseLrQuery, readVendorLr, vendorLrUrl } from "../../src/lib/backend/vendor-lr";

interface Env {
  DSL_LR_API_BASE?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const DEFAULT_BASE = "https://dharmashreegroup.in/api";
const UPSTREAM_TIMEOUT_MS = 12_000;
const WINDOW_MS = 5 * 60 * 1000;
const MAX_LOOKUPS_PER_WINDOW = 30;

const lookups = new Map<string, number[]>();

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

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  /* Browsers mark a request from another site; the page itself is same-origin. */
  const site = request.headers.get("Sec-Fetch-Site");
  if (site === "cross-site") return json(403, { code: "FORBIDDEN" });

  const address = request.headers.get("CF-Connecting-IP") ?? "unknown";
  if (overLimit(address, Date.now())) return json(429, { code: "RATE_LIMITED" });

  const query = parseLrQuery(new URL(request.url).searchParams.get("no") ?? "");
  if (query === null) return json(400, { code: "LR_FORMAT" });

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, UPSTREAM_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(vendorLrUrl(env.DSL_LR_API_BASE ?? DEFAULT_BASE, query), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return json(timedOut ? 504 : 502, { code: timedOut ? "UPSTREAM_TIMEOUT" : "UPSTREAM_DOWN" });
  } finally {
    clearTimeout(timer);
  }

  /* The vendor's server answers 401/403 with an HTML page while API access has
     not been granted to us. */
  if (upstream.status === 401 || upstream.status === 403) {
    return json(503, { code: "UPSTREAM_LOCKED" });
  }
  if (!upstream.ok) return json(502, { code: "UPSTREAM_ERROR" });

  let body: unknown;
  try {
    /* It sends JSON as text/plain, so the text is parsed whatever the type says. */
    body = JSON.parse(await upstream.text()) as unknown;
  } catch {
    return json(502, { code: "UPSTREAM_UNREADABLE" });
  }

  const reading = readVendorLr(body, query);
  if (reading.kind === "not-found") return json(404, { code: "LR_NOT_FOUND" });
  if (reading.kind === "unreadable") return json(502, { code: "UPSTREAM_UNREADABLE" });
  return json(200, reading.record);
}
