/* POST /api/admin/logout — clears the session cookie. */

import { json, sessionCookie } from "../../../src/lib/desk/server";

export function onRequestPost(): Response {
  return json(200, { ok: true }, { "Set-Cookie": sessionCookie("", 0) });
}
