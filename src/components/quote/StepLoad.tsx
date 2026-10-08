"use client";

import { DateField, NotesField, SelectField, TextField } from "@/components/vendor/origin";
import { fleetVehicles } from "@/content/fleet";
import { quote } from "@/content/quote";
import { VEHICLE_UNDECIDED } from "@/lib/quote";
import { errorText, FIELD_IDS, type QuoteFieldsProps } from "./fields";

/* Step 2 · The load.

   Weight is a text input with a decimal keypad rather than `type="number"`: the
   rule is "a number above zero if it is typed at all", and the field's own copy
   says that better than a spinner and a browser-localised locale ever would.

   The vehicle select always has an answer — "Let DharmaShree decide" is the
   first option and the payload's empty string — because the desk assigns the
   vehicle after the load is measured (see `services.ts`). */

const vehicleNames: readonly string[] = fleetVehicles().map((vehicle) => vehicle.name);

export function StepLoad({
  values,
  onChange,
  errors,
  today,
}: QuoteFieldsProps & { today: string }) {
  return (
    <section aria-labelledby="quote-step-load" className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p id="quote-step-load" tabIndex={-1} className="text-ink text-step-2 leading-headline">
          {quote.load.title}
        </p>
        <p className="text-muted max-w-measure leading-body text-sm font-light">
          {quote.load.note}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <SelectField
          id={FIELD_IDS.loadType}
          label={quote.load.loadTypeLabel}
          error={errorText(errors, "loadType")}
          value={values.loadType}
          onChange={(event) => {
            onChange("loadType", event.target.value);
          }}
        >
          <option value="" disabled>
            {quote.load.loadTypePlaceholder}
          </option>
          {quote.load.loadTypes.map((loadType) => (
            <option key={loadType} value={loadType}>
              {loadType}
            </option>
          ))}
        </SelectField>

        <TextField
          id={FIELD_IDS.weightKg}
          label={quote.load.weightLabel}
          helper={quote.load.weightHelper}
          error={errorText(errors, "weightKg")}
          value={values.weightKg}
          inputMode="decimal"
          autoComplete="off"
          onChange={(event) => {
            onChange("weightKg", event.target.value);
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <SelectField
          id={FIELD_IDS.vehicle}
          label={quote.load.vehicleLabel}
          helper={quote.load.vehicleHelper}
          value={values.vehicle}
          onChange={(event) => {
            onChange("vehicle", event.target.value);
          }}
        >
          <option value={VEHICLE_UNDECIDED}>{quote.load.vehicleDecide}</option>
          {vehicleNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </SelectField>

        {/* `min` arrives with `today`, which is set after mount: the server's
            idea of "today" can be a day off the visitor's, and a min attribute
            that disagrees with itself is a hydration mismatch. */}
        <DateField
          id={FIELD_IDS.pickupDate}
          label={quote.load.pickupLabel}
          helper={quote.load.pickupHelper}
          error={errorText(errors, "pickupDate")}
          value={values.pickupDate}
          min={today === "" ? undefined : today}
          onChange={(event) => {
            onChange("pickupDate", event.target.value);
          }}
        />
      </div>

      <NotesField
        label={quote.load.notesLabel}
        helper={quote.load.notesHelper}
        placeholder={quote.load.notesPlaceholder}
        maxLength={quote.load.notesMaxLength}
        value={values.notes}
        onValueChange={(next) => {
          onChange("notes", next);
        }}
      />
    </section>
  );
}
