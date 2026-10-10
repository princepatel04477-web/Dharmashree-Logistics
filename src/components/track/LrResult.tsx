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
import { isDemoLr } from "@/lib/backend/demo";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import type { LrDetails, LrRecord, LrStatus } from "@/lib/backend/types";
import {
  formatAmountINR,
  formatDateIN,
  formatDateTimeIN,
  formatNumberIN,
  formatPhoneIN,
} from "@/lib/format";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";
import { LrProgress } from "./LrProgress";
import { statusCopy } from "./statusCopy";

/* The LR as the customer sees it: a clean, digital version of the printed slip.

     header     LR number, delivery and payment terms, the status and the
                desk's own words for it, the journey bar
     summary    route, booked / expected / delivered, vehicle, last location
     parties    consignor and consignee, with GSTIN and contact
     slip       invoice details beside freight details
     delivery   the delivery address and its numbers
     history    every recorded movement, newest first

   Every block shows only what the booking carries: a field with no value is
   left out, and a block with nothing in it is not drawn (house rule 4). Laid
   out by the card's own width (container queries), so it reads the same in the
   home hero's card and on /track. Motion owns the entrance (none under reduced
   motion); the heading takes focus on arrival so keyboard and screen-reader
   visitors land on the result. */

const copy = track.live.result;

/* Where on the journey a consignment is. "Requires attention" is a problem, not
   a place, so the position comes from the newest movement that was one. */
function progressStatus(record: LrRecord): LrStatus | null {
  if (record.status !== "attention") return record.status;
  return record.events.find((event) => event.status !== "attention")?.status ?? null;
}

/** How many movements the history shows before the rest are folded away. */
const VISIBLE_EVENTS = 3;

function Fact({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <dt className="label-caps">{label}</dt>
      <dd className="text-ink text-sm">{children}</dd>
    </div>
  );
}

/** One "label … value" line of a slip block. */
interface Row {
  label: string;
  value: ReactNode;
  strong?: boolean;
}

function SlipBlock({ title, rows }: { title: string; rows: readonly Row[] }): ReactElement | null {
  if (rows.length === 0) return null;
  return (
    <section className="border-line flex flex-col rounded-xs border">
      <h3 className="label-caps border-line bg-paper-2 border-b px-4 py-3">{title}</h3>
      <dl className="divide-line flex flex-col divide-y px-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-ink-2 text-xs font-light">{row.label}</dt>
            <dd
              className={cn(
                "text-right text-sm break-words tabular-nums",
                row.strong === true ? "text-ink font-medium" : "text-ink",
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function PartyCard({
  role,
  name,
  gstin,
  contact,
}: {
  role: string;
  name: string;
  gstin: string | null;
  contact: string | null;
}): ReactElement | null {
  if (name === "" && gstin === null && contact === null) return null;
  return (
    <section className="border-line bg-paper flex flex-col gap-3 rounded-xs border p-4">
      <h3 className="label-caps">{role}</h3>
      {name !== "" && <p className="text-ink text-base font-medium break-words">{name}</p>}
      {(gstin !== null || contact !== null) && (
        <dl className="flex flex-col gap-1.5">
          {gstin !== null && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-ink-2 text-xs font-light">{copy.gstinLabel}</dt>
              <dd className="text-ink font-mono text-xs">{gstin}</dd>
            </div>
          )}
          {contact !== null && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-ink-2 text-xs font-light">{copy.contactLabel}</dt>
              <dd className="text-ink text-xs">{contact}</dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
}

function invoiceRows(record: LrRecord, details: LrDetails): Row[] {
  const rows: Row[] = [];
  const push = (label: string, value: string | null): void => {
    if (value !== null && value !== "") rows.push({ label, value });
  };
  push(copy.invoiceNoLabel, details.invoiceNo);
  push(
    copy.invoiceDateLabel,
    details.invoiceDate === null ? null : formatDateIN(details.invoiceDate),
  );
  push(
    copy.invoiceValueLabel,
    details.invoiceValue === null ? null : formatAmountINR(details.invoiceValue),
  );
  push(copy.privateMarkLabel, details.privateMark);
  push(copy.containsLabel, details.contains);
  push(copy.ewayBillLabel, details.ewayBill);
  push(
    copy.packagesLabel,
    record.packages === null
      ? null
      : [formatNumberIN(record.packages), details.packageType].filter(Boolean).join(" · "),
  );
  if (record.packages === null) push(copy.packageTypeLabel, details.packageType);
  push(
    copy.weightLabel,
    record.weightKg === null ? null : copy.weightValue(formatNumberIN(record.weightKg)),
  );
  if (details.chargeWeightKg !== null && details.chargeWeightKg !== record.weightKg) {
    push(copy.chargeWeightLabel, copy.weightValue(formatNumberIN(details.chargeWeightKg)));
  }
  push(copy.supplierLabel, details.supplier);
  return rows;
}

function freightRows(details: LrDetails): Row[] {
  const rows: Row[] = [];
  if (details.rateType !== null) rows.push({ label: copy.rateTypeLabel, value: details.rateType });
  /* Freight always shows once it is known; a nil extra charge is left off. */
  for (const charge of details.charges) {
    if (charge.key !== "freight" && charge.amount === 0) continue;
    rows.push({ label: copy.charges[charge.key], value: formatAmountINR(charge.amount) });
  }
  /* A nil total with nothing to add up (a paid or billed LR) says nothing. */
  if (details.total !== null && (details.total !== 0 || rows.length > 0)) {
    rows.push({ label: copy.totalLabel, value: formatAmountINR(details.total), strong: true });
  }
  if (details.advance !== null && details.advance > 0) {
    rows.push({ label: copy.advanceLabel, value: formatAmountINR(details.advance) });
  }
  if (details.balance !== null && (details.advance ?? 0) > 0) {
    rows.push({ label: copy.balanceLabel, value: formatAmountINR(details.balance), strong: true });
  }
  /* The payment mode is one of the header's terms, so it is not repeated here. */
  return rows;
}

interface LrResultProps {
  record: LrRecord;
  onReset: () => void;
}

export function LrResult({ record, onReset }: LrResultProps): ReactElement {
  const reduced = useReducedMotionSafe();
  const headingId = useId();
  const historyId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const { details } = record;
  const status = statusCopy(record.status);
  const delivered = record.status === "delivered";
  const eventCount = record.events.length;
  const shownEvents = expanded ? record.events : record.events.slice(0, VISIBLE_EVENTS);
  const foldable = eventCount > VISIBLE_EVENTS;
  const terms = [details.deliveryType, details.paymentMode].filter(
    (term): term is string => term !== null,
  );
  const invoice = invoiceRows(record, details);
  const freight = freightRows(details);

  return (
    <motion.section
      aria-labelledby={headingId}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced ? { duration: 0 } : { duration: MOTION_DURATIONS.sm, ease: MOTION_EASES.out }
      }
      className="@container flex flex-col gap-6"
    >
      {isDemoLr(record.lrNumber) && (
        <p className="border-signal-red/40 text-ink-2 inline-flex items-center gap-2 self-start rounded-xs border px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase">
          <span aria-hidden="true" className="bg-signal-red size-2 rounded-full" />
          {track.live.direct.demoBadge}
        </p>
      )}

      {/* ——— Header ——— */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="flex flex-col gap-1">
            <p className="label-caps">{copy.lrLabel}</p>
            <h2
              id={headingId}
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-ink text-step-3 leading-headline tracking-display break-all outline-none"
            >
              {record.lrNumber}
            </h2>
          </div>
          {terms.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {terms.map((term) => (
                <li
                  key={term}
                  className="border-line text-ink-2 rounded-xs border px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] uppercase"
                >
                  {term}
                </li>
              ))}
            </ul>
          )}
        </div>

        {status !== null && (
          <div className="flex flex-col gap-2">
            <p className="bg-brand-tint text-brand-deep inline-flex items-center gap-2 self-start rounded-xs px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase">
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 rounded-full",
                  status.attention ? "bg-signal-red" : "bg-brand",
                )}
              />
              <span className="sr-only">{copy.statusLabel}: </span>
              {status.label}
            </p>
            {record.statusText !== null &&
              record.statusText.toLowerCase() !== status.label.toLowerCase() && (
                <p className="text-ink text-sm">{copy.deskUpdate(record.statusText)}</p>
              )}
            <p className="text-ink-2 max-w-measure leading-body text-xs font-light">
              {status.meaning}
            </p>
          </div>
        )}

        <LrProgress current={progressStatus(record)} />
      </header>

      {/* ——— Summary ——— */}
      <dl className="border-line grid grid-cols-2 gap-x-6 gap-y-4 border-y py-5 @xl:grid-cols-4">
        <Fact label={copy.routeLabel} className="col-span-2">
          <span className="inline-flex flex-wrap items-center gap-x-2 text-base font-medium">
            {record.origin}
            <ArrowRightIcon aria-hidden="true" className="text-brand size-4 shrink-0" />
            <span className="sr-only">{copy.routeTo}</span>
            {record.destination}
          </span>
        </Fact>
        <Fact label={copy.bookedLabel}>{formatDateIN(record.bookedOn)}</Fact>
        {delivered && record.deliveredOn !== null ? (
          <Fact label={copy.deliveredLabel}>{formatDateIN(record.deliveredOn)}</Fact>
        ) : (
          record.expectedDelivery !== null && (
            <Fact label={copy.expectedLabel}>{formatDateIN(record.expectedDelivery)}</Fact>
          )
        )}
        {details.vehicleNo !== null && (
          <Fact label={copy.vehicleLabel}>
            <span className="font-mono">{details.vehicleNo}</span>
          </Fact>
        )}
        {!delivered && record.currentLocation !== null && (
          <Fact label={copy.locationLabel}>{record.currentLocation}</Fact>
        )}
      </dl>

      {/* ——— Parties ——— */}
      {(record.consignor !== "" || record.consignee !== "") && (
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
          <PartyCard
            role={copy.consignorLabel}
            name={record.consignor}
            gstin={details.consignorGstin}
            contact={details.consignorContact}
          />
          <PartyCard
            role={copy.consigneeLabel}
            name={record.consignee}
            gstin={details.consigneeGstin}
            contact={details.consigneeContact}
          />
        </div>
      )}

      {/* ——— Invoice and freight ——— */}
      {(invoice.length > 0 || freight.length > 0) && (
        <div className="grid grid-cols-1 items-start gap-4 @xl:grid-cols-2">
          <SlipBlock title={copy.invoiceTitle} rows={invoice} />
          <SlipBlock title={copy.freightTitle} rows={freight} />
        </div>
      )}

      {/* ——— Delivery at ——— */}
      {(details.deliveryAddress !== null || details.deliveryContacts.length > 0) && (
        <section className="border-line flex flex-col gap-2 rounded-xs border p-4">
          <h3 className="label-caps">{copy.deliveryAtTitle}</h3>
          {details.deliveryAddress !== null && (
            <p className="text-ink leading-body text-sm">{details.deliveryAddress}</p>
          )}
          {details.deliveryContacts.length > 0 && (
            <p className="text-ink-2 text-xs font-light">
              {copy.contactLabel}:{" "}
              {details.deliveryContacts.map((mobile, index) => (
                <span key={mobile}>
                  {index > 0 && " · "}
                  <a
                    href={`tel:+91${mobile}`}
                    className="text-brand-deep hover:text-ink underline underline-offset-4"
                  >
                    {formatPhoneIN(`+91${mobile}`)}
                  </a>
                </span>
              ))}
            </p>
          )}
        </section>
      )}

      {/* ——— History ——— */}
      <div className="border-line flex flex-col gap-4 border-t pt-6">
        <h3 className="label-caps">{copy.historyTitle}</h3>
        {eventCount === 0 ? (
          <p className="text-ink-2 max-w-measure leading-body text-xs font-light">
            {copy.noEvents}
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
                {expanded ? copy.showFewerEvents : copy.showAllEvents(eventCount)}
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
        {copy.trackAnother}
      </Button>
    </motion.section>
  );
}
