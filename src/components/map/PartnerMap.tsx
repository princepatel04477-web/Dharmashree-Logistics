"use client";

import { useMemo } from "react";
import { partners, partnersPage } from "@/content/partners";
import { cn } from "@/lib/utils";
import { INDIA_PATHS, INDIA_VIEWBOX } from "./india-outline";
import { INDIA_STATES } from "./india-states";
import { percentOf } from "./map-layout";
import { useMapSelection } from "./MapSelection";
import { projectPoint } from "./projection";

/* The partner map (Prompt 13): the same India geometry as the network map,
   cropped to the partner cities in Uttar Pradesh, with one numbered pin per
   partner. The pins are real buttons laid over the SVG — the network map's own
   approach — so they are keyboard reachable and carry an accessible name;
   selecting one (or its row in the list) goes through the shared
   `MapSelection`. Pins are outlines and numerals only: the accent never fills
   (house rule 6). The geometry is static, so nothing here animates; the
   selection ring is a CSS transition that the global reduced-motion rule
   resolves instantly. */

const [, , VB_W, VB_H] = INDIA_VIEWBOX.split(" ").map(Number) as [number, number, number, number];
const ASPECT = VB_H / VB_W;
const PAD = 0.5;
const MIN_WIDTH = 150;
const FOCUS_STATE = "uttar-pradesh";

interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Pin {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

function cropAround(points: readonly { x: number; y: number }[]): Crop {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = Math.min(
    Math.max((maxX - minX) * (1 + PAD * 2), ((maxY - minY) * (1 + PAD * 2)) / ASPECT, MIN_WIDTH),
    VB_W,
  );
  const h = w * ASPECT;
  const x = Math.min(Math.max((minX + maxX) / 2 - w / 2, 0), VB_W - w);
  const y = Math.min(Math.max((minY + maxY) / 2 - h / 2, 0), VB_H - h);
  return { x, y, w, h };
}

export function PartnerMap({ className }: { className?: string }) {
  const [selectedId, select] = useMapSelection();

  const { crop, pins } = useMemo(() => {
    const placed: Pin[] = partners.map((partner) => {
      const point = projectPoint(partner.latLng[0], partner.latLng[1]);
      return {
        id: partner.id,
        label: `${partner.name}, ${partner.city}`,
        x: point.x,
        y: point.y,
      };
    });
    return { crop: cropAround(placed), pins: placed };
  }, []);

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: `${String(VB_W)} / ${String(VB_H)}` }}
      onClick={(event) => {
        if (event.target === event.currentTarget) select(null);
      }}
    >
      <svg
        viewBox={`${crop.x.toFixed(2)} ${crop.y.toFixed(2)} ${crop.w.toFixed(2)} ${crop.h.toFixed(2)}`}
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 size-full"
      >
        {INDIA_STATES.map((state) => (
          <path
            key={state.id}
            d={state.d}
            fill={state.id === FOCUS_STATE ? "var(--map-land-served)" : "var(--map-land-quiet)"}
            stroke="var(--map-state-line)"
            strokeLinejoin="round"
          />
        ))}
        {INDIA_PATHS.map((d) => (
          <path
            key={d.length}
            d={d}
            fill="none"
            stroke="var(--map-border)"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      <ol aria-label={partnersPage.network.mapLabel}>
        {pins.map((pin, position) => {
          const selected = pin.id === selectedId;
          return (
            <li
              key={pin.id}
              className="absolute"
              style={{
                left: percentOf(pin.x - crop.x, crop.w),
                top: percentOf(pin.y - crop.y, crop.h),
              }}
            >
              <button
                type="button"
                aria-label={pin.label}
                aria-pressed={selected}
                onClick={() => select(selected ? null : pin.id)}
                className={cn(
                  "bg-paper text-ink absolute -top-4 -left-4 flex size-8 items-center justify-center rounded-full border font-mono text-[11px] transition-colors duration-200",
                  selected ? "border-brand" : "border-line-strong hover:border-brand",
                )}
              >
                <span aria-hidden="true">{position + 1}</span>
                {selected && (
                  <span
                    aria-hidden="true"
                    className="border-brand pointer-events-none absolute -inset-1.5 rounded-full border"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
