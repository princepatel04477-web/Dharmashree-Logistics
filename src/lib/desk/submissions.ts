/* Reading one form's submissions from D1, for the admin list and the Excel
   export. Server-only. No path aliases. */

import type { DeskKind } from "./forms";
import type { D1Database } from "./server";

export interface StoredSubmission {
  reference: string;
  /** ISO instant, UTC. */
  receivedAt: string;
  data: Record<string, string>;
}

interface Row {
  reference: string;
  received_at: string;
  data: string;
}

function readData(raw: string): Record<string, string> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string") out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

/** Newest first. */
export async function loadSubmissions(
  db: D1Database,
  kind: DeskKind,
  limit: number,
): Promise<StoredSubmission[]> {
  const { results } = await db
    .prepare(
      "SELECT reference, received_at, data FROM submissions WHERE kind = ? ORDER BY received_at DESC, id DESC LIMIT ?",
    )
    .bind(kind, limit)
    .all<Row>();
  return results.map((row) => ({
    reference: row.reference,
    receivedAt: row.received_at,
    data: readData(row.data),
  }));
}
