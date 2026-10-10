import { track } from "@/content/track";
import type { LrStatus } from "@/lib/backend/types";

/** The label and the plain-language meaning of a status — the same words the
    ladder on /track explains, so the result and the explainer cannot disagree.
    `null` only if a status has no entry in `track.statuses.items`. */
export interface StatusCopy {
  label: string;
  meaning: string;
  /** The one status that needs the sender to act; marked in --signal-red. */
  attention: boolean;
}

export function statusCopy(status: LrStatus): StatusCopy | null {
  const item = track.statuses.items.find((entry) => entry.key === status);
  if (item === undefined) return null;
  return {
    label: item.question,
    meaning: item.answer,
    attention: "attention" in item && item.attention,
  };
}
