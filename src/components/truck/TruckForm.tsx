"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLink } from "@/components/layout/ArrowLink";
import { PendingDots } from "@/components/quote/PendingDots";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ConsentCheckbox,
  DateField,
  RadioCards,
  SelectField,
  TextField,
  type RadioCardOption,
} from "@/components/vendor/origin";
import { toast } from "@/components/vendor/lightswind";
import { operatingCities, truckPage } from "@/content/truck";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { useTodayISODate } from "@/hooks/useTodayISODate";
import { formatPhoneIN } from "@/lib/format";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { sourcePageFrom, type QuoteError } from "@/lib/quote";
import {
  EMPTY_TRUCK,
  firstInvalidTruckField,
  resolveDriver,
  submitTruck,
  validateTruck,
  type TruckFieldErrors,
  type TruckFieldName,
  type TruckPayload,
} from "@/lib/truck";
import { normalizePhone } from "@/lib/validate";

/* The truck attachment application (`/attach-truck`), laid out like the paper
   form it replaces: six numbered blocks — owner, vehicle, driver, settlement
   account, documents ready, declaration — in one page rather than a wizard, so
   an owner can fill it with the RC and licence in hand and check it whole before
   sending.

   Origin UI fields, validated on send (never per keystroke); the first field
   with a problem takes focus. Posted to the desk's Apps Script through
   `submitTruck` — the quote form's endpoint, on the `Truck attachments` tab.
   Lightswind's toast reports the outcome; the form is replaced by the
   confirmation on success and stays put, with every answer kept, on failure.

   Nothing typed here is saved in the browser: the form carries a bank account,
   so unlike the quote form it keeps no session draft. The submit is the page's
   one secondary filled button beside the header's "Enquire now" (house rule 6).
   The honeypot is off-screen and out of the tab order. */

const copy = truckPage;
const HONEYPOT_ID = "truck-website";
const CITY_LIST_ID = "truck-operating-cities";

function fieldId(field: TruckFieldName): string {
  return `truck-${field}`;
}

const gpsOptions: RadioCardOption[] = copy.vehicle.gpsOptions.map((option) => ({ ...option }));

type Status = "idle" | "sending" | "failed";

function Block({
  index,
  title,
  note,
  children,
}: {
  index: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-line bg-paper rounded-xs border p-5 sm:p-6">
      <legend className="float-left mb-6 flex w-full items-baseline gap-3">
        <span className="text-brand font-mono text-[11px]">{index}</span>
        <span className="font-display text-ink leading-headline tracking-display text-xl sm:text-2xl">
          {title}
        </span>
      </legend>
      <div className="clear-both flex flex-col gap-6">
        {note !== undefined && (
          <p className="text-ink-2 max-w-measure leading-body text-sm font-light">{note}</p>
        )}
        {children}
      </div>
    </fieldset>
  );
}

export function TruckForm() {
  const reduced = useReducedMotionSafe();
  const today = useTodayISODate();
  const [values, setValues] = useState<TruckPayload>(EMPTY_TRUCK);
  const [accountConfirm, setAccountConfirm] = useState("");
  const [declaration, setDeclaration] = useState(false);
  const [selfDriven, setSelfDriven] = useState(false);
  const [documents, setDocuments] = useState<readonly string[]>([]);
  const [errors, setErrors] = useState<TruckFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState<QuoteError | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const confirmationRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (reference !== null) confirmationRef.current?.focus();
  }, [reference]);

  function clearError(field: TruckFieldName): void {
    if (errors[field] === undefined) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function update<K extends keyof TruckPayload & TruckFieldName>(field: K, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    clearError(field);
  }

  function errorText(field: TruckFieldName): string | undefined {
    const code = errors[field];
    return code === undefined ? undefined : copy.errors[code];
  }

  /* Props every text-like field shares: id, name, value, error, change handler. */
  function bind(field: keyof TruckPayload & TruckFieldName) {
    return {
      id: fieldId(field),
      name: field,
      value: values[field],
      error: errorText(field),
      onChange: (event: { target: { value: string } }) => update(field, event.target.value),
    };
  }

  function toggleDocument(label: string, checked: boolean): void {
    setDocuments((current) =>
      checked ? [...current, label] : current.filter((entry) => entry !== label),
    );
  }

  async function send(): Promise<void> {
    const found = validateTruck(values, { accountConfirm, declaration, selfDriven }, today);
    const first = firstInvalidTruckField(found);
    if (first !== null) {
      setErrors(found);
      document.getElementById(fieldId(first))?.focus();
      return;
    }

    setErrors({});
    setStatus("sending");
    setFailure(null);

    /* Documents in the order the list shows them, whatever order they were ticked in. */
    const ticked = copy.documents.items
      .map((item) => item.label)
      .filter((label) => documents.includes(label));

    const result = await submitTruck({
      ...resolveDriver(values, selfDriven),
      documents: ticked.join(", "),
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
    setValues(EMPTY_TRUCK);
    setAccountConfirm("");
    setDeclaration(false);
    setSelfDriven(false);
    setDocuments([]);
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

  const dateMin = today === "" ? undefined : today;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {reference !== null ? (
        <motion.section
          key="confirmation"
          {...swap}
          aria-labelledby="truck-success"
          className="border-line bg-paper-2 flex flex-col gap-6 rounded-xs border p-6 sm:p-8"
        >
          <p
            ref={confirmationRef}
            id="truck-success"
            tabIndex={-1}
            className="text-ink text-step-3 leading-headline"
          >
            {copy.successTitle}
          </p>
          <div className="flex flex-col gap-1">
            <p className="label-caps">{copy.successReference}</p>
            <p className="font-display text-ink text-step-4 tracking-display">{reference}</p>
          </div>
          <p className="text-ink-2 max-w-measure leading-body text-sm font-light">
            {copy.successBody}
          </p>
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
          aria-label={copy.formLabel}
          className="flex flex-col gap-6"
        >
          <p className="text-muted text-xs font-light">{copy.requiredNote}</p>

          {/* ——— 01 · Owner ——— */}
          <Block index={copy.owner.index} title={copy.owner.title}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <TextField
                {...bind("ownerName")}
                label={copy.owner.ownerNameLabel}
                helper={copy.owner.ownerNameHelper}
                autoComplete="organization"
              />
              <SelectField {...bind("entityType")} label={copy.owner.entityTypeLabel}>
                <option value="" disabled>
                  {copy.owner.entityTypePlaceholder}
                </option>
                {copy.owner.entityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </SelectField>
              <TextField
                {...bind("phone")}
                label={copy.owner.phoneLabel}
                helper={
                  values.phone.trim() !== "" && errors.phone === undefined
                    ? formatPhoneIN(normalizePhone(values.phone))
                    : copy.owner.phoneHelper
                }
                type="tel"
                inputMode="tel"
                autoComplete="tel"
              />
              <TextField
                {...bind("email")}
                label={copy.owner.emailLabel}
                helper={copy.owner.emailHelper}
                type="email"
                inputMode="email"
                autoComplete="email"
              />
              <TextField
                {...bind("gstin")}
                label={copy.owner.gstinLabel}
                helper={copy.owner.gstinHelper}
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={20}
              />
              <TextField
                {...bind("operatingCity")}
                label={copy.owner.operatingCityLabel}
                helper={copy.owner.operatingCityHelper}
                list={CITY_LIST_ID}
                autoComplete="off"
              />
              <datalist id={CITY_LIST_ID}>
                {operatingCities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
              <div className="sm:col-span-2">
                <TextField
                  {...bind("address")}
                  label={copy.owner.addressLabel}
                  helper={copy.owner.addressHelper}
                  autoComplete="street-address"
                />
              </div>
            </div>
          </Block>

          {/* ——— 02 · Vehicle ——— */}
          <Block index={copy.vehicle.index} title={copy.vehicle.title}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <TextField
                {...bind("vehicleNumber")}
                label={copy.vehicle.vehicleNumberLabel}
                placeholder={copy.vehicle.vehicleNumberPlaceholder}
                autoCapitalize="characters"
                spellCheck={false}
                autoComplete="off"
                maxLength={16}
              />
              <TextField
                {...bind("makeModel")}
                label={copy.vehicle.makeModelLabel}
                helper={copy.vehicle.makeModelHelper}
              />
              <TextField
                {...bind("yearOfMfg")}
                label={copy.vehicle.yearLabel}
                placeholder={copy.vehicle.yearPlaceholder}
                inputMode="numeric"
                maxLength={4}
                autoComplete="off"
              />
              <SelectField {...bind("bodyType")} label={copy.vehicle.bodyTypeLabel}>
                <option value="" disabled>
                  {copy.vehicle.bodyTypePlaceholder}
                </option>
                {copy.vehicle.bodyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </SelectField>
              <TextField
                {...bind("payloadTons")}
                label={copy.vehicle.payloadLabel}
                helper={copy.vehicle.payloadHelper}
                inputMode="decimal"
                autoComplete="off"
              />
              <TextField
                {...bind("chassisNumber")}
                label={copy.vehicle.chassisLabel}
                helper={copy.vehicle.chassisHelper}
                autoCapitalize="characters"
                spellCheck={false}
                autoComplete="off"
                maxLength={20}
              />
              <DateField
                {...bind("permitValidUntil")}
                label={copy.vehicle.permitLabel}
                min={dateMin}
              />
              <DateField
                {...bind("insuranceValidUntil")}
                label={copy.vehicle.insuranceLabel}
                min={dateMin}
              />
            </div>
            <RadioCards
              id={fieldId("gps")}
              label={copy.vehicle.gpsLabel}
              options={gpsOptions}
              value={values.gps}
              onValueChange={(next) => update("gps", next)}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            />
          </Block>

          {/* ——— 03 · Driver ——— */}
          <Block index={copy.driver.index} title={copy.driver.title}>
            <ConsentCheckbox
              id="truck-self-driven"
              checked={selfDriven}
              onCheckedChange={(next) => {
                setSelfDriven(next === true);
                clearError("driverName");
                clearError("driverPhone");
              }}
            >
              {copy.driver.selfDrivenLabel}
            </ConsentCheckbox>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {selfDriven ? (
                <p className="text-muted text-xs font-light sm:col-span-2">
                  {copy.driver.selfDrivenNote}
                </p>
              ) : (
                <>
                  <TextField
                    {...bind("driverName")}
                    label={copy.driver.nameLabel}
                    autoComplete="off"
                  />
                  <TextField
                    {...bind("driverPhone")}
                    label={copy.driver.phoneLabel}
                    helper={
                      values.driverPhone.trim() !== "" && errors.driverPhone === undefined
                        ? formatPhoneIN(normalizePhone(values.driverPhone))
                        : undefined
                    }
                    type="tel"
                    inputMode="tel"
                    autoComplete="off"
                  />
                </>
              )}
              <TextField
                {...bind("driverLicence")}
                label={copy.driver.licenceLabel}
                placeholder={copy.driver.licencePlaceholder}
                autoCapitalize="characters"
                spellCheck={false}
                autoComplete="off"
                maxLength={22}
              />
              <DateField
                {...bind("licenceValidUntil")}
                label={copy.driver.licenceExpiryLabel}
                min={dateMin}
              />
              <SelectField {...bind("policeVerification")} label={copy.driver.policeLabel}>
                <option value="">{copy.driver.policePlaceholder}</option>
                {copy.driver.policeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
            </div>
          </Block>

          {/* ——— 04 · Settlement account ——— */}
          <Block index={copy.bank.index} title={copy.bank.title} note={copy.bank.note}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <TextField
                {...bind("accountHolder")}
                label={copy.bank.holderLabel}
                autoComplete="off"
              />
              <TextField {...bind("bankName")} label={copy.bank.bankNameLabel} autoComplete="off" />
              <TextField
                {...bind("accountNumber")}
                label={copy.bank.accountLabel}
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                maxLength={22}
              />
              <TextField
                id={fieldId("accountConfirm")}
                name="accountConfirm"
                label={copy.bank.accountConfirmLabel}
                value={accountConfirm}
                error={errorText("accountConfirm")}
                onChange={(event) => {
                  setAccountConfirm(event.target.value);
                  clearError("accountConfirm");
                }}
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                maxLength={22}
              />
              <TextField
                {...bind("ifsc")}
                label={copy.bank.ifscLabel}
                placeholder={copy.bank.ifscPlaceholder}
                autoCapitalize="characters"
                spellCheck={false}
                autoComplete="off"
                maxLength={14}
              />
            </div>
          </Block>

          {/* ——— 05 · Documents ready ——— */}
          <Block
            index={copy.documents.index}
            title={copy.documents.title}
            note={copy.documents.note}
          >
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {copy.documents.items.map((item) => {
                const id = `truck-doc-${item.id}`;
                const checked = documents.includes(item.label);
                return (
                  <li key={item.id}>
                    <label
                      htmlFor={id}
                      className={`bg-paper-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-xs border px-4 py-3 transition-colors duration-200 ${
                        checked ? "border-brand" : "border-line hover:border-line-strong"
                      }`}
                    >
                      <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={(next) => toggleDocument(item.label, next === true)}
                      />
                      <span className="text-ink-2 text-sm font-light">{item.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Block>

          {/* ——— 06 · Declaration ——— */}
          <Block index={copy.declaration.index} title={copy.declaration.title}>
            <ConsentCheckbox
              id={fieldId("declaration")}
              checked={declaration}
              error={errorText("declaration")}
              onCheckedChange={(next) => {
                setDeclaration(next === true);
                if (next === true) clearError("declaration");
              }}
            >
              {copy.declaration.label}
            </ConsentCheckbox>
          </Block>

          <div aria-hidden="true" className="sr-only">
            <label htmlFor={HONEYPOT_ID}>Leave this field empty</label>
            <input
              id={HONEYPOT_ID}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={(event) =>
                setValues((current) => ({ ...current, website: event.target.value }))
              }
            />
          </div>

          <div className="flex flex-col items-start gap-4">
            <Button type="submit" size="lg" disabled={status === "sending"}>
              {status === "sending" ? <PendingDots label={copy.sendingLabel} /> : copy.submitLabel}
            </Button>
            {status === "failed" && failure !== null && (
              <p role="alert" className="text-brand max-w-measure font-mono text-[11px]">
                {copy.failure} {copy.reasons[failure]}
              </p>
            )}
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
