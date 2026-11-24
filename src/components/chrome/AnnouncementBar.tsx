"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { announcement } from "@/content/navigation";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS, MOTION_EASES, MOTION_STAGGER } from "@/lib/motion-tokens";

/* The notice the client writes in the admin panel (/admin › Announcement): a
   slim --brand-deep strip across the full width of every page, just under the
   header.

   Read at runtime from /api/announcement (functions/api/announcement.ts), so an
   edit shows within about a minute with no rebuild. Nothing is shown while it
   loads, when it is switched off, or when the call fails.

   Animation owners (house rule 8): Motion opens the strip (AnimatePresence) and
   keeps the red status dot blinking and rippling to draw the eye; GSAP reveals the notice word by word
   under a mask, then reverts the split so the text reflows normally. The strip
   lives in the root layout, so it reveals once per visit, not on every route.
   Reduced motion: the strip and its text simply appear. The amber tag is a
   highlight with ink text, the red dot a status mark (house rule 6). */

interface Announcement {
  active: boolean;
  text: string;
}

function readAnnouncement(value: unknown): Announcement | null {
  if (typeof value !== "object" || value === null) return null;
  const { active, text } = value as Record<string, unknown>;
  if (typeof active !== "boolean" || typeof text !== "string") return null;
  return { active, text };
}

export function AnnouncementBar(): ReactElement {
  const reduced = useReducedMotionSafe();
  const [text, setText] = useState<string | null>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/announcement", { signal: controller.signal });
        if (!response.ok) return;
        const notice = readAnnouncement((await response.json()) as unknown);
        if (notice !== null && notice.active && notice.text.trim() !== "") {
          setText(notice.text.trim());
        }
      } catch {
        /* Offline, aborted, or no API in this environment: no strip. */
      }
    })();
    return () => {
      controller.abort();
    };
  }, []);

  useGSAP(
    () => {
      const node = textRef.current;
      if (reduced || node === null || text === null) return;
      const split = new SplitText(node, { type: "words", mask: "words" });
      gsap.from(split.words, {
        yPercent: 110,
        duration: MOTION_DURATIONS.md,
        ease: GSAP_EASES.reveal,
        stagger: MOTION_STAGGER.words,
        delay: MOTION_DURATIONS.xs,
        onComplete: () => {
          split.revert();
        },
      });
      return () => {
        split.revert();
      };
    },
    { dependencies: [reduced, text] },
  );

  return (
    <AnimatePresence initial={false}>
      {text !== null && (
        <motion.aside
          key="announcement"
          aria-label={announcement.label}
          initial={reduced ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: reduced ? 0 : MOTION_DURATIONS.sm, ease: MOTION_EASES.out }}
          className="overflow-hidden"
        >
          <div className="bg-brand-deep text-on-deep border-on-deep-line relative isolate border-b">
            {/* One hue only: a --brand glow at the strip's leading edge. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_220%_at_0%_50%,var(--brand)_0%,transparent_70%)]"
            />
            <div className="wrap flex items-center py-2.5">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span aria-hidden="true" className="relative flex size-2 shrink-0">
                  {!reduced && (
                    <motion.span
                      className="bg-signal-red absolute inset-0 rounded-full"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ scale: [1, 2.8], opacity: [0.7, 0] }}
                      transition={{
                        duration: MOTION_DURATIONS.lg,
                        ease: MOTION_EASES.out,
                        repeat: Infinity,
                        repeatDelay: MOTION_DURATIONS.lg,
                      }}
                    />
                  )}
                  {/* The dot itself blinks for as long as the strip is up; one
                      blink per ripple half-cycle so the two stay in step. */}
                  <motion.span
                    className="bg-signal-red relative inline-block size-2 rounded-full"
                    animate={reduced ? { opacity: 1 } : { opacity: [1, 0.15, 1] }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: MOTION_DURATIONS.lg, ease: MOTION_EASES.inOut, repeat: Infinity }
                    }
                  />
                </span>
                <span className="bg-highway text-ink rounded-2xs shrink-0 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase">
                  {announcement.badge}
                </span>
                <p
                  ref={textRef}
                  className="font-display text-on-deep leading-headline min-w-0 text-sm sm:text-base"
                >
                  {text}
                </p>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
