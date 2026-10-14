import type { Metadata } from "next";
import { BranchList } from "@/components/contact/BranchList";
import { MessageForm } from "@/components/contact/MessageForm";
import { ArrowLink } from "@/components/layout/ArrowLink";
import { PageIntro } from "@/components/layout/PageIntro";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { FaqAccordion } from "@/components/vendor/origin";
import { company } from "@/content/company";
import { contact } from "@/content/contact";
import { faqs } from "@/content/faq";
import {
  contactAddressLine,
  contactLinks,
  corporateOfficeLine,
  quoteCta,
  registrationLines,
  type FooterLine,
  type FooterLink,
} from "@/content/navigation";

/* `/contact` — channels, the message box, the branches and delivery partners,
   the quote route, and the general FAQ (#faq, linked from the footer). Every
   channel row is a fact from `company.ts` via `contactLinks()` and the address
   and registration line helpers; a null fact is simply not a row, and the lede changes so
   the page never points at a number it cannot show. Contact actions are plain
   <a> tags (house rule 10); the website row leaves the site, so it opens in a
   new tab like WhatsApp. */

const NEW_TAB_KINDS: readonly FooterLink["kind"][] = ["whatsapp", "website"];

export const metadata: Metadata = {
  title: contact.metaTitle,
  description: contact.metaDescription,
  alternates: { canonical: "/contact/" },
};

/* The channel links grouped by kind, in first-seen order, so every phone
   number sits under a single "Call" label. */
function channelRows(
  links: readonly FooterLink[],
): { kind: FooterLink["kind"]; links: FooterLink[] }[] {
  const rows: { kind: FooterLink["kind"]; links: FooterLink[] }[] = [];
  for (const link of links) {
    const row = rows.find((candidate) => candidate.kind === link.kind);
    if (row === undefined) rows.push({ kind: link.kind, links: [link] });
    else row.links.push(link);
  }
  return rows;
}

const SECTION_TITLE = "font-display text-ink text-4xl leading-headline tracking-display";

/* One labelled row of the channels list: a place name over its printed lines. */
function PlaceRow({
  label,
  place,
  lines,
}: {
  label: string;
  place: string | null;
  lines: readonly FooterLine[];
}) {
  return (
    <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
      <dt className="label-caps">{label}</dt>
      <dd className="sm:text-right">
        {place !== null && (
          <span className="font-display text-ink block text-2xl sm:text-3xl">{place}</span>
        )}
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
  );
}

export default function ContactPage() {
  const links = contactLinks();
  const office = corporateOfficeLine();
  const address = contactAddressLine();
  const registration = registrationLines();

  return (
    <>
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
            {channelRows(links).map((row) => {
              const newTab = NEW_TAB_KINDS.includes(row.kind);
              return (
                <div
                  key={row.kind}
                  className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <dt className="label-caps">{contact.channelLabels[row.kind]}</dt>
                  <dd className="flex flex-col sm:items-end">
                    {row.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target={newTab ? "_blank" : undefined}
                        rel={newTab ? "noopener" : undefined}
                        className="tap-target font-display text-ink hover:text-brand-deep text-2xl [overflow-wrap:anywhere] transition-colors sm:text-3xl"
                      >
                        {link.label}
                      </a>
                    ))}
                  </dd>
                </div>
              );
            })}
            {office !== null && (
              <PlaceRow
                label={contact.corporateOfficeLabel}
                place={contact.corporateOffice}
                lines={[office]}
              />
            )}
            {address !== null && (
              <PlaceRow label={contact.officeLabel} place={contact.office} lines={[address]} />
            )}
            {registration.length > 0 && (
              <PlaceRow label={contact.registrationLabel} place={null} lines={registration} />
            )}
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

      {/* ——— Message box ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <SectionHeading
              index={contact.messageIndex}
              title={contact.messageTitle}
              titleClassName={SECTION_TITLE}
            />
            <p className="text-ink-2 max-w-measure leading-body text-base font-light">
              {contact.messageBody}
            </p>
          </div>
          <div className="lg:col-span-8">
            <MessageForm variant="page" />
          </div>
        </div>
      </section>

      {/* ——— Branches and delivery partners ——— */}
      <section className="bg-brand-tint py-14 sm:py-16 lg:py-20">
        <div className="wrap flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading
                index={contact.branches.index}
                title={contact.branches.title}
                titleClassName={SECTION_TITLE}
              />
            </div>
            <p className="text-ink-2 max-w-measure leading-body text-base font-light lg:col-span-8">
              {contact.branches.body}
            </p>
          </div>
          <BranchList />
          <ArrowLink href="/partners" label={contact.branches.partnersLink} />
        </div>
      </section>

      {/* ——— The quote route ——— */}
      <section className="py-14 sm:py-16 lg:py-20">
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
    </>
  );
}
