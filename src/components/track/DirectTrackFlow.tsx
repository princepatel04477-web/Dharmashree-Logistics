"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/vendor/origin";
import { track } from "@/content/track";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { lookupLr } from "@/lib/backend/client";
import { parseLrQuery } from "@/lib/backend/vendor-lr";
import type { LrRecord } from "@/lib/backend/types";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { normalizeLr, validateLr } from "@/lib/validate";
import { LrResult } from "./LrResult";

/* The LR lookup with no SMS code ("direct" mode): the LR number goes to this
   site's own `/api/lr`, which reads the client's E-Transport API. Two states —
   the number, then the result — swapped by Motion (instant under reduced
   motion). Every failure arrives as a code from `src/lib/backend` and is shown
   as the sentence in `track.live.errors`; the number stays in the field so it
   can be corrected and sent again.

   In the home hero (`openOnTrackPage`) the card is too narrow for a whole LR, so
   a valid number opens `/track/?lr=…` instead; on /track the `lr` parameter is
   read once on arrival and looked up straight away, so that link (and any link
   the desk shares) lands on the result. */

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
  const [record, setRecord] = useState<LrRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
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

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setLr(event.target.value);
    setFieldError(undefined);
    setError(undefined);
  }

  async function run(value: string): Promise<void> {
    setError(undefined);
    setBusy(true);
    const result = await lookupLr(normalizeLr(value));
    setBusy(false);

    if (!result.ok) {
      setError(track.live.errors[result.error]);
      return;
    }
    setRecord(result.data);
  }

  /* On /track, an LR in the address is looked up once, on arrival. */
  useEffect(() => {
    if (openOnTrackPage) return;
    const fromUrl = new URLSearchParams(window.location.search).get(LR_PARAM);
    if (fromUrl === null || parseLrQuery(fromUrl) === null) return;
    const value = normalizeLr(fromUrl);
    queueMicrotask(() => {
      setLr(value);
      void run(value);
    });
    // Runs once: the address is read on arrival only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy) return;

    const code = validateLr(lr);
    if (code !== null) {
      setFieldError(track.errors[code]);
      return;
    }
    /* The whole number: a branch code and the number, never the number alone. */
    if (parseLrQuery(lr) === null) {
      setFieldError(copy.wholeNumber);
      return;
    }
    setFieldError(undefined);

    if (openOnTrackPage) {
      router.push(`/track/?${LR_PARAM}=${encodeURIComponent(normalizeLr(lr))}`);
      return;
    }
    await run(lr);
  }

  function reset(): void {
    setRecord(null);
    setLr("");
    setError(undefined);
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <TextField
                label={copy.lrLabel}
                name="lr-number"
                value={lr}
                onChange={handleChange}
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
            <Button
              type="submit"
              variant="outline"
              aria-disabled={busy}
              className="w-full aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:mt-[1.6rem] sm:w-auto"
            >
              {busy ? copy.submitting : copy.submit}
            </Button>
          </div>
          {error !== undefined && (
            <p role="alert" className="text-brand leading-body font-mono text-[11px]">
              {error}
            </p>
          )}
        </motion.form>
      ) : (
        <LrResult key="result" record={record} onReset={reset} />
      )}
    </AnimatePresence>
  );
}
