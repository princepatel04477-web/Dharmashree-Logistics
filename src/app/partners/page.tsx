import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import { ArrowLink } from "@/components/layout/ArrowLink";
import { DrawLine } from "@/components/motion/DrawLine";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { PartnerForm } from "@/components/partners/PartnerForm";
import { PartnersNetwork } from "@/components/partners/PartnersNetwork";
import { MicroLift } from "@/components/motion/MicroLift";
import { QuoteStepper } from "@/components/vendor/origin";
import { LogoLoop } from "@/components/vendor/reactbits";
import { partners, partnersPage } from "@/content/partners";

/* `/partners` — delivery partners (Prompt 13). The company profile's Delivery
   Partner page: the four reasons to join (set as an asymmetric list, not a row
   of equal cards), how onboarding walks, the transport partners already in
   Uttar Pradesh on a map and a directory, and the application form.

   The page's one filled button is the header's "Request a quote"; the join
   action in the intro is a text link to the form, and the form's submit is an
   outline button. Partner names on the loop are decorative (`aria-hidden`) — the
   directory beside the map is the real, keyboard-reachable list. */

export const metadata: Metadata = {
  title: partnersPage.metaTitle,
  description: partnersPage.metaDescription,
  alternates: { canonical: "/partners/" },
};

const SECTION_TITLE = "font-display text-ink text-4xl leading-headline tracking-display font-light";
const bandItems: string[] = partners.map((partner) => `${partner.name} · ${partner.city}`);

export default function PartnersPage() {
  const { benefits, onboarding, network, join } = partnersPage;

  return (
    <>
      <PageIntro
        eyebrow={partnersPage.eyebrow}
        title={partnersPage.title}
        lede={partnersPage.lede}
        footnote={<ArrowLink href={partnersPage.joinHref} label={partnersPage.joinLabel} />}
      />

      {/* ——— 01 · Why partner with us ——— */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <SectionHeading
              index={benefits.index}
              title={benefits.title}
              titleClassName={SECTION_TITLE}
            />
            <Reveal as="p" className="text-ink-2 max-w-measure leading-body text-base font-light">
              {partnersPage.intro}
            </Reveal>
          </div>
          <ol className="flex flex-col lg:col-span-8">
            {benefits.items.map((item, index) => (
              <li key={item.title} className="flex flex-col">
                {index > 0 && <DrawLine className="my-8" />}
                <MicroLift className="grid grid-cols-1 gap-3 sm:grid-cols-[3rem_1fr] sm:gap-6">
                  <span className="section-index sm:pt-2">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-3">
                    <h3 className="font-display text-ink leading-headline tracking-display text-2xl font-light sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="text-ink-2 max-w-measure leading-body text-sm font-light">
                      {item.body}
                    </p>
                  </div>
                </MicroLift>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ——— 02 · How joining works ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <SectionHeading
              index={onboarding.index}
              title={onboarding.title}
              titleClassName={SECTION_TITLE}
            />
            <Reveal as="p" className="text-ink-2 max-w-measure leading-body text-base font-light">
              {onboarding.note}
            </Reveal>
          </div>
          <div className="flex flex-col gap-8 lg:col-span-8">
            <QuoteStepper
              label={onboarding.label}
              steps={onboarding.steps.map((step) => step.title)}
              defaultValue={1}
              titleClassName="sr-only sm:not-sr-only"
            />
            <dl className="divide-line border-line divide-y border-y">
              {onboarding.steps.map((step) => (
                <div
                  key={step.title}
                  className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6"
                >
                  <dt className="font-display text-ink text-xl font-light">{step.title}</dt>
                  <dd className="text-ink-2 leading-body text-sm font-light">{step.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ——— 03 · Our delivery partners: map + directory ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <SectionHeading
                index={network.index}
                title={network.title}
                titleClassName={SECTION_TITLE}
              />
            </div>
            <Reveal
              as="p"
              className="text-ink-2 max-w-measure leading-body text-base font-light lg:col-span-6 lg:col-start-7 lg:pt-10"
            >
              {network.body}
            </Reveal>
          </div>
          <PartnersNetwork />
        </div>
        <div aria-hidden="true" className="border-line mt-14 border-y py-4">
          <LogoLoop
            items={bandItems}
            duration={60}
            decorative
            itemClassName="label-caps"
            separatorClassName="text-accent"
          />
        </div>
      </section>

      {/* ——— 04 · Join ——— */}
      <section id="join" className="border-line scroll-mt-24 border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <SectionHeading index={join.index} title={join.title} titleClassName={SECTION_TITLE} />
            <Reveal as="p" className="text-ink-2 max-w-measure leading-body text-base font-light">
              {join.body}
            </Reveal>
            <p className="text-muted text-sm font-light">{join.quoteNote}</p>
            <ArrowLink href={join.quoteHref} label={join.quoteLabel} />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <PartnerForm />
          </div>
        </div>
      </section>
    </>
  );
}
