"use client";

import { FileTextIcon, PackageSearchIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactElement } from "react";
import { heroTabs } from "@/content/home";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";

/* The notice the client writes in the admin panel (/admin › Announcement),
   shown as the top row of the home page's track card, above both tabs.

   A --brand-deep band so it reads as news, not as part of the form: an amber
   "New" tag (amber is for highlights, ink text on it — house rule 6), the
   notice in the display face, and two outline shortcuts that open the Track or
   Quote tab below (`onAction`). Outline, not filled: the page's two filled
   buttons are already spoken for.

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

export type AnnouncementAction = "track" | "quote";

interface AnnouncementBarProps {
  className?: string;
  /** Opens the matching tab of the card below. */
  onAction: (action: AnnouncementAction) => void;
}

const ACTIONS: readonly {
  id: AnnouncementAction;
  label: string;
  short: string;
  Icon: typeof PackageSearchIcon;
}[] = [
  { id: "track", ...heroTabs.announcementActions.track, Icon: PackageSearchIcon },
  { id: "quote", ...heroTabs.announcementActions.quote, Icon: FileTextIcon },
];

export function AnnouncementBar({ className, onAction }: AnnouncementBarProps): ReactElement {
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
          <div className="bg-brand-deep text-on-deep relative isolate px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {/* One hue only: a --brand glow in the corner of the --brand-deep band. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_160%_at_0%_0%,var(--brand)_0%,transparent_60%)]"
            />
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <div className="flex min-w-0 flex-col gap-2.5">
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className="relative flex size-2.5">
                    {!reduced && (
                      <motion.span
                        className="bg-signal-red absolute inset-0 rounded-full"
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{ scale: [1, 2.6], opacity: [0.7, 0] }}
                        transition={{
                          duration: MOTION_DURATIONS.xl,
                          ease: MOTION_EASES.out,
                          repeat: 3,
                          repeatDelay: 0.6,
                        }}
                      />
                    )}
                    <span className="bg-signal-red relative inline-block size-2.5 rounded-full" />
                  </span>
                  <span className="bg-highway text-ink rounded-2xs px-2 py-0.5 font-mono text-[11px] tracking-[0.14em] uppercase">
                    {heroTabs.announcementBadge}
                  </span>
                </span>
                <p className="font-display text-on-deep leading-headline tracking-display text-xl sm:text-2xl lg:text-step-3">
                  {text}
                </p>
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-3 lg:flex">
                {ACTIONS.map(({ id, label, short, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onAction(id);
                    }}
                    className="border-on-deep text-on-deep hover:bg-on-deep hover:text-brand-deep focus-visible:outline-on-deep inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xs border px-4 font-mono text-[11px] tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-200"
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
