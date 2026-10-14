"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextField } from "@/components/vendor/origin";
import { track } from "@/content/track";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { fetchLr, requestOtp, verifyOtp } from "@/lib/backend/client";
import type {
  BackendErrorCode,
  LrRecord,
  OtpChallenge,
  VerifiedSession,
} from "@/lib/backend/types";
import { formatMaskedMobileIN } from "@/lib/format";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import {
  normalizeLr,
  normalizeOtp,
  normalizePhone,
  validateLr,
  validateMobile,
  validateOtp,
} from "@/lib/validate";
import { LrResult } from "./LrResult";

/* The LR + SMS-code flow, used when a backend is connected (Prompt: client
   backend). Three steps, one on screen at a time:

   1. details — the LR number and the mobile number on the booking;
   2. otp     — the 6-digit code from the SMS;
   3. result  — the verified LR and its history.

   State lives in this component only. The session token that proves the code
   was verified is held in React state and nowhere else (no storage, no URL), so
   a reload asks for a new code. Motion owns the step swap (AnimatePresence); it
   is instant under reduced motion. Every failure arrives as a code from
   `src/lib/backend` and is shown as the sentence in `track.live.errors`.

   Errors that leave the visitor where they are (a wrong code, a network blip)
   keep the step; the ones that end the attempt (too many wrong codes, an
   expired session, an LR that was not found after the code) go back to step 1,
   because nothing on step 2 can fix them. */

type Flow =
  | { step: "details" }
  | {
      step: "otp";
      lr: string;
      challenge: OtpChallenge;
      /** Epoch ms from which a new code may be requested. */
      resendAt: number;
      /** Set once the code is verified, so a failed read can be retried without
          asking for the same code twice. */
      session: VerifiedSession | null;
    }
  | { step: "result"; record: LrRecord };

type Busy = "send" | "verify" | "resend" | null;

/** Failures that end the attempt: step 2 cannot recover from them. */
const RESTART_ERRORS: readonly BackendErrorCode[] = [
  "TooManyAttempts",
  "SessionExpired",
  "NotFound",
  "MobileMismatch",
  "RateLimited",
];

const ERROR_TEXT_CLASS = "text-brand font-mono text-[11px] leading-body";

/** "Code sent to +91 ••••• •1234 for LR …", or the same without the number when
    the backend's mask has no digits to show. */
function sentLine(lr: string, maskedMobile: string): string {
  const masked = formatMaskedMobileIN(maskedMobile);
  return masked === null ? track.live.otp.sentToFallback(lr) : track.live.otp.sentTo(masked, lr);
}

export function LiveTrackFlow(): ReactElement {
  const reduced = useReducedMotionSafe();
  const otpId = useId();

  const [flow, setFlow] = useState<Flow>({ step: "details" });
  const [lr, setLr] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  /** The sentence for a failed call, shown above the step's button. */
  const [error, setError] = useState<string | undefined>(undefined);
  const [lrError, setLrError] = useState<string | undefined>(undefined);
  const [mobileError, setMobileError] = useState<string | undefined>(undefined);
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  /** Focus goes to the first field only after the visitor has moved between
      steps — never on first paint, where it would pull the page. */
  const [moved, setMoved] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const waitingForResend = flow.step === "otp" && flow.resendAt > now;
  useEffect(() => {
    if (!waitingForResend) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [waitingForResend]);

  const stepMotion = reduced
    ? { transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0 },
        transition: { duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out },
      };

  function backToDetails(message: string | undefined): void {
    setFlow({ step: "details" });
    setOtp("");
    setError(message);
    setOtpError(undefined);
    setMoved(true);
  }

  function reset(): void {
    setLr("");
    setMobile("");
    backToDetails(undefined);
  }

  function handleLrChange(event: ChangeEvent<HTMLInputElement>): void {
    setLr(event.target.value);
    setLrError(undefined);
    setError(undefined);
  }

  function handleMobileChange(event: ChangeEvent<HTMLInputElement>): void {
    setMobile(event.target.value);
    setMobileError(undefined);
    setError(undefined);
  }

  function handleOtpChange(event: ChangeEvent<HTMLInputElement>): void {
    setOtp(normalizeOtp(event.target.value));
    setOtpError(undefined);
    setError(undefined);
  }

  /* ——— Step 1 → 2 ——— */
  async function handleSend(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy !== null) return;

    const lrCode = validateLr(lr);
    const mobileCode = validateMobile(mobile);
    setLrError(lrCode === null ? undefined : track.errors[lrCode]);
    setMobileError(mobileCode === null ? undefined : track.live.fieldErrors[mobileCode]);
    if (lrCode !== null || mobileCode !== null) return;

    setError(undefined);
    setBusy("send");
    const lrNumber = normalizeLr(lr);
    const result = await requestOtp(lrNumber, normalizePhone(mobile));
    setBusy(null);

    if (!result.ok) {
      setError(track.live.errors[result.error]);
      return;
    }
    const sentAt = Date.now();
    setNow(sentAt);
    setOtp("");
    setMoved(true);
    setFlow({
      step: "otp",
      lr: lrNumber,
      challenge: result.data,
      resendAt: sentAt + result.data.resendAfterSec * 1000,
      session: null,
    });
  }

  /* ——— Step 2 → 3 ——— */
  async function handleVerify(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy !== null || flow.step !== "otp") return;

    const otpCode = validateOtp(otp);
    setOtpError(otpCode === null ? undefined : track.live.fieldErrors[otpCode]);
    if (otpCode !== null) return;

    setError(undefined);
    setBusy("verify");

    let session = flow.session;
    if (session === null) {
      const verified = await verifyOtp(flow.challenge.requestId, normalizeOtp(otp));
      if (!verified.ok) {
        setBusy(null);
        if (RESTART_ERRORS.includes(verified.error)) {
          backToDetails(track.live.errors[verified.error]);
        } else {
          setError(track.live.errors[verified.error]);
        }
        return;
      }
      session = verified.data;
    }

    const found = await fetchLr(flow.lr, session);
    setBusy(null);
    if (!found.ok) {
      if (RESTART_ERRORS.includes(found.error)) {
        backToDetails(track.live.errors[found.error]);
        return;
      }
      /* The code is spent but the read failed: keep the session so the next
         press retries the read instead of asking for the code again. */
      setFlow({ ...flow, session });
      setError(track.live.errors[found.error]);
      return;
    }
    setFlow({ step: "result", record: found.data });
  }

  /* ——— Resend ——— */
  async function handleResend(): Promise<void> {
    if (busy !== null || flow.step !== "otp" || flow.resendAt > now) return;
    setError(undefined);
    setOtpError(undefined);
    setBusy("resend");
    const result = await requestOtp(flow.lr, normalizePhone(mobile));
    setBusy(null);

    if (!result.ok) {
      if (RESTART_ERRORS.includes(result.error)) {
        backToDetails(track.live.errors[result.error]);
      } else {
        setError(track.live.errors[result.error]);
      }
      return;
    }
    const sentAt = Date.now();
    setNow(sentAt);
    setOtp("");
    setFlow({
      step: "otp",
      lr: flow.lr,
      challenge: result.data,
      resendAt: sentAt + result.data.resendAfterSec * 1000,
      session: null,
    });
  }

  const alert =
    error === undefined ? null : (
      <p role="alert" className={ERROR_TEXT_CLASS}>
        {error}
      </p>
    );

  return (
    <AnimatePresence mode="wait" initial={false}>
      {flow.step === "details" && (
        <motion.form
          key="details"
          onSubmit={(event) => {
            void handleSend(event);
          }}
          noValidate
          className="flex flex-col gap-4"
          {...stepMotion}
        >
          {/* Two columns only where the card is wide enough for both labels on
              one line: the page card, not the narrower home hero column. */}
          <div className="@container">
            <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
              <TextField
                label={track.live.details.lrLabel}
                name="lr-number"
                value={lr}
                onChange={handleLrChange}
                placeholder={track.panel.placeholder}
                helper={track.panel.helper}
                error={lrError}
                className="uppercase"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                autoFocus={moved}
              />
              <TextField
                label={track.live.details.mobileLabel}
                name="mobile"
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={handleMobileChange}
                placeholder={track.live.details.mobilePlaceholder}
                helper={track.live.details.mobileHelper}
                error={mobileError}
                autoComplete="tel-national"
              />
            </div>
          </div>
          {alert}
          <Button
            type="submit"
            variant="outline"
            aria-disabled={busy !== null}
            className="w-full aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:w-auto sm:self-start"
          >
            {busy === "send" ? track.live.details.submitting : track.live.details.submit}
          </Button>
        </motion.form>
      )}

      {flow.step === "otp" && (
        <motion.form
          key="otp"
          onSubmit={(event) => {
            void handleVerify(event);
          }}
          noValidate
          className="flex flex-col gap-4"
          {...stepMotion}
        >
          <p className="text-ink-2 max-w-measure leading-body text-sm font-light">
            {sentLine(flow.lr, flow.challenge.maskedMobile)}
          </p>
          <div className="space-y-2">
            <Label htmlFor={otpId}>{track.live.otp.label}</Label>
            <Input
              id={otpId}
              name="otp"
              value={otp}
              onChange={handleOtpChange}
              placeholder={track.live.otp.placeholder}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              spellCheck={false}
              autoFocus
              aria-invalid={otpError !== undefined || undefined}
              aria-describedby={otpError !== undefined ? `${otpId}-error` : `${otpId}-helper`}
              className="font-mono tracking-[0.4em] sm:max-w-60"
            />
            {otpError !== undefined ? (
              <p id={`${otpId}-error`} role="alert" className={ERROR_TEXT_CLASS}>
                {otpError}
              </p>
            ) : (
              <p id={`${otpId}-helper`} className="text-muted text-xs font-light">
                {track.live.otp.helper}
              </p>
            )}
          </div>
          {alert}
          <Button
            type="submit"
            variant="outline"
            aria-disabled={busy !== null}
            className="w-full aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:w-auto sm:self-start"
          >
            {busy === "verify"
              ? flow.session === null
                ? track.live.otp.verifying
                : track.live.otp.fetching
              : track.live.otp.submit}
          </Button>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {flow.resendAt > now ? (
              <p className="text-muted font-mono text-[11px] tracking-[0.14em] uppercase">
                {track.live.otp.resendIn(Math.ceil((flow.resendAt - now) / 1000))}
              </p>
            ) : (
              <Button
                type="button"
                variant="link"
                size="sm"
                aria-disabled={busy !== null}
                className="px-0 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                onClick={() => {
                  void handleResend();
                }}
              >
                {busy === "resend" ? track.live.otp.resending : track.live.otp.resend}
              </Button>
            )}
            <Button
              type="button"
              variant="link"
              size="sm"
              aria-disabled={busy !== null}
              className="px-0 aria-disabled:pointer-events-none aria-disabled:opacity-50"
              onClick={() => {
                if (busy === null) backToDetails(undefined);
              }}
            >
              {track.live.otp.changeNumber}
            </Button>
          </div>
        </motion.form>
      )}

      {flow.step === "result" && <LrResult key="result" record={flow.record} onReset={reset} />}
    </AnimatePresence>
  );
}
