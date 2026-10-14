/* GET /api/admin/submissions?kind=truck — one form's submissions, newest
   first, at most 1,000, each { reference, receivedAt, data } with `data`
   holding only that form's columns (src/lib/desk/forms.ts).

   200 { kind, columns, rows } · 400 UNKNOWN_KIND · 503 no database */

import { DESK_FORMS, isDeskKind } from "../../../src/lib/desk/forms";
import { json, type PagesContext } from "../../../src/lib/desk/server";
import { loadSubmissions } from "../../../src/lib/desk/submissions";

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const kind = new URL(context.request.url).searchParams.get("kind");
  if (!isDeskKind(kind)) return json(400, { error: "UNKNOWN_KIND" });
  const db = context.env.DESK_DB;
  if (db === undefined) return json(503, { error: "NO_DATABASE" });

  const rows = await loadSubmissions(db, kind, 1000);
  return json(200, { kind, columns: DESK_FORMS[kind].columns, rows });
}
