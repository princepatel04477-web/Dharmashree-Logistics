"use client";

/* Accessible alternative to the map: the same hubs as a filterable list
   grouped by region, alphabetical within each group. Selecting a row
   selects the hub on the map when both share a MapSelectionProvider. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HUBS, REGIONS, type Hub, type RegionId } from "@/content/hubs";
import { networkMap } from "@/content/network";
import { formatNumberIN } from "@/lib/format";
import { useMapSelection } from "./MapSelection";

interface HubDirectoryProps {
  hubs?: readonly Hub[];
  className?: string;
}

export function HubDirectory({ hubs, className = "" }: HubDirectoryProps) {
  const hubsList = hubs ?? HUBS;
  const [selectedId, select] = useMapSelection();
  const [filter, setFilter] = useState<RegionId | "all">("all");
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());

  const groups = useMemo(() => {
    const filtered = filter === "all" ? hubsList : hubsList.filter((hub) => hub.region === filter);
    return REGIONS.filter((entry) => entry.id !== "all")
      .map((entry) => ({
        id: entry.id,
        label: entry.label,
        hubs: filtered
          .filter((hub) => hub.region === entry.id)
          .sort((a, b) => a.name.localeCompare(b.name, "en-IN")),
      }))
      .filter((group) => group.hubs.length > 0);
  }, [hubsList, filter]);

  const visibleCount = groups.reduce((sum, group) => sum + group.hubs.length, 0);

  /* Keep the selected row visible inside the directory's own scroll box
     (the home page clips it). Never `scrollIntoView`: that also scrolls the
     window, which yanked the page away from the map on every selection. */
  useEffect(() => {
    if (selectedId === null) return;
    const row = rowRefs.current.get(selectedId);
    if (row === undefined) return;
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

  const registerRow = useCallback((el: HTMLButtonElement | null): void => {
    if (el === null) return;
    const id = el.getAttribute("data-hub-row");
    if (id !== null) rowRefs.current.set(id, el);
  }, []);

  const toggle = (hub: Hub): void => {
    select(selectedId === hub.id ? null : hub.id);
  };

  return (
    <div className={className}>
      <div className="border-line flex items-center justify-between border-b pb-2.5 font-mono text-[10px] tracking-[0.2em] uppercase">
        <span className="text-muted">Active Network ({visibleCount} hubs)</span>
        <span className="text-muted">{networkMap.panel.distanceLabel}</span>
      </div>

      <div
        role="group"
        aria-label="Filter directory by region"
        className="flex flex-wrap gap-x-5 gap-y-1 pt-3"
      >
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

      <div className="mt-2 space-y-8">
        {groups.map((group) => (
          <section key={group.id} aria-label={group.label}>
            <p className="section-index">{group.label}</p>
            <ul className="mt-3 divide-y divide-[var(--line)]">
              {group.hubs.map((hub) => {
                const selected = selectedId === hub.id;
                return (
                  <li key={hub.id}>
                    <button
                      ref={registerRow}
                      type="button"
                      data-hub-row={hub.id}
                      aria-current={selected ? "true" : undefined}
                      onClick={() => toggle(hub)}
                      className={`flex w-full items-center justify-between gap-4 py-3 text-left transition-colors ${
                        selected ? "text-brand" : "text-ink hover:text-brand"
                      }`}
                    >
                      <span>
                        <span className="font-display block text-lg">{hub.name}</span>
                        <span className="text-muted block text-xs font-light">{hub.state}</span>
                      </span>
                      <span className="shrink-0 text-right font-mono text-[11px]">
                        {hub.transitDays !== null && (
                          <span className="text-brand block">
                            {hub.transitDays.min}–{hub.transitDays.max} days
                          </span>
                        )}
                        {hub.verifiedOn !== null && (
                          <span className="text-muted block">Verified</span>
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
          </section>
        ))}
      </div>
    </div>
  );
}
