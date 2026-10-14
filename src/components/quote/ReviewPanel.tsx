"use client";

import { Button } from "@/components/ui/button";
import { quote } from "@/content/quote";
import { formatDateIN, formatPhoneIN } from "@/lib/format";
import { normalizePhone } from "@/lib/validate";
import type { QuoteError, QuotePayload } from "@/lib/quote";
import type { QuoteStep } from "@/lib/validate";
import { PendingDots } from "./PendingDots";

/* The review panel, and the page's one filled button.

   Rows are built from the same payload the desk receives, and a row with no
   answer is dropped rather than shown empty (house rule 4) — which is why the
   optional fields (company, email, weight, notes) simply are not here when they
   were left alone. `weight` and `pickupDate` are the only two that are formatted
   for reading; the numbers themselves go to the sheet untouched. */

interface ReviewRow {
  readonly label: string;
  readonly value: string;
}

interface ReviewGroup {
  readonly step: QuoteStep;
  readonly title: string;
  readonly rows: readonly ReviewRow[];
}

function answered(entries: readonly (readonly [string, string])[]): ReviewRow[] {
  const rows: ReviewRow[] = [];
  for (const [label, value] of entries) {
    if (value.trim() === "") continue;
    rows.push({ label, value });
  }
  return rows;
}

function reviewGroups(values: QuotePayload): ReviewGroup[] {
  return [
    {
      step: 1,
      title: quote.lane.title,
      rows: answered([
        [quote.lane.serviceLabel, values.service],
        [quote.lane.fromLabel, values.from],
        [quote.lane.toLabel, values.to],
      ]),
    },
    {
      step: 2,
      title: quote.load.title,
      rows: answered([
        [quote.load.loadTypeLabel, values.loadType],
        [
          quote.load.weightLabel,
          values.weightKg.trim() === "" ? "" : `${values.weightKg.trim()} kg`,
        ],
        [
          quote.load.vehicleLabel,
          values.vehicle.trim() === "" ? quote.load.vehicleDecide : values.vehicle,
        ],
        [
          quote.load.pickupLabel,
          values.pickupDate.trim() === "" ? "" : formatDateIN(values.pickupDate),
        ],
        [quote.load.notesLabel, values.notes],
      ]),
    },
    {
      step: 3,
      title: quote.contact.title,
      rows: answered([
        [quote.contact.nameLabel, values.name],
        [quote.contact.companyLabel, values.company],
        [
          quote.contact.phoneLabel,
          values.phone.trim() === "" ? "" : formatPhoneIN(normalizePhone(values.phone)),
        ],
        [quote.contact.emailLabel, values.email],
      ]),
    },
  ];
}

interface ReviewPanelProps {
  values: QuotePayload;
  onEdit: (step: QuoteStep) => void;
  onBack: () => void;
  status: "idle" | "sending" | "failed";
  failureCode: QuoteError | null;
  whatsappHref: string | null;
}

export function ReviewPanel({
  values,
  onEdit,
  onBack,
  status,
  failureCode,
  whatsappHref,
}: ReviewPanelProps) {
  const groups = reviewGroups(values);
  const sending = status === "sending";
  const failed = status === "failed" && failureCode !== null;

  return (
    <section
      aria-labelledby="quote-review"
      className="border-line bg-paper-2 rounded-xs border p-6 sm:p-8"
    >
      <div className="flex flex-col gap-2">
        <p id="quote-review" tabIndex={-1} className="text-ink text-step-2 leading-headline">
          {quote.review.title}
        </p>
        <p className="text-muted max-w-measure leading-body text-sm font-light">
          {quote.review.note}
        </p>
      </div>

      <div className="mt-8 flex flex-col">
        {groups.map((group) => (
          <div key={group.step} className="border-line flex flex-col gap-4 border-t py-5">
            <div className="flex items-baseline justify-between gap-4">
              <p className="label-caps">{group.title}</p>
              <button
                type="button"
                onClick={() => {
                  onEdit(group.step);
                }}
                className="text-brand-deep hover:text-ink cursor-pointer font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
              >
                {quote.review.editLabel}
              </button>
            </div>
            <dl className="flex flex-col gap-3">
              {group.rows.map((row) => (
                <div key={row.label} className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-muted text-xs font-light">{row.label}</dt>
                  <dd className="text-ink text-sm font-light sm:col-span-2">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {failed && (
        <div
          role="alert"
          className="border-brand/60 bg-paper-3 mt-4 flex flex-col gap-3 rounded-xs border p-4"
        >
          <p className="text-ink text-sm font-medium">{quote.failure.title}</p>
          <p className="text-ink-2 leading-body text-sm font-light">
            {whatsappHref === null ? quote.failure.withoutWhatsapp : quote.failure.withWhatsapp}
          </p>
          <p className="text-muted text-xs font-light">{quote.failure.kept}</p>
          <p className="label-caps">{quote.failure.reasons[failureCode]}</p>
          {whatsappHref !== null && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener"
              className="text-brand-deep hover:text-ink self-start font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
            >
              {quote.success.whatsappLabel}
            </a>
          )}
        </div>
      )}

      <div className="border-line mt-6 flex flex-wrap items-center gap-3 border-t pt-6">
        <Button type="button" variant="ghost" onClick={onBack}>
          {quote.review.backLabel}
        </Button>
        <Button type="submit" disabled={sending} aria-busy={sending} className="w-full sm:w-auto">
          {sending ? (
            <PendingDots label={quote.review.sendingLabel} />
          ) : failed ? (
            quote.failure.retryLabel
          ) : (
            quote.review.submitLabel
          )}
        </Button>
      </div>
    </section>
  );
}
