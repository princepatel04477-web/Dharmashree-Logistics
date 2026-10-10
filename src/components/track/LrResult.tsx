"use client";

import { ArrowRightIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
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
import { Button } from "@/components/ui/button";
import { track } from "@/content/track";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import type { LrRecord, LrStatus } from "@/lib/backend/types";
import { formatDateIN, formatDateTimeIN, formatNumberIN } from "@/lib/format";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";
import { LrProgress } from "./LrProgress";
import { statusCopy } from "./statusCopy";

/* Where on the journey a consignment is. "Requires attention" is a problem, not
   a place, so the position comes from the newest movement that was one. */
function progressStatus(record: LrRecord): LrStatus | null {
  if (record.status !== "attention") return record.status;
  return record.events.find((event) => event.status !== "attention")?.status ?? null;
}

/** How many movements the history shows before the rest are folded away. */
const VISIBLE_EVENTS = 3;

interface FactProps {
  label: string;
  className?: string;
  children: ReactNode;
}

function Fact({ label, className, children }: FactProps): ReactElement {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <dt className="label-caps">{label}</dt>
      <dd className="text-ink text-sm font-light">{children}</dd>
    </div>
  );
}

interface LrResultProps {
  record: LrRecord;
  onReset: () => void;
}

/* The verified LR: a summary card, then its movements as a timeline. Motion owns
   the entrance (a short fade; none under reduced motion) and the heading takes
   focus on arrival, so a keyboard or screen-reader visitor lands on the result
   instead of on the button that has just left the page. */
export function LrResult({ record, onReset }: LrResultProps): ReactElement {
  const reduced = useReducedMotionSafe();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const copy = statusCopy(record.status);
  const delivered = record.status === "delivered";
  const eventCount = record.events.length;
  const shownEvents = expanded ? record.events : record.events.slice(0, VISIBLE_EVENTS);
  const foldable = eventCount > VISIBLE_EVENTS;
  const historyId = useId();

  return (
    <motion.section
      aria-labelledby={headingId}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced ? { duration: 0 } : { duration: MOTION_DURATIONS.sm, ease: MOTION_EASES.out }
      }
      className="flex flex-col gap-6"
    >
      <header className="flex flex-col gap-3">
        <p className="label-caps">{track.live.result.lrLabel}</p>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-ink text-step-3 leading-headline tracking-display break-all outline-none"
        >
          {record.lrNumber}
        </h2>
        {copy !== null && (
          <>
            <p className="bg-brand-tint text-brand-deep inline-flex items-center gap-2 self-start rounded-xs px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase">
              <span
                aria-hidden="true"
                className={cn("size-2 rounded-full", copy.attention ? "bg-signal-red" : "bg-brand")}
              />
              <span className="sr-only">{track.live.result.statusLabel}: </span>
              {copy.label}
            </p>
            <p className="text-ink-2 max-w-measure leading-body text-xs font-light">
              {copy.meaning}
            </p>
          </>
        )}
      </header>

      <LrProgress current={progressStatus(record)} />

      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Fact label={track.live.result.routeLabel} className="sm:col-span-2">
          <span className="inline-flex flex-wrap items-center gap-x-2">
            {record.origin}
            <ArrowRightIcon aria-hidden="true" className="text-brand size-4 shrink-0" />
            <span className="sr-only">{track.live.result.routeTo}</span>
            {record.destination}
          </span>
        </Fact>
        {record.consignor !== "" && (
          <Fact label={track.live.result.consignorLabel}>{record.consignor}</Fact>
        )}
        {record.consignee !== "" && (
          <Fact label={track.live.result.consigneeLabel}>{record.consignee}</Fact>
        )}
        {record.packages !== null && (
          <Fact label={track.live.result.packagesLabel}>{formatNumberIN(record.packages)}</Fact>
        )}
        {record.weightKg !== null && (
          <Fact label={track.live.result.weightLabel}>
            {track.live.result.weightValue(formatNumberIN(record.weightKg))}
          </Fact>
        )}
        <Fact label={track.live.result.bookedLabel}>{formatDateIN(record.bookedOn)}</Fact>
        {delivered && record.deliveredOn !== null ? (
          <Fact label={track.live.result.deliveredLabel}>{formatDateIN(record.deliveredOn)}</Fact>
        ) : (
          record.expectedDelivery !== null && (
            <Fact label={track.live.result.expectedLabel}>
              {formatDateIN(record.expectedDelivery)}
            </Fact>
          )
        )}
        {!delivered && record.currentLocation !== null && (
          <Fact label={track.live.result.locationLabel}>{record.currentLocation}</Fact>
        )}
      </dl>

      <div className="border-line flex flex-col gap-4 border-t pt-6">
        <h3 className="label-caps">{track.live.result.historyTitle}</h3>
        {eventCount === 0 ? (
          <p className="text-ink-2 max-w-measure leading-body text-xs font-light">
            {track.live.result.noEvents}
          </p>
        ) : (
          /* Newest first. Every step counts as reached, so the whole rail is
             drawn; the newest movement's dot is filled to mark "now". */
          <>
            <Timeline value={shownEvents.length} id={historyId}>
              {shownEvents.map((event, index) => {
                const eventCopy = statusCopy(event.status);
                const detail = [event.location, event.note ?? ""].filter((part) => part !== "");
                return (
                  <TimelineItem
                    key={`${event.at}-${String(index)}`}
                    step={index + 1}
                    className="group-data-[orientation=vertical]/timeline:not-last:pb-6"
                  >
                    <TimelineHeader>
                      <TimelineDate asChild>
                        <time dateTime={event.at}>{formatDateTimeIN(event.at)}</time>
                      </TimelineDate>
                      <TimelineTitle className="text-base">{eventCopy?.label}</TimelineTitle>
                    </TimelineHeader>
                    {detail.length > 0 && <TimelineContent>{detail.join(" · ")}</TimelineContent>}
                    <TimelineIndicator
                      className={cn(
                        index === 0 && "bg-brand",
                        eventCopy?.attention === true && "border-signal-red bg-signal-red",
                      )}
                    />
                    <TimelineSeparator />
                  </TimelineItem>
                );
              })}
            </Timeline>
            {foldable && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="self-start px-0"
                aria-expanded={expanded}
                aria-controls={historyId}
                onClick={() => {
                  setExpanded((open) => !open);
                }}
              >
                {expanded
                  ? track.live.result.showFewerEvents
                  : track.live.result.showAllEvents(eventCount)}
              </Button>
            )}
          </>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto sm:self-start"
        onClick={onReset}
      >
        {track.live.result.trackAnother}
      </Button>
    </motion.section>
  );
}
