"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { PendingDots } from "@/components/quote/PendingDots";
import { Button } from "@/components/ui/button";
import { ConsentCheckbox, NotesField, TextField } from "@/components/vendor/origin";
import { message } from "@/content/message";
import { contactLinks } from "@/content/navigation";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import {
  EMPTY_MESSAGE,
  firstInvalidMessageField,
  isDeskConnected,
  submitMessage,
  validateMessage,
  type MessageFieldErrors,
  type MessageFieldName,
  type MessagePayload,
} from "@/lib/message";
import { sourcePageFrom, type QuoteError } from "@/lib/quote";

/* "Send us a message" — on /contact (`page`, every field) and in the footer's top
   band (`footer`, compact: no email, on the --brand-deep ground). Origin UI
   fields, validated on send (never per keystroke), posted to the desk's Apps
   Script through `submitMessage` — the quote form's endpoint, on the `Messages`
   tab. The form is replaced by the confirmation on success and stays put, with
   the answers kept, on failure. When the build has no endpoint the box says so
   and offers the desk's own phone and email instead of a form that cannot send.

   Two instances can share a page (contact section + footer), so every id hangs
   off `useId()`. The submit is always an outline button: the page's filled
   buttons are the header's "Enquire now" and nothing here (house rule 6).

   On the deep ground the vendored fields are re-pointed at the on-deep tokens by
   overriding the roles they read (`--muted`, `--ink-2`, `--brand`, `--primary`)
   on the wrapper — the inputs themselves stay light, so they keep their AA
   contrast, and the labels, hints, errors and checkbox follow the ground. */

type Variant = "page" | "footer";
type Status = "idle" | "sending" | "failed";

const DEEP_SCOPE =
  "[--muted:var(--on-deep-text)] [--ink-2:var(--on-deep-text)] [--brand:var(--on-deep)] [--primary:var(--on-deep)] [--primary-foreground:var(--brand-deep)]";

interface Tone {
  panel: string;
  heading: string;
  reference: string;
  body: string;
  link: string;
  again: string;
}

const TONES: Record<Variant, Tone> = {
  page: {
    panel: "border-line bg-paper-2",
    heading: "text-ink",
    reference: "text-ink",
    body: "text-ink-2",
    link: "text-brand-deep hover:text-ink",
    again: "",
  },
  footer: {
    panel: "border-on-deep-line bg-on-deep-band",
    heading: "text-on-deep",
    reference: "text-on-deep",
    body: "text-on-deep-text",
    link: "text-on-deep hover:text-on-deep",
    again: "text-on-deep hover:bg-on-deep-band hover:text-on-deep",
  },
};

/* Only the channels a person can use without the form. */
const deskChannels = contactLinks().filter(
  (link) => link.kind === "phone" || link.kind === "email",
);

function errorText(errors: MessageFieldErrors, field: MessageFieldName): string | undefined {
  const code = errors[field];
  return code === undefined ? undefined : message.errors[code];
}

function DeskChannels({ lead, tone }: { lead: string; tone: Tone }) {
  if (deskChannels.length === 0) return null;
  return (
    <p className={`${tone.body} text-sm font-light`}>
      {lead}{" "}
      {deskChannels.map((link, index) => (
        <span key={link.href}>
          {index > 0 && " · "}
          <a href={link.href} className={`${tone.link} underline underline-offset-4`}>
            {link.label}
          </a>
        </span>
      ))}
    </p>
  );
}

export function MessageForm({ variant }: { variant: Variant }) {
  const compact = variant === "footer";
  const tone = TONES[variant];
  const uid = useId();
  const reduced = useReducedMotionSafe();
  const formRef = useRef<HTMLFormElement>(null);
  const confirmationRef = useRef<HTMLParagraphElement>(null);
  const [values, setValues] = useState<MessagePayload>(EMPTY_MESSAGE);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<MessageFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState<QuoteError | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const ids = {
    name: `${uid}-name`,
    phone: `${uid}-phone`,
    email: `${uid}-email`,
    consent: `${uid}-consent`,
    honeypot: `${uid}-website`,
    success: `${uid}-success`,
  };
  const scope = compact ? DEEP_SCOPE : "";

  useEffect(() => {
    if (reference !== null) confirmationRef.current?.focus();
  }, [reference]);

  function update<K extends keyof MessagePayload>(field: K, value: MessagePayload[K]): void {
    setValues((current) => ({ ...current, [field]: value }));
    if (field in errors) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field as MessageFieldName];
        return next;
      });
    }
  }

  function focusField(field: MessageFieldName): void {
    if (field === "message") {
      formRef.current?.querySelector("textarea")?.focus();
      return;
    }
    document.getElementById(ids[field])?.focus();
  }

  async function send(): Promise<void> {
    const found = validateMessage(values, consent);
    const first = firstInvalidMessageField(found);
    if (first !== null) {
      setErrors(found);
      focusField(first);
      return;
    }

    setErrors({});
    setStatus("sending");
    setFailure(null);

    const result = await submitMessage({ ...values, sourcePage: sourcePageFrom(window.location) });

    if (result.ok) {
      setStatus("idle");
      setReference(result.reference);
      return;
    }

    setStatus("failed");
    setFailure(result.error);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void send();
  }

  function handleReset(): void {
    setValues(EMPTY_MESSAGE);
    setConsent(false);
    setErrors({});
    setStatus("idle");
    setFailure(null);
    setReference(null);
  }

  /* No endpoint in this build: nothing to fill in, so say so and point at the desk. */
  if (!isDeskConnected()) {
    return (
      <section
        aria-label={message.formLabel}
        className={`${scope} ${tone.panel} flex flex-col gap-3 rounded-xs border p-6`}
      >
        <p className={`${tone.heading} text-step-2 leading-headline`}>
          {message.unconfigured.title}
        </p>
        <p className={`${tone.body} max-w-measure text-sm font-light`}>
          {message.unconfigured.body}
        </p>
        {deskChannels.length > 0 ? (
          <DeskChannels lead={message.unconfigured.channelsLead} tone={tone} />
        ) : (
          <p className={`${tone.body} max-w-measure text-sm font-light`}>
            {message.unconfigured.noChannels}
          </p>
        )}
      </section>
    );
  }

  const swap = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: reduced ? 0 : MOTION_DURATIONS.sm, ease: MOTION_EASES.out },
  };

  return (
    <div className={scope}>
      <AnimatePresence mode="wait" initial={false}>
        {reference !== null ? (
          <motion.section
            key="confirmation"
            {...swap}
            aria-labelledby={ids.success}
            className={`${tone.panel} flex flex-col gap-6 rounded-xs border p-6 sm:p-8`}
          >
            <p
              ref={confirmationRef}
              id={ids.success}
              tabIndex={-1}
              className={`${tone.heading} text-step-3 leading-headline`}
            >
              {message.success.title}
            </p>
            <div className="flex flex-col gap-1">
              <p className="label-caps">{message.success.referenceLabel}</p>
              <p className={`${tone.reference} font-display text-step-4 tracking-display`}>
                {reference}
              </p>
            </div>
            <p className={`${tone.body} max-w-measure leading-body text-sm font-light`}>
              {message.success.notice}
            </p>
            <div>
              <Button type="button" variant="ghost" className={tone.again} onClick={handleReset}>
                {message.success.againLabel}
              </Button>
            </div>
          </motion.section>
        ) : (
          <motion.form
            key="form"
            {...swap}
            ref={formRef}
            noValidate
            onSubmit={handleSubmit}
            aria-label={message.formLabel}
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <TextField
                id={ids.name}
                label={message.nameLabel}
                name="name"
                autoComplete="name"
                value={values.name}
                error={errorText(errors, "name")}
                onChange={(event) => {
                  update("name", event.target.value);
                }}
              />
              <TextField
                id={ids.phone}
                label={message.phoneLabel}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={values.phone}
                helper={compact ? undefined : message.phoneHelper}
                error={errorText(errors, "phone")}
                onChange={(event) => {
                  update("phone", event.target.value);
                }}
              />
              {!compact && (
                <div className="sm:col-span-2">
                  <TextField
                    id={ids.email}
                    label={message.emailLabel}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={values.email}
                    helper={message.emailHelper}
                    error={errorText(errors, "email")}
                    onChange={(event) => {
                      update("email", event.target.value);
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <NotesField
                label={message.messageLabel}
                name="message"
                maxLength={message.maxLength}
                value={values.message}
                helper={compact ? undefined : message.messageHelper}
                onValueChange={(next) => {
                  update("message", next);
                }}
              />
              {errors.message !== undefined && (
                <p role="alert" className="text-brand font-mono text-[11px]">
                  {message.errors[errors.message]}
                </p>
              )}
            </div>

            <ConsentCheckbox
              id={ids.consent}
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
              {message.consentLabel}
            </ConsentCheckbox>

            <div aria-hidden="true" className="sr-only">
              <label htmlFor={ids.honeypot}>{message.honeypotLabel}</label>
              <input
                id={ids.honeypot}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={(event) => {
                  update("website", event.target.value);
                }}
              />
            </div>

            <div className="flex flex-col items-start gap-4">
              <Button
                type="submit"
                variant="outline"
                disabled={status === "sending"}
                className={
                  compact
                    ? "border-on-deep text-on-deep hover:bg-on-deep hover:text-brand-deep"
                    : undefined
                }
              >
                {status === "sending" ? (
                  <PendingDots label={message.sendingLabel} />
                ) : (
                  message.submitLabel
                )}
              </Button>
              {status === "failed" && failure !== null && (
                <div role="alert" className="flex flex-col gap-2">
                  <p className="text-brand max-w-measure font-mono text-[11px]">
                    {message.failure.lead} {message.failure.reasons[failure]}
                  </p>
                  <DeskChannels lead={message.failure.channelsLead} tone={tone} />
                </div>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
