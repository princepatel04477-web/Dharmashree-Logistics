/* GET /api/announcement — the notice the client sets in the admin panel, shown
   as a bar on the home page's track card (src/components/home/AnnouncementBar.tsx).

   200 { active, text } — `active: false` (or no database) means show nothing.
   Cached for a minute at the edge and in the browser, so an edit shows up within
   about a minute without a redeploy. */

import {
  json,
  loadAnnouncement,
  NO_ANNOUNCEMENT,
  type PagesContext,
} from "../../src/lib/desk/server";

const CACHE = { "Cache-Control": "public, max-age=60" };

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const db = context.env.DESK_DB;
  if (db === undefined) return json(200, NO_ANNOUNCEMENT, CACHE);
  try {
    return json(200, await loadAnnouncement(db), CACHE);
  } catch {
    return json(200, NO_ANNOUNCEMENT, CACHE);
  }
}
