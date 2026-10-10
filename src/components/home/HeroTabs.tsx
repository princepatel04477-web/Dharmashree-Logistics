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

   On phones the tabs are a row above the panel. From `lg` the card is a wide bar
   that overlaps the foot of the hero: the tabs stack in a left column, the
   panel runs horizontally, and both panels share one grid cell so the bar keeps
   the same height on either tab. Motion owns the active-tab marker (`layoutId`):
   an underline on phones, a bar on the column's inner edge from `lg`; under
   reduced motion it moves instantly. */

type TabId = "track" | "quote";

const TABS: readonly { id: TabId; label: string }[] = [
  { id: "track", label: heroTabs.track.label },
  { id: "quote", label: heroTabs.quote.label },
];

function QuoteLaneForm() {
  const listId = useId();
  const hubNames = HUBS.map((hub) => hub.name);

  return (
    <form
      action="/quote/"
      method="get"
      className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-x-5"
    >
      <p className="text-ink/75 max-w-measure leading-body text-sm font-light lg:col-span-2">
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
      <Button type="submit" variant="outline" className="w-full sm:w-auto sm:self-start lg:self-end">
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
    <div className="bg-paper shadow-card-lift overflow-hidden rounded-md lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]">
      <div
        role="tablist"
        aria-label={heroTabs.ariaLabel}
        className="border-line lg:bg-paper-2 grid grid-cols-2 border-b lg:grid-cols-1 lg:content-start lg:border-r lg:border-b-0"
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
                "relative h-14 cursor-pointer font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200 focus-visible:-outline-offset-4 lg:px-6 lg:text-left",
                selected ? "text-brand" : "text-ink/70 hover:text-ink",
              )}
            >
              {tab.label}
              {selected && (
                <motion.span
                  layoutId={`${baseId}-underline`}
                  aria-hidden="true"
                  className="bg-brand absolute inset-x-0 -bottom-px h-0.5 lg:inset-x-auto lg:inset-y-0 lg:-right-px lg:h-auto lg:w-0.5"
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

      <div className="lg:grid">
        <div
          role="tabpanel"
          id={panelId("track")}
          aria-labelledby={tabId("track")}
          hidden={active !== "track"}
          /* On phones the card is narrow, so the two portal buttons stack and
             the track field sits above them. From `lg` TrackPanel's root becomes
             two columns (the field, then the sign-in links under a vertical
             hairline). TrackPanel itself is unchanged; the layout is applied
             from here. */
          className={cn(
            "p-5 sm:p-6 [&_ul]:grid-cols-1 lg:block lg:p-7 lg:[grid-area:1/1]",
            "lg:[&>div]:grid lg:[&>div]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:[&>div]:gap-x-8 lg:[&>div]:gap-y-4",
            "lg:[&>div>div:last-child]:col-start-2 lg:[&>div>div:last-child]:row-span-3 lg:[&>div>div:last-child]:row-start-1 lg:[&>div>div:last-child]:mt-0 lg:[&>div>div:last-child]:border-t-0 lg:[&>div>div:last-child]:border-l lg:[&>div>div:last-child]:pt-0 lg:[&>div>div:last-child]:pl-8",
            active !== "track" && "lg:invisible",
          )}
        >
          <TrackPanel context="hero" />
        </div>
        <div
          role="tabpanel"
          id={panelId("quote")}
          aria-labelledby={tabId("quote")}
          hidden={active !== "quote"}
          className={cn(
            "p-5 sm:p-6 lg:block lg:p-7 lg:[grid-area:1/1]",
            active !== "quote" && "lg:invisible",
          )}
        >
          <QuoteLaneForm />
        </div>
      </div>
    </div>
  );
}
