"use client";

import { DownloadIcon, RefreshCwIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { admin } from "@/content/admin";
import { DESK_KINDS, istStamp, type DeskColumn, type DeskKind } from "@/lib/desk/forms";
import { cn } from "@/lib/utils";

/* The admin panel (/admin), all client-side against the site's own API:

     POST /api/admin/login · POST /api/admin/logout · GET /api/admin/session
     GET  /api/admin/submissions?kind=…   the list
     GET  /api/admin/export?kind=…        the .xlsx (a plain link)
     GET/PUT /api/admin/announcement      the home page's notice

   One shared password (a Cloudflare secret); the session is an HttpOnly cookie
   this script never sees. Any 401 drops back to the sign-in form. Lists are
   searched in the browser over what was loaded (the newest 1,000); the Excel
   download always has every row. */

type Section = DeskKind | "announcement";
const SECTIONS: readonly Section[] = [...DESK_KINDS, "announcement"];

type Session = "checking" | "signed-out" | "signed-in";

const ERROR_TEXT = "text-brand font-mono text-[11px] leading-body";
const LIST_LIMIT = 1000;

/** `fetch` that never throws: the response, or null when it did not arrive. */
async function call(path: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(path, { credentials: "same-origin", cache: "no-store", ...init });
  } catch {
    return null;
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/* ——— Sign in ——— */

type LoginError = keyof typeof admin.login.errors;

function LoginForm({ onSignedIn }: { onSignedIn: () => void }): ReactElement {
  const id = useId();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy) return;
    if (password === "") {
      setError("Required");
      return;
    }
    setBusy(true);
    setError(null);
    const response = await call("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (response === null) return setError("Network");
    if (response.ok) {
      setPassword("");
      onSignedIn();
      return;
    }
    if (response.status === 401) return setError("WrongPassword");
    if (response.status === 429) return setError("Locked");
    if (response.status === 503) return setError("Unconfigured");
    setError("Network");
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      noValidate
      className="border-line bg-paper flex max-w-md flex-col gap-5 rounded-xs border p-6 sm:p-8"
    >
      <p className="text-ink-2 leading-body text-sm font-light">{admin.login.lede}</p>
      <div className="space-y-2">
        <Label htmlFor={`${id}-password`}>{admin.login.passwordLabel}</Label>
        <Input
          id={`${id}-password`}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError(null);
          }}
          aria-invalid={error !== null || undefined}
          aria-describedby={error !== null ? `${id}-error` : undefined}
        />
        {error !== null && (
          <p id={`${id}-error`} role="alert" className={ERROR_TEXT}>
            {admin.login.errors[error]}
          </p>
        )}
      </div>
      <Button
        type="submit"
        aria-disabled={busy}
        className="self-start aria-disabled:pointer-events-none aria-disabled:opacity-50"
      >
        {busy ? admin.login.submitting : admin.login.submit}
      </Button>
    </form>
  );
}

/* ——— A form's submissions ——— */

interface Row {
  reference: string;
  receivedAt: string;
  data: Record<string, string>;
}

function readList(value: unknown): { columns: DeskColumn[]; rows: Row[] } | null {
  if (!isRecord(value) || !Array.isArray(value["columns"]) || !Array.isArray(value["rows"])) {
    return null;
  }
  const columns: DeskColumn[] = [];
  for (const column of value["columns"] as unknown[]) {
    if (
      isRecord(column) &&
      typeof column["key"] === "string" &&
      typeof column["label"] === "string"
    ) {
      columns.push({ key: column["key"], label: column["label"] });
    }
  }
  const rows: Row[] = [];
  for (const row of value["rows"] as unknown[]) {
    if (!isRecord(row) || typeof row["reference"] !== "string") continue;
    if (typeof row["receivedAt"] !== "string" || !isRecord(row["data"])) continue;
    const data: Record<string, string> = {};
    for (const [key, cell] of Object.entries(row["data"])) {
      if (typeof cell === "string") data[key] = cell;
    }
    rows.push({ reference: row["reference"], receivedAt: row["receivedAt"], data });
  }
  return { columns, rows };
}

function SubmissionList({
  kind,
  onSignedOut,
}: {
  kind: DeskKind;
  onSignedOut: () => void;
}): ReactElement {
  const filterId = useId();
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "failed" }
    | { status: "ready"; columns: DeskColumn[]; rows: Row[] }
  >({ status: "loading" });
  const [filter, setFilter] = useState("");

  const load = useCallback(async (): Promise<void> => {
    setState({ status: "loading" });
    const response = await call(`/api/admin/submissions?kind=${kind}`);
    if (response?.status === 401) return onSignedOut();
    const list = response?.ok === true ? readList(await readJson(response)) : null;
    setState(list === null ? { status: "failed" } : { status: "ready", ...list });
  }, [kind, onSignedOut]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const shown = useMemo(() => {
    if (state.status !== "ready") return [];
    const words = filter
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word !== "");
    if (words.length === 0) return state.rows;
    return state.rows.filter((row) => {
      const haystack = [row.reference, ...Object.values(row.data)].join(" ").toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  }, [state, filter]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-60 flex-1 space-y-2">
          <Label htmlFor={filterId}>{admin.list.filterLabel}</Label>
          <Input
            id={filterId}
            type="search"
            value={filter}
            placeholder={admin.list.filterPlaceholder}
            onChange={(event) => {
              setFilter(event.target.value);
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void load();
          }}
        >
          <RefreshCwIcon aria-hidden="true" />
          {admin.list.refresh}
        </Button>
        {/* A plain link: the browser downloads the file with the session cookie. */}
        <Button asChild variant="outline">
          <a href={`/api/admin/export?kind=${kind}`} download>
            <DownloadIcon aria-hidden="true" />
            {admin.list.download}
          </a>
        </Button>
      </div>

      {state.status === "loading" && (
        <p className="text-muted text-sm font-light" role="status">
          {admin.list.loading}
        </p>
      )}
      {state.status === "failed" && (
        <p role="alert" className={ERROR_TEXT}>
          {admin.list.failed}
        </p>
      )}
      {state.status === "ready" && (
        <>
          <p className="text-muted font-mono text-[11px] tracking-[0.14em] uppercase" role="status">
            {admin.list.count(shown.length, state.rows.length)}
          </p>
          {state.rows.length >= LIST_LIMIT && (
            <p className="text-ink-2 text-sm font-light">{admin.list.capped}</p>
          )}
          {state.rows.length === 0 ? (
            <p className="text-ink-2 text-sm font-light">{admin.list.empty}</p>
          ) : shown.length === 0 ? (
            <p className="text-ink-2 text-sm font-light">{admin.list.noMatch}</p>
          ) : (
            <div className="border-line overflow-x-auto rounded-xs border" tabIndex={0}>
              <table className="w-max min-w-full border-collapse text-left text-sm">
                <thead className="bg-paper-2">
                  <tr>
                    {[
                      admin.list.receivedAt,
                      admin.list.reference,
                      ...state.columns.map((c) => c.label),
                    ].map((label) => (
                      <th
                        key={label}
                        scope="col"
                        className="border-line text-ink-2 border-b px-3 py-2 font-mono text-[10px] font-normal tracking-[0.12em] whitespace-nowrap uppercase"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((row) => (
                    <tr key={row.reference} className="border-line border-b last:border-b-0">
                      <td className="text-ink-2 px-3 py-2 align-top whitespace-nowrap">
                        {istStamp(row.receivedAt)}
                      </td>
                      <th
                        scope="row"
                        className="text-ink px-3 py-2 align-top font-mono text-xs whitespace-nowrap"
                      >
                        {row.reference}
                      </th>
                      {state.columns.map((column) => (
                        <td
                          key={column.key}
                          className="text-ink max-w-80 px-3 py-2 align-top break-words"
                        >
                          {row.data[column.key] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ——— The announcement ——— */

const ANNOUNCEMENT_MAX = 200;

function AnnouncementEditor({ onSignedOut }: { onSignedOut: () => void }): ReactElement {
  const id = useId();
  const [text, setText] = useState("");
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<
    "loading" | "load-failed" | "idle" | "saving" | "saved" | "failed"
  >("loading");

  useEffect(() => {
    void (async () => {
      const response = await call("/api/admin/announcement");
      if (response?.status === 401) return onSignedOut();
      const body = response?.ok === true ? await readJson(response) : null;
      if (
        isRecord(body) &&
        typeof body["text"] === "string" &&
        typeof body["active"] === "boolean"
      ) {
        setText(body["text"]);
        setActive(body["active"]);
        setStatus("idle");
      } else {
        setStatus("load-failed");
      }
    })();
  }, [onSignedOut]);

  const tooLong = text.trim().length > ANNOUNCEMENT_MAX;
  const preview = active && text.trim() !== "" ? text.replace(/\s+/g, " ").trim() : null;

  async function handleSave(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (status === "saving" || tooLong) return;
    setStatus("saving");
    const response = await call("/api/admin/announcement", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active, text }),
    });
    if (response?.status === 401) return onSignedOut();
    setStatus(response?.ok === true ? "saved" : "failed");
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSave(event);
      }}
      noValidate
      className="flex max-w-2xl flex-col gap-5"
    >
      <p className="text-ink-2 leading-body text-sm font-light">{admin.announcement.lede}</p>
      {status === "load-failed" && (
        <p role="alert" className={ERROR_TEXT}>
          {admin.announcement.loadFailed}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor={`${id}-text`}>{admin.announcement.textLabel}</Label>
        <Textarea
          id={`${id}-text`}
          value={text}
          rows={3}
          disabled={status === "loading"}
          onChange={(event) => {
            setText(event.target.value);
            if (status === "saved" || status === "failed") setStatus("idle");
          }}
          aria-invalid={tooLong || undefined}
          aria-describedby={`${id}-helper`}
        />
        <p id={`${id}-helper`} className={tooLong ? ERROR_TEXT : "text-muted text-xs font-light"}>
          {tooLong
            ? admin.announcement.tooLong
            : admin.announcement.textHelper(ANNOUNCEMENT_MAX - text.trim().length)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox
          id={`${id}-active`}
          checked={active}
          disabled={status === "loading"}
          onCheckedChange={(checked) => {
            setActive(checked === true);
            if (status === "saved" || status === "failed") setStatus("idle");
          }}
        />
        <Label htmlFor={`${id}-active`}>{admin.announcement.activeLabel}</Label>
      </div>

      <div className="flex flex-col gap-2">
        <p className="label-caps">{admin.announcement.previewLabel}</p>
        {preview === null ? (
          <p className="text-muted text-sm font-light">{admin.announcement.previewEmpty}</p>
        ) : (
          <p className="bg-brand-tint border-line text-ink leading-body flex items-start gap-3 rounded-xs border px-5 py-3 text-sm">
            <span
              aria-hidden="true"
              className="bg-signal-red mt-[0.45em] inline-block size-2 shrink-0 rounded-full"
            />
            <span>{preview}</span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          aria-disabled={status === "saving" || status === "loading" || tooLong}
          className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          {status === "saving" ? admin.announcement.saving : admin.announcement.save}
        </Button>
        {status === "saved" && (
          <p role="status" className="text-ink-2 text-sm font-light">
            {admin.announcement.saved}
          </p>
        )}
        {status === "failed" && (
          <p role="alert" className={ERROR_TEXT}>
            {admin.announcement.failed}
          </p>
        )}
      </div>
    </form>
  );
}

/* ——— The panel ——— */

export function AdminPanel(): ReactElement {
  const baseId = useId();
  const [session, setSession] = useState<Session>("checking");
  const [section, setSection] = useState<Section>("truck");

  const signedOut = useCallback((): void => {
    setSession("signed-out");
  }, []);

  useEffect(() => {
    void (async () => {
      const response = await call("/api/admin/session");
      setSession(response?.ok === true ? "signed-in" : "signed-out");
    })();
  }, []);

  async function signOut(): Promise<void> {
    await call("/api/admin/logout", { method: "POST" });
    setSession("signed-out");
  }

  if (session === "checking") {
    return (
      <p className="text-muted text-sm font-light" role="status">
        {admin.checking}
      </p>
    );
  }
  if (session === "signed-out") {
    return (
      <LoginForm
        onSignedIn={() => {
          setSession("signed-in");
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="border-line flex flex-wrap items-end justify-between gap-4 border-b">
        <div role="tablist" aria-label={admin.tabsLabel} className="flex flex-wrap gap-x-6">
          {SECTIONS.map((id) => {
            const selected = section === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                onClick={() => {
                  setSection(id);
                }}
                className={cn(
                  "-mb-px min-h-11 border-b-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors",
                  selected
                    ? "border-brand text-brand"
                    : "text-ink/70 hover:text-ink border-transparent",
                )}
              >
                {admin.tabs[id]}
              </button>
            );
          })}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-1"
          onClick={() => {
            void signOut();
          }}
        >
          {admin.signOut}
        </Button>
      </div>

      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${section}`}>
        {section === "announcement" ? (
          <AnnouncementEditor onSignedOut={signedOut} />
        ) : (
          <SubmissionList key={section} kind={section} onSignedOut={signedOut} />
        )}
      </div>
    </div>
  );
}
