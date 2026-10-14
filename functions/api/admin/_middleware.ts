/* Every /api/admin/* request but the login itself needs a valid session cookie
   (src/lib/desk/server.ts). Requests from another site are refused outright;
   the cookie is SameSite=Strict as well, so they would carry no session.

   401 { error: "SIGNED_OUT" } · 403 another site · 503 ADMIN_UNCONFIGURED (the
   password or session key secret is missing) */

import {
  adminSecrets,
  isCrossSite,
  json,
  readCookie,
  SESSION_COOKIE,
  sessionIsValid,
  type PagesContext,
} from "../../../src/lib/desk/server";

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  if (isCrossSite(request)) return json(403, { error: "FORBIDDEN" });

  const secrets = adminSecrets(env);
  if (secrets === null) return json(503, { error: "ADMIN_UNCONFIGURED" });

  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  if (path === "/api/admin/login") return context.next();

  const token = readCookie(request, SESSION_COOKIE);
  if (token === null || !(await sessionIsValid(secrets.sessionKey, token, Date.now()))) {
    return json(401, { error: "SIGNED_OUT" });
  }
  return context.next();
}
