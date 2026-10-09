import type { Metadata } from "next";
import { ArrowLink } from "@/components/layout/ArrowLink";
import { PageIntro } from "@/components/layout/PageIntro";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { FaqAccordion } from "@/components/vendor/origin";
import { company } from "@/content/company";
import { contact } from "@/content/contact";
import { faqs } from "@/content/faq";
import { contactLines, contactLinks, quoteCta } from "@/content/navigation";
import { InnerPage } from "@/components/layout/InnerPage";

/* `/contact` — channels, the quote route, and the general FAQ (#faq, linked
   from the footer). Every channel row is a fact from `company.ts` via
   `contactLinks()` / `contactLines()`; a null fact is simply not a row, and
   the lede changes so the page never points at a number it cannot show.
   Contact actions are plain <a> tags (house rule 10). */

export const metadata: Metadata = {
  title: contact.metaTitle,
  description: contact.metaDescription,
  alternates: { canonical: "/contact/" },
};

const SECTION_TITLE = "font-display text-ink text-4xl leading-headline tracking-display";

export default function ContactPage() {
  const links = contactLinks();
  const lines = contactLines();

  return (
    <InnerPage>
      <PageIntro eyebrow={contact.eyebrow} title={contact.title} lede={contact.lede} />

      {/* ——— Channels ——— */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              index={contact.channelsIndex}
              title={contact.channelsTitle}
              titleClassName={SECTION_TITLE}
            />
          </div>
          <dl className="divide-line border-line divide-y border-y lg:col-span-8">
            {links.map((link) => (
              <div
                key={link.href}
                className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <dt className="label-caps">{contact.channelLabels[link.kind]}</dt>
                <dd>
                  <a
                    href={link.href}
                    className="font-display text-ink hover:text-brand-deep text-2xl [overflow-wrap:anywhere] transition-colors sm:text-3xl"
                  >
                    {link.label}
                  </a>
                </dd>
              </div>
            ))}
            <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
              <dt className="label-caps">{contact.officeLabel}</dt>
              <dd className="sm:text-right">
                <span className="font-display text-ink block text-2xl sm:text-3xl">
                  {contact.office}
                </span>
                {lines.map((line) =>
                  line.href === null ? (
                    <span key={line.text} className="text-ink-2 mt-1 block text-sm font-light">
                      {line.text}
                    </span>
                  ) : (
                    <a
                      key={line.text}
                      href={line.href}
                      className="text-ink-2 hover:text-brand-deep mt-1 block text-sm font-light underline-offset-4 hover:underline"
                    >
                      {line.text}
                    </a>
                  ),
                )}
              </dd>
            </div>
            {company.supportHours !== null && (
              <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
                <dt className="label-caps">{contact.hoursLabel}</dt>
                <dd className="font-display text-ink text-2xl sm:text-right sm:text-3xl">
                  {company.supportHours}
                </dd>
              </div>
            )}
            {company.branches.length > 0 && (
              <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
                <dt className="label-caps">{contact.branchesLabel}</dt>
                <dd className="font-display text-ink text-2xl sm:text-right sm:text-3xl">
                  {company.branches.map((branch) => `${branch.city}, ${branch.state}`).join(" · ")}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* ——— The quote route ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              index={contact.quoteIndex}
              title={contact.quoteTitle}
              titleClassName={SECTION_TITLE}
            />
          </div>
          <div className="flex flex-col gap-8 lg:col-span-8">
            <div className="space-y-2">
              <p className="text-ink-2 max-w-measure leading-body text-base font-light">
                {contact.quoteBody}
              </p>
              <ArrowLink href={quoteCta.href} label={contact.quoteLink} />
            </div>
            <div className="border-line space-y-2 border-t pt-8">
              <p className="text-ink-2 max-w-measure leading-body text-base font-light">
                {contact.trackBody}
              </p>
              <ArrowLink href="/track" label={contact.trackLink} />
            </div>
          </div>
        </div>
      </section>

      {/* ——— FAQ (footer links here) ——— */}
      {faqs.length > 0 && (
        <section id="faq" className="border-line scroll-mt-24 border-t py-14 sm:py-16 lg:py-20">
          <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading
                index={contact.faqIndex}
                title={contact.faqTitle}
                titleClassName={SECTION_TITLE}
              />
            </div>
            <div className="flex flex-col items-start gap-6 lg:col-span-8">
              <FaqAccordion items={faqs} />
              <ArrowLink href="/support" label={contact.faqMoreLabel} />
            </div>
          </div>
        </section>
      )}
    </InnerPage>
  );
}
