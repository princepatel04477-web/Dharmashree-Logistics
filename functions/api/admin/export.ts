/* GET /api/admin/export?kind=truck — one form's submissions as an Excel file
   (.xlsx), every row, newest first: "Received at" (India time), "Reference",
   then the form's columns (src/lib/desk/forms.ts). A link the browser follows,
   so the session cookie comes with it.

   200 the file · 400 UNKNOWN_KIND · 503 no database */

import { DESK_FORMS, DESK_SHEET_TITLES, isDeskKind, istStamp } from "../../../src/lib/desk/forms";
import { json, type PagesContext } from "../../../src/lib/desk/server";
import { loadSubmissions } from "../../../src/lib/desk/submissions";
import { buildXlsx } from "../../../src/lib/desk/xlsx";

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const kind = new URL(context.request.url).searchParams.get("kind");
  if (!isDeskKind(kind)) return json(400, { error: "UNKNOWN_KIND" });
  const db = context.env.DESK_DB;
  if (db === undefined) return json(503, { error: "NO_DATABASE" });

  const { columns } = DESK_FORMS[kind];
  const title = DESK_SHEET_TITLES[kind];
  const rows = await loadSubmissions(db, kind, 100_000);
  const file = buildXlsx({
    sheetTitle: title,
    header: ["Received at", "Reference", ...columns.map((column) => column.label)],
    rows: rows.map((row) => [
      istStamp(row.receivedAt),
      row.reference,
      ...columns.map((column) => row.data[column.key] ?? ""),
    ]),
  });

  const day = istStamp(new Date().toISOString()).slice(0, 10);
  const name = `dharmashree-${title.toLowerCase().replace(/\s+/g, "-")}-${day}.xlsx`;
  return new Response(file, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
