/* The one place that talks to the quote desk (Prompt 08).

   The enquiry is POSTed straight to a Google Apps Script Web App
   (apps-script/Code.gs): no server of our own, so nothing here may assume one.

   Two details are load-bearing, and both were learned the hard way:

   1. `Content-Type: text/plain;charset=utf-8` with a JSON *string* body. That is
      a CORS-safelisted content type, so the browser sends a simple request and
      never the `OPTIONS` preflight that Apps Script cannot answer. Changing it to
      `application/json` breaks every submission in the browser, before it is
      sent — `scripts/verify-quote.mts` fails if the string changes.
   2. Apps Script answers with a 302 onto script.googleusercontent.com, so the
      request follows redirects.

   `NEXT_PUBLIC_QUOTE_ENDPOINT` is inlined at build time (`output: "export"`),
   which is why an unset variable arrives here as `""`/undefined rather than as a
   runtime lookup — see `apps-script/README.md` for the two places it is set. */

/** The delivery column is `QUOTE_FIELDS` order; `verify:quote` keeps the sheet
    and this list in step. `website` is the honeypot and is never filled by a
    person. */
export const QUOTE_FIELDS = [
  "name",
  "company",
  "phone",
  "email",
  "service",
  "from",
  "to",
  "loadType",
  "weightKg",
  "vehicle",
  "pickupDate",
  "notes",
  "sourcePage",
  "website",
] as const;

export type QuoteField = (typeof QUOTE_FIELDS)[number];

/** Everything the desk's sheet has a column for. `Service` cites the name in
    `company.services`, not a slug: what reaches the desk is the fact. */
export interface QuotePayload {
  name: string;
  company: string;
  phone: string;
  email: string;
  service: string;
  from: string;
  to: string;
  loadType: string;
  weightKg: string;
  vehicle: string;
  pickupDate: string;
  notes: string;
  sourcePage: string;
  website: string;
}

/** The blank form, and the shape check for a restored draft: every field of
    `QuotePayload` is present, so the interface and `QUOTE_FIELDS` cannot drift
    without the verifier noticing. */
export const EMPTY_QUOTE: QuotePayload = {
  name: "",
  company: "",
  phone: "",
  email: "",
  service: "",
  from: "",
  to: "",
  loadType: "",
  weightKg: "",
  vehicle: "",
  pickupDate: "",
  notes: "",
  sourcePage: "",
  website: "",
};

/** Mirrors the `required` list in `apps-script/Code.gs`: the desk will not
    accept a request without these, so the client must not send one. */
export const REQUIRED_QUOTE_FIELDS: readonly QuoteField[] = [
  "name",
  "phone",
  "service",
  "from",
  "to",
];

/** A non-empty `vehicle` means the visitor picked one; `""` is the
    "let DharmaShree decide" option and reaches the sheet as a blank cell. */
export const VEHICLE_UNDECIDED = "";

export const QUOTE_ENDPOINT_ENV = "NEXT_PUBLIC_QUOTE_ENDPOINT" as const;

/** Why a submission failed, as a code. The copy for each lives in
    `src/content/quote.ts` under `failure.reasons` — no user-facing sentence in
    this file (house rule 3). */
export type QuoteError = "Unconfigured" | "Network" | "Timeout" | "Rejected" | "Server";

export type QuoteResult = { ok: true; reference: string } | { ok: false; error: QuoteError };

const TIMEOUT_MS = 15_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Narrowing for the parsed body. Apps Script answers `{ok:true,reference}`,
    `{ok:false,error}` or an HTML login page (a deployment that is not public);
    anything else is treated as a failure rather than trusted. */
function readReference(value: unknown): string | null {
  if (!isRecord(value)) return null;
  if (value["ok"] !== true) return null;
  const reference = value["reference"];
  if (typeof reference !== "string" || reference.trim() === "") return null;
  return reference;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export async function submitQuote(payload: QuotePayload): Promise<QuoteResult> {
  const endpoint = process.env.NEXT_PUBLIC_QUOTE_ENDPOINT;
  if (endpoint === undefined || endpoint.trim() === "") {
    return { ok: false, error: "Unconfigured" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });

    /* A non-2xx is a deployment problem, not a rejected enquiry. */
    if (!response.ok) return { ok: false, error: "Server" };

    const body = await readJson(response);
    if (body === null) return { ok: false, error: "Server" };

    const reference = readReference(body);
    if (reference === null) {
      /* `{ok:false}` with a reason is the script refusing the request — a
         missing required field, i.e. our own validation did not run. */
      return isRecord(body) && body["ok"] === false
        ? { ok: false, error: "Rejected" }
        : { ok: false, error: "Server" };
    }

    return { ok: true, reference };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, error: "Timeout" };
    }
    /* Offline, DNS, a blocked request or a CORS failure all land here; the form
       offers the desk's own channels as the retry path. */
    return { ok: false, error: "Network" };
  } finally {
    clearTimeout(timer);
  }
}

/** Which page the enquiry came from (`/quote/?service=part-load`), so the desk
    can tell a service-page click from a direct visit. Client-only. */
export function sourcePageFrom(location: Pick<Location, "pathname" | "search">): string {
  return `${location.pathname}${location.search}`.slice(0, 200);
}
