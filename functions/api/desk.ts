/* POST /api/desk — every form the site sends to the desk: the quote request,
   the delivery-partner and truck attachment applications, and the "Send us a
   message" box (`kind`: quote / partner / truck / message; none means quote).

   It stores one row in the D1 database (`DESK_DB`, migrations/0001_desk.sql)
   and answers `{ ok: true, reference }` — the same reply the Google Apps Script
   gave, so `postToDesk` (src/lib/quote.ts) reads it unchanged. What each form
   keeps and requires is src/lib/desk/forms.ts. The admin panel (/admin) lists
   the rows and exports them to Excel.

   The forms post `text/plain` JSON (a habit from Apps Script); the body is read
   as JSON whatever its type. A filled honeypot gets a normal-looking answer and
   nothing is stored.

   200 { ok, reference } · 200 { ok: false, error } a refused form (a required
   field missing — the client's own checks did not run) · 403 another site ·
   405 not a POST · 429 too many from one address · 503 no database bound */

import { deskReference, readDeskBody } from "../../src/lib/desk/forms";
import {
  clientAddress,
  isCrossSite,
  json,
  readJsonBody,
  WindowLimiter,
  type PagesContext,
} from "../../src/lib/desk/server";

/* A person sends a handful of forms; a script sends hundreds. */
const submissions = new WindowLimiter(10 * 60 * 1000, 12);

export function onRequestGet(): Response {
  return json(405, { ok: false, error: "Method not allowed" });
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  if (isCrossSite(request)) return json(403, { ok: false, error: "Forbidden" });

  const address = clientAddress(request);
  const now = Date.now();
  if (submissions.isSpent(address, now)) return json(429, { ok: false, error: "Too many" });

  const reading = readDeskBody(await readJsonBody(request));
  if (!reading.ok) return json(200, { ok: false, error: reading.error });
  submissions.record(address, now);

  if ("bot" in reading) {
    return json(200, {
      ok: true,
      reference: deskReference(reading.kind, new Date(now), Math.random()),
    });
  }

  const db = env.DESK_DB;
  if (db === undefined) return json(503, { ok: false, error: "Not connected" });

  const receivedAt = new Date(now).toISOString();
  const data = JSON.stringify(reading.data);
  /* The reference is unique in the table; a clash (1 in 9,000 on the same day)
     draws again. */
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const reference = deskReference(reading.kind, new Date(now), Math.random());
    try {
      await db
        .prepare("INSERT INTO submissions (kind, reference, received_at, data) VALUES (?, ?, ?, ?)")
        .bind(reading.kind, reference, receivedAt, data)
        .run();
      return json(200, { ok: true, reference });
    } catch (error) {
      if (!(error instanceof Error) || !/UNIQUE/i.test(error.message)) {
        return json(500, { ok: false, error: "Server error" });
      }
    }
  }
  return json(500, { ok: false, error: "Server error" });
}
