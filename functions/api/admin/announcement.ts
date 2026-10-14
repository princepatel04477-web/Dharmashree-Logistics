/* GET  /api/admin/announcement  → { active, text }
   PUT  /api/admin/announcement  { active, text } → saves it; the home page shows
   it within about a minute (functions/api/announcement.ts caches for 60 s).

   400 BAD_ANNOUNCEMENT (not that shape, or longer than 200 characters) ·
   415 not JSON · 503 no database */

import {
  ANNOUNCEMENT_KEY,
  json,
  loadAnnouncement,
  readAnnouncement,
  readJsonBody,
  type PagesContext,
} from "../../../src/lib/desk/server";

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const db = context.env.DESK_DB;
  if (db === undefined) return json(503, { error: "NO_DATABASE" });
  return json(200, await loadAnnouncement(db));
}

export async function onRequestPut(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const db = env.DESK_DB;
  if (db === undefined) return json(503, { error: "NO_DATABASE" });
  /* Only the panel's own fetch sends JSON; a plain form post from elsewhere cannot. */
  if (!(request.headers.get("Content-Type") ?? "").includes("application/json")) {
    return json(415, { error: "NOT_JSON" });
  }

  const announcement = readAnnouncement(await readJsonBody(request, 4_000));
  if (announcement === null) return json(400, { error: "BAD_ANNOUNCEMENT" });

  await db
    .prepare(
      "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) " +
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
    )
    .bind(ANNOUNCEMENT_KEY, JSON.stringify(announcement), new Date().toISOString())
    .run();
  return json(200, announcement);
}
