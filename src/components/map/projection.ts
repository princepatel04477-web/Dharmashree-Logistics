/* Verbatim math from Maa Sheetla `components/india-geometry.ts`
   (AUTO-GENERATED, Mercator-projected to the 760x860 viewBox). Only the
   signature is adapted to the Prompt 03 contract: (lat, lng) in, { x, y }
   out. NOTE the argument order — source called it as (lon, lat). */

export const PROJECTION = {
  scale: 1416.40106,
  ox: 18.0,
  oy: 19.739628,
  mx0: 1.188578859,
  myTop: 0.69767068,
} as const;

export interface ProjectedPoint {
  x: number;
  y: number;
}

/* `Math.log` and `Math.tan` are not required to agree to the last bit between
   the engine that renders the HTML (Node) and the browser, so the raw
   projection can differ in the 13th digit and the pin offsets derived from it
   would then be serialised differently on the server and the client (a
   hydration mismatch). Every projected point is therefore rounded here, once,
   to a thousandth of a viewBox unit (far below a pixel); everything downstream
   is plain IEEE arithmetic on those rounded values and agrees exactly. */
const PRECISION = 1000;

function settle(value: number): number {
  return Math.round(value * PRECISION) / PRECISION;
}

export function projectPoint(lat: number, lng: number): ProjectedPoint {
  const { scale, ox, oy, mx0, myTop } = PROJECTION;
  const my = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  return {
    x: settle(ox + ((lng * Math.PI) / 180 - mx0) * scale),
    y: settle(oy + (myTop - my) * scale),
  };
}
