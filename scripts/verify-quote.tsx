/* Unit check for the quote pipeline (Prompt 08). Run with `npm run verify:quote`.

   The two halves live in different files and different languages — a typed
   client (`src/lib/quote.ts`) and an Apps Script (`apps-script/Code.gs`) — so
   the drift that matters is the kind a compiler cannot see:

   - the sheet's columns and the payload's fields agreeing, one for one;
   - the honeypot being called the same thing on both sides;
   - the CORS-simple content type still being `text/plain` (the whole submission
     breaks if that string is "fixed" to application/json — see the README);
   - the endpoint variable being the one the site reads and the one `.env.example`
     documents;
   - every validator code having copy, and a *valid* payload passing every rule
     (a validator that rejects good input is worse than one that misses bad).

   The rest is the half a static HTML audit cannot reach: steps 2 and 3, the
   review panel in all three states and the confirmation, rendered through
   `react-dom/server` with a filled payload, an untouched one and a failure. The
   exported `/quote` only ever contains step 1, so without this the markup for
   everything after "Continue" would ship unrendered. */

import { readFileSync } from "node:fs";
import { company } from "../src/content/company";
import { createServer } from "node:http";
import { renderToStaticMarkup } from "react-dom/server";
import { QuoteAside } from "../src/components/quote/QuoteAside";
import { resolveQuoteEntry } from "../src/components/quote/useQuoteEntry";
import { ReviewPanel } from "../src/components/quote/ReviewPanel";
import { StepContact } from "../src/components/quote/StepContact";
import { StepLane } from "../src/components/quote/StepLane";
import { StepLoad } from "../src/components/quote/StepLoad";
import { SuccessPanel } from "../src/components/quote/SuccessPanel";
import { LrSlip } from "../src/components/track/LrSlip";
import { TrackPanel } from "../src/components/track/TrackPanel";
import { HUBS, ORIGIN } from "../src/content/hubs";
import { quote } from "../src/content/quote";
import { services } from "../src/content/services";
import { track } from "../src/content/track";
import {
  submitQuote,
  EMPTY_QUOTE,
  QUOTE_ENDPOINT_ENV,
  QUOTE_FIELDS,
  REQUIRED_QUOTE_FIELDS,
  type QuotePayload,
} from "../src/lib/quote";
import {
  firstInvalidField,
  isEmail,
  isIndianMobile,
  LR_CODES,
  QUOTE_FIELD_CODES,
  readWeightKg,
  stepOfField,
  todayISODate,
  validateLr,
  validateQuote,
  type QuoteFieldErrors,
} from "../src/lib/validate";

const codeGs = readFileSync(new URL("../apps-script/Code.gs", import.meta.url), "utf8");
const appsScriptReadme = readFileSync(new URL("../apps-script/README.md", import.meta.url), "utf8");
const envExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
const quoteLib = readFileSync(new URL("../src/lib/quote.ts", import.meta.url), "utf8");

function fail(message: string): never {
  console.error(`verify:quote FAILED — ${message}`);
  process.exit(1);
}

function check(condition: boolean, message: string): void {
  if (!condition) fail(message);
}

const dayMs = 24 * 60 * 60 * 1000;

function isoDaysFromToday(offset: number): string {
  return todayISODate(new Date(Date.now() + offset * dayMs));
}

function validPayload(): QuotePayload {
  return {
    ...EMPTY_QUOTE,
    name: "Verifier",
    company: "Verifier & Co",
    phone: "+91 98765 43210",
    email: "desk@example.com",
    service: "Full truckload (FTL)",
    from: ORIGIN.name,
    to: HUBS[0]?.name ?? "Delhi NCR",
    loadType: "Bales",
    weightKg: "1200",
    vehicle: "",
    pickupDate: isoDaysFromToday(2),
    notes: "Two lines, no surprises.",
    sourcePage: "/quote/",
  };
}

async function main(): Promise<void> {
  /* ——— 1. The sheet and the payload are one list ——— */
  const headersMatch = /const HEADERS = \[([^\]]*)\]/.exec(codeGs);
  if (headersMatch === null || headersMatch[1] === undefined) {
    fail("could not read HEADERS out of apps-script/Code.gs");
  }
  const headers = headersMatch[1]
    .split(",")
    .map((cell) => cell.trim().replace(/^'|'$/g, ""))
    .filter((cell) => cell !== "");
  check(headers.length > 0, "HEADERS parsed as empty");

  /* The two leading columns are the script's own: it writes them, not the
     client. Everything after them is one payload field per column. */
  const scriptColumns = 2;
  const payloadFields = QUOTE_FIELDS.length - 1; /* `website` is the honeypot. */
  check(
    headers.length === scriptColumns + payloadFields,
    `${String(headers.length)} sheet columns vs ${String(scriptColumns + payloadFields)} (2 written by the script + ${String(payloadFields)} payload fields)`,
  );
  check(
    QUOTE_FIELDS.includes("website"),
    "the honeypot field `website` is missing from QUOTE_FIELDS",
  );

  /* ——— 2. The honeypot is the same word on both sides ——— */
  check(/body\.website\b/.test(codeGs), "Code.gs no longer reads the `website` honeypot");
  check(
    /if \(body\.website\) return json_\(\{ ok: true \}\)/.test(codeGs),
    "the honeypot no longer returns ok without writing",
  );

  /* ——— 3. The client validates at least what the script requires ——— */
  const requiredMatch = /const required = \[([^\]]*)\]/.exec(codeGs);
  if (requiredMatch === null || requiredMatch[1] === undefined) {
    fail("could not read the `required` list out of apps-script/Code.gs");
  }
  const requiredInScript = requiredMatch[1]
    .split(",")
    .map((name) => name.trim().replace(/^'|'$/g, ""))
    .filter((name) => name !== "");
  for (const field of requiredInScript) {
    check(
      (QUOTE_FIELDS as readonly string[]).includes(field),
      `Code.gs requires \`${field}\`, which is not a payload field`,
    );
    check(
      (REQUIRED_QUOTE_FIELDS as readonly string[]).includes(field),
      `Code.gs requires \`${field}\` but the client does not`,
    );
  }
  check(
    requiredInScript.length === REQUIRED_QUOTE_FIELDS.length,
    "the required lists differ in length",
  );

  /* ——— 4. The CORS lesson is still encoded ——— */
  check(
    quoteLib.includes('"Content-Type": "text/plain;charset=utf-8"'),
    "src/lib/quote.ts must send text/plain;charset=utf-8 (a plain string body) — a JSON content type triggers a preflight Apps Script cannot answer",
  );
  /* The comment above that header is allowed to name the other content type;
     the request's own header is not. */
  check(
    !/["']?Content-Type["']?\s*:\s*["']application\/json/.test(quoteLib),
    "src/lib/quote.ts sets an application/json content type — the request must stay CORS-simple",
  );
  check(
    /body:\s*JSON\.stringify\(/.test(quoteLib),
    "src/lib/quote.ts must send the payload as a JSON string body",
  );

  /* ——— 5. The endpoint variable is one name in three places ——— */
  check(
    quoteLib.includes(`"${QUOTE_ENDPOINT_ENV}"`),
    "quote.ts does not name the endpoint variable",
  );
  check(
    envExample.includes(QUOTE_ENDPOINT_ENV),
    `.env.example does not document ${QUOTE_ENDPOINT_ENV}`,
  );
  check(
    appsScriptReadme.includes(QUOTE_ENDPOINT_ENV),
    `apps-script/README.md does not mention ${QUOTE_ENDPOINT_ENV}`,
  );

  /* ——— 6. EMPTY_QUOTE is the payload, field for field ——— */
  const emptyKeys = Object.keys(EMPTY_QUOTE).sort();
  const fieldKeys = [...QUOTE_FIELDS].sort();
  check(
    emptyKeys.join(",") === fieldKeys.join(","),
    `EMPTY_QUOTE keys (${emptyKeys.join(", ")}) do not match QUOTE_FIELDS`,
  );
  check(QUOTE_FIELDS.length === new Set(QUOTE_FIELDS).size, "QUOTE_FIELDS repeats a field");

  /* ——— 7. Every code has copy ——— */
  for (const code of QUOTE_FIELD_CODES) {
    check(quote.errors[code].trim() !== "", `quote.errors.${code} is empty`);
  }
  for (const code of LR_CODES) {
    check(track.errors[code].trim() !== "", `track.errors.${code} is empty`);
  }
  check(quote.load.loadTypes.length > 0, "no load types");
  check(quote.load.loadTypes.length === new Set(quote.load.loadTypes).size, "duplicate load type");
  check(quote.stepper.length === 3, "the stepper must have three steps");
  for (const line of quote.aside.steps) {
    check(line.trim() !== "", "an aside line is empty");
  }

  /* ——— 8. A valid payload passes every rule ——— */
  const good = validPayload();
  const goodErrors = validateQuote(good, true, todayISODate());
  const firstGood = firstInvalidField(goodErrors);
  check(
    firstGood === null,
    `a valid payload was rejected on \`${String(firstGood)}\` (${String(goodErrors[firstGood ?? "name"])})`,
  );

  /* ——— 9. And each rule still bites ——— */
  check(
    validateQuote(EMPTY_QUOTE, false, todayISODate()).service === "Required",
    "service is not required",
  );
  check(
    validateQuote(EMPTY_QUOTE, false, todayISODate()).from === "Required",
    "from is not required",
  );
  check(validateQuote(EMPTY_QUOTE, false, todayISODate()).to === "Required", "to is not required");
  check(
    validateQuote(EMPTY_QUOTE, false, todayISODate()).name === "Required",
    "name is not required",
  );
  check(
    validateQuote(EMPTY_QUOTE, false, todayISODate()).phone === "Required",
    "phone is not required",
  );
  check(
    validateQuote(EMPTY_QUOTE, false, todayISODate()).loadType === "Required",
    "load type is not required",
  );
  check(
    validateQuote(EMPTY_QUOTE, false, todayISODate()).consent === "Consent",
    "consent is not required",
  );

  check(isIndianMobile("9876543210"), "a plain ten-digit mobile was rejected");
  check(isIndianMobile("+91 98765 43210"), "+91 was not stripped");
  check(isIndianMobile("09876543210"), "a leading zero was not stripped");
  check(!isIndianMobile("5876543210"), "a number starting below 6 was accepted");
  check(!isIndianMobile("987654321"), "a nine-digit number was accepted");
  check(isEmail("desk@example.com"), "a plain address was rejected");
  check(!isEmail("desk@@example"), "an address with no TLD was accepted");

  check(readWeightKg("").kind === "empty", "an empty weight is not treated as optional");
  check(readWeightKg("1200.5").kind === "kg", "a decimal weight was rejected");
  check(readWeightKg("0").kind === "invalid", "a zero weight was accepted");
  check(readWeightKg("heavy").kind === "invalid", "a non-numeric weight was accepted");

  const past = { ...good, pickupDate: isoDaysFromToday(-1) };
  check(
    validateQuote(past, true, todayISODate()).pickupDate === "DatePast",
    "a past pickup was accepted",
  );
  check(
    validateQuote({ ...good, pickupDate: "2026-02-31" }, true, todayISODate()).pickupDate ===
      "DateInvalid",
    "a date that does not exist was accepted",
  );
  check(
    validateQuote({ ...good, pickupDate: "" }, true, todayISODate()).pickupDate === undefined,
    "an empty pickup date is not treated as optional",
  );

  check(stepOfField("service") === 1, "service does not belong to step 1");
  check(stepOfField("pickupDate") === 2, "pickup date does not belong to step 2");
  check(stepOfField("consent") === 3, "consent does not belong to step 3");

  check(validateLr("dsl-2601-4821") === null, "a hyphenated LR was rejected");
  check(validateLr("") === "LrRequired", "an empty LR was accepted");
  check(validateLr("abc") === "LrFormat", "a three-character LR was accepted");
  check(validateLr("A".repeat(21)) === "LrFormat", "a 21-character LR was accepted");

  /* ——— 10. Two files can still be read, and one trap avoided ——— */
  check(services.length > 0, "the catalogue is empty — the service question would have no options");
  const gitignore = readFileSync(new URL("../.gitignore", import.meta.url), "utf8");
  check(
    gitignore.includes("!.env.example"),
    ".gitignore ignores `.env*` without re-including `.env.example` — the endpoint documentation would never be committed",
  );

  /* ——— 11. The steps the exported HTML never contains ——— */
  /* A payload with every optional field answered, for the render checks. */
  const filled: QuotePayload = {
    ...validPayload(),
    company: "Test & Co",
    phone: "09876543210",
    email: "desk@example.com",
    service: "Express parcel",
    to: "Meerut",
    weightKg: "1200.5",
    pickupDate: todayISODate(),
    notes: "Twelve bales, covered.",
    sourcePage: "/quote/?service=express-parcel",
  };

  function noop(): void {}

  const lane = renderToStaticMarkup(<StepLane values={EMPTY_QUOTE} onChange={noop} errors={{}} />);
  check(lane.includes("Lane &amp; service"), "step 1 heading missing");
  check(lane.includes("quote-service"), "step 1 service question missing");
  check(lane.includes('role="radio"'), "step 1 radios missing");
  check(lane.includes("quote-hub-list"), "hub datalist missing");

  const laneErrors: QuoteFieldErrors = { service: "Required", from: "Required", to: "Required" };
  const laneBad = renderToStaticMarkup(
    <StepLane values={EMPTY_QUOTE} onChange={noop} errors={laneErrors} />,
  );
  check(laneBad.includes('role="alert"'), "step 1 errors are not announced");
  check(laneBad.includes('aria-invalid="true"'), "step 1 group is not marked invalid");
  check(
    laneBad.includes("This one is needed before the desk can quote."),
    "step 1 error copy missing",
  );

  const load = renderToStaticMarkup(
    <StepLoad values={filled} onChange={noop} errors={{}} today={todayISODate()} />,
  );
  check(load.includes("quote-load-type"), "step 2 load type missing");
  check(load.includes("Let DharmaShree decide"), "step 2 vehicle fallback missing");
  check(load.includes('value="1200.5"'), "step 2 weight not controlled");
  check(!load.includes("0 / 500"), "step 2 counter is wrong for a filled draft");
  check(load.includes("22 / 500"), "step 2 notes counter did not read the controlled value");
  check(load.includes(`min="${todayISODate()}"`), "step 2 date floor missing");

  const loadBad = renderToStaticMarkup(
    <StepLoad
      values={{ ...filled, weightKg: "heavy" }}
      onChange={noop}
      errors={{ weightKg: "Weight" }}
      today=""
    />,
  );
  check(loadBad.includes("Weight in kilograms"), "step 2 weight error copy missing");

  const contact = renderToStaticMarkup(
    <StepContact
      values={filled}
      onChange={noop}
      errors={{ consent: "Consent" }}
      consent={false}
      onConsentChange={noop}
    />,
  );
  check(contact.includes('name="website"'), "honeypot missing");
  check(contact.includes('tabindex="-1"'), "honeypot is in the tab order");
  const honey = /<input[^>]*name="website"[^>]*>/.exec(contact);
  check(honey !== null, "honeypot input not found");
  check(/autocomplete="off"/i.test(honey?.[0] ?? ""), "honeypot will be autofilled");
  check(contact.includes("We need your agreement"), "consent error copy missing");
  check(contact.includes('type="tel"'), "phone field is not a tel input");
  check(contact.includes('aria-invalid="true"'), "consent checkbox is not marked invalid");

  const review = renderToStaticMarkup(
    <ReviewPanel
      values={filled}
      onEdit={noop}
      onBack={noop}
      status="idle"
      failureCode={null}
      whatsappHref={null}
    />,
  );
  check(review.includes("Check the request"), "review heading missing");
  check(review.includes("Express parcel"), "review does not carry the service");
  check(review.includes("1200.5 kg"), "review does not format the weight");
  check(review.includes("+91 98765 43210"), "review does not format the phone");
  check(review.includes("Send request"), "review has no submit button");

  const reviewOptional = renderToStaticMarkup(
    <ReviewPanel
      values={EMPTY_QUOTE}
      onEdit={noop}
      onBack={noop}
      status="idle"
      failureCode={null}
      whatsappHref={null}
    />,
  );
  check(reviewOptional.includes("Let DharmaShree decide"), "the undecided vehicle is not stated");
  /* The vehicle is the only row an untouched form has: every other optional field
     drops its row rather than showing an empty value. */
  const optionalRows = (reviewOptional.match(/<dt/g) ?? []).length;
  check(
    optionalRows === 1,
    `an untouched review rendered ${String(optionalRows)} rows, expected 1 (the vehicle)`,
  );
  check(!reviewOptional.includes("Your name<"), "an unanswered field rendered an empty row");

  const reviewFailed = renderToStaticMarkup(
    <ReviewPanel
      values={filled}
      onEdit={noop}
      onBack={noop}
      status="failed"
      failureCode="Timeout"
      whatsappHref={null}
    />,
  );
  check(reviewFailed.includes("That didn&#x27;t go through. Try again."), "failure copy missing");
  check(
    !reviewFailed.includes("WhatsApp us your details"),
    "failure copy promises WhatsApp while the number is null",
  );
  check(reviewFailed.includes("did not answer in time"), "failure reason missing");
  check(reviewFailed.includes("Try again"), "retry label missing");

  const success = renderToStaticMarkup(
    <SuccessPanel reference="DSL-2601-4821" whatsappHref={null} onReset={noop} />,
  );
  check(success.includes("Request received."), "confirmation heading missing");
  check(success.includes("DSL-2601-4821"), "reference missing from the confirmation");
  check(success.includes("Save this reference"), "save notice missing");
  check(!success.includes("wa.me"), "confirmation links WhatsApp while the number is null");
  check(success.includes("Start another request"), "no way out of the confirmation");

  const aside = renderToStaticMarkup(<QuoteAside />);
  check(aside.includes("The desk"), "aside heading missing");
  /* The channel checks follow the facts: with every channel null the page must
     say so; with one published it must offer exactly that one. */
  const hasChannel = company.whatsapp !== null || company.phone !== null || company.email !== null;
  if (hasChannel) {
    check(
      company.email === null || aside.includes(`mailto:${company.email}`),
      "aside does not link the published email",
    );
    check(
      !aside.includes("appear here once"),
      "aside says the numbers are missing while one is published",
    );
  } else {
    check(
      aside.includes("Phone and WhatsApp appear here"),
      "aside does not explain the missing numbers",
    );
  }

  const panel = renderToStaticMarkup(<TrackPanel />);
  if (hasChannel) {
    check(
      panel.includes(
        company.whatsapp !== null
          ? "Continue on WhatsApp"
          : company.email !== null
            ? "Email the desk"
            : "Call the desk",
      ),
      "track panel does not offer the published channel",
    );
  } else {
    check(
      panel.includes("no way to pass a tracking number on"),
      "track panel does not state the missing channels",
    );
    check(!panel.includes("tracking-number"), "track panel offers a control with nowhere to send");
  }

  const slip = renderToStaticMarkup(<LrSlip />);
  check(slip.includes("DharmaShree Logistics"), "slip does not carry the desk's name");
  check(slip.includes("<figcaption"), "slip has no caption");
  check((slip.match(/data-draw/g) ?? []).length >= 10, "slip is not drawn");
  check(slip.includes("stroke-accent"), "the LR field is not in the accent");
  check(
    !/[0-9]{4}/.test(slip.replace(/viewBox|rx|text-\[|font-mono|[0-9.]+px/g, "")),
    "the slip contains something that looks like a real number",
  );

  /* ——— 12. The client half, against a stand-in for Apps Script ——— */
  async function againstStandIn(
    mode: "ok" | "rejected" | "html",
    run: (endpoint: string) => Promise<void>,
  ): Promise<void> {
    /* The stand-in mirrors the shape of the real deployment: a POST is answered
       with a 302 carrying the payload, and the final hop returns JSON. That is
       what `redirect: "follow"` is for, and it is the one part of the round trip
       a browser is not needed to prove. */
    const seen: { method: string; contentType: string; body: string }[] = [];
    const server = createServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on("data", (chunk: Buffer) => chunks.push(chunk));
      request.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        const path = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
        seen.push({
          method: request.method ?? "",
          contentType: request.headers["content-type"] ?? "",
          body,
        });
        if (path.endsWith("/exec")) {
          response.writeHead(302, {
            Location: `/answered?payload=${encodeURIComponent(body)}`,
          });
          response.end();
          return;
        }
        if (mode === "html") {
          /* What a deployment that is not public actually returns. */
          response.writeHead(200, { "Content-Type": "text/html" });
          response.end("<!doctype html><title>Sign in</title>");
          return;
        }
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(
          mode === "rejected"
            ? JSON.stringify({ ok: false, error: "Missing phone" })
            : JSON.stringify({ ok: true, reference: "DSL-2601-0001" }),
        );
      });
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (address === null || typeof address === "string") {
      fail("the stand-in server did not report a port");
    }
    try {
      await run(`http://127.0.0.1:${String(address.port)}/macros/s/stand-in/exec`);
    } finally {
      /* The client keeps its connection alive; without this the stand-in would
         hold the process open. */
      server.closeAllConnections();
      server.close();
    }

    const post = seen.find((entry) => entry.method === "POST");
    if (post === undefined) fail(`no POST reached the stand-in (${mode})`);
    check(
      post.contentType === "text/plain;charset=utf-8",
      `the POST arrived as "${post.contentType}" — the browser would have sent a preflight`,
    );
    const received: unknown = JSON.parse(post.body);
    if (typeof received !== "object" || received === null) {
      return fail("the stand-in received a body that is not a JSON object");
    }
    for (const field of QUOTE_FIELDS) {
      check(
        Object.prototype.hasOwnProperty.call(received, field),
        `the POST body is missing \`${field}\``,
      );
    }
  }

  await againstStandIn("ok", async (endpoint) => {
    process.env.NEXT_PUBLIC_QUOTE_ENDPOINT = endpoint;
    const result = await submitQuote(good);
    check(result.ok, "a successful submission was not reported as ok");
    if (!result.ok) return;
    check(result.reference === "DSL-2601-0001", `the reference came back as "${result.reference}"`);
  });

  await againstStandIn("rejected", async (endpoint) => {
    process.env.NEXT_PUBLIC_QUOTE_ENDPOINT = endpoint;
    const result = await submitQuote(good);
    check(!result.ok && result.error === "Rejected", "a refusal was not mapped to Rejected");
  });

  await againstStandIn("html", async (endpoint) => {
    process.env.NEXT_PUBLIC_QUOTE_ENDPOINT = endpoint;
    const result = await submitQuote(good);
    check(!result.ok && result.error === "Server", "an HTML login page was not mapped to Server");
  });

  delete process.env.NEXT_PUBLIC_QUOTE_ENDPOINT;
  const unconfigured = await submitQuote(good);
  check(
    !unconfigured.ok && unconfigured.error === "Unconfigured",
    "a missing endpoint must report Unconfigured, not throw",
  );

  /* ——— 13. The prefill: ?service=<slug>, ?to=<hub id or name>, ?from= ——— */
  const prefilled = resolveQuoteEntry(null, "?service=express-parcel&to=meerut");
  check(
    prefilled.values.service === "Express parcel",
    `?service=express-parcel prefilled "${prefilled.values.service}" instead of the service name`,
  );
  check(prefilled.values.to === "Meerut", `?to=meerut prefilled "${prefilled.values.to}"`);

  const unknownPrefill = resolveQuoteEntry(null, "?service=nope&to=");
  check(
    unknownPrefill.values.service === "" && unknownPrefill.values.to === "",
    "an unknown service slug or an empty destination was written into the form",
  );

  /* The home page's quote tab sends the lane as typed: a hub name resolves to
     the hub, a city that is not on the map stays as text, and From is free text. */
  const homeLane = resolveQuoteEntry(null, "?from=Surat&to=delhi%20ncr");
  check(
    homeLane.values.from === "Surat" && homeLane.values.to === "Delhi NCR",
    `?from=/?to= from the home tab prefilled "${homeLane.values.from}" -> "${homeLane.values.to}"`,
  );
  check(
    resolveQuoteEntry(null, "?to=Nagpur").values.to === "Nagpur",
    "a destination that is not a hub was dropped instead of kept as text",
  );
  check(
    resolveQuoteEntry(null, "?from=%20%20&to=").values.from === "",
    "a blank From or To overwrote the form",
  );
  check(
    resolveQuoteEntry(null, `?to=${"x".repeat(200)}`).values.to.length <= 60,
    "an over-long destination was written into the form unclipped",
  );

  const noPrefill = resolveQuoteEntry(null, "");
  check(
    noPrefill.values.service === "" && noPrefill.values.to === "",
    "an empty query is not an empty form",
  );

  /* ?intent=pickup seeds the notes, but never over something already typed. */
  const pickupIntent = resolveQuoteEntry(null, "?intent=pickup");
  check(
    pickupIntent.values.notes.startsWith("Pickup request"),
    "?intent=pickup did not seed the notes",
  );
  const typedNotes = resolveQuoteEntry(
    { values: { ...EMPTY_QUOTE, notes: "Twelve cartons" }, consent: false, step: 1 },
    "?intent=pickup",
  );
  check(
    typedNotes.values.notes === "Twelve cartons",
    "?intent=pickup overwrote notes the visitor had typed",
  );
  check(
    resolveQuoteEntry(null, "?intent=nope").values.notes === "",
    "an unknown intent was written into the form",
  );

  /* The click that brought the visitor here is newer than the tab's memory. */
  const draftFirst = resolveQuoteEntry(
    {
      values: { ...EMPTY_QUOTE, service: "Last mile delivery", to: "Old hub" },
      consent: true,
      step: 2,
    },
    "?service=express-parcel&to=meerut",
  );
  check(
    draftFirst.values.service === "Express parcel" && draftFirst.values.to === "Meerut",
    "the query did not win over the draft",
  );
  check(draftFirst.consent && draftFirst.step === 2, "the rest of the draft was lost");
  check(draftFirst.values.name === "", "the prefill carried a field the query did not ask for");

  console.log(
    `verify:quote OK — ${String(QUOTE_FIELDS.length)} payload fields against ${String(headers.length)} sheet columns; honeypot, required list and text/plain guarded; the client posts through a stand-in for Apps Script's redirect; the ?service=/?to=/?intent= prefill resolves slugs, hub ids and the pickup intent; ${String(QUOTE_FIELD_CODES.length)} quote codes and ${String(LR_CODES.length)} LR codes have copy; valid payload passes and every rule bites; steps 1–3, review (filled/blank/failed), confirmation, aside, track panel and slip all render`,
  );
}

/* Not a top-level `await`: this file is JSX, so it is compiled as CommonJS. */
main().catch((error: unknown) => {
  console.error("verify:quote FAILED —", error);
  process.exit(1);
});
