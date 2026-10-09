"use client";

import { ArrowRightIcon } from "lucide-react";
import { motion } from "motion/react";
import {
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
} from "react";
import { TrackPanel } from "@/components/track/TrackPanel";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/vendor/origin";
import { company } from "@/content/company";
import { heroTabs } from "@/content/home";
import { HUBS } from "@/content/hubs";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

/* The card beside the hero text: "Track shipment" and "Get a quote".

   Both panels stay mounted (the inactive one is `hidden`), so a number typed in
   the Track tab is still there after a visit to the Quote tab. The Track tab is
   the shared `TrackPanel`, unchanged. The Quote tab is a plain GET form to
   `/quote/`: the lane travels as `?from=` and `?to=`, which the quote form reads
   on mount (`resolveQuoteEntry`), and it works as a full page load with no
   client state to go stale.

   Motion owns the active-tab underline (`layoutId`); under reduced motion it
   moves instantly. */

type TabId = "track" | "quote";

const TABS: readonly { id: TabId; label: string }[] = [
  { id: "track", label: heroTabs.track.label },
  { id: "quote", label: heroTabs.quote.label },
];

function QuoteLaneForm() {
  const listId = useId();
  const hubNames = HUBS.map((hub) => hub.name);

  return (
    <form action="/quote/" method="get" className="flex flex-col gap-5">
      <p className="text-ink/75 max-w-measure leading-body text-sm font-light">
        {heroTabs.quote.intro}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label={heroTabs.quote.fromLabel}
          name="from"
          defaultValue={company.headquarters.city}
          placeholder={heroTabs.quote.fromPlaceholder}
          autoComplete="address-level2"
        />
        <TextField
          label={heroTabs.quote.toLabel}
          name="to"
          list={listId}
          placeholder={heroTabs.quote.toPlaceholder}
          autoComplete="off"
        />
      </div>
      <datalist id={listId} aria-label={heroTabs.quote.hubListLabel}>
        {hubNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <Button type="submit" variant="outline" className="w-full sm:w-auto sm:self-start">
        {heroTabs.quote.submitLabel}
        <ArrowRightIcon aria-hidden="true" />
      </Button>
    </form>
  );
}

export function HeroTabs(): ReactElement {
  const reduced = useReducedMotionSafe();
  const baseId = useId();
  const [active, setActive] = useState<TabId>("track");
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ track: null, quote: null });

  function select(next: TabId): void {
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number): void {
    const last = TABS.length - 1;
    let target: number | null = null;
    if (event.key === "ArrowRight") target = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") target = index === 0 ? last : index - 1;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = last;
    if (target === null) return;
    const next = TABS[target];
    if (next === undefined) return;
    event.preventDefault();
    select(next.id);
  }

  const tabId = (id: TabId): string => `${baseId}-tab-${id}`;
  const panelId = (id: TabId): string => `${baseId}-panel-${id}`;

  return (
    <div className="bg-paper shadow-card overflow-hidden rounded-md">
      <div
        role="tablist"
        aria-label={heroTabs.ariaLabel}
        className="border-line grid grid-cols-2 border-b"
      >
        {TABS.map((tab, index) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[tab.id] = node;
              }}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              aria-selected={selected}
              aria-controls={panelId(tab.id)}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                setActive(tab.id);
              }}
              onKeyDown={(event) => {
                handleKeyDown(event, index);
              }}
              className={cn(
                "relative h-14 cursor-pointer font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200 focus-visible:-outline-offset-4",
                selected ? "text-brand" : "text-ink/70 hover:text-ink",
              )}
            >
              {tab.label}
              {selected && (
                <motion.span
                  layoutId={`${baseId}-underline`}
                  aria-hidden="true"
                  className="bg-brand absolute inset-x-0 -bottom-px h-0.5"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: MOTION_DURATIONS.sm, ease: MOTION_EASES.out }
                  }
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId("track")}
        aria-labelledby={tabId("track")}
        hidden={active !== "track"}
        /* The card is narrower than the panel's two-column login row needs, so
           the two portal buttons stack here (TrackPanel itself is unchanged). */
        className="p-5 sm:p-6 [&_ul]:grid-cols-1"
      >
        <TrackPanel />
      </div>
      <div
        role="tabpanel"
        id={panelId("quote")}
        aria-labelledby={tabId("quote")}
        hidden={active !== "quote"}
        className="p-5 sm:p-6"
      >
        <QuoteLaneForm />
      </div>
    </div>
  );
}
