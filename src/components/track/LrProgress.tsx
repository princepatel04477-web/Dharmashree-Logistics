import { track } from "@/content/track";
import { LR_STATUSES, type LrStatus } from "@/lib/backend/types";
import { cn } from "@/lib/utils";
import { statusCopy } from "./statusCopy";

/** The journey a consignment follows, without the one status that is a problem
    rather than a place on the route. */
const STEPS: readonly LrStatus[] = LR_STATUSES.filter((status) => status !== "attention");

interface LrProgressProps {
  /** Where on the journey the consignment is; `null` when that is not known. */
  current: LrStatus | null;
}

/* Six segments, filled up to the current step. The words are for screen readers
   (a list that marks the current step); sighted visitors read the status badge
   above it, so six labels never have to fit a 360px card. Static: it shows a
   position, it does not animate. */
export function LrProgress({ current }: LrProgressProps) {
  const currentIndex = current === null ? -1 : STEPS.indexOf(current);

  return (
    <ol aria-label={track.live.result.progressLabel} className="grid grid-cols-6 gap-1">
      {STEPS.map((step, index) => (
        <li key={step} aria-current={index === currentIndex ? "step" : undefined}>
          <span
            aria-hidden="true"
            className={cn(
              "block h-1.5 rounded-full",
              index <= currentIndex ? "bg-brand" : "bg-line",
            )}
          />
          <span className="sr-only">
            {statusCopy(step)?.label}
            {index === currentIndex ? `, ${track.live.result.progressCurrent}` : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}
