/* Which backend the tracking flow talks to, decided once, at build time.

   `output: "export"` means there is no server to read an environment variable
   from at request time: `NEXT_PUBLIC_DSL_API_BASE` is inlined into the bundle
   when `next build` runs, so the mode below is a constant of the exported site.
   Setting or changing the variable therefore needs a rebuild (on Cloudflare
   Pages: set it in the project's environment variables, then redeploy).

   Three modes:
   - "live": the variable is an https URL — the client's API, called straight
     from the browser (see docs/backend-integration.md).
   - "mock": the variable is the word `mock` AND this is not a production build.
     A local-QA stand-in (src/lib/backend/mock.ts). A production build treats
     `mock` as unset, so the simulator can never answer a real customer.
   - "off": anything else. The /track page keeps its WhatsApp / email / phone
     handoff exactly as it was before the backend existed. */

export type BackendMode = "live" | "mock" | "off";

export const BACKEND_BASE_ENV = "NEXT_PUBLIC_DSL_API_BASE" as const;

/** The https origin and path prefix, without a trailing slash; `null` unless the
    value is a usable https URL. */
function readHttpsBase(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

/** Pure, so the rules can be checked without rebuilding: `raw` is the variable,
    `nodeEnv` is `process.env.NODE_ENV`. */
export function resolveBackend(
  raw: string | undefined,
  nodeEnv: string | undefined,
): { mode: BackendMode; base: string | null } {
  const value = raw?.trim() ?? "";
  if (value === "") return { mode: "off", base: null };
  if (value === "mock") {
    return nodeEnv === "production" ? { mode: "off", base: null } : { mode: "mock", base: null };
  }
  const base = readHttpsBase(value);
  return base === null ? { mode: "off", base: null } : { mode: "live", base };
}

/* The two `process.env` reads are written out in full so the bundler can inline
   them; a computed key (`process.env[name]`) would be left as a runtime lookup
   and arrive as `undefined` in the browser. */
const resolved = resolveBackend(process.env.NEXT_PUBLIC_DSL_API_BASE, process.env.NODE_ENV);

export const backendMode: BackendMode = resolved.mode;

/** The API base for "live" mode; `null` in every other mode. */
export const apiBase: string | null = resolved.base;
