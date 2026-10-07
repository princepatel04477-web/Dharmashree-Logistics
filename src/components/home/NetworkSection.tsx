import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { HubDirectory } from "@/components/map/HubDirectory";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { sectionHeadings } from "@/content/home";
import { HUBS, REGIONS } from "@/content/hubs";
import { MapCanvas } from "./MapCanvas";

/* H3 · The network. The count line is derived from `hubs.ts`, never from
   `company.hubsServed` — the map and the directory are the truth, so the
   number can't disagree with them. Under the map sits Maa Sheetla's compact
   ledger: the real directory rows clipped to a short scroll box at `lg`, with
   the full page one click away. */

const REGION_COUNT = REGIONS.filter((entry) => entry.id !== "all").length;

export function NetworkSection() {
  const heading = sectionHeadings.network;

  return (
    <section className="border-line border-t py-24 sm:py-28 lg:py-32">
      <div className="wrap flex flex-col gap-12">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index={heading.index}
            title={heading.title}
            titleClassName="font-display text-headline text-ink leading-headline font-light tracking-display"
          />
          <p className="label-caps lg:pb-2">
            {HUBS.length} hubs across {REGION_COUNT} regions
          </p>
        </div>

        {/* Full mode lays out its own 12-column map + panel grid, so it takes
            the container width instead of a hero-sized cap. */}
        <MapCanvas mode="full" />

        <div className="border-line flex flex-col gap-6 border-t pt-8">
          <div className="flex items-end justify-between gap-6">
            <p className="section-index">Directory</p>
            <Link
              href="/network"
              className="group/hubs text-accent-ink inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase"
            >
              <span className="relative">
                See every hub
                <span
                  aria-hidden="true"
                  className="bg-accent absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/hubs:scale-x-100"
                />
              </span>
              <ArrowRightIcon
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover/hubs:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="border-line overscroll-contain rounded-xs border p-4 sm:p-6 lg:max-h-96 lg:overflow-y-auto">
            <HubDirectory />
          </div>
        </div>
      </div>
    </section>
  );
}
