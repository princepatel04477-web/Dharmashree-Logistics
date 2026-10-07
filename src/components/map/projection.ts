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

export function projectPoint(lat: number, lng: number): ProjectedPoint {
  const { scale, ox, oy, mx0, myTop } = PROJECTION;
  const my = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  return {
    x: ox + ((lng * Math.PI) / 180 - mx0) * scale,
    y: oy + (myTop - my) * scale,
  };
}
