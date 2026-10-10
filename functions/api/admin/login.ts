/* POST /api/admin/login  { "password": "…" } → sets the session cookie.

   Five wrong passwords from one address lock it out for 15 minutes (per
   Cloudflare isolate, best effort).

   200 { ok: true } · 400 BAD_REQUEST · 401 WRONG_PASSWORD · 405 · 429 LOCKED */

import {
  adminSecrets,
  clientAddress,
  issueSession,
  json,
  passwordMatches,
  readJsonBody,
  SESSION_TTL_MS,
  sessionCookie,
  WindowLimiter,
  type PagesContext,
} from "../../../src/lib/desk/server";

const failures = new WindowLimiter(15 * 60 * 1000, 5);

export function onRequestGet(): Response {
  return json(405, { error: "METHOD_NOT_ALLOWED" });
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const secrets = adminSecrets(env);
  if (secrets === null) return json(503, { error: "ADMIN_UNCONFIGURED" });

  const address = clientAddress(request);
  const now = Date.now();
  if (failures.isSpent(address, now)) return json(429, { error: "LOCKED" });

  const body = await readJsonBody(request, 2_000);
  const typed =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)["password"]
      : null;
  if (typeof typed !== "string" || typed.length > 200) return json(400, { error: "BAD_REQUEST" });

  if (!(await passwordMatches(secrets.sessionKey, secrets.password, typed))) {
    failures.record(address, now);
    return json(401, { error: "WRONG_PASSWORD" });
  }

  const token = await issueSession(secrets.sessionKey, now);
  return json(200, { ok: true }, { "Set-Cookie": sessionCookie(token, SESSION_TTL_MS / 1000) });
}
