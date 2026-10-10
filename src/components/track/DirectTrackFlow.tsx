"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/vendor/origin";
import { track } from "@/content/track";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { lookupLr } from "@/lib/backend/client";
import { parseLrQuery } from "@/lib/backend/vendor-lr";
import type { BackendErrorCode, LrRecord } from "@/lib/backend/types";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { normalizeLr, normalizePhone, validateLr, validateMobile } from "@/lib/validate";
import { LrResult } from "./LrResult";

/* The LR lookup ("direct" mode): the LR number *and the mobile number on the
   booking* go to this site's own `/api/lr`, which reads the client's E-Transport
   API and returns the LR only when that mobile is one the booking carries. LR
   numbers run in sequence, so a number alone would let anyone read a stranger's
   consignment; the mobile is what makes it the customer's own.

   Two states — the form, then the result — swapped by Motion (instant under
   reduced motion). Every failure arrives as a code from `src/lib/backend` and is
   shown as the sentence in `track.live.errors`. The server answers an unknown LR,
   a wrong mobile and a booking with no number on file identically, and so does
   this screen: one sentence, and a way to the desk. The fields stay filled so a
   typo can be corrected and sent again; they are cleared after "Track another".

   In the home hero (`openOnTrackPage`) the card is too narrow for both fields, so
   a valid LR number opens `/track/?lr=…` instead; on /track the `lr` parameter
   only fills the LR field — nothing is looked up until the mobile is given, and
   the mobile never goes in the address. */

/** The query parameter that carries an LR to /track. */
const LR_PARAM = "lr";

const copy = track.live.direct;

export function DirectTrackFlow({
  openOnTrackPage = false,
}: {
  openOnTrackPage?: boolean;
}): ReactElement {
  const reduced = useReducedMotionSafe();
  const router = useRouter();
  const [lr, setLr] = useState("");
  const [mobile, setMobile] = useState("");
  const [record, setRecord] = useState<LrRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [mobileError, setMobileError] = useState<string | undefined>(undefined);
  const [failure, setFailure] = useState<BackendErrorCode | null>(null);
  /** Focus returns to the field only after "Track another", never on first paint. */
  const [returned, setReturned] = useState(false);

  const stepMotion = reduced
    ? { transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0 },
        transition: { duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out },
      };

  function handleLrChange(event: ChangeEvent<HTMLInputElement>): void {
    setLr(event.target.value);
    setFieldError(undefined);
    setFailure(null);
  }

  function handleMobileChange(event: ChangeEvent<HTMLInputElement>): void {
    setMobile(event.target.value);
    setMobileError(undefined);
    setFailure(null);
  }

  /* On /track, an LR in the address fills the LR field, once, on arrival. */
  useEffect(() => {
    if (openOnTrackPage) return;
    const fromUrl = new URLSearchParams(window.location.search).get(LR_PARAM);
    if (fromUrl === null || parseLrQuery(fromUrl) === null) return;
    queueMicrotask(() => {
      setLr(normalizeLr(fromUrl));
    });
  }, [openOnTrackPage]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy) return;

    const lrCode = validateLr(lr);
    /* The whole number: a branch code and the number, never the number alone. */
    const lrProblem =
      lrCode !== null
        ? track.errors[lrCode]
        : parseLrQuery(lr) === null
          ? copy.wholeNumber
          : undefined;
    setFieldError(lrProblem);

    /* In the hero only the LR is asked for; the mobile is asked for on /track. */
    if (openOnTrackPage) {
      if (lrProblem !== undefined) return;
      router.push(`/track/?${LR_PARAM}=${encodeURIComponent(normalizeLr(lr))}`);
      return;
    }

    const mobileCode = validateMobile(mobile);
    setMobileError(mobileCode === null ? undefined : track.live.fieldErrors[mobileCode]);
    if (lrProblem !== undefined || mobileCode !== null) return;

    setFailure(null);
    setBusy(true);
    const result = await lookupLr(normalizeLr(lr), normalizePhone(mobile));
    setBusy(false);

    if (!result.ok) {
      setFailure(result.error);
      return;
    }
    setRecord(result.data);
  }

  function reset(): void {
    setRecord(null);
    setLr("");
    setMobile("");
    setFailure(null);
    setReturned(true);
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {record === null ? (
        <motion.form
          key="lookup"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          noValidate
          className="flex flex-col gap-4"
          {...stepMotion}
        >
          <div
            className={
              openOnTrackPage
                ? "flex flex-col gap-3 sm:flex-row sm:items-start"
                : "flex flex-col gap-5"
            }
          >
            <div className="flex-1">
              <TextField
                label={copy.lrLabel}
                name="lr-number"
                value={lr}
                onChange={handleLrChange}
                placeholder={copy.placeholder}
                helper={copy.helper}
                error={fieldError}
                className="uppercase"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                autoFocus={returned}
              />
            </div>
            {!openOnTrackPage && (
              <div className="flex-1">
                <TextField
                  label={copy.mobileLabel}
                  name="mobile"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={mobile}
                  onChange={handleMobileChange}
                  placeholder={copy.mobilePlaceholder}
                  helper={copy.mobileHelper}
                  error={mobileError}
                />
              </div>
            )}
            <Button
              type="submit"
              variant="outline"
              aria-disabled={busy}
              className={
                openOnTrackPage
                  ? "w-full aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:mt-[1.6rem] sm:w-auto"
                  : "w-full self-start aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:w-auto"
              }
            >
              {busy ? copy.submitting : openOnTrackPage ? copy.submit : copy.submitVerified}
            </Button>
          </div>

          {!openOnTrackPage && (
            <p className="text-muted max-w-measure leading-body text-xs font-light">
              {copy.privacyNote}
            </p>
          )}

          {failure !== null && (
            <div role="alert" className="flex flex-col gap-2">
              <p className="text-brand leading-body max-w-measure font-mono text-[11px]">
                {track.live.errors[failure]}
              </p>
              {failure === "NotVerified" && (
                <Link
                  href={copy.askDeskHref}
                  className="text-brand-deep hover:text-ink inline-flex min-h-11 items-center self-start font-mono text-[11px] tracking-[0.14em] uppercase underline-offset-4 hover:underline"
                >
                  {copy.askDeskLabel}
                </Link>
              )}
            </div>
          )}
        </motion.form>
      ) : (
        <LrResult key="result" record={record} onReset={reset} />
      )}
    </AnimatePresence>
  );
}
