/* What the desk's Pages Functions (functions/api/desk.ts, announcement.ts and
   admin/**) share: the D1 binding's shape, the JSON reply, a per-address limit,
   and the admin session.

   Server-only. No path aliases: the Pages Function bundler reads it on its own. */

/* ——— D1, as much of it as these functions use ——— */

export interface D1Result<T> {
  results: T[];
}

export interface D1PreparedStatement {
  bind(...values: (string | number | null)[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

/* Cloudflare Pages › Settings › Variables and Secrets (encrypted):
     DSL_ADMIN_PASSWORD      the admin panel's password
     DSL_ADMIN_SESSION_KEY   32+ random characters that sign the session cookie
   and the D1 binding `DESK_DB` (wrangler.toml). */
export interface DeskEnv {
  DESK_DB?: D1Database;
  DSL_ADMIN_PASSWORD?: string;
  DSL_ADMIN_SESSION_KEY?: string;
}

export interface PagesContext {
  request: Request;
  env: DeskEnv;
  next: () => Promise<Response>;
}

/* ——— Replies ——— */

export function json(
  status: number,
  body: unknown,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

/** Browsers mark a request sent from another site; the site's own pages are
    same-origin. */
export function isCrossSite(request: Request): boolean {
  return request.headers.get("Sec-Fetch-Site") === "cross-site";
}

export function clientAddress(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

/** The body as JSON whatever its content type (the forms send `text/plain`),
    or null. */
export async function readJsonBody(request: Request, maxBytes = 32_000): Promise<unknown> {
  const text = await request.text();
  if (text.length > maxBytes) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/* ——— Limits (per Cloudflare isolate, best effort) ——— */

export class WindowLimiter {
  private readonly events = new Map<string, number[]>();

  constructor(
    private readonly windowMs: number,
    private readonly max: number,
  ) {}

  private recent(key: string, now: number): number[] {
    return (this.events.get(key) ?? []).filter((at) => now - at < this.windowMs);
  }

  isSpent(key: string, now: number): boolean {
    return this.recent(key, now).length >= this.max;
  }

  record(key: string, now: number): void {
    const recent = this.recent(key, now);
    recent.push(now);
    this.events.set(key, recent);
    if (this.events.size > 5000) this.events.clear();
  }
}

/* ——— Admin session ———
   A cookie holding `base64url({"exp":ms}) . base64url(HMAC-SHA-256)`, keyed with
   DSL_ADMIN_SESSION_KEY. HttpOnly, Secure, SameSite=Strict and scoped to
   /api/admin, so page scripts never see it and no other site can send it. */

export const SESSION_COOKIE = "dsl_admin";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MIN_KEY_LENGTH = 32;
const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) return null;
  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** The password and session key, or null when the admin panel is not set up. */
export function adminSecrets(env: DeskEnv): { password: string; sessionKey: string } | null {
  const password = env.DSL_ADMIN_PASSWORD ?? "";
  const sessionKey = env.DSL_ADMIN_SESSION_KEY?.trim() ?? "";
  if (password === "" || sessionKey.length < MIN_KEY_LENGTH) return null;
  return { password, sessionKey };
}

/** True when `typed` is the password — compared as HMACs, in constant time. */
export async function passwordMatches(
  sessionKey: string,
  password: string,
  typed: string,
): Promise<boolean> {
  const key = await hmacKey(sessionKey);
  const expected = await crypto.subtle.sign("HMAC", key, encoder.encode(`pw:${password}`));
  return crypto.subtle.verify("HMAC", key, expected, encoder.encode(`pw:${typed}`));
}

export async function issueSession(sessionKey: string, now: number): Promise<string> {
  const payload = toBase64Url(encoder.encode(JSON.stringify({ exp: now + SESSION_TTL_MS })));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(sessionKey),
    encoder.encode(`session:${payload}`),
  );
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function sessionIsValid(
  sessionKey: string,
  token: string,
  now: number,
): Promise<boolean> {
  const [payload, signatureText, extra] = token.split(".");
  if (payload === undefined || signatureText === undefined || extra !== undefined) return false;
  const signature = fromBase64Url(signatureText);
  if (signature === null) return false;
  const genuine = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(sessionKey),
    signature,
    encoder.encode(`session:${payload}`),
  );
  if (!genuine) return false;
  const bytes = fromBase64Url(payload);
  if (bytes === null) return false;
  try {
    const claims = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    if (typeof claims !== "object" || claims === null) return false;
    const exp = (claims as Record<string, unknown>)["exp"];
    return typeof exp === "number" && now < exp;
  } catch {
    return false;
  }
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie");
  if (header === null) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export function sessionCookie(token: string, maxAgeSec: number): string {
  return `${SESSION_COOKIE}=${token}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${String(maxAgeSec)}`;
}

/* ——— The announcement ——— */

export const ANNOUNCEMENT_KEY = "announcement";
export const ANNOUNCEMENT_MAX_LENGTH = 200;

export interface Announcement {
  active: boolean;
  text: string;
}

export const NO_ANNOUNCEMENT: Announcement = { active: false, text: "" };

/** A stored or posted value → an announcement, or null when it is not one. */
export function readAnnouncement(value: unknown): Announcement | null {
  if (typeof value !== "object" || value === null) return null;
  const { active, text } = value as Record<string, unknown>;
  if (typeof active !== "boolean" || typeof text !== "string") return null;
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length > ANNOUNCEMENT_MAX_LENGTH) return null;
  return { active: active && trimmed !== "", text: trimmed };
}

export async function loadAnnouncement(db: D1Database): Promise<Announcement> {
  const row = await db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .bind(ANNOUNCEMENT_KEY)
    .first<{ value: string }>();
  if (row === null) return NO_ANNOUNCEMENT;
  try {
    return readAnnouncement(JSON.parse(row.value) as unknown) ?? NO_ANNOUNCEMENT;
  } catch {
    return NO_ANNOUNCEMENT;
  }
}
