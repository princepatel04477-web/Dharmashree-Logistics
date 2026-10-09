"use client";

/* The full-mode side panel. Idle, it is the map's index: a city search and
   the region breakdown. With a hub selected it becomes the corridor card.
   Motion owns the cross-fade between the two (AnimatePresence, one keyed
   child); nothing here is touched by GSAP. */

import { ArrowLeftIcon, ArrowRightIcon, SearchIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useId, useMemo, useState, type Ref } from "react";
import { Button } from "@/components/ui/button";
import { REGIONS, type Hub, type RegionId } from "@/content/hubs";
import { whatsappLink } from "@/content/navigation";
import { networkMap } from "@/content/network";
import { formatDateIN, formatNumberIN } from "@/lib/format";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";

type RegionFilter = RegionId | "all";

const MAX_RESULTS = 6;

interface MapPanelProps {
  hubs: readonly Hub[];
  selected: Hub | null;
  region: RegionFilter;
  headingRef: Ref<HTMLHeadingElement>;
  onRegion: (region: RegionFilter) => void;
  onSelect: (id: string) => void;
  onPreview: (id: string | null) => void;
  onClose: () => void;
}

function regionLabel(id: RegionId): string {
  return REGIONS.find((entry) => entry.id === id)?.label ?? "";
}

/* Name matches first (word-start before substring), then state matches. */
function searchHubs(hubs: readonly Hub[], query: string): Hub[] {
  const q = query.trim().toLocaleLowerCase("en-IN");
  if (q === "") return [];
  const score = (hub: Hub): number => {
    const name = hub.name.toLocaleLowerCase("en-IN");
    if (name.startsWith(q)) return 0;
    if (name.split(/[\s(]+/).some((word) => word.startsWith(q))) return 1;
    if (name.includes(q)) return 2;
    if (hub.state.toLocaleLowerCase("en-IN").includes(q)) return 3;
    return -1;
  };
  return hubs
    .map((hub) => ({ hub, rank: score(hub) }))
    .filter((entry) => entry.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.hub.name.localeCompare(b.hub.name, "en-IN"))
    .map((entry) => entry.hub);
}

export function MapPanel({
  hubs,
  selected,
  region,
  headingRef,
  onRegion,
  onSelect,
  onPreview,
  onClose,
}: MapPanelProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {selected === null ? (
        <motion.div
          key="overview"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
        >
          <Overview
            hubs={hubs}
            region={region}
            onRegion={onRegion}
            onSelect={onSelect}
            onPreview={onPreview}
          />
        </motion.div>
      ) : (
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
        >
          <Corridor hub={selected} headingRef={headingRef} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ——— Idle: search + regions ——— */

interface OverviewProps {
  hubs: readonly Hub[];
  region: RegionFilter;
  onRegion: (region: RegionFilter) => void;
  onSelect: (id: string) => void;
  onPreview: (id: string | null) => void;
}

function Overview({ hubs, region, onRegion, onSelect, onPreview }: OverviewProps) {
  const copy = networkMap.overview;
  const [query, setQuery] = useState("");
  const inputId = useId();
  const resultsId = useId();
  const results = useMemo(() => searchHubs(hubs, query), [hubs, query]);
  const shown = results.slice(0, MAX_RESULTS);
  const trimmed = query.trim();

  const regionRows = useMemo(() => {
    const rows = REGIONS.filter(
      (entry): entry is { id: RegionId; label: string } => entry.id !== "all",
    ).map((entry) => ({
      id: entry.id,
      label: entry.label,
      count: hubs.filter((hub) => hub.region === entry.id).length,
    }));
    const max = Math.max(1, ...rows.map((row) => row.count));
    return rows.map((row) => ({ ...row, share: row.count / max }));
  }, [hubs]);

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-3">
        <p className="section-index">{copy.eyebrow}</p>
        <h3 className="font-display text-ink text-3xl leading-tight tracking-tight">
          {copy.title(hubs.length)}
        </h3>
        <p className="text-ink-2 leading-body max-w-measure text-sm font-light">{copy.body}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor={inputId} className="label-caps block">
          {copy.searchLabel}
        </label>
        <div className="relative">
          <SearchIcon
            aria-hidden="true"
            className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <input
            id={inputId}
            type="search"
            value={query}
            autoComplete="off"
            spellCheck={false}
            placeholder={copy.searchPlaceholder}
            aria-controls={resultsId}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              const first = shown[0];
              if (event.key === "Enter" && first !== undefined) {
                event.preventDefault();
                onSelect(first.id);
              }
              if (event.key === "Escape" && query !== "") {
                event.stopPropagation();
                setQuery("");
              }
            }}
            className="border-line-strong bg-paper-2 text-ink placeholder:text-muted/70 focus-visible:border-accent h-11 w-full rounded-xs border pr-3 pl-9 text-sm font-light transition-colors duration-200 [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>
        <div id={resultsId} aria-live="polite">
          {trimmed !== "" && shown.length > 0 && (
            <ul
              aria-label={copy.resultsLabel}
              className="divide-line border-line divide-y border-b"
            >
              {shown.map((hub) => (
                <li key={hub.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(hub.id)}
                    onPointerEnter={() => onPreview(hub.id)}
                    onPointerLeave={() => onPreview(null)}
                    onFocus={() => onPreview(hub.id)}
                    onBlur={() => onPreview(null)}
                    className="group/result hover:text-accent-ink flex min-h-11 w-full items-center justify-between gap-4 py-2 text-left transition-colors"
                  >
                    <span>
                      <span className="font-display block text-lg leading-tight">{hub.name}</span>
                      <span className="text-muted block text-xs font-light">{hub.state}</span>
                    </span>
                    <ArrowRightIcon
                      aria-hidden="true"
                      className="text-accent size-4 shrink-0 transition-transform duration-200 group-hover/result:translate-x-0.5"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {trimmed !== "" && shown.length === 0 && (
            <p className="text-ink-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1 text-sm font-light">
              <span>{copy.noMatch(trimmed)}</span>
              <Link
                href="/quote"
                className="text-accent-ink font-mono text-[11px] tracking-[0.14em] uppercase underline-offset-4 hover:underline"
              >
                {copy.noMatchAction}
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="label-caps">{copy.regionsTitle}</p>
        <ul className="divide-line border-line divide-y border-y">
          {regionRows.map((row) => {
            const active = region === row.id;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onRegion(active ? "all" : row.id)}
                  className={`group/region flex min-h-12 w-full flex-col justify-center gap-2 py-2.5 text-left transition-colors ${
                    active ? "text-accent-ink" : "text-ink hover:text-accent-ink"
                  }`}
                >
                  <span className="flex w-full items-baseline justify-between gap-4">
                    <span className="text-sm">{row.label}</span>
                    <span className="text-muted font-mono text-[11px] tracking-[0.08em]">
                      {copy.regionCount(row.count)}
                    </span>
                  </span>
                  <span aria-hidden="true" className="bg-line relative block h-px w-full">
                    <span
                      className={`absolute inset-y-0 left-0 block origin-left transition-colors ${
                        active ? "bg-accent" : "bg-ink-2/50 group-hover/region:bg-accent"
                      }`}
                      style={{ width: `${String(Math.round(row.share * 100))}%` }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ——— Selected: the corridor card ——— */

interface CorridorProps {
  hub: Hub;
  headingRef: Ref<HTMLHeadingElement>;
  onClose: () => void;
}

function Corridor({ hub, headingRef, onClose }: CorridorProps) {
  const copy = networkMap.panel;
  const wa = whatsappLink(copy.whatsappMessage(hub.name));

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between gap-4">
        <p className="section-index">{copy.eyebrow}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.closeLabel}
          className="group/back text-muted hover:text-ink -mr-2 inline-flex min-h-11 items-center gap-2 px-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors"
        >
          <ArrowLeftIcon
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover/back:-translate-x-0.5"
          />
          {copy.backLabel}
        </button>
      </div>

      <div className="space-y-2">
        <p className="label-caps">{copy.route}</p>
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-ink text-4xl leading-none tracking-tight outline-none"
        >
          {hub.name}
        </h3>
        <p className="text-ink-2 pt-1 text-sm font-light">
          {hub.state === regionLabel(hub.region)
            ? hub.state
            : `${hub.state} · ${regionLabel(hub.region)}`}
        </p>
        {hub.primary && (
          <p className="text-accent-ink border-accent mt-3 inline-block border-l pl-2.5 font-mono text-[10px] tracking-[0.18em] uppercase">
            {copy.primaryTag}
          </p>
        )}
      </div>

      <dl className="border-line divide-line divide-y border-y">
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="label-caps">{copy.distanceLabel}</dt>
          <dd className="text-ink font-mono text-sm">
            {copy.distanceValue(formatNumberIN(hub.distanceKm))}
          </dd>
        </div>
        {hub.transitDays !== null && (
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="label-caps">{copy.transitLabel}</dt>
            <dd className="text-ink font-mono text-sm">
              {copy.transit(hub.transitDays.min, hub.transitDays.max)}
            </dd>
          </div>
        )}
      </dl>
      {hub.verifiedOn !== null && (
        <p className="text-muted -mt-4 font-mono text-xs">
          {copy.verified(formatDateIN(hub.verifiedOn))}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Button asChild variant="outline">
          <Link href={`/quote?to=${hub.id}`}>{copy.quote(hub.name)}</Link>
        </Button>
        {wa !== null && (
          <Button asChild variant="ghost">
            <a href={wa}>{copy.whatsapp}</a>
          </Button>
        )}
      </div>
    </div>
  );
}
