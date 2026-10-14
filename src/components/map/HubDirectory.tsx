"use client";

/* Accessible alternative to the map: the same hubs as a state-by-state list.
   Each state is a collapsible panel (collapsed by default) whose header
   carries the state name and its hub count; inside, hubs are alphabetical.
   The region chips narrow which states are listed. Selecting a row selects
   the hub on the map when both share a MapSelectionProvider, and a hub
   selected on the map opens its state's panel and scrolls its row into view.

   The disclosure is a plain button with aria-expanded / aria-controls rather
   than Radix: Radix unmounts closed content, and this list is also the one
   place the hub names exist as crawlable HTML. Closed panels stay in the DOM
   with `hidden="until-found"`, so find-in-page still reaches them (and opens
   them, via `beforematch`). Motion owns the open fade; under reduced motion
   it resolves instantly. */

import { MinusIcon, PlusIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { HUBS, REGIONS, type Hub, type RegionId } from "@/content/hubs";
import { networkMap } from "@/content/network";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { formatNumberIN } from "@/lib/format";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { useMapSelection } from "./MapSelection";

interface HubDirectoryProps {
  hubs?: readonly Hub[];
  className?: string;
}

type RegionFilter = RegionId | "all";

interface StateGroup {
  id: string;
  label: string;
  hubs: Hub[];
}

const copy = networkMap.directory;

/* React's `hidden` prop is typed boolean-only, but the DOM takes the
   "until-found" keyword (closed yet findable). The string is what reaches
   the attribute, so the cast only widens React's type, never the value. */
const CLOSED_PANEL = "until-found" as unknown as boolean;

/* States in region order (so the chips and the list read the same way), then
   alphabetical; hubs alphabetical inside each state. */
function groupByState(hubs: readonly Hub[]): StateGroup[] {
  const regionRank = (region: RegionId): number =>
    REGIONS.findIndex((entry) => entry.id === region);
  const byState = new Map<string, StateGroup & { rank: number }>();
  for (const hub of hubs) {
    const group = byState.get(hub.stateId);
    if (group === undefined) {
      byState.set(hub.stateId, {
        id: hub.stateId,
        label: hub.state,
        hubs: [hub],
        rank: regionRank(hub.region),
      });
    } else {
      group.hubs.push(hub);
    }
  }
  return [...byState.values()]
    .sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label, "en-IN"))
    .map(({ id, label, hubs: members }) => ({
      id,
      label,
      hubs: [...members].sort((a, b) => a.name.localeCompare(b.name, "en-IN")),
    }));
}

export function HubDirectory({ hubs, className = "" }: HubDirectoryProps) {
  const hubsList = hubs ?? HUBS;
  const reduced = useReducedMotionSafe();
  const [selectedId, select] = useMapSelection();
  const [filter, setFilter] = useState<RegionFilter>("all");
  const [open, setOpen] = useState<readonly string[]>([]);
  const [syncedId, setSyncedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  const byId = useMemo(() => new Map(hubsList.map((hub) => [hub.id, hub])), [hubsList]);

  /* A hub selected anywhere (the map, the panel search) opens its state's
     panel, and clears a region chip that would hide it. Done while rendering,
     not in an effect, so the row exists in the same commit that scrolls to
     it. */
  if (selectedId !== syncedId) {
    setSyncedId(selectedId);
    const hub = selectedId === null ? undefined : byId.get(selectedId);
    if (hub !== undefined) {
      if (filter !== "all" && hub.region !== filter) setFilter("all");
      if (!open.includes(hub.stateId)) setOpen([...open, hub.stateId]);
    }
  }

  const groups = useMemo(
    () => groupByState(filter === "all" ? hubsList : hubsList.filter((h) => h.region === filter)),
    [hubsList, filter],
  );
  const visibleCount = groups.reduce((sum, group) => sum + group.hubs.length, 0);
  const allOpen = groups.length > 0 && groups.every((group) => open.includes(group.id));

  const toggleState = (id: string): void => {
    setOpen((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  };

  const toggleAll = (): void => {
    const ids = groups.map((group) => group.id);
    setOpen((current) =>
      allOpen
        ? current.filter((id) => !ids.includes(id))
        : [...current, ...ids.filter((id) => !current.includes(id))],
    );
  };

  /* Find-in-page matching text in a closed panel opens that panel. The
     event bubbles, so one listener on the list covers every panel. */
  useEffect(() => {
    const list = listRef.current;
    if (list === null) return;
    const onBeforeMatch = (event: Event): void => {
      const panel = (event.target as Element | null)?.closest<HTMLElement>("[data-state-panel]");
      const id = panel?.getAttribute("data-state-panel");
      if (id === null || id === undefined) return;
      setOpen((current) => (current.includes(id) ? current : [...current, id]));
    };
    list.addEventListener("beforematch", onBeforeMatch);
    return () => list.removeEventListener("beforematch", onBeforeMatch);
  }, []);

  /* Keep the selected row visible inside the directory's own scroll box
     (the home page clips it). Never `scrollIntoView`: that also scrolls the
     window, which yanked the page away from the map on every selection. */
  useEffect(() => {
    if (selectedId === null) return;
    const row = listRef.current?.querySelector<HTMLElement>(
      `[data-hub-row="${CSS.escape(selectedId)}"]`,
    );
    if (row === null || row === undefined) return;
    let box = row.parentElement;
    while (box !== null && box !== document.body) {
      const overflowY = getComputedStyle(box).overflowY;
      if ((overflowY === "auto" || overflowY === "scroll") && box.scrollHeight > box.clientHeight) {
        const rowBox = row.getBoundingClientRect();
        const boxRect = box.getBoundingClientRect();
        if (rowBox.top < boxRect.top) box.scrollTop -= boxRect.top - rowBox.top;
        else if (rowBox.bottom > boxRect.bottom) box.scrollTop += rowBox.bottom - boxRect.bottom;
        return;
      }
      box = box.parentElement;
    }
  }, [selectedId]);

  const toggleHub = (hub: Hub): void => {
    select(selectedId === hub.id ? null : hub.id);
  };

  return (
    <div className={className}>
      <div className="border-line flex items-center justify-between border-b pb-2.5 font-mono text-[10px] tracking-[0.2em] uppercase">
        <span className="text-muted">{copy.title(formatNumberIN(visibleCount))}</span>
        <span className="text-muted">{networkMap.panel.distanceLabel}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 pt-3">
        <div role="group" aria-label={copy.filterLabel} className="flex flex-wrap gap-x-5 gap-y-1">
          {REGIONS.map((entry) => {
            const active = filter === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(entry.id)}
                className={`min-h-[44px] py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors ${
                  active ? "text-brand font-medium" : "text-muted hover:text-ink"
                }`}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="text-brand min-h-[44px] py-2 font-mono text-[11px] tracking-[0.14em] uppercase underline-offset-4 hover:underline"
        >
          {allOpen ? copy.collapseAll : copy.expandAll}
        </button>
      </div>

      <div ref={listRef} role="group" aria-label={copy.statesLabel} className="mt-2">
        {groups.map((group) => {
          const isOpen = open.includes(group.id);
          const holdsSelection = group.hubs.some((hub) => hub.id === selectedId);
          const triggerId = `${uid}-trigger-${group.id}`;
          const panelId = `${uid}-panel-${group.id}`;
          return (
            <section key={group.id} className="border-line border-b first:border-t">
              <h3>
                <button
                  id={triggerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleState(group.id)}
                  className="group/state flex min-h-14 w-full items-center justify-between gap-4 rounded-xs py-3 text-left"
                >
                  <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span
                      className={`font-display text-lg transition-colors ${
                        holdsSelection ? "text-brand" : "text-ink group-hover/state:text-brand"
                      }`}
                    >
                      {group.label}
                    </span>
                    <span className="text-muted font-mono text-[11px] tracking-[0.08em]">
                      {copy.stateCount(formatNumberIN(group.hubs.length), group.hubs.length)}
                    </span>
                  </span>
                  {isOpen ? (
                    <MinusIcon aria-hidden="true" className="text-brand size-4 shrink-0" />
                  ) : (
                    <PlusIcon aria-hidden="true" className="text-brand size-4 shrink-0" />
                  )}
                </button>
              </h3>
              <div
                id={panelId}
                data-state-panel={group.id}
                hidden={isOpen ? undefined : CLOSED_PANEL}
              >
                <motion.div
                  initial={false}
                  animate={{ opacity: isOpen ? 1 : 0 }}
                  transition={{
                    duration: reduced ? 0 : MOTION_DURATIONS.xs,
                    ease: MOTION_EASES.out,
                  }}
                >
                  <ul className="divide-y divide-[var(--line)] pb-2">
                    {group.hubs.map((hub) => {
                      const selected = selectedId === hub.id;
                      return (
                        <li key={hub.id}>
                          <button
                            type="button"
                            data-hub-row={hub.id}
                            aria-current={selected ? "true" : undefined}
                            onClick={() => toggleHub(hub)}
                            className={`flex w-full items-center justify-between gap-4 py-3 text-left transition-colors ${
                              selected ? "text-brand" : "text-ink hover:text-brand"
                            }`}
                          >
                            <span>
                              <span className="font-display block text-lg">{hub.name}</span>
                              <span className="text-muted block text-xs font-light">
                                {hub.state}
                              </span>
                            </span>
                            <span className="shrink-0 text-right font-mono text-[11px]">
                              {hub.transitDays !== null && (
                                <span className="text-brand block">
                                  {networkMap.panel.transit(
                                    hub.transitDays.min,
                                    hub.transitDays.max,
                                  )}
                                </span>
                              )}
                              {hub.verifiedOn !== null && (
                                <span className="text-muted block">{copy.verified}</span>
                              )}
                              <span className="text-muted block">
                                {networkMap.panel.distanceValue(formatNumberIN(hub.distanceKm))}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
