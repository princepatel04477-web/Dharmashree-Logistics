import { CheckIcon } from "lucide-react";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import type { TimelineEntry } from "@/content/types";

interface HeritageTimelineProps {
  entries: TimelineEntry[];
}

/* Vertical heritage timeline. Every entry is historical, so all nodes render
   in the completed state. */
export function HeritageTimeline({ entries }: HeritageTimelineProps) {
  return (
    <Timeline defaultValue={entries.length} orientation="vertical">
      {entries.map((entry, index) => (
        <TimelineItem key={`${entry.year}-${index}`} step={index + 1}>
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineDate>
              {entry.year}
              {entry.badge !== "" && <span className="text-muted"> · {entry.badge}</span>}
            </TimelineDate>
            {entry.tagline !== "" && <p className="label-caps">{entry.tagline}</p>}
            <TimelineTitle>{entry.title}</TimelineTitle>
            <TimelineIndicator />
          </TimelineHeader>
          <TimelineContent>
            {entry.subtitle !== "" && (
              <p className="text-muted font-mono text-xs italic">{entry.subtitle}</p>
            )}
            <p className="mt-2">{entry.description}</p>
            {entry.highlights.length > 0 && (
              <ul className="mt-3 space-y-2">
                {entry.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5">
                    <CheckIcon
                      aria-hidden="true"
                      className="text-signal mt-0.5 size-3.5 shrink-0"
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
