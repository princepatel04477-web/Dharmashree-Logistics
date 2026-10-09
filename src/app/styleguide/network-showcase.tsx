import type { ReactNode } from "react";
import { HubDirectory } from "@/components/map/HubDirectory";
import { IndiaNetworkMap } from "@/components/map/IndiaNetworkMap";
import { MapSelectionProvider } from "@/components/map/MapSelection";

function DemoPanel({
  index,
  title,
  note,
  children,
}: {
  index: string;
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div className="border-line bg-paper-2 space-y-4 border p-6 sm:p-8">
      <div className="space-y-1">
        <p className="section-index">
          {index} — {title}
        </p>
        <p className="text-muted text-xs font-light">{note}</p>
      </div>
      {children}
    </div>
  );
}

/* Prompt 03 verification: Maa Sheetla's 78-hub geometry with GSAP entrance,
   DrawSVG corridors and Motion finishing. MP-1 auto-cycles while idle;
   MP-2 pairs the full map with the directory under shared selection. */
export function NetworkShowcase() {
  return (
    <section aria-labelledby="sg-network" className="space-y-8">
      <div className="wrap space-y-3">
        <p className="section-index">06 — Network</p>
        <h2 id="sg-network" className="font-display text-3xl tracking-tight">
          India corridors from Surat
        </h2>
      </div>

      <div className="wrap grid grid-cols-1 gap-6">
        <DemoPanel
          index="MP-1"
          title="IndiaNetworkMap, hero mode"
          note="No filters, no panel. Hover a hub for its corridor; idle auto-cycles six cross-region hubs."
        >
          <div className="mx-auto w-full max-w-[560px]">
            <IndiaNetworkMap mode="hero" />
          </div>
        </DemoPanel>

        <DemoPanel
          index="MP-2"
          title="IndiaNetworkMap, full mode + HubDirectory"
          note="Region chips, selection panel, arrow-key travel; the directory shares selection with the map."
        >
          <MapSelectionProvider>
            <IndiaNetworkMap mode="full" />
            <div className="border-line mt-10 border-t pt-8">
              <HubDirectory />
            </div>
          </MapSelectionProvider>
        </DemoPanel>
      </div>
    </section>
  );
}
