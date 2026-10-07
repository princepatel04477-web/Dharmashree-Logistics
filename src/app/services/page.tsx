import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { FleetSection } from "@/components/services/FleetSection";
import { ServicesIndexList } from "@/components/services/ServicesIndexList";
import { HUBS } from "@/content/hubs";
import { fleetVehicles } from "@/content/fleet";
import { quoteCta } from "@/content/navigation";
import { services, servicesIndex } from "@/content/services";

/* `/services` — the index (Prompt 06).

   The catalogue is the content, so the page is one `<ol>` of rows, not a grid of
   cards: a row carries the number, the name, the summary and nothing else, and
   every one of them opens a real page. Below it sits the fleet grid, which
   `content/fleet.ts` derives from the services above — a vehicle appears there
   precisely because some service lists it.

   No CTA band here: the rows already link to the pages whose aside carries the
   one filled button, and a second filled button on this page would only compete
   with the header's. */

export const metadata: Metadata = {
  title: "Services",
  description: servicesIndex.lede,
};

export default function ServicesIndexPage() {
  const fleet = fleetVehicles();

  return (
    <>
      {/* ——— H1 band ——— */}
      <section className="border-line border-b">
        <div className="wrap flex flex-col gap-10 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <SectionHeading
                as="h1"
                index={servicesIndex.eyebrow}
                title={servicesIndex.title}
                titleClassName="font-display text-ink text-display leading-display tracking-display font-light"
              />
            </div>
            <Reveal
              as="p"
              className="text-ink-2 max-w-measure leading-body text-base font-light lg:col-span-5 lg:pt-10"
            >
              {servicesIndex.lede}
            </Reveal>
          </div>

          <p className="label-caps">{servicesIndex.countLine(services.length, HUBS.length)}</p>
        </div>
      </section>

      {/* ——— The rows. No landmark here and no hidden heading repeating the H1:
              the list's own h2s are the outline. ——— */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap">
          <ServicesIndexList services={services} />

          <div className="border-line mt-10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-ink-2 leading-body text-sm font-light">{servicesIndex.askLine}</p>
            <Link
              href={quoteCta.href}
              className="group/ask text-accent-ink inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase"
            >
              <span className="relative">
                {servicesIndex.askLabel}
                <span
                  aria-hidden="true"
                  className="bg-accent absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/ask:scale-x-100"
                />
              </span>
              <ArrowRightIcon
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover/ask:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ——— The fleet the services name ——— */}
      {fleet.length > 0 && (
        <section className="border-line border-t py-14 sm:py-16 lg:py-20">
          <div className="wrap flex flex-col gap-10">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
              {/* A plain h2, not a numbered section label: the rows above are
                  numbered 01–05 as items, and a numbered heading underneath
                  them would read as a sixth row. */}
              <h2 className="font-display text-ink text-step-3 leading-headline tracking-display font-light lg:col-span-5">
                {servicesIndex.fleetTitle}
              </h2>
              <p className="text-ink-2 max-w-measure leading-body text-sm font-light lg:col-span-6 lg:col-start-7">
                {servicesIndex.fleetNote}
              </p>
            </div>

            <FleetSection vehicles={fleet} />
          </div>
        </section>
      )}
    </>
  );
}
