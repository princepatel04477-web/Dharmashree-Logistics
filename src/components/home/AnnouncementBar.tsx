"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactElement } from "react";
import { heroTabs } from "@/content/home";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";

/* The notice the client writes in the admin panel (/admin › Announcement),
   shown as the top row of the home page's track card, above both tabs.

   Read at runtime from /api/announcement (functions/api/announcement.ts), so an
   edit shows within about a minute with no rebuild. Nothing is shown while it
   loads, when it is switched off, or when the call fails — the card simply has
   no bar. Motion owns the bar's arrival (instant under reduced motion). The red
   dot is a status mark, the one use `--signal-red` is for (house rule 6). */

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

export function AnnouncementBar({ className }: { className?: string }): ReactElement {
  const reduced = useReducedMotionSafe();
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/announcement", { signal: controller.signal });
        if (!response.ok) return;
        const announcement = readAnnouncement((await response.json()) as unknown);
        if (announcement !== null && announcement.active && announcement.text.trim() !== "") {
          setText(announcement.text.trim());
        }
      } catch {
        /* Offline, aborted, or no API in this environment: no bar. */
      }
    })();
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <AnimatePresence initial={false}>
      {text !== null && (
        <motion.aside
          key="announcement"
          aria-label={heroTabs.announcementLabel}
          initial={reduced ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: reduced ? 0 : MOTION_DURATIONS.sm, ease: MOTION_EASES.out }}
          className={className}
        >
          <p className="bg-brand-tint border-line text-ink leading-body flex items-start gap-3 border-b px-5 py-3 text-sm sm:px-6 lg:px-7">
            <span
              aria-hidden="true"
              className="bg-signal-red mt-[0.45em] inline-block size-2 shrink-0 rounded-full"
            />
            <span>{text}</span>
          </p>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
