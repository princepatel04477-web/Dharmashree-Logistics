import type { Metadata } from "next";
import Link from "next/link";
import { QuoteBand } from "@/components/home/QuoteBand";
import { StatsStrip } from "@/components/home/StatsStrip";
import { ArrowLink } from "@/components/layout/ArrowLink";
import { BusinessSelector } from "@/components/about/BusinessSelector";
import { PageIntro } from "@/components/layout/PageIntro";
import { MapCanvas } from "@/components/map/MapCanvas";
import { DrawLine } from "@/components/motion/DrawLine";
import { PinnedSteps } from "@/components/motion/PinnedSteps";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { HeritageTimeline } from "@/components/vendor/origin";
import { about } from "@/content/about";
import { industries } from "@/content/industries";
import { services } from "@/content/services";
import { timeline } from "@/content/timeline";

/* `/about`. The company profile's own story (Prompt 10): the tagline as the
   H1, the three things logistics is about, the four commitments as a pinned
   scrub (GSAP), a business-type selector (Origin UI cards, Motion swap), then
   the service and industry lists from `company.ts` and the network from
   `hubs.ts`. The stats strip and the timeline are data-gated — with every
   company figure null and no timeline entries, both render nothing, and
   their numbered section disappears with them (house rule 4). */

export const metadata: Metadata = {
  title: about.metaTitle,
  description: about.metaDescription,
  alternates: { canonical: "/about/" },
};

const SECTION_TITLE = "font-display text-ink text-4xl leading-headline tracking-display font-light";

export default function AboutPage() {
  const carriedFor = industries();

  return (
    <>
      <PageIntro eyebrow={about.eyebrow} title={about.title} lede={about.lede} />

      <StatsStrip />

      {/* ——— 01 · More than moving goods ——— */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-4">
            <SectionHeading
              index={about.intro.index}
              title={about.intro.title}
              titleClassName={SECTION_TITLE}
            />
            {about.intro.paragraphs.map((paragraph) => (
              <Reveal
                key={paragraph}
                as="p"
                className="text-ink-2 leading-body max-w-measure text-base font-light"
              >
                {paragraph}
              </Reveal>
            ))}
          </div>
          <div className="flex flex-col lg:col-span-8">
            {about.intro.statements.map((line, index) => (
              <div
                key={line}
                className={index === 0 ? "flex flex-col" : "flex flex-col pt-10 sm:pt-12"}
              >
                {index > 0 && <DrawLine className="mb-10 sm:mb-12" />}
                <p className="font-display text-ink leading-headline tracking-display text-3xl font-light sm:text-4xl">
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— 02 · What drives us: the four commitments, pinned and scrubbed ——— */}
      <PinnedSteps
        index={about.drives.index}
        title={about.drives.title}
        lede={about.drives.lede}
        steps={about.drives.commitments}
      />

      {/* ——— 03 · Which business are you? ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <SectionHeading
                index={about.kinds.index}
                title={about.kinds.title}
                titleClassName={SECTION_TITLE}
              />
            </div>
            <Reveal
              as="p"
              className="text-ink-2 max-w-measure leading-body text-base font-light lg:col-span-6 lg:col-start-7 lg:pt-10"
            >
              {about.kinds.note}
            </Reveal>
          </div>
          <BusinessSelector />
        </div>
      </section>

      {/* ——— 04 · What we move ——— */}
      {services.length > 0 && (
        <section className="border-line border-t py-14 sm:py-16 lg:py-20">
          <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="flex flex-col items-start gap-6 lg:col-span-4">
              <SectionHeading
                index={about.moves.index}
                title={about.moves.title}
                titleClassName={SECTION_TITLE}
              />
              <ArrowLink href="/services" label={about.moves.linkLabel} />
            </div>
            <ol className="divide-line border-line divide-y border-y lg:col-span-8">
              {services.map((service, index) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group/svc grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1 py-5 sm:grid-cols-[3rem_1fr]"
                  >
                    <span className="section-index pt-2">{String(index + 1).padStart(2, "0")}</span>
                    <span className="font-display text-ink group-hover/svc:text-accent-ink text-2xl font-light transition-colors">
                      {service.name}
                    </span>
                    <span className="text-ink-2 col-start-2 text-sm font-light">
                      {service.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ——— 05 · Who we carry for ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              index={about.carries.index}
              title={about.carries.title}
              titleClassName={SECTION_TITLE}
            />
          </div>
          <dl className="divide-line border-line divide-y border-y lg:col-span-8">
            {carriedFor.map((industry) => (
              <div
                key={industry.name}
                className="grid grid-cols-1 gap-1 py-5 sm:grid-cols-2 sm:gap-8"
              >
                <dt className="font-display text-ink text-xl font-light">{industry.name}</dt>
                {industry.note !== "" && (
                  <dd className="text-ink-2 leading-body text-sm font-light">{industry.note}</dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ——— 06 · The network ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-6 lg:col-span-5">
            <SectionHeading
              index={about.reach.index}
              title={about.reach.title}
              titleClassName={SECTION_TITLE}
            />
            <p className="text-ink-2 max-w-measure leading-body text-base font-light">
              {about.reach.body}
            </p>
            <ArrowLink href="/network" label={about.reach.linkLabel} />
          </div>
          <div className="lg:col-span-7">
            <MapCanvas mode="hero" className="mx-auto w-full max-w-[30rem]" />
          </div>
        </div>
      </section>

      {/* ——— 07 · Timeline (data-gated) ——— */}
      {timeline.length > 0 && (
        <section className="border-line border-t py-14 sm:py-16 lg:py-20">
          <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading
                index={about.timeline.index}
                title={about.timeline.title}
                titleClassName={SECTION_TITLE}
              />
            </div>
            <div className="lg:col-span-8">
              <HeritageTimeline entries={timeline} />
            </div>
          </div>
        </section>
      )}

      <QuoteBand />
    </>
  );
}
