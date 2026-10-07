"use client";

/* DharmaShree network map: Maa Sheetla's India geometry + 78 hubs, rebuilt
   with a GSAP entrance, DrawSVG corridors and Motion finishing.
   - mode="hero": no filters, no panel. Hover/focus lights a hub's corridor
     (drawn once); an idle auto-cycle rotates 6 cross-region hubs every 4s.
   - mode="full": region chips, click/Enter/Space selection with a looping
     corridor, AnimatePresence side panel / bottom sheet, arrow-key travel.
   The active corridor is drawn with GSAP DrawSVG directly: P02's
   CorridorTrace is scroll-linked (wrong semantics for transient hover), so
   the map reuses its technique + `data-corridor-active` mirror instead. */

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { company } from "@/content/company";
import { HUBS, ORIGIN, REGIONS, type Hub, type RegionId } from "@/content/hubs";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { useMapSelection } from "./MapSelection";
import { getCorridorPath } from "./corridor";
import { INDIA_PATHS, INDIA_VIEWBOX, ISLET_MARKERS } from "./india-outline";

export interface IndiaNetworkMapProps {
  mode: "hero" | "full";
  hubs?: readonly Hub[];
  initialRegion?: RegionId | "all";
  onHubSelect?: (hub: Hub | null) => void;
  className?: string;
}

type RegionFilter = RegionId | "all";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatVerifiedOn(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined || Number.isNaN(y + m + d)) return iso;
  return `${String(d)} ${MONTHS[m - 1] ?? ""} ${String(y)}`.trim();
}

function distanceFromOrigin(hub: Hub): number {
  return Math.hypot(hub.x - ORIGIN.x, hub.y - ORIGIN.y);
}

const ARROW_VECTORS: Record<string, readonly [number, number]> = {
  ArrowRight: [1, 0],
  ArrowLeft: [-1, 0],
  ArrowDown: [0, 1],
  ArrowUp: [0, -1],
};

/* Nearest hub in an arrow direction: angle within ±45° (cos ≥ √½), then
   nearest by distance. SVG y grows downward, so ArrowDown is +y. */
function nearestInDirection(from: Hub, key: string, hubs: readonly Hub[]): Hub | null {
  const vec = ARROW_VECTORS[key];
  if (vec === undefined) return null;
  let best: Hub | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const hub of hubs) {
    if (hub.id === from.id) continue;
    const dx = hub.x - from.x;
    const dy = hub.y - from.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) continue;
    const cos = (dx * vec[0] + dy * vec[1]) / dist;
    if (cos >= Math.SQRT1_2 && dist < bestDist) {
      best = hub;
      bestDist = dist;
    }
  }
  return best;
}

interface HubNodeProps {
  hub: Hub;
  lit: boolean;
  selected: boolean;
  register: (el: SVGGElement | null) => void;
  onEnter: (id: string) => void;
  onLeave: () => void;
  onActivate: (id: string) => void;
  onArrow: (id: string, key: string) => void;
}

/* Memoised: only the lit/selected hubs re-render on hover or selection. */
const HubNode = memo(function HubNode({
  hub,
  lit,
  selected,
  register,
  onEnter,
  onLeave,
  onActivate,
  onArrow,
}: HubNodeProps) {
  const handleKeyDown = (event: ReactKeyboardEvent<SVGGElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate(hub.id);
      return;
    }
    if (event.key.startsWith("Arrow")) {
      event.preventDefault();
      onArrow(hub.id, event.key);
    }
  };
  const labelAnchor = hub.x > 600 ? "end" : "start";
  const labelX = hub.x + (labelAnchor === "end" ? -10 : 10);
  return (
    <g
      ref={register}
      role="button"
      tabIndex={0}
      data-hub={hub.id}
      data-region={hub.region}
      aria-label={`${hub.name}, ${hub.state}`}
      className="cursor-pointer outline-none"
      onMouseEnter={() => onEnter(hub.id)}
      onMouseLeave={onLeave}
      onFocus={() => onEnter(hub.id)}
      onBlur={onLeave}
      onClick={() => onActivate(hub.id)}
      onKeyDown={handleKeyDown}
    >
      <circle className="map-hit" cx={hub.x} cy={hub.y} r={14} fill="transparent" />
      <g data-hub-scale>
        <circle cx={hub.x} cy={hub.y} r={3} fill="var(--ink)" />
        <motion.circle
          cx={hub.x}
          cy={hub.y}
          r={7}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1}
          style={{ transformBox: "fill-box", transformOrigin: "center", pointerEvents: "none" }}
          initial={false}
          animate={lit ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
          transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
        />
      </g>
      {selected && (
        <text
          x={labelX}
          y={hub.y + 4}
          textAnchor={labelAnchor}
          fill="var(--muted)"
          className="label-caps"
          style={{ pointerEvents: "none" }}
        >
          {hub.name}
        </text>
      )}
    </g>
  );
});

export function IndiaNetworkMap({
  mode,
  hubs,
  initialRegion = "all",
  onHubSelect,
  className = "",
}: IndiaNetworkMapProps) {
  const reduced = useReducedMotionSafe();
  const [selectedId, select] = useMapSelection();
  const [region, setRegion] = useState<RegionFilter>(initialRegion);
  const [userActiveId, setUserActiveId] = useState<string | null>(null);
  const [cycleIdx, setCycleIdx] = useState(0);

  const hubsList = hubs ?? HUBS;
  const ordered = useMemo(
    () => [...hubsList].sort((a, b) => distanceFromOrigin(a) - distanceFromOrigin(b)),
    [hubsList],
  );
  const byId = useMemo(() => new Map(hubsList.map((hub) => [hub.id, hub])), [hubsList]);
  const paths = useMemo(() => {
    const map = new Map<string, string>();
    for (const hub of hubsList) map.set(hub.id, getCorridorPath(ORIGIN, hub));
    return map;
  }, [hubsList]);

  /* Six auto-cycle hubs across regions: nearest of each region, then the
     next-nearest overall. Deterministic, no per-frame React state. */
  const cyclePool = useMemo(() => {
    const pool: Hub[] = [];
    for (const entry of REGIONS) {
      if (entry.id === "all") continue;
      const first = ordered.find((hub) => hub.region === entry.id);
      if (first !== undefined) pool.push(first);
    }
    for (const hub of ordered) {
      if (pool.length >= 6) break;
      if (!pool.includes(hub)) pool.push(hub);
    }
    return pool;
  }, [ordered]);

  const isFull = mode === "full";
  const cycleId =
    !isFull && cyclePool.length > 0 ? (cyclePool[cycleIdx % cyclePool.length]?.id ?? null) : null;
  const activeId = isFull ? (selectedId ?? userActiveId) : (userActiveId ?? cycleId);
  const selected = isFull ? (selectedId === null ? null : (byId.get(selectedId) ?? null)) : null;

  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const activePathRef = useRef<SVGPathElement>(null);
  const breathRef = useRef<SVGCircleElement>(null);
  const hubEls = useRef(new Map<string, SVGGElement>());
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const loopTween = useRef<{ kill: () => void } | null>(null);
  const inViewRef = useRef(false);
  const lastInteractRef = useRef(0);
  const focusPanelRef = useRef(false);
  const noteId = useId();

  const markInteracted = useCallback((): void => {
    lastInteractRef.current = Date.now();
  }, []);

  /* Entrance: outline draws, fill fades, hubs pop in distance order, ghost
     corridors draw, origin breathing starts. Reduced: final state, no
     breathing, no ScrollTrigger. */
  useGSAP(
    () => {
      const svg = svgRef.current;
      if (svg === null) return;
      const outlines = svg.querySelectorAll<SVGPathElement>("[data-outline-path]");
      const hubScales = svg.querySelectorAll<SVGGElement>("[data-hub-scale]");
      const ghosts = svg.querySelectorAll<SVGPathElement>("[data-ghost]");
      for (const el of hubScales) gsap.set(el, { transformOrigin: "50% 50%" });
      if (reduced) {
        gsap.set(outlines, { drawSVG: "100%", fillOpacity: 1 });
        gsap.set(hubScales, { scale: 1, opacity: 1 });
        gsap.set(ghosts, { drawSVG: "100%" });
        return;
      }
      const breath = breathRef.current;
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: svg, start: "top 75%", once: true },
      });
      timeline
        .fromTo(
          outlines,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 1.6, ease: GSAP_EASES.draw },
        )
        .fromTo(outlines, { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.6 }, ">")
        .fromTo(
          hubScales,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: MOTION_DURATIONS.sm,
            ease: GSAP_EASES.reveal,
            stagger: 0.012,
          },
          ">",
        )
        .fromTo(
          ghosts,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.8, ease: GSAP_EASES.draw, stagger: 0.01 },
          ">",
        );
      if (breath !== null) {
        gsap.set(breath, { transformOrigin: "50% 50%" });
        timeline.add(() => {
          gsap.fromTo(
            breath,
            { scale: 1, opacity: 0.5 },
            { scale: 2.4, opacity: 0, duration: 3, repeat: -1, ease: "none" },
          );
        }, ">");
      }
    },
    { scope: svgRef, dependencies: [reduced, hubsList] },
  );

  /* Active corridor: selection > hover > auto-cycle. Full-mode selection
     loops its draw; everything else draws once. Reduced: instant. */
  useEffect(() => {
    const path = activePathRef.current;
    const svg = svgRef.current;
    if (path === null || svg === null) return;
    loopTween.current?.kill();
    loopTween.current = null;
    if (activeId === null) {
      gsap.set(path, { opacity: 0 });
      svg.setAttribute("data-corridor-active", "false");
      return;
    }
    const d = paths.get(activeId);
    if (d === undefined) return;
    path.setAttribute("d", d);
    svg.setAttribute("data-corridor-active", "true");
    if (reduced) {
      gsap.set(path, { drawSVG: "100%", opacity: 1 });
      return;
    }
    if (isFull && selectedId === activeId) {
      loopTween.current = gsap
        .timeline({ repeat: -1 })
        .fromTo(
          path,
          { drawSVG: "0%", opacity: 1 },
          { drawSVG: "100%", duration: 0.9, ease: GSAP_EASES.draw },
        )
        .to(path, { opacity: 0.2, duration: 0.6 }, "+=0.4");
    } else {
      gsap.fromTo(
        path,
        { drawSVG: "0%", opacity: 1 },
        { drawSVG: "100%", duration: 0.9, ease: GSAP_EASES.draw, overwrite: "auto" },
      );
    }
  }, [activeId, isFull, selectedId, paths, reduced]);

  /* Region dimming (full mode): non-matching hubs + ghosts to 0.15,
     matching to 1. Targets the outer hub <g>; the entrance owns the inner
     scale group, so the two never fight over one property. */
  useEffect(() => {
    if (!isFull) return;
    const svg = svgRef.current;
    if (svg === null) return;
    const show = (selector: string): void => {
      const els = svg.querySelectorAll<SVGElement>(selector);
      for (const el of els) {
        const match = region === "all" || el.getAttribute("data-region") === region;
        if (reduced) gsap.set(el, { opacity: match ? 1 : 0.15 });
        else gsap.to(el, { opacity: match ? 1 : 0.15, duration: 0.4, overwrite: "auto" });
      }
    };
    show("[data-hub]");
    show("[data-ghost]");
  }, [isFull, region, reduced, ordered]);

  /* Hero auto-cycle: 4s ticks, paused offscreen (IO) and for 10s after any
     interaction. Disabled under reduced motion. */
  useEffect(() => {
    if (isFull || reduced || cyclePool.length === 0) return;
    const tick = window.setInterval(() => {
      if (!inViewRef.current) return;
      if (Date.now() - lastInteractRef.current < 10_000) return;
      setCycleIdx((i) => (i + 1) % cyclePool.length);
    }, 4000);
    return () => window.clearInterval(tick);
  }, [isFull, reduced, cyclePool]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (wrap === null || isFull || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry?.isIntersecting ?? false;
      },
      { threshold: 0.2 },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [isFull, reduced]);

  /* Focus the panel heading when a selection originates from this map
     (never when it comes from the directory). */
  useEffect(() => {
    if (selectedId !== null && focusPanelRef.current) {
      focusPanelRef.current = false;
      panelHeadingRef.current?.focus({ preventScroll: true });
    }
  }, [selectedId]);

  useEffect(
    () => () => {
      loopTween.current?.kill();
    },
    [],
  );

  const registerHub = useCallback((el: SVGGElement | null): void => {
    if (el === null) return;
    const id = el.getAttribute("data-hub");
    if (id !== null) hubEls.current.set(id, el);
  }, []);

  const handleEnter = useCallback(
    (id: string): void => {
      markInteracted();
      setUserActiveId(id);
    },
    [markInteracted],
  );

  const handleLeave = useCallback((): void => {
    setUserActiveId(null);
  }, []);

  const clearSelection = useCallback((): void => {
    select(null);
    onHubSelect?.(null);
  }, [select, onHubSelect]);

  const handleActivate = useCallback(
    (id: string): void => {
      markInteracted();
      if (!isFull) {
        setUserActiveId(id);
        return;
      }
      focusPanelRef.current = true;
      if (selectedId === id) {
        clearSelection();
        return;
      }
      select(id);
      onHubSelect?.(byId.get(id) ?? null);
    },
    [isFull, markInteracted, selectedId, select, onHubSelect, byId, clearSelection],
  );

  const handleArrow = useCallback(
    (id: string, key: string): void => {
      markInteracted();
      const from = byId.get(id);
      if (from === undefined) return;
      const next = nearestInDirection(from, key, ordered);
      if (next !== null) hubEls.current.get(next.id)?.focus();
    },
    [markInteracted, byId, ordered],
  );

  const handleBackgroundClick = (event: ReactMouseEvent<SVGSVGElement>): void => {
    if (!isFull || selectedId === null) return;
    const target = event.target as Element | null;
    if (target !== null && target.closest("[data-hub]") === null) clearSelection();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Escape" && isFull && selectedId !== null) {
      event.stopPropagation();
      clearSelection();
      hubEls.current.get(selectedId)?.focus();
    }
  };

  const selectedRegionLabel =
    selected === null ? "" : (REGIONS.find((entry) => entry.id === selected.region)?.label ?? "");

  return (
    <div
      ref={wrapRef}
      className={`network-map ${className}`}
      onPointerMove={isFull ? undefined : markInteracted}
      onPointerDown={markInteracted}
      onWheel={isFull ? undefined : markInteracted}
      onKeyDown={handleKeyDown}
    >
      {isFull && (
        <div className="space-y-3">
          <div
            role="group"
            aria-label="Filter hubs by region"
            className="flex flex-wrap gap-x-6 gap-y-2"
          >
            {REGIONS.map((entry) => {
              const active = region === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRegion(entry.id)}
                  className={`relative min-h-[44px] py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors ${
                    active ? "text-accent font-medium" : "text-muted hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="region-pill"
                      className="bg-accent absolute inset-x-0 -bottom-px h-px"
                      transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
                    />
                  )}
                  <span className="relative">{entry.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-ink-2 text-sm font-light">
            Tap any hub to see its corridor from Surat.
          </p>
        </div>
      )}

      <div className={isFull ? "mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12" : ""}>
        <div className={isFull ? "lg:col-span-7" : ""}>
          <svg
            ref={svgRef}
            viewBox={INDIA_VIEWBOX}
            role="group"
            aria-label="DharmaShree Logistics network map from Surat"
            aria-describedby={noteId}
            data-corridor-active="false"
            className="network-map-svg"
            onClick={handleBackgroundClick}
          >
            <g className="outline">
              {INDIA_PATHS.map((d) => (
                <path
                  key={d.length}
                  d={d}
                  data-outline-path
                  fill="var(--paper-2)"
                  stroke="var(--line-strong)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                />
              ))}
              {ISLET_MARKERS.map(([x, y]) => (
                <circle key={`${x},${y}`} cx={x} cy={y} r={1.6} fill="var(--ink)" opacity={0.25} />
              ))}
            </g>
            <g className="corridors">
              {ordered.map((hub) => (
                <path
                  key={hub.id}
                  d={paths.get(hub.id)}
                  data-ghost
                  data-region={hub.region}
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth={1}
                  opacity={0.5}
                />
              ))}
              <path
                ref={activePathRef}
                data-active-corridor
                fill="none"
                stroke="var(--accent)"
                strokeWidth={2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={0}
                style={{ pointerEvents: "none" }}
              />
            </g>
            <g className="hubs">
              {ordered.map((hub) => (
                <HubNode
                  key={hub.id}
                  hub={hub}
                  lit={activeId === hub.id}
                  selected={selectedId === hub.id && isFull}
                  register={registerHub}
                  onEnter={handleEnter}
                  onLeave={handleLeave}
                  onActivate={handleActivate}
                  onArrow={handleArrow}
                />
              ))}
            </g>
            <g className="origin">
              <circle
                ref={breathRef}
                cx={ORIGIN.x}
                cy={ORIGIN.y}
                r={6}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={1}
                opacity={0}
                style={{ pointerEvents: "none" }}
              />
              <circle
                cx={ORIGIN.x}
                cy={ORIGIN.y}
                r={6}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={1}
              />
              <circle cx={ORIGIN.x} cy={ORIGIN.y} r={2} fill="var(--ink)" />
              <text
                x={ORIGIN.x - 10}
                y={ORIGIN.y + 3}
                textAnchor="end"
                fill="var(--muted)"
                className="label-caps"
                style={{ pointerEvents: "none" }}
              >
                SURAT
              </text>
            </g>
          </svg>
          <p id={noteId} className="sr-only">
            A list of all hubs is available below the map.
          </p>
        </div>

        {isFull && (
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {selected !== null && (
                <motion.aside
                  key={selected.id}
                  role="dialog"
                  aria-label={`Corridor to ${selected.name}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: MOTION_DURATIONS.sm, ease: MOTION_EASES.out }}
                  className="border-line bg-paper-2 border p-6 max-lg:fixed max-lg:inset-x-4 max-lg:bottom-4 max-lg:z-50 max-lg:shadow-[var(--shadow-card-lift)] sm:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="section-index">Corridor</p>
                      <h3
                        ref={panelHeadingRef}
                        tabIndex={-1}
                        className="font-display text-3xl font-light tracking-tight outline-none"
                      >
                        {selected.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        clearSelection();
                        hubEls.current.get(selected.id)?.focus();
                      }}
                      aria-label="Close corridor panel"
                      className="text-muted hover:text-ink flex min-h-[44px] min-w-[44px] items-center justify-center font-mono text-xs tracking-[0.14em] uppercase"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-ink-2 mt-3 text-sm font-light">
                    {selected.state} · {selectedRegionLabel}
                  </p>
                  <p className="label-caps mt-4">From Surat</p>
                  {selected.transitDays !== null && (
                    <p className="mt-2 text-sm font-light">
                      Transit {selected.transitDays.min}–{selected.transitDays.max} days
                    </p>
                  )}
                  {selected.verifiedOn !== null && (
                    <p className="text-muted mt-2 font-mono text-xs">
                      Verified {formatVerifiedOn(selected.verifiedOn)}
                    </p>
                  )}
                  <div className="mt-6 flex flex-col gap-3">
                    <Button asChild>
                      <Link href={`/quote?to=${selected.id}`}>
                        Request a quote to {selected.name}
                      </Link>
                    </Button>
                    {company.whatsapp !== null && (
                      <Button asChild variant="outline">
                        <a
                          href={`https://wa.me/${company.whatsapp.replace(/^\+/, "")}?text=${encodeURIComponent(
                            `Hello DharmaShree Logistics, I'd like a rate from Surat to ${selected.name}.`,
                          )}`}
                        >
                          Ask on WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
