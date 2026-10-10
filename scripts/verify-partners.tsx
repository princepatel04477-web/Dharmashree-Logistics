/* Unit check for the profile-driven pages (Prompts 09, 12, 13): the partner
   directory against the hub list and the phone grammar, the partner form against
   the Apps Script that receives it, and the support topics against the FAQ they
   filter. Run with `npm run verify:partners`. */

import { readFileSync } from "node:fs";
import { projectPoint } from "../src/components/map/projection";
import { faqs } from "../src/content/faq";
import { HUBS } from "../src/content/hubs";
import { partners, partnersPage } from "../src/content/partners";
import { supportFaqs, supportTopics } from "../src/content/support";
import {
  EMPTY_PARTNER,
  REQUIRED_PARTNER_FIELDS,
  firstInvalidPartnerField,
  submitPartner,
  validatePartner,
} from "../src/lib/partner";

const codeGs = readFileSync(new URL("../apps-script/Code.gs", import.meta.url), "utf8");

const PHONE = /^\+91[6-9]\d{9}$/;
/** Largest gap, in map units, between a hub's pin and the partner city's own
    projected coordinates. The hubs were placed from the same projection. */
const PIN_TOLERANCE = 14;

function fail(message: string): never {
  console.error(`verify:partners FAILED — ${message}`);
  process.exit(1);
}

function check(condition: boolean, message: string): void {
  if (!condition) fail(message);
}

async function main(): Promise<void> {
  /* ——— Directory ——— */
  check(partners.length > 0, "the partner directory is empty");
  check(new Set(partners.map((p) => p.id)).size === partners.length, "duplicate partner id");
  for (const partner of partners) {
    check(partner.name.trim() !== "", `${partner.id}: empty name`);
    check(partner.addressLines.length > 0, `${partner.id}: no address`);
    for (const phone of partner.phones) {
      check(PHONE.test(phone), `${partner.id}: "${phone}" is not +91 and ten digits`);
    }
    check(
      new Set(partner.phones).size === partner.phones.length,
      `${partner.id}: a phone is listed twice`,
    );
    const [lat, lng] = partner.latLng;
    check(lat > 6 && lat < 38 && lng > 67 && lng < 98, `${partner.id}: latLng is outside India`);
    if (partner.hubId !== null) {
      const hub = HUBS.find((candidate) => candidate.id === partner.hubId);
      if (hub === undefined) fail(`${partner.id}: hub "${partner.hubId}" is not in hubs.ts`);
      const point = projectPoint(lat, lng);
      const gap = Math.hypot(point.x - hub.x, point.y - hub.y);
      check(
        gap <= PIN_TOLERANCE,
        `${partner.id}: ${partner.city} projects ${gap.toFixed(1)} units from hub ${hub.name}`,
      );
    }
  }

  /* ——— Partner form ↔ Apps Script ——— */
  const requiredMatch = /const partnerRequired = \[([^\]]*)\]/.exec(codeGs);
  if (requiredMatch === null || requiredMatch[1] === undefined) {
    fail("could not read `partnerRequired` out of apps-script/Code.gs");
  }
  const requiredInScript = requiredMatch[1]
    .split(",")
    .map((name) => name.trim().replace(/^'|'$/g, ""))
    .filter((name) => name !== "");
  for (const field of requiredInScript) {
    check(
      REQUIRED_PARTNER_FIELDS.some((candidate) => candidate === field),
      `Code.gs requires \`${field}\` but the client does not`,
    );
  }
  check(
    requiredInScript.length === REQUIRED_PARTNER_FIELDS.length,
    "required lists differ in size",
  );
  check(/body\.kind === 'partner'/.test(codeGs), "Code.gs no longer routes kind === 'partner'");
  check(EMPTY_PARTNER.kind === "partner", "EMPTY_PARTNER is not kind: partner");

  const headersMatch = /const PARTNER_HEADERS = \[([^\]]*)\]/.exec(codeGs);
  if (headersMatch === null || headersMatch[1] === undefined) {
    fail("could not read PARTNER_HEADERS out of apps-script/Code.gs");
  }
  const headerCount = headersMatch[1].split(",").filter((cell) => cell.trim() !== "").length;
  /* Two columns the script writes (time, reference), then one per sent field
     except the kind, the consent (never sent) and the honeypot. */
  const sentFields = Object.keys(EMPTY_PARTNER).filter(
    (field) => field !== "kind" && field !== "website",
  );
  check(
    headerCount === 2 + sentFields.length,
    `${String(headerCount)} partner columns vs ${String(2 + sentFields.length)} expected`,
  );

  const blank = validatePartner(EMPTY_PARTNER, false);
  check(
    Object.keys(blank).length === 5 && firstInvalidPartnerField(blank) === "name",
    "an empty application should fail all five rules, name first",
  );
  const good = validatePartner(
    {
      ...EMPTY_PARTNER,
      name: "Asha",
      phone: "98765 43210",
      city: "Lucknow",
      availability: "Flexible hours",
    },
    true,
  );
  check(Object.keys(good).length === 0, "a valid application was rejected");
  check(
    validatePartner(
      { ...EMPTY_PARTNER, name: "A", phone: "12345", city: "x", availability: "y" },
      true,
    ).phone === "Phone",
    "a bad mobile number was accepted",
  );
  for (const code of ["Required", "Phone", "Consent"] as const) {
    check(partnersPage.join.errors[code].trim() !== "", `join.errors.${code} is empty`);
  }

  /* ——— Support ——— */
  const topicIds = new Set<string>(supportTopics.map((topic) => topic.id));
  for (const entry of supportFaqs) {
    check(topicIds.has(entry.topic), `"${entry.question}" has unknown topic ${entry.topic}`);
  }
  for (const topic of supportTopics) {
    check(
      supportFaqs.some((entry) => entry.topic === topic.id),
      `topic "${topic.label}" filters to nothing`,
    );
  }
  check(supportFaqs.length >= faqs.length + 5, "the profile's five questions are not all present");
  check(
    new Set(supportFaqs.map((entry) => entry.question)).size === supportFaqs.length,
    "a support question appears twice",
  );

  /* ——— The post: same transport as the quote form, tagged for its own tab ——— */
  const realFetch = globalThis.fetch;
  let seenBody = "";
  let seenType = "";
  globalThis.fetch = ((_input: unknown, init?: RequestInit) => {
    seenBody = typeof init?.body === "string" ? init.body : "";
    seenType = new Headers(init?.headers).get("Content-Type") ?? "";
    return Promise.resolve(
      new Response(JSON.stringify({ ok: true, reference: "DSP-261008-1234" }), { status: 200 }),
    );
  }) as typeof fetch;
  process.env.NEXT_PUBLIC_QUOTE_ENDPOINT = "https://script.example/exec";
  try {
    const sent = await submitPartner({
      ...EMPTY_PARTNER,
      name: "Asha",
      phone: "9876543210",
      city: "Lucknow",
      availability: "Flexible hours",
    });
    check(
      sent.ok && sent.reference === "DSP-261008-1234",
      "submitPartner did not return the reference",
    );
    check(
      seenType === "text/plain;charset=utf-8",
      "the partner post must be text/plain (CORS-simple)",
    );
    check(seenBody.includes('"kind":"partner"'), "the partner post is not tagged kind: partner");
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.NEXT_PUBLIC_QUOTE_ENDPOINT;
  }

  console.log(
    `verify:partners OK — ${String(partners.length)} partners (phones +91, hubs and pins consistent), partner form ↔ Code.gs and its text/plain post, ${String(supportFaqs.length)} support questions across ${String(supportTopics.length)} topics`,
  );
}

main().catch((error: unknown) => {
  console.error("verify:partners FAILED —", error);
  process.exit(1);
});
