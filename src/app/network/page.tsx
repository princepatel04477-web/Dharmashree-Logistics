import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import { HubDirectory } from "@/components/map/HubDirectory";
import { MapCanvas } from "@/components/map/MapCanvas";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { HUBS, REGIONS } from "@/content/hubs";
import { images } from "@/content/images";
import { networkPage } from "@/content/network";

/* `/network` — the map at full width and the complete directory under it.
   The nav, the footer's hub band and the home page's "See every hub" link
   all land here. Map and directory share the root MapSelectionProvider, so a
   row picked below is the corridor drawn above. Counts come from `hubs.ts`
   only, never from `company.hubsServed`. */

export const metadata: Metadata = {
  title: networkPage.metaTitle,
  description: networkPage.metaDescription,
};

const REGION_COUNT = REGIONS.filter((entry) => entry.id !== "all").length;

export default function NetworkPage() {
  return (
    <>
      <PageIntro
        eyebrow={networkPage.eyebrow}
        title={networkPage.title}
        lede={networkPage.lede}
        footnote={networkPage.countLine(HUBS.length, REGION_COUNT)}
        imageKey={images.pages.network.key}
        imageAlt={images.pages.network.alt}
      />

      {/* ——— The map ——— */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap">
          <MapCanvas mode="full" />
        </div>
      </section>

      {/* ——— The directory, unclipped ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <SectionHeading
              index={networkPage.directoryIndex}
              title={networkPage.directoryTitle}
              titleClassName="font-display text-ink text-4xl leading-headline tracking-display"
            />
          </div>
          <HubDirectory className="lg:col-span-8" />
        </div>
      </section>
    </>
  );
}
