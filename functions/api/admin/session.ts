/* GET /api/admin/session — 200 while signed in (the middleware answers 401
   otherwise). The admin page asks on load to choose between the login form and
   the panel. */

import { json } from "../../../src/lib/desk/server";

export function onRequestGet(): Response {
  return json(200, { ok: true });
}
