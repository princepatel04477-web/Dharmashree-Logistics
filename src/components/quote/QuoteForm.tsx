"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/vendor/lightswind";
import { QuoteStepper } from "@/components/vendor/origin";
import { whatsappLink } from "@/content/navigation";
import { quote } from "@/content/quote";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { useTodayISODate } from "@/hooks/useTodayISODate";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { clearQuoteDraft, writeQuoteDraft } from "@/lib/quote-draft";
import {
  EMPTY_QUOTE,
  sourcePageFrom,
  submitQuote,
  type QuoteError,
  type QuotePayload,
} from "@/lib/quote";
import {
  firstInvalidField,
  isQuoteStep,
  stepOfField,
  todayISODate,
  validateQuote,
  validateQuoteStep,
  type QuoteFieldErrors,
  type QuoteStep,
} from "@/lib/validate";
import { focusQuoteField, focusQuoteStep } from "./fields";
import { ReviewPanel } from "./ReviewPanel";
import { StepContact } from "./StepContact";
import { StepLane } from "./StepLane";
import { StepLoad } from "./StepLoad";
import { SuccessPanel } from "./SuccessPanel";
import { useQuoteEntry, type QuoteEntry } from "./useQuoteEntry";

/* The quote wizard (Prompt 08): three steps, a review, one POST.

   Motion owns the finishing layer here and only that — the step swap
   (x 24 → 0 + opacity) and the container's height as the steps change size.
   Nothing on this page is tweened by GSAP, so every element has one owner (house
   rule 8); under reduced motion the steps land at their final position instantly
   (`initial={false}`, duration 0).

   The step swap deliberately does not use `AnimatePresence`: a step that mounts
   only after the previous one has finished exiting cannot take focus when it is
   told to, and focus is how a screen reader hears the next question. The form ↔
   confirmation swap does use it, because the confirmation panel focuses itself
   on mount. */

type SubmitStatus = "idle" | "sending" | "failed";

function nextStep(step: QuoteStep): QuoteStep {
  return step === 1 ? 2 : 3;
}

function previousStep(step: QuoteStep): QuoteStep {
  return step === 3 ? 2 : 1;
}

export function QuoteForm() {
  const entry = useQuoteEntry();

  /* Mounted with whatever this tab already knew — nothing on the server, the
     draft plus the link's prefill on the client. The key is what makes that a
     mount rather than a state update, so no effect has to push it in after the
     first paint. */
  return <QuoteWizard key={entry === null ? "blank" : "prefilled"} entry={entry} />;
}

function QuoteWizard({ entry }: { entry: QuoteEntry | null }) {
  const reduced = useReducedMotionSafe();
  const today = useTodayISODate();

  const [values, setValues] = useState<QuotePayload>(entry?.values ?? EMPTY_QUOTE);
  const [consent, setConsent] = useState(entry?.consent ?? false);
  const [step, setStep] = useState<QuoteStep>(entry?.step ?? 1);
  const [furthest, setFurthest] = useState<QuoteStep>(entry?.step ?? 1);
  const [errors, setErrors] = useState<QuoteFieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [failureCode, setFailureCode] = useState<QuoteError | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const announceStep = useRef(false);

  const whatsappHref = whatsappLink();

  /* Mirrored with every keystroke; `writeQuoteDraft` skips a blank form. */
  useEffect(() => {
    writeQuoteDraft({ values, consent, step });
  }, [values, consent, step]);

  /* Where focus goes after a step changes or a validation fails: the offending
     field if this step owns it, otherwise the step's own heading — which is how
     the new step gets announced. */
  useEffect(() => {
    const first = firstInvalidField(errors);
    if (first !== null && stepOfField(first) === step) {
      announceStep.current = false;
      focusQuoteField(first);
      return;
    }
    if (announceStep.current) {
      announceStep.current = false;
      focusQuoteStep(step);
    }
  }, [step, errors]);

  function setField(field: keyof QuotePayload, value: string): void {
    setValues((current) => {
      const next: QuotePayload = { ...current };
      next[field] = value;
      return next;
    });
  }

  function validationDate(): string {
    return today === "" ? todayISODate() : today;
  }

  function goTo(target: QuoteStep): void {
    announceStep.current = target !== step;
    if (target !== step) setStep(target);
  }

  function handleContinue(): void {
    const found = validateQuoteStep(step, values, consent, validationDate());
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    const next = nextStep(step);
    setFurthest((current) => (next > current ? next : current));
    goTo(next);
  }

  function handleBack(): void {
    setErrors({});
    goTo(previousStep(step));
  }

  /* The rail only moves between steps the visitor has already earned. */
  function handleStepperChange(target: number): void {
    if (!isQuoteStep(target) || target > furthest) return;
    setErrors({});
    goTo(target);
  }

  async function send(): Promise<void> {
    const found = validateQuote(values, consent, validationDate());
    if (Object.keys(found).length > 0) {
      const first = firstInvalidField(found);
      if (first !== null) goTo(stepOfField(first));
      setErrors(found);
      return;
    }

    setErrors({});
    setStatus("sending");
    setFailureCode(null);

    const result = await submitQuote({ ...values, sourcePage: sourcePageFrom(window.location) });

    if (result.ok) {
      clearQuoteDraft();
      setStatus("idle");
      setReference(result.reference);
      toast(quote.success.toastTitle, {
        description: `${quote.success.referenceLabel} ${result.reference}`,
        type: "success",
      });
      return;
    }

    setStatus("failed");
    setFailureCode(result.error);
    toast(quote.failure.title, {
      description: quote.failure.reasons[result.error],
      type: "destructive",
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void send();
  }

  function handleReset(): void {
    clearQuoteDraft();
    setValues(EMPTY_QUOTE);
    setConsent(false);
    setErrors({});
    setStatus("idle");
    setFailureCode(null);
    setReference(null);
    setStep(1);
    setFurthest(1);
  }

  const stepBody =
    step === 1 ? (
      <StepLane values={values} onChange={setField} errors={errors} />
    ) : step === 2 ? (
      <StepLoad values={values} onChange={setField} errors={errors} today={today} />
    ) : (
      <>
        <StepContact
          values={values}
          onChange={setField}
          errors={errors}
          consent={consent}
          onConsentChange={setConsent}
        />
        <ReviewPanel
          values={values}
          onEdit={goTo}
          onBack={handleBack}
          status={status}
          failureCode={failureCode}
          whatsappHref={whatsappHref}
        />
      </>
    );

  return (
    <AnimatePresence mode="wait" initial={false}>
      {reference === null ? (
        <motion.div
          key="form"
          className="flex flex-col gap-10"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
        >
          <QuoteStepper
            label={quote.stepperLabel}
            steps={[...quote.stepper]}
            value={step}
            onValueChange={handleStepperChange}
            maxStep={furthest}
            titleClassName="sr-only sm:not-sr-only"
          />

          <form
            aria-label={quote.formLabel}
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-col gap-10"
          >
            <motion.div layout={!reduced} transition={{ duration: reduced ? 0 : 0.3 }}>
              <motion.div
                key={step}
                initial={reduced ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: reduced ? 0 : MOTION_DURATIONS.sm,
                  ease: MOTION_EASES.out,
                }}
              >
                {stepBody}
              </motion.div>
            </motion.div>

            {step < 3 && (
              <div className="border-line flex flex-wrap items-center gap-3 border-t pt-8">
                {step > 1 && (
                  <Button type="button" variant="ghost" onClick={handleBack}>
                    {quote.review.backLabel}
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={handleContinue}>
                  {quote.review.nextLabel}
                </Button>
              </div>
            )}

            <noscript>
              <p className="text-muted border-line border-t pt-6 text-xs font-light">
                {quote.noscript}
              </p>
            </noscript>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="success"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : MOTION_DURATIONS.sm, ease: MOTION_EASES.out }}
        >
          <SuccessPanel
            reference={reference}
            whatsappHref={
              whatsappHref === null ? null : whatsappLink(quote.success.whatsappMessage(reference))
            }
            onReset={handleReset}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
