/* GET /api/delivery-partners — public delivery partners directory.
   200 { partners: CustomDeliveryPartner[] }
   Cached for a minute at the edge and in the browser. */

import {
  json,
  loadDeliveryPartners,
  type PagesContext,
} from "../../src/lib/desk/server";

const CACHE = { "Cache-Control": "public, max-age=60" };

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const db = context.env.DESK_DB;
  if (db === undefined) return json(200, { partners: [] }, CACHE);
  try {
    const partners = await loadDeliveryPartners(db);
    return json(200, { partners }, CACHE);
  } catch {
    return json(200, { partners: [] }, CACHE);
  }
}
