import type { Metadata } from "next";
import { ArrowLink } from "@/components/layout/ArrowLink";
import { PageIntro } from "@/components/layout/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { ReadyChecklist } from "@/components/support/ReadyChecklist";
import { SupportFaq } from "@/components/support/SupportFaq";
import { company } from "@/content/company";
import { contact } from "@/content/contact";
import { contactLinks } from "@/content/navigation";
import { images } from "@/content/images";
import { support } from "@/content/support";

/* `/support` (Prompt 12). The company profile's Support page, made usable: the
   six questions it answers, filterable by topic, plus the four things to have
   ready and the ways to reach the team. Channel rows come from `contactLinks()`
   and drop with their facts; the hours row exists only when
   `company.supportHours` is set. Contact actions are plain <a> tags (house rule
   10); the internal routes are `ArrowLink`s. */

export const metadata: Metadata = {
  title: support.metaTitle,
  description: support.metaDescription,
  alternates: { canonical: "/support/" },
};

const SECTION_TITLE = "font-display text-ink text-4xl leading-headline tracking-display";

export default function SupportPage() {
  const links = contactLinks();

  return (
    <>
      <PageIntro
        eyebrow={support.eyebrow}
        title={support.title}
        lede={support.lede}
        imageKey={images.pages.support.key}
        imageAlt={images.pages.support.alt}
      />

      {/* ——— 01 · Have these ready ——— */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <SectionHeading
              index={support.ready.index}
              title={support.ready.title}
              titleClassName={SECTION_TITLE}
            />
            <Reveal as="p" className="text-ink-2 max-w-measure leading-body text-base font-light">
              {support.ready.note}
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ReadyChecklist label={support.ready.title} items={support.ready.items} />
          </div>
        </div>
      </section>

      {/* ——— 02 · Questions ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              index={support.faq.index}
              title={support.faq.title}
              titleClassName={SECTION_TITLE}
            />
          </div>
          <div className="lg:col-span-8">
            <SupportFaq />
          </div>
        </div>
      </section>

      {/* ——— 03 · More help ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <SectionHeading
              index={support.help.index}
              title={support.help.title}
              titleClassName={SECTION_TITLE}
            />
            <Reveal as="p" className="text-ink-2 max-w-measure leading-body text-base font-light">
              {support.help.body}
            </Reveal>
          </div>
          <div className="flex flex-col gap-8 lg:col-span-8">
            {links.length > 0 ? (
              <dl className="divide-line border-line divide-y border-y">
                {links.map((link) => (
                  <div
                    key={link.href}
                    className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between"
                  >
                    <dt className="label-caps">{contact.channelLabels[link.kind]}</dt>
                    <dd>
                      <a
                        href={link.href}
                        target={link.kind === "website" ? "_blank" : undefined}
                        rel={link.kind === "website" ? "noopener" : undefined}
                        className="font-display text-ink hover:text-brand-deep text-2xl [overflow-wrap:anywhere] transition-colors sm:text-3xl"
                      >
                        {link.label}
                      </a>
                    </dd>
                  </div>
                ))}
                {company.supportHours !== null && (
                  <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
                    <dt className="label-caps">{support.help.hoursLabel}</dt>
                    <dd className="font-display text-ink text-2xl sm:text-3xl">
                      {company.supportHours}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-muted border-line bg-paper-2 max-w-measure leading-body rounded-xs border p-6 text-xs font-light">
                {support.help.noChannels}
              </p>
            )}
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <ArrowLink href={support.help.pickupHref} label={support.help.pickupLabel} />
              <ArrowLink href={support.help.trackHref} label={support.help.trackLabel} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
