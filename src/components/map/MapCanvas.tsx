"use client";

import dynamic from "next/dynamic";
import { INDIA_VIEWBOX } from "@/components/map/india-outline";
import { cn } from "@/lib/utils";

/* The network map is the heaviest paint on the page — 79 hub nodes, the
   outline geometry and a corridor path per hub. Keeping it out of the server
   HTML (and swapping the real component in only once the tree is live) is what
   makes the hero's LCP element the H1 text instead of the map, and it keeps
   the exported document small.

   Prompt 06 moved it from `components/home/` to `components/map/` because the
   service detail pages mount a mini map of their own; the reserve box and the
   width cap that keep the hero shift-free are what a small map needs too. */

/* The fallback reserves exactly the box the map's viewBox will occupy, so
   replacing it cannot shift the page. */
function MapReserve() {
  const parts = INDIA_VIEWBOX.split(" ");
  const boxWidth = Number(parts[2]);
  const boxHeight = Number(parts[3]);
  const aspectRatio =
    Number.isFinite(boxWidth) && Number.isFinite(boxHeight) && boxWidth > 0 && boxHeight > 0
      ? `${String(boxWidth)} / ${String(boxHeight)}`
      : undefined;

  return (
    <div
      aria-hidden="true"
      style={aspectRatio === undefined ? undefined : { aspectRatio }}
      className="border-line bg-paper-2 w-full rounded-xs border"
    />
  );
}

const IndiaNetworkMap = dynamic(
  () => import("@/components/map/IndiaNetworkMap").then((mod) => mod.IndiaNetworkMap),
  { ssr: false, loading: () => <MapReserve /> },
);

interface MapCanvasProps {
  mode: "hero" | "full";
  className?: string;
}

export function MapCanvas({ mode, className = "" }: MapCanvasProps) {
  return (
    <div className={cn("w-full", className)}>
      <IndiaNetworkMap mode={mode} />
    </div>
  );
}
