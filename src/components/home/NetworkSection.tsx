import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { HubDirectory } from "@/components/map/HubDirectory";
import { MapCanvas } from "@/components/map/MapCanvas";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { sectionHeadings, sectionLinks } from "@/content/home";
import { HUBS, REGIONS } from "@/content/hubs";
import { SECTION_TITLE_CLASS } from "./shared";

/* H3 · The network, on `--brand-tint`. The count line is derived from
   `hubs.ts`, never from `company.hubsServed`: the map and the directory are the
   truth, so the number can't disagree with them. The map keeps its own
   animation (GSAP draws the outline and corridors and pulses the Surat pin,
   which is a static ring under reduced motion). Under it sits the compact
   directory, the real rows clipped to a short scroll box at `lg`, with the full
   page one click away. */

const REGION_COUNT = REGIONS.filter((entry) => entry.id !== "all").length;

export function NetworkSection() {
  const heading = sectionHeadings.network;

  return (
    <section className="bg-brand-tint py-20 sm:py-24 lg:py-28">
      <div className="wrap flex flex-col gap-10 sm:gap-12">
        <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index={heading.index}
            title={heading.title}
            titleClassName={SECTION_TITLE_CLASS}
          />
          <p className="label-caps text-ink/75 lg:pb-2">
            {HUBS.length} hubs across {REGION_COUNT} regions
          </p>
        </div>

        {/* Full mode lays out its own 12-column map + panel grid, so it takes
            the container width instead of a hero-sized cap. */}
        <MapCanvas mode="full" />

        <div className="border-line-strong flex flex-col gap-6 border-t pt-8">
          <div className="flex items-end justify-between gap-6">
            <p className="section-index text-brand">{sectionLinks.network.directoryLabel}</p>
            <Link
              href={sectionLinks.network.href}
              className="group/hubs text-brand inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase"
            >
              <span className="relative">
                {sectionLinks.network.label}
                <span
                  aria-hidden="true"
                  className="bg-brand absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/hubs:scale-x-100"
                />
              </span>
              <ArrowRightIcon
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover/hubs:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="border-line bg-paper max-h-96 overflow-y-auto overscroll-contain rounded-md border p-4 sm:p-6">
            <HubDirectory />
          </div>
        </div>
      </div>
    </section>
  );
}
