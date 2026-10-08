"use client";

/* DharmaShree network map: Maa Sheetla's India geometry (nation outline
   verbatim, state layer simplified) with every hub laid out from Surat.

   Two layers share one coordinate system. The SVG carries the geography and
   the corridors; an HTML overlay carries the hub pins, labels and callout,
   positioned from the same viewBox through CSS custom properties on the
   stage. That split is what lets a region zoom bring the dense UP / Bihar
   cluster apart while pins stay finger-sized and labels stay 10px.

   - mode="hero": no filters, no panel. Hover / focus / tap lights a hub's
     corridor; an idle auto-cycle sweeps six principal hubs every few seconds.
   - mode="full": region chips that zoom the map, click / Enter selection with
     a looping shuttle, the side panel (search + regions, or the corridor
     card), arrow-key travel between hubs (one tab stop for the whole map).

   Animation ownership: GSAP draws the outline, ghost corridors and active
   corridor, runs the shuttle, the origin breath and the zoom tween. Motion
   owns the pin rings, the callout, the region pill and the panel. CSS only
   transitions dimming and label visibility. */

import { AnimatePresence, motion } from "motion/react";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { HUBS, ORIGIN, REGIONS, type Hub, type RegionId } from "@/content/hubs";
import { networkMap } from "@/content/network";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { formatNumberIN } from "@/lib/format";
import { gsap, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { MapPanel } from "./MapPanel";
import { useMapSelection } from "./MapSelection";
import { getCorridorPath } from "./corridor";
import { INDIA_PATHS, INDIA_VIEWBOX, ISLET_MARKERS } from "./india-outline";
import { INDIA_STATES } from "./india-states";
import {
  FULL_VIEW,
  TROPIC_Y,
  labelWidth,
  nearestInDirection,
  originLabelRect,
  placeLabels,
  viewBoxString,
  zoomBoxFor,
  type LabelPlacement,
  type ViewBox,
} from "./map-layout";

export interface IndiaNetworkMapProps {
  mode: "hero" | "full";
  hubs?: readonly Hub[];
  initialRegion?: RegionId | "all";
  onHubSelect?: (hub: Hub | null) => void;
  className?: string;
}

type RegionFilter = RegionId | "all";
type MapVars = CSSProperties & Record<`--${string}`, string | number>;

const CYCLE_SIZE = 6;
const CYCLE_MS = 4200;
const IDLE_AFTER_INTERACTION_MS = 10_000;
const SHUTTLE_R = 3.2;
/* Stage width (px) from which the map has room for its secondary labels. */
const WIDE_STAGE_PX = 480;

function regionLabel(id: RegionId): string {
  return REGIONS.find((entry) => entry.id === id)?.label ?? "";
}

function at(x: number, y: number): MapVars {
  return { "--x": x, "--y": y };
}

/* Hero auto-cycle: the farthest principal hub of each region, topped up with
   the next-farthest, then ordered by bearing from Surat so the cycle sweeps
   across the country instead of jumping back and forth. */
function buildCyclePool(hubs: readonly Hub[]): Hub[] {
  const source = hubs.filter((hub) => hub.primary);
  const byFar = [...(source.length >= CYCLE_SIZE ? source : hubs)].sort(
    (a, b) => b.distanceKm - a.distanceKm,
  );
  const pool: Hub[] = [];
  for (const entry of REGIONS) {
    if (entry.id === "all") continue;
    const far = byFar.find((hub) => hub.region === entry.id);
    if (far !== undefined) pool.push(far);
  }
  for (const hub of byFar) {
    if (pool.length >= CYCLE_SIZE) break;
    if (!pool.includes(hub)) pool.push(hub);
  }
  const bearing = (hub: Hub): number => Math.atan2(hub.y - ORIGIN.y, hub.x - ORIGIN.x);
  return pool.sort((a, b) => bearing(a) - bearing(b));
}

/* ——— Pin ——— */

interface HubPinProps {
  hub: Hub;
  lit: boolean;
  pressed: boolean | undefined;
  dim: boolean;
  tabbable: boolean;
  register: (el: HTMLButtonElement | null) => void;
  onPreview: (id: string | null) => void;
  onFocusHub: (id: string) => void;
  onActivate: (id: string) => void;
  onArrow: (id: string, key: string) => void;
}

/* Memoised: a hover or selection re-renders only the pins whose props move. */
const HubPin = memo(function HubPin({
  hub,
  lit,
  pressed,
  dim,
  tabbable,
  register,
  onPreview,
  onFocusHub,
  onActivate,
  onArrow,
}: HubPinProps) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
    if (event.key.startsWith("Arrow")) {
      event.preventDefault();
      onArrow(hub.id, event.key);
    }
  };
  const mouseOnly =
    (id: string | null) =>
    (event: ReactPointerEvent<HTMLButtonElement>): void => {
      if (event.pointerType === "mouse") onPreview(id);
    };

  return (
    <button
      ref={register}
      type="button"
      data-hub={hub.id}
      data-region={hub.region}
      data-dim={dim ? "true" : "false"}
      inert={dim}
      tabIndex={tabbable ? 0 : -1}
      aria-label={hub.state === hub.name ? hub.name : `${hub.name}, ${hub.state}`}
      aria-pressed={pressed}
      className="map-at map-pin"
      style={at(hub.x, hub.y)}
      onPointerEnter={mouseOnly(hub.id)}
      onPointerLeave={mouseOnly(null)}
      onFocus={() => onFocusHub(hub.id)}
      onBlur={() => onPreview(null)}
      onClick={() => onActivate(hub.id)}
      onKeyDown={handleKeyDown}
    >
      <span data-hub-dot className="map-dot" data-primary={hub.primary ? "true" : "false"} />
      <motion.span
        className="map-ring"
        initial={false}
        animate={lit ? { scale: 1, opacity: 1 } : { scale: 0.3, opacity: 0 }}
        transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
      />
    </button>
  );
});

/* ——— Map ——— */

export function IndiaNetworkMap({
  mode,
  hubs,
  initialRegion = "all",
  onHubSelect,
  className = "",
}: IndiaNetworkMapProps) {
  const isFull = mode === "full";
  const reduced = useReducedMotionSafe();
  const [selectedId, select] = useMapSelection();
  const [region, setRegion] = useState<RegionFilter>(initialRegion);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [cycleIdx, setCycleIdx] = useState(0);
  const [stagePx, setStagePx] = useState(0);

  const hubsList = hubs ?? HUBS;
  const byId = useMemo(() => new Map(hubsList.map((hub) => [hub.id, hub])), [hubsList]);
  /* DOM order = distance from Surat, so every entrance stagger radiates out. */
  const ordered = useMemo(
    () => [...hubsList].sort((a, b) => a.distanceKm - b.distanceKm),
    [hubsList],
  );
  const paths = useMemo(() => {
    const map = new Map<string, string>();
    for (const hub of hubsList) map.set(hub.id, getCorridorPath(ORIGIN, hub));
    return map;
  }, [hubsList]);
  const cyclePool = useMemo(() => buildCyclePool(hubsList), [hubsList]);

  const selected = isFull && selectedId !== null ? (byId.get(selectedId) ?? null) : null;
  /* A selection made elsewhere (the directory) that sits outside the current
     region shows the whole country rather than a dimmed, unreachable pin. */
  const activeRegion: RegionFilter =
    isFull && (selected === null || region === "all" || selected.region === region)
      ? region
      : "all";
  const regionHubs = useMemo(
    () => (activeRegion === "all" ? hubsList : hubsList.filter((h) => h.region === activeRegion)),
    [hubsList, activeRegion],
  );
  const targetView: ViewBox = useMemo(
    () => (activeRegion === "all" ? FULL_VIEW : zoomBoxFor(regionHubs)),
    [activeRegion, regionHubs],
  );

  const cycleHub = !isFull ? (cyclePool[cycleIdx % Math.max(cyclePool.length, 1)] ?? null) : null;
  const activeId = isFull
    ? (previewId ?? selected?.id ?? null)
    : (previewId ?? cycleHub?.id ?? null);
  const active = activeId === null ? null : (byId.get(activeId) ?? null);
  const pinnedSelection = isFull && selected !== null && activeId === selected.id;

  const visibleIds = useMemo(() => new Set(regionHubs.map((hub) => hub.id)), [regionHubs]);
  const tabStopId = useMemo(() => {
    for (const id of [focusId, selected?.id ?? null]) {
      if (id !== null && visibleIds.has(id)) return id;
    }
    return ordered.find((hub) => visibleIds.has(hub.id))?.id ?? null;
  }, [focusId, selected, visibleIds, ordered]);

  /* States: tinted where a hub sits, deeper inside the focused region. */
  const servedStates = useMemo(
    () => new Set([ORIGIN.stateId, ...hubsList.map((hub) => hub.stateId)]),
    [hubsList],
  );
  const focusStates = useMemo(
    () => new Set(activeRegion === "all" ? [] : regionHubs.map((hub) => hub.stateId)),
    [activeRegion, regionHubs],
  );

  /* Surat's label sits left of its pin unless the stage is too narrow for
     it there (small phones), then it drops below. The "dispatch desk" tag
     and the tropic label only appear where there is room for them. */
  const roomy = stagePx >= WIDE_STAGE_PX;
  const originPlacement = useMemo(() => {
    const roomLeft = ((ORIGIN.x - targetView.x) / targetView.w) * stagePx;
    return { below: roomLeft < labelWidth(networkMap.originLabel) + 22 };
  }, [targetView, stagePx]);

  /* Labels: principal hubs first (source order is market weight), then —
     zoomed into a region — every other hub that still has room. */
  const labels = useMemo(() => {
    const pool = activeRegion === "all" ? hubsList.filter((hub) => hub.primary) : regionHubs;
    const priority = [...pool].sort((a, b) => Number(b.primary) - Number(a.primary));
    const reserved = [
      originLabelRect(ORIGIN, networkMap.originLabel, targetView, stagePx, originPlacement.below),
    ];
    const placed = placeLabels(priority, targetView, stagePx, reserved, regionHubs);
    return new Map<string, LabelPlacement["side"]>(placed.map((p) => [p.id, p.side]));
  }, [activeRegion, hubsList, regionHubs, targetView, stagePx, originPlacement]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const activePathRef = useRef<SVGPathElement>(null);
  const shuttleRef = useRef<SVGCircleElement>(null);
  const breathRef = useRef<HTMLSpanElement>(null);
  const pinEls = useRef(new Map<string, HTMLButtonElement>());
  const corridorTl = useRef<{ kill: () => void } | null>(null);
  const viewRef = useRef<ViewBox>({ ...FULL_VIEW });
  const inViewRef = useRef(false);
  const lastInteractRef = useRef(0);
  const focusPanelRef = useRef(false);
  const noteId = useId();
  const clipId = `india-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const markInteracted = useCallback((): void => {
    lastInteractRef.current = Date.now();
  }, []);

  /* Writes one viewBox to both layers: the SVG attribute and the stage's
     custom properties. The shuttle radius follows the zoom by hand (an SVG
     `r` is in user units and has no CSS-var route that every engine takes). */
  const applyView = useCallback((vb: ViewBox): void => {
    const svg = svgRef.current;
    const stage = stageRef.current;
    if (svg === null || stage === null) return;
    const k = FULL_VIEW.w / vb.w;
    svg.setAttribute("viewBox", viewBoxString(vb));
    stage.style.setProperty("--vb-x", vb.x.toFixed(3));
    stage.style.setProperty("--vb-y", vb.y.toFixed(3));
    stage.style.setProperty("--vb-w", vb.w.toFixed(3));
    stage.style.setProperty("--vb-h", vb.h.toFixed(3));
    stage.style.setProperty("--k", k.toFixed(4));
    shuttleRef.current?.setAttribute("r", (SHUTTLE_R / k).toFixed(3));
  }, []);

  /* Stage width drives label placement. */
  useEffect(() => {
    const stage = stageRef.current;
    if (stage === null) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry !== undefined) setStagePx(Math.round(entry.contentRect.width));
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  /* Entrance: the border inks in, the state wash follows, corridors draw out
     from Surat, pins pop in distance order, labels settle, Surat breathes.
     ~2.2s in all. Reduced motion: the final frame, no breath. */
  useGSAP(
    () => {
      const stage = stageRef.current;
      if (stage === null) return;
      const nation = stage.querySelectorAll<SVGPathElement>("[data-nation]");
      const states = stage.querySelector<SVGGElement>("[data-states]");
      const ghosts = stage.querySelectorAll<SVGPathElement>("[data-ghost]");
      const dots = stage.querySelectorAll<HTMLSpanElement>("[data-hub-dot]");
      const fades = stage.querySelectorAll<HTMLElement>("[data-fade-in]");
      const washes: Element[] = [...fades];
      if (states !== null) washes.push(states);
      const breath = breathRef.current;
      if (reduced) {
        gsap.set(washes, { opacity: 1 });
        gsap.set(dots, { scale: 1, opacity: 1 });
        return;
      }
      /* Once drawn, drop DrawSVG's dash props so nothing can clip a stroke. */
      const clearDash = (): void => {
        gsap.set([...nation, ...ghosts], { clearProps: "strokeDasharray,strokeDashoffset" });
      };
      gsap.set(nation, { drawSVG: "0%" });
      gsap.set(ghosts, { drawSVG: "0%" });
      gsap.set(washes, { opacity: 0 });
      gsap.set(dots, { scale: 0, opacity: 0 });
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: stage, start: "top 85%", once: true },
      });
      timeline
        .to(nation, { drawSVG: "100%", duration: 1.2, ease: GSAP_EASES.draw }, 0)
        .to(washes, { opacity: 1, duration: 0.6, ease: "none", stagger: 0.1 }, 0.55)
        .to(
          ghosts,
          { drawSVG: "100%", duration: 0.7, ease: GSAP_EASES.draw, stagger: { amount: 0.5 } },
          0.8,
        )
        .to(
          dots,
          {
            scale: 1,
            opacity: 1,
            duration: MOTION_DURATIONS.sm,
            ease: GSAP_EASES.reveal,
            stagger: { amount: 0.6 },
          },
          0.95,
        )
        .add(clearDash, 2.1);
      /* Nested (not fired from a callback) so the context reverts it. */
      if (breath !== null) {
        timeline.fromTo(
          breath,
          { scale: 1, opacity: 0.55 },
          { scale: 2.6, opacity: 0, duration: 2.8, repeat: -1, ease: "sine.out" },
          1.2,
        );
      }
    },
    { scope: stageRef, dependencies: [reduced, hubsList] },
  );

  /* Region zoom: tween the live viewBox; both layers follow. */
  useEffect(() => {
    const from = viewRef.current;
    if (
      from.x === targetView.x &&
      from.y === targetView.y &&
      from.w === targetView.w &&
      from.h === targetView.h
    ) {
      return;
    }
    if (reduced) {
      viewRef.current = { ...targetView };
      applyView(targetView);
      return;
    }
    const tween = gsap.to(viewRef.current, {
      ...targetView,
      duration: MOTION_DURATIONS.lg,
      ease: "power3.inOut",
      overwrite: true,
      onUpdate: () => applyView(viewRef.current),
    });
    return () => {
      tween.kill();
    };
  }, [targetView, reduced, applyView]);

  /* Active corridor: draws from Surat with a shuttle riding it. A pinned
     full-mode selection keeps the shuttle running; everything else runs
     once. Reduced: the drawn line, no shuttle. */
  useEffect(() => {
    const path = activePathRef.current;
    const shuttle = shuttleRef.current;
    const svg = svgRef.current;
    if (path === null || shuttle === null || svg === null) return;
    corridorTl.current?.kill();
    corridorTl.current = null;
    const d = activeId === null ? undefined : paths.get(activeId);
    if (d === undefined) {
      gsap.to(path, { opacity: 0, duration: 0.25, overwrite: true });
      gsap.set(shuttle, { opacity: 0 });
      svg.setAttribute("data-corridor-active", "false");
      return;
    }
    path.setAttribute("d", d);
    svg.setAttribute("data-corridor-active", "true");
    if (reduced) {
      gsap.set(path, { drawSVG: "100%", opacity: 1 });
      gsap.set(shuttle, { opacity: 0 });
      return;
    }
    const ride = {
      motionPath: {
        path,
        align: path,
        alignOrigin: [0.5, 0.5] as [number, number],
        start: 0,
        end: 1,
      },
    };
    const timeline = gsap.timeline();
    timeline
      .fromTo(
        path,
        { drawSVG: "0%", opacity: 1 },
        { drawSVG: "100%", duration: 0.9, ease: GSAP_EASES.draw, overwrite: true },
        0,
      )
      .fromTo(shuttle, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0)
      .to(shuttle, { ...ride, duration: 0.9, ease: GSAP_EASES.draw }, 0)
      .to(shuttle, { opacity: 0, duration: 0.3 }, 0.95);
    if (pinnedSelection) {
      const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.9, delay: 0.6 });
      loop
        .fromTo(shuttle, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
        .to(shuttle, { ...ride, duration: 1.7, ease: "power1.inOut" }, 0)
        .to(shuttle, { opacity: 0, duration: 0.3 }, 1.5);
      timeline.add(loop, ">");
    }
    corridorTl.current = timeline;
  }, [activeId, pinnedSelection, paths, reduced]);

  useEffect(
    () => () => {
      corridorTl.current?.kill();
    },
    [],
  );

  /* Hero auto-cycle: paused offscreen and for 10s after any interaction. */
  useEffect(() => {
    if (isFull || reduced || cyclePool.length === 0) return;
    const tick = window.setInterval(() => {
      if (!inViewRef.current) return;
      if (Date.now() - lastInteractRef.current < IDLE_AFTER_INTERACTION_MS) return;
      setCycleIdx((i) => (i + 1) % cyclePool.length);
    }, CYCLE_MS);
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

  /* Focus the corridor card when the selection came from this map. A
     callback ref, not an effect: the card mounts only after the panel's
     exit animation, well after the selection render has committed. On
     phones the card sits under the map, so it is nudged into view. */
  const panelHeadingRef = useCallback(
    (heading: HTMLHeadingElement | null): void => {
      if (heading === null || !focusPanelRef.current) return;
      focusPanelRef.current = false;
      heading.focus({ preventScroll: true });
      const box = heading.getBoundingClientRect();
      if (box.top < 0 || box.bottom > window.innerHeight) {
        heading.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
      }
    },
    [reduced],
  );

  const registerPin = useCallback((el: HTMLButtonElement | null): void => {
    if (el === null) return;
    const id = el.getAttribute("data-hub");
    if (id !== null) pinEls.current.set(id, el);
  }, []);

  const handlePreview = useCallback(
    (id: string | null): void => {
      if (id !== null) markInteracted();
      setPreviewId(id);
    },
    [markInteracted],
  );

  const handleFocusHub = useCallback(
    (id: string): void => {
      markInteracted();
      setFocusId(id);
      setPreviewId(id);
    },
    [markInteracted],
  );

  const clearSelection = useCallback((): void => {
    select(null);
    onHubSelect?.(null);
  }, [select, onHubSelect]);

  const selectHub = useCallback(
    (id: string): void => {
      select(id);
      setFocusId(id);
      onHubSelect?.(byId.get(id) ?? null);
    },
    [select, onHubSelect, byId],
  );

  const handleActivate = useCallback(
    (id: string): void => {
      markInteracted();
      if (!isFull) {
        setPreviewId(id);
        return;
      }
      if (selectedId === id) {
        clearSelection();
        return;
      }
      focusPanelRef.current = true;
      selectHub(id);
    },
    [isFull, markInteracted, selectedId, clearSelection, selectHub],
  );

  const handleArrow = useCallback(
    (id: string, key: string): void => {
      markInteracted();
      const from = byId.get(id);
      if (from === undefined) return;
      const next = nearestInDirection(from, key, regionHubs);
      if (next !== null) pinEls.current.get(next.id)?.focus();
    },
    [markInteracted, byId, regionHubs],
  );

  const handleRegion = useCallback(
    (next: RegionFilter): void => {
      markInteracted();
      setPreviewId(null);
      if (selected !== null && next !== "all" && selected.region !== next) clearSelection();
      setRegion(next);
    },
    [markInteracted, selected, clearSelection],
  );

  const handleStageClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
    if (!isFull || selectedId === null) return;
    const target = event.target as Element | null;
    if (target !== null && target.closest("[data-hub]") === null) clearSelection();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Escape" && isFull && selectedId !== null) {
      event.stopPropagation();
      const id = selectedId;
      clearSelection();
      pinEls.current.get(id)?.focus();
    }
  };

  const handleClosePanel = useCallback((): void => {
    const id = selectedId;
    clearSelection();
    if (id !== null) pinEls.current.get(id)?.focus();
  }, [selectedId, clearSelection]);

  const handlePanelSelect = useCallback(
    (id: string): void => {
      markInteracted();
      setPreviewId(null);
      focusPanelRef.current = true;
      selectHub(id);
    },
    [markInteracted, selectHub],
  );

  const handlePanelPreview = useCallback((id: string | null): void => {
    setPreviewId(id);
  }, []);

  const regionCounts = useMemo(() => {
    const counts = new Map<RegionFilter, number>([["all", hubsList.length]]);
    for (const hub of hubsList) counts.set(hub.region, (counts.get(hub.region) ?? 0) + 1);
    return counts;
  }, [hubsList]);

  /* Callout placement against the target view: flip left on the east side,
     drop below the pin near the top edge. */
  const calloutSide = useMemo(() => {
    if (active === null) return { flipX: false, below: false };
    const rx = (active.x - targetView.x) / targetView.w;
    const ry = (active.y - targetView.y) / targetView.h;
    return { flipX: rx > 0.55, below: ry < 0.2 };
  }, [active, targetView]);

  const stage = (
    <div
      ref={stageRef}
      className="map-stage"
      data-zoomed={activeRegion === "all" ? "false" : "true"}
      onClick={handleStageClick}
      onPointerDown={markInteracted}
    >
      <svg
        ref={svgRef}
        viewBox={INDIA_VIEWBOX}
        aria-hidden="true"
        focusable="false"
        data-corridor-active="false"
        className="map-svg"
      >
        <defs>
          <clipPath id={clipId}>
            {INDIA_PATHS.map((d) => (
              <path key={d.length} d={d} />
            ))}
          </clipPath>
        </defs>

        <g data-states>
          {INDIA_STATES.map((state) => (
            <path
              key={state.id}
              d={state.d}
              className="map-state"
              fill={
                focusStates.has(state.id)
                  ? "var(--map-land-focus)"
                  : servedStates.has(state.id)
                    ? "var(--map-land-served)"
                    : "var(--map-land-quiet)"
              }
              stroke="var(--map-state-line)"
              strokeLinejoin="round"
            />
          ))}
          {isFull && (
            <line
              x1={0}
              x2={FULL_VIEW.w}
              y1={TROPIC_Y}
              y2={TROPIC_Y}
              className="map-tropic"
              stroke="var(--map-border)"
              clipPath={`url(#${clipId})`}
            />
          )}
        </g>

        {INDIA_PATHS.map((d) => (
          <path
            key={d.length}
            d={d}
            data-nation
            className="map-nation"
            fill="none"
            stroke="var(--map-border)"
            strokeLinejoin="round"
          />
        ))}
        {ISLET_MARKERS.map(([x, y]) => (
          <circle key={`${x},${y}`} cx={x} cy={y} r={1.6} fill="var(--map-border)" />
        ))}

        <g>
          {ordered.map((hub) => (
            <path
              key={hub.id}
              d={paths.get(hub.id)}
              data-ghost
              data-dim={visibleIds.has(hub.id) ? "false" : "true"}
              className="map-ghost"
              fill="none"
              stroke="var(--map-corridor)"
              strokeLinecap="round"
            />
          ))}
          <path
            ref={activePathRef}
            data-active-corridor
            className="map-active"
            fill="none"
            stroke="var(--accent)"
            strokeLinecap="round"
            opacity={0}
          />
          <circle ref={shuttleRef} cx={0} cy={0} r={SHUTTLE_R} fill="var(--accent)" opacity={0} />
        </g>
      </svg>

      {/* Labels sit under the pins so a label never steals a tap. */}
      <div data-fade-in aria-hidden="true" className="pointer-events-none absolute inset-0">
        {isFull && roomy && activeRegion === "all" && (
          <span
            className="map-label right-2 text-[9px]"
            style={{
              top: `calc((${String(TROPIC_Y)} - var(--vb-y)) / var(--vb-h) * 100%)`,
              transform: "translateY(-115%)",
              color: "var(--muted)",
            }}
          >
            {networkMap.tropicLabel}
          </span>
        )}
        {ordered.map((hub) => {
          const side = labels.get(hub.id);
          const show = side !== undefined && hub.id !== activeId;
          return (
            <span
              key={hub.id}
              className="map-at map-label"
              data-show={show ? "true" : "false"}
              style={{
                ...at(hub.x, hub.y),
                transform:
                  side === "left" ? "translate(calc(-100% - 9px), -50%)" : "translate(9px, -50%)",
              }}
            >
              {hub.name}
            </span>
          );
        })}
      </div>

      {/* Surat: the origin is information, not a control. */}
      <div
        data-fade-in
        aria-hidden="true"
        className="map-at pointer-events-none"
        style={at(ORIGIN.x, ORIGIN.y)}
      >
        <span
          ref={breathRef}
          className="border-accent absolute -top-[9px] -left-[9px] block size-[18px] rounded-full border opacity-0"
        />
        <span className="border-accent bg-paper absolute -top-[9px] -left-[9px] block size-[18px] rounded-full border" />
        <span className="bg-ink absolute -top-[3px] -left-[3px] block size-[6px] rounded-full" />
        <span
          className={
            originPlacement.below
              ? "absolute top-[13px] -left-[4px] flex flex-col items-start"
              : "absolute top-0 right-[15px] flex -translate-y-1/2 flex-col items-end text-right"
          }
        >
          <span className="map-label text-ink relative font-medium">{networkMap.originLabel}</span>
          {isFull && roomy && (
            <span className="map-label relative mt-[3px] text-[9px] tracking-[0.18em]">
              {networkMap.originTag}
            </span>
          )}
        </span>
      </div>

      <div role="group" aria-label={networkMap.ariaLabel} aria-describedby={noteId}>
        {ordered.map((hub) => (
          <HubPin
            key={hub.id}
            hub={hub}
            lit={activeId === hub.id}
            pressed={isFull ? selected?.id === hub.id : undefined}
            dim={!visibleIds.has(hub.id)}
            tabbable={tabStopId === hub.id}
            register={registerPin}
            onPreview={handlePreview}
            onFocusHub={handleFocusHub}
            onActivate={handleActivate}
            onArrow={handleArrow}
          />
        ))}
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            key={active.id}
            aria-hidden="true"
            className="map-at pointer-events-none z-10"
            style={at(active.x, active.y)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
          >
            <motion.div
              className="border-line-strong bg-paper-2 absolute min-w-max rounded-xs border px-3 py-2 shadow-[var(--shadow-card)]"
              style={{
                left: calloutSide.flipX ? undefined : 14,
                right: calloutSide.flipX ? 14 : undefined,
                top: calloutSide.below ? 12 : undefined,
                bottom: calloutSide.below ? undefined : 12,
              }}
              initial={{ y: calloutSide.below ? -4 : 4 }}
              animate={{ y: 0 }}
              transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
            >
              <span className="font-display text-ink block text-base leading-tight">
                {active.name}
              </span>
              <span className="text-muted mt-0.5 block font-mono text-[10px] tracking-[0.12em] uppercase">
                {active.state === active.name ? regionLabel(active.region) : active.state}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div
      ref={wrapRef}
      className={`network-map ${className}`}
      onPointerMove={isFull ? undefined : markInteracted}
      onKeyDown={handleKeyDown}
    >
      {isFull && (
        <div className="space-y-3">
          <div
            role="group"
            aria-label={networkMap.filterLabel}
            className="flex flex-wrap gap-x-6 gap-y-1"
          >
            {REGIONS.map((entry) => {
              const on = activeRegion === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => handleRegion(entry.id)}
                  className={`relative inline-flex min-h-11 items-baseline gap-2 py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors ${
                    on ? "text-accent-ink font-medium" : "text-muted hover:text-ink"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="region-pill"
                      className="bg-accent absolute inset-x-0 bottom-1 h-px"
                      transition={{ duration: MOTION_DURATIONS.xs, ease: MOTION_EASES.out }}
                    />
                  )}
                  <span className="relative">{entry.label}</span>
                  <span className="relative text-[10px] tracking-normal opacity-70">
                    {regionCounts.get(entry.id) ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-ink-2 text-sm font-light">{networkMap.instruction}</p>
        </div>
      )}

      <div
        className={
          isFull ? "mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12" : ""
        }
      >
        <div className={isFull ? "lg:col-span-7" : ""}>
          {stage}
          {!isFull && (
            <p
              aria-hidden="true"
              className="border-line text-muted mt-3 flex items-baseline justify-between gap-4 border-t pt-3 font-mono text-[10px] tracking-[0.14em] uppercase"
            >
              <span className="truncate">
                {active === null ? (
                  networkMap.readoutIdle
                ) : (
                  <>
                    {networkMap.originLabel} <span className="text-accent">→</span>{" "}
                    <span className="text-ink">{active.name}</span>
                  </>
                )}
              </span>
              {active !== null && (
                <span className="shrink-0">
                  {networkMap.readoutDistance(formatNumberIN(active.distanceKm))}
                </span>
              )}
            </p>
          )}
          <p id={noteId} className="sr-only">
            {networkMap.srNote}
          </p>
        </div>

        {isFull && (
          <div className="border-line lg:col-span-5 lg:border-l lg:pl-12">
            <MapPanel
              hubs={hubsList}
              selected={selected}
              region={activeRegion}
              headingRef={panelHeadingRef}
              onRegion={handleRegion}
              onSelect={handlePanelSelect}
              onPreview={handlePanelPreview}
              onClose={handleClosePanel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
