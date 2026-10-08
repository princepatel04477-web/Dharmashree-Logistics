"use client";

import { RadioCards, TextField, type RadioCardOption } from "@/components/vendor/origin";
import { HUBS } from "@/content/hubs";
import { quote } from "@/content/quote";
import { services } from "@/content/services";
import { errorText, FIELD_IDS, HUB_LIST_ID, type QuoteFieldsProps } from "./fields";

/* Step 1 · Lane & service.

   The radio value is the service *name* — the fact in `company.services`, and
   the string the sheet's Service column holds — so the prefill from
   `/quote/?service=<slug>` resolves the slug once, here, and nothing has to map
   names back to slugs on the way out.

   "To" is a text input with the 78 hub names as a datalist rather than a select:
   a lane that is not on the map is a question for the desk, not an invalid
   answer, and a `<select>` would say the opposite. */

const serviceOptions: readonly RadioCardOption[] = services.map((service) => ({
  value: service.name,
  title: service.name,
  description: service.summary,
}));

const hubNames: readonly string[] = HUBS.map((hub) => hub.name);

export function StepLane({ values, onChange, errors }: QuoteFieldsProps) {
  return (
    <section aria-labelledby="quote-step-lane" className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p id="quote-step-lane" tabIndex={-1} className="text-ink text-step-2 leading-headline">
          {quote.lane.title}
        </p>
        <p className="text-muted max-w-measure leading-body text-sm font-light">
          {quote.lane.note}
        </p>
      </div>

      <RadioCards
        id={FIELD_IDS.service}
        label={quote.lane.serviceLabel}
        options={[...serviceOptions]}
        value={values.service}
        onValueChange={(next) => {
          onChange("service", next);
        }}
        helper={quote.lane.serviceHelper}
        error={errorText(errors, "service")}
      />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <TextField
          id={FIELD_IDS.from}
          label={quote.lane.fromLabel}
          helper={quote.lane.fromHelper}
          error={errorText(errors, "from")}
          value={values.from}
          autoComplete="address-level2"
          onChange={(event) => {
            onChange("from", event.target.value);
          }}
        />
        <TextField
          id={FIELD_IDS.to}
          label={quote.lane.toLabel}
          helper={quote.lane.toHelper}
          error={errorText(errors, "to")}
          value={values.to}
          list={HUB_LIST_ID}
          autoComplete="off"
          onChange={(event) => {
            onChange("to", event.target.value);
          }}
        />
      </div>

      {/* The datalist carries names only — ids are the map's business. */}
      <datalist id={HUB_LIST_ID} aria-label={quote.lane.hubListLabel}>
        {hubNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </section>
  );
}
