"use client";

import { ConsentCheckbox, TextField } from "@/components/vendor/origin";
import { quote } from "@/content/quote";
import { errorText, FIELD_IDS, HONEYPOT_ID, type QuoteContactProps } from "./fields";

/* Step 3 · Contact.

   `type="tel"` + `inputMode="tel"` is the difference between a phone keypad and
   a letter keyboard on a phone; the number itself is validated on the way out
   (Indian mobile, optional +91/0 — see `validate.ts`), never by the browser.

   The honeypot is off the screen and out of the tab order, never filled by a
   person and never validated: a bot that fills it gets `{ok:true}` and no row in
   the sheet. It lives inside this step because this is the step that is always
   mounted when the form is submitted. */

export function StepContact({
  values,
  onChange,
  errors,
  consent,
  onConsentChange,
}: QuoteContactProps) {
  return (
    <section aria-labelledby="quote-step-contact" className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p id="quote-step-contact" tabIndex={-1} className="text-ink text-step-2 leading-headline">
          {quote.contact.title}
        </p>
        <p className="text-muted max-w-measure leading-body text-sm font-light">
          {quote.contact.note}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <TextField
          id={FIELD_IDS.name}
          label={quote.contact.nameLabel}
          error={errorText(errors, "name")}
          value={values.name}
          autoComplete="name"
          onChange={(event) => {
            onChange("name", event.target.value);
          }}
        />
        <TextField
          id={FIELD_IDS.company}
          label={quote.contact.companyLabel}
          helper={quote.contact.companyHelper}
          value={values.company}
          autoComplete="organization"
          onChange={(event) => {
            onChange("company", event.target.value);
          }}
        />
        <TextField
          id={FIELD_IDS.phone}
          label={quote.contact.phoneLabel}
          helper={quote.contact.phoneHelper}
          error={errorText(errors, "phone")}
          value={values.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          onChange={(event) => {
            onChange("phone", event.target.value);
          }}
        />
        <TextField
          id={FIELD_IDS.email}
          label={quote.contact.emailLabel}
          helper={quote.contact.emailHelper}
          error={errorText(errors, "email")}
          value={values.email}
          type="email"
          inputMode="email"
          autoComplete="email"
          onChange={(event) => {
            onChange("email", event.target.value);
          }}
        />
      </div>

      <ConsentCheckbox
        id={FIELD_IDS.consent}
        checked={consent}
        error={errorText(errors, "consent")}
        onCheckedChange={(next) => {
          onConsentChange(next === true);
        }}
      >
        {quote.contact.consentLabel}
      </ConsentCheckbox>

      <div aria-hidden="true" className="sr-only">
        <label htmlFor={HONEYPOT_ID}>{quote.contact.honeypotLabel}</label>
        <input
          id={HONEYPOT_ID}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => {
            onChange("website", event.target.value);
          }}
        />
      </div>
    </section>
  );
}
