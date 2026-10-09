"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLink } from "@/components/layout/ArrowLink";
import { PendingDots } from "@/components/quote/PendingDots";
import { Button } from "@/components/ui/button";
import {
  ConsentCheckbox,
  RadioCards,
  SelectField,
  TextField,
  type RadioCardOption,
} from "@/components/vendor/origin";
import { toast } from "@/components/vendor/lightswind";
import { partners, partnersPage } from "@/content/partners";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import {
  EMPTY_PARTNER,
  firstInvalidPartnerField,
  submitPartner,
  validatePartner,
  type PartnerFieldErrors,
  type PartnerFieldName,
  type PartnerPayload,
} from "@/lib/partner";
import { formatPhoneIN } from "@/lib/format";
import { sourcePageFrom, type QuoteError } from "@/lib/quote";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { normalizePhone } from "@/lib/validate";

/* The delivery-partner application (Prompt 13). Origin UI fields, validated on
   send (never per keystroke), posted to the desk's Apps Script through
   `submitPartner` — the same endpoint and workbook as the quote form, on its own
   tab. Lightswind's toast reports the outcome; the form is replaced by the
   confirmation on success and stays put, with the answers kept, on failure.

   The submit is an outline button: the page's one filled button is the header's
   "Enquire now" (house rule 6). The honeypot is off-screen and out of the tab
   order, like the quote form's. */

const FIELD_IDS: Record<PartnerFieldName, string> = {
  name: "partner-name",
  phone: "partner-phone",
  city: "partner-city",
  availability: "partner-availability",
  consent: "partner-consent",
};
const HONEYPOT_ID = "partner-website";

const copy = partnersPage.join;
const availabilityOptions: RadioCardOption[] = copy.availability.map((option) => ({ ...option }));
const cityOptions: readonly string[] = [...partners.map((partner) => partner.city), copy.cityOther];

type Status = "idle" | "sending" | "failed";

function errorText(errors: PartnerFieldErrors, field: PartnerFieldName): string | undefined {
  const code = errors[field];
  return code === undefined ? undefined : copy.errors[code];
}

export function PartnerForm() {
  const reduced = useReducedMotionSafe();
  const [values, setValues] = useState<PartnerPayload>(EMPTY_PARTNER);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<PartnerFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState<QuoteError | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const confirmationRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (reference !== null) confirmationRef.current?.focus();
  }, [reference]);

  function update<K extends keyof PartnerPayload>(field: K, value: PartnerPayload[K]): void {
    setValues((current) => ({ ...current, [field]: value }));
    if (field in errors) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field as PartnerFieldName];
        return next;
      });
    }
  }

  async function send(): Promise<void> {
    const found = validatePartner(values, consent);
    const first = firstInvalidPartnerField(found);
    if (first !== null) {
      setErrors(found);
      document.getElementById(FIELD_IDS[first])?.focus();
      return;
    }

    setErrors({});
    setStatus("sending");
    setFailure(null);

    const result = await submitPartner({
      ...values,
      phone: normalizePhone(values.phone),
      sourcePage: sourcePageFrom(window.location),
    });

    if (result.ok) {
      setStatus("idle");
      setReference(result.reference);
      toast(copy.toastTitle, { description: copy.toastBody, type: "success" });
      return;
    }

    setStatus("failed");
    setFailure(result.error);
    toast(copy.failureTitle, { description: copy.reasons[result.error], type: "destructive" });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void send();
  }

  function handleReset(): void {
    setValues(EMPTY_PARTNER);
    setConsent(false);
    setErrors({});
    setStatus("idle");
    setFailure(null);
    setReference(null);
  }

  const swap = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: reduced ? 0 : MOTION_DURATIONS.sm, ease: MOTION_EASES.out },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {reference !== null ? (
        <motion.section
          key="confirmation"
          {...swap}
          aria-labelledby="partner-success"
          className="border-line bg-paper-2 flex flex-col gap-6 rounded-xs border p-6 sm:p-8"
        >
          <p
            ref={confirmationRef}
            id="partner-success"
            tabIndex={-1}
            className="text-ink text-step-3 leading-headline"
          >
            {copy.successTitle}
          </p>
          <div className="flex flex-col gap-1">
            <p className="label-caps">{copy.successReference}</p>
            <p className="font-display text-ink text-step-4 tracking-display">{reference}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button type="button" variant="ghost" onClick={handleReset}>
              {copy.againLabel}
            </Button>
            <ArrowLink href={copy.quoteHref} label={copy.quoteLabel} />
          </div>
        </motion.section>
      ) : (
        <motion.form
          key="form"
          {...swap}
          noValidate
          onSubmit={handleSubmit}
          aria-label={partnersPage.joinLabel}
          className="flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TextField
              id={FIELD_IDS.name}
              label={copy.nameLabel}
              name="name"
              autoComplete="name"
              value={values.name}
              error={errorText(errors, "name")}
              onChange={(event) => update("name", event.target.value)}
            />
            <TextField
              id={FIELD_IDS.phone}
              label={copy.phoneLabel}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={values.phone}
              helper={copy.phoneHelper}
              error={errorText(errors, "phone")}
              onChange={(event) => update("phone", event.target.value)}
            />
            <SelectField
              id={FIELD_IDS.city}
              label={copy.cityLabel}
              name="city"
              value={values.city}
              error={errorText(errors, "city")}
              onChange={(event) => update("city", event.target.value)}
            >
              <option value="" disabled>
                {copy.cityPlaceholder}
              </option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </SelectField>
            <SelectField
              label={copy.vehicleLabel}
              name="vehicle"
              value={values.vehicle}
              onChange={(event) => update("vehicle", event.target.value)}
            >
              <option value="" disabled>
                {copy.vehiclePlaceholder}
              </option>
              {copy.vehicles.map((vehicle) => (
                <option key={vehicle} value={vehicle}>
                  {vehicle}
                </option>
              ))}
            </SelectField>
          </div>

          <RadioCards
            id={FIELD_IDS.availability}
            label={copy.availabilityLabel}
            options={availabilityOptions}
            value={values.availability}
            error={errorText(errors, "availability")}
            onValueChange={(next) => update("availability", next)}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          />

          <ConsentCheckbox
            id={FIELD_IDS.consent}
            checked={consent}
            error={errorText(errors, "consent")}
            onCheckedChange={(next) => {
              setConsent(next === true);
              if (next === true) {
                setErrors((current) => {
                  const rest = { ...current };
                  delete rest.consent;
                  return rest;
                });
              }
            }}
          >
            {copy.consentLabel}
          </ConsentCheckbox>

          <div aria-hidden="true" className="sr-only">
            <label htmlFor={HONEYPOT_ID}>Leave this field empty</label>
            <input
              id={HONEYPOT_ID}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={(event) => update("website", event.target.value)}
            />
          </div>

          <div className="flex flex-col items-start gap-4">
            <Button type="submit" variant="outline" disabled={status === "sending"}>
              {status === "sending" ? <PendingDots label={copy.sendingLabel} /> : copy.submitLabel}
            </Button>
            {status === "failed" && failure !== null && (
              <p role="alert" className="text-brand max-w-measure font-mono text-[11px]">
                {copy.failure} {copy.reasons[failure]}
              </p>
            )}
            {values.phone.trim() !== "" && errors.phone === undefined && (
              <p className="text-muted font-mono text-[11px]">
                {formatPhoneIN(normalizePhone(values.phone))}
              </p>
            )}
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
