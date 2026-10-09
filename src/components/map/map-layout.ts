/* Pure layout maths for the network map: the region zoom box, collision-free
   label placement and arrow-key travel. No React, no DOM — every function is
   deterministic in its inputs so the map can recompute them freely. */

import type { Hub } from "@/content/hubs";
import { INDIA_VIEWBOX } from "./india-outline";
import { projectPoint } from "./projection";

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const [, , VB_W, VB_H] = INDIA_VIEWBOX.split(" ").map(Number) as [number, number, number, number];

export const FULL_VIEW: ViewBox = { x: 0, y: 0, w: VB_W, h: VB_H };

const ASPECT = VB_H / VB_W;
/* Tightest zoom (≈3.2×): close enough to separate the UP cluster, wide
   enough that a region never loses its neighbours. */
const MIN_ZOOM_WIDTH = 235;
const ZOOM_PADDING = 0.22;

/** A percentage of a box, as a CSS length with fixed precision, so the server
   and the client serialise the same text for the same position. */
export function percentOf(offset: number, size: number): string {
  return `${((offset / size) * 100).toFixed(3)}%`;
}

export function viewBoxString(vb: ViewBox): string {
  return `${vb.x.toFixed(2)} ${vb.y.toFixed(2)} ${vb.w.toFixed(2)} ${vb.h.toFixed(2)}`;
}

/* Box around a set of hubs, padded, locked to the map's aspect ratio (so
   the SVG and the HTML overlay share one mapping) and clamped inside the
   full map. One or zero hubs → the full view. */
export function zoomBoxFor(hubs: readonly Hub[]): ViewBox {
  if (hubs.length < 2) return FULL_VIEW;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const hub of hubs) {
    minX = Math.min(minX, hub.x);
    minY = Math.min(minY, hub.y);
    maxX = Math.max(maxX, hub.x);
    maxY = Math.max(maxY, hub.y);
  }
  const spanX = maxX - minX;
  const spanY = maxY - minY;
  let w = Math.max(spanX * (1 + ZOOM_PADDING * 2), (spanY * (1 + ZOOM_PADDING * 2)) / ASPECT);
  w = Math.min(Math.max(w, MIN_ZOOM_WIDTH), VB_W);
  const h = w * ASPECT;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const x = Math.min(Math.max(cx - w / 2, 0), VB_W - w);
  const y = Math.min(Math.max(cy - h / 2, 0), VB_H - h);
  return { x, y, w, h };
}

/* ——— Labels ——— */

export interface LabelPlacement {
  id: string;
  side: "left" | "right";
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/* Mono 10px caps at 0.12em tracking ≈ 7.2px per glyph. */
const GLYPH_PX = 7.2;
const LABEL_H = 12;
const LABEL_GAP = 9;
const LABEL_PAD = 3;

export function labelWidth(text: string): number {
  return text.length * GLYPH_PX;
}

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w + LABEL_PAD &&
    a.x + a.w + LABEL_PAD > b.x &&
    a.y < b.y + b.h + LABEL_PAD &&
    a.y + a.h + LABEL_PAD > b.y
  );
}

/* Plain intersection, no padding: a label may sit close to a dot. */
function touches(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/* Footprint of a hub dot (7px principal dot + halo), so labels never run
   through another pin. */
const DOT_PX = 8;

/* Greedy placement in priority order: try the right of the dot, then the
   left; keep the first side that stays inside the stage and clears every
   label already placed, every other visible dot and the reserved rects (the
   origin's label). A label that fits nowhere is simply not shown — never
   overlapped; zooming into its region gives it room. */
export function placeLabels(
  candidates: readonly Hub[],
  view: ViewBox,
  stagePx: number,
  reserved: readonly Rect[] = [],
  dots: readonly Hub[] = [],
): LabelPlacement[] {
  if (stagePx <= 0) return [];
  const scale = stagePx / view.w;
  const stageH = stagePx * ASPECT;
  const placed: Rect[] = [...reserved];
  const dotRects = dots.map((hub) => ({
    id: hub.id,
    rect: {
      x: (hub.x - view.x) * scale - DOT_PX / 2,
      y: (hub.y - view.y) * scale - DOT_PX / 2,
      w: DOT_PX,
      h: DOT_PX,
    },
  }));
  const out: LabelPlacement[] = [];
  for (const hub of candidates) {
    const px = (hub.x - view.x) * scale;
    const py = (hub.y - view.y) * scale;
    if (px < 0 || py < 0 || px > stagePx || py > stageH) continue;
    const w = labelWidth(hub.name);
    const y = py - LABEL_H / 2;
    const sides: readonly LabelPlacement["side"][] =
      px > stagePx * 0.62 ? ["left", "right"] : ["right", "left"];
    for (const side of sides) {
      const x = side === "right" ? px + LABEL_GAP : px - LABEL_GAP - w;
      const rect: Rect = { x, y, w, h: LABEL_H };
      if (x < 2 || x + w > stagePx - 2 || y < 2 || y + LABEL_H > stageH - 2) continue;
      if (placed.some((other) => overlaps(rect, other))) continue;
      if (dotRects.some((dot) => dot.id !== hub.id && touches(rect, dot.rect))) continue;
      placed.push(rect);
      out.push({ id: hub.id, side });
      break;
    }
  }
  return out;
}

/* Rect the origin label occupies (left of the dot, or below it on narrow
   stages), so hub labels avoid it. */
export function originLabelRect(
  origin: Hub,
  text: string,
  view: ViewBox,
  stagePx: number,
  below = false,
): Rect {
  const scale = stagePx / view.w;
  const px = (origin.x - view.x) * scale;
  const py = (origin.y - view.y) * scale;
  const w = labelWidth(text) + 12;
  if (below) return { x: px - 6, y: py + 8, w, h: LABEL_H + 18 };
  return { x: px - LABEL_GAP - w, y: py - LABEL_H / 2 - 2, w, h: LABEL_H + 16 };
}

/* ——— Keyboard travel ——— */

const ARROW_VECTORS: Record<string, readonly [number, number]> = {
  ArrowRight: [1, 0],
  ArrowLeft: [-1, 0],
  ArrowDown: [0, 1],
  ArrowUp: [0, -1],
};

/* Nearest hub in an arrow direction: within ±60° of the arrow, scored by
   distance with off-axis travel penalised, so a held key walks a straight
   line rather than zig-zagging. SVG y grows downward: ArrowDown is +y. */
export function nearestInDirection(from: Hub, key: string, hubs: readonly Hub[]): Hub | null {
  const vec = ARROW_VECTORS[key];
  if (vec === undefined) return null;
  let best: Hub | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const hub of hubs) {
    if (hub.id === from.id) continue;
    const dx = hub.x - from.x;
    const dy = hub.y - from.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) continue;
    const along = dx * vec[0] + dy * vec[1];
    const cos = along / dist;
    if (cos < 0.5) continue;
    const across = Math.abs(dx * vec[1] - dy * vec[0]);
    const score = along + across * 2;
    if (score < bestScore) {
      best = hub;
      bestScore = score;
    }
  }
  return best;
}

/* ——— Reference lines ——— */

/* Tropic of Cancer (23.4365°N). Mercator keeps parallels horizontal, so one
   projected y describes the whole line. */
export const TROPIC_Y = projectPoint(23.4365, 78).y;
