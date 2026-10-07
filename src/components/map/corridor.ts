/* Flight-path arcs from the origin to each hub. The control point is the
   segment midpoint offset perpendicular by 18% of the segment length,
   always bowing north (negative y); purely north–south segments tie-break
   east. This replaces Maa Sheetla's per-node `curve` values with one
   uniform rule (see docs/map-port.md). */

export interface CorridorPoint {
  x: number;
  y: number;
}

const BOW_RATIO = 0.18;

export function corridorPath(a: CorridorPoint, b: CorridorPoint): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) {
    return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${a.x.toFixed(1)},${(a.y - 1).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
  }
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const off = len * BOW_RATIO;
  const nx = -dy / len;
  const ny = dx / len;
  const c1x = mx + nx * off;
  const c1y = my + ny * off;
  const c2x = mx - nx * off;
  const c2y = my - ny * off;
  /* North-bowing; east tie-break for north–south segments. */
  const [cx, cy] = c1y < c2y || (c1y === c2y && c1x >= c2x) ? [c1x, c1y] : [c2x, c2y];
  return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
}

const corridorCache = new Map<string, string>();

/* Memoised: at most one path string per origin–hub pair, built once. */
export function getCorridorPath(
  origin: CorridorPoint & { id: string },
  hub: CorridorPoint & { id: string },
): string {
  const key = `${origin.id}>${hub.id}`;
  const cached = corridorCache.get(key);
  if (cached !== undefined) return cached;
  const d = corridorPath(origin, hub);
  corridorCache.set(key, d);
  return d;
}
