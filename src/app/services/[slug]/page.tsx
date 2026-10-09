import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "lucide-react";
import { MapCanvas } from "@/components/map/MapCanvas";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { PageIntro } from "@/components/layout/PageIntro";
import { IncludedList } from "@/components/services/IncludedList";
import { FleetSection } from "@/components/services/FleetSection";
import { ServiceSignature } from "@/components/services/ServiceSignature";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/vendor/origin";
import { Magnet } from "@/components/vendor/reactbits";
import { company } from "@/content/company";
import { HUBS, ORIGIN } from "@/content/hubs";
import { fleetForService } from "@/content/fleet";
import { serviceImage } from "@/content/images";
import { quoteCta, quoteHrefForService, whatsapp, whatsappLink } from "@/content/navigation";
import { findService, serviceDetail, services, servicesIndex } from "@/content/services";
import { formatPhoneIN } from "@/lib/format";
import { cn, numbered } from "@/lib/utils";
import type { Service } from "@/content/types";
import { InnerPage } from "@/components/layout/InnerPage";

/* `/services/[slug]` — the detail template (Prompt 06).

   Blocks are assembled in order, then numbered by position *after* the empty
   ones are dropped: warehousing has no `vehicles`, so its page runs 01–04 with
   no gap in the sequence (house rule 4 — an empty block is absent, never a
   heading over a hole).

   The aside is `lg:sticky lg:top-24 lg:self-start` on the grid item itself, so
   it travels through the row it shares with the blocks and can never reach past
   the section into the footer. It carries the page's one filled button, plus the
   contact rows `company.ts` actually has.

   Under `output: export` only `generateStaticParams` can be served, so that is
   the whole list; an unknown slug falls through `notFound()` to the static 404
   (dev logs Next's export validation for that request — closing
   `dynamicParams` only trades the 404 for a 500, so it stays open and unused). */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = findService(slug);
  if (service === undefined) return {};

  return {
    title: service.name,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}/` },
  };
}

interface DetailBlock {
  readonly id: string;
  readonly title: string;
  readonly body: ReactNode;
}

interface ContactRow {
  readonly label: string;
  readonly href: string;
  readonly value: string;
  readonly external: boolean;
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = findService(slug);
  if (service === undefined) notFound();

  const vehicles = fleetForService(service);
  const slot = serviceImage(service.slug);
  const position = services.findIndex((entry) => entry.slug === service.slug);
  const previous = position > 0 ? services[position - 1] : undefined;
  const next = position >= 0 && position < services.length - 1 ? services[position + 1] : undefined;

  const blocks: DetailBlock[] = [];

  if (service.bullets.length > 0) {
    blocks.push({
      id: "included",
      title: serviceDetail.includedTitle,
      body: <IncludedList service={service} />,
    });
  }

  if (service.sections.length > 0) {
    blocks.push({
      id: "detail",
      title: serviceDetail.detailTitle,
      body: (
        <div className="flex flex-col gap-10">
          {service.sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-4">
              <h3 className="font-display text-ink leading-headline tracking-display text-2xl">
                {section.title}
              </h3>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-ink-2 max-w-measure leading-body text-sm font-light"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      ),
    });
  }

  if (service.bestFor.length > 0) {
    blocks.push({
      id: "best-for",
      title: serviceDetail.bestForTitle,
      body: (
        <ul className="flex flex-col gap-3">
          {service.bestFor.map((item) => (
            <li key={item} className="text-ink-2 leading-body flex items-start gap-3 text-sm">
              <span aria-hidden="true" className="bg-brand mt-2 size-1 shrink-0 rounded-full" />
              <span className="font-light">{item}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (vehicles.length > 0) {
    blocks.push({
      id: "fleet",
      title: serviceDetail.vehiclesTitle,
      body: <FleetSection vehicles={vehicles} density="detail" />,
    });
  }

  /* Intra-city and storage services have no corridor to draw, so the map is
     a per-service choice (`showLanes`), not a given. */
  if (service.showLanes) {
    blocks.push({
      id: "lanes",
      title: serviceDetail.lanesTitle,
      body: (
        <div className="flex flex-col gap-6">
          <p className="text-ink-2 max-w-measure leading-body text-sm font-light">
            {serviceDetail.lanesLine(HUBS.length, ORIGIN.name)} {serviceDetail.lanesNote}
          </p>
          <MapCanvas mode="hero" className="mx-auto w-full max-w-[26rem]" />
        </div>
      ),
    });
  }

  if (service.questions.length > 0) {
    blocks.push({
      id: "questions",
      title: serviceDetail.questionsTitle,
      body: <FaqAccordion items={[...service.questions]} />,
    });
  }

  return (
    <InnerPage>
      {/* ——— Intro: the service's photo when the file exists, a solid
              --brand-deep band until then. The H1 is server-rendered, then split
              client-side. ——— */}
      <PageIntro
        eyebrow={`${serviceDetail.eyebrow} ${numbered(position)}`}
        title={service.name}
        lede={service.headline}
        imageKey={slot?.key}
        imageAlt={slot?.alt}
      />

      {/* ——— The page's long-form introduction ——— */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap flex flex-col gap-4">
          {service.body.map((paragraph) => (
            <Reveal
              as="p"
              key={paragraph}
              className="text-ink-2 max-w-measure leading-body text-base font-light"
            >
              {paragraph}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ——— The service's own interactive block (Prompt 11) ——— */}
      <ServiceSignature service={service} />

      {/* ——— Blocks, numbered by position — with the aside alongside ——— */}
      <div className="wrap grid grid-cols-1 items-start gap-x-10 gap-y-10 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-7">
          {blocks.map((block, index) => (
            /* No aria-labelledby: SectionHeading renders the real h2 inside, and
               pointing a landmark at a hidden duplicate of its text would give
               screen readers the same line twice. */
            <section
              key={block.id}
              className="border-line flex flex-col gap-8 border-t py-14 sm:py-16 lg:py-20"
            >
              <SectionHeading
                index={numbered(index)}
                title={block.title}
                titleClassName="font-display text-ink text-step-3 leading-headline tracking-display"
              />
              {block.body}
            </section>
          ))}
        </div>

        <aside className="border-line bg-paper-2 flex flex-col gap-6 rounded-xs border p-6 sm:p-8 lg:sticky lg:top-24 lg:col-span-4 lg:col-start-9 lg:self-start">
          <p className="label-caps">{serviceDetail.asideTitle}</p>
          <p className="text-ink-2 leading-body text-sm font-light">{serviceDetail.asideNote}</p>

          {/* `w-full` belongs on the Magnet wrapper as well: the vendor renders
              an inline-flex span, so the button would otherwise shrink-wrap to
              its own label instead of filling the aside. */}
          <Magnet strength={10} className="w-full">
            <Button asChild variant="default" className="w-full">
              <Link href={quoteHrefForService(service.slug)}>{quoteCta.label}</Link>
            </Button>
          </Magnet>

          <ContactRows service={service} />
        </aside>
      </div>

      {/* ——— Catalogue navigation: the neighbours in `services.ts`, which is the
            truth — no related-content guessing. ——— */}
      <nav aria-label="More services" className="border-line border-t py-10 sm:py-12 lg:py-14">
        <div className="wrap grid grid-cols-1 gap-6 sm:grid-cols-3">
          <NeighbourLink service={previous} side="previous" />
          <div className="flex items-center justify-center">
            <Link
              href={servicesIndex.backHref}
              className="text-ink-2 hover:text-ink font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
            >
              {servicesIndex.backLabel}
            </Link>
          </div>
          <NeighbourLink service={next} side="next" />
        </div>
      </nav>
    </InnerPage>
  );
}

/* Rows only exist when the fact they show does. With no numbers published the
   aside says so in one line instead of rendering an empty "Reach us" block. */
function contactRows(service: Service): ContactRow[] {
  const rows: ContactRow[] = [];
  const whatsappNumber = company.whatsapp;
  const whatsappHref =
    whatsappNumber === null ? null : whatsappLink(serviceDetail.whatsappMessage(service.name));

  if (whatsappHref !== null && whatsappNumber !== null) {
    rows.push({
      label: whatsapp.label,
      href: whatsappHref,
      value: formatPhoneIN(whatsappNumber),
      external: true,
    });
  }
  if (company.phone !== null) {
    rows.push({
      label: serviceDetail.callLabel,
      href: `tel:${company.phone}`,
      value: formatPhoneIN(company.phone),
      external: false,
    });
  }
  if (company.email !== null) {
    rows.push({
      label: serviceDetail.emailLabel,
      href: `mailto:${company.email}`,
      value: company.email,
      external: false,
    });
  }
  return rows;
}

function ContactRows({ service }: { service: Service }) {
  const rows = contactRows(service);

  if (rows.length === 0) {
    return (
      <p className="text-muted border-line leading-body border-t pt-5 text-xs font-light">
        {serviceDetail.ctaNote}
      </p>
    );
  }

  return (
    <ul className="border-line flex flex-col gap-2 border-t pt-5">
      {rows.map((row) => (
        <li key={`${row.label}-${row.href}`}>
          <a
            href={row.href}
            target={row.external ? "_blank" : undefined}
            rel={row.external ? "noopener" : undefined}
            className="text-ink-2 hover:text-ink inline-flex w-full items-center justify-between gap-4 text-sm font-light transition-colors duration-200"
          >
            <span className="label-caps shrink-0">{row.label}</span>
            <span className="min-w-0 truncate">{row.value}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function NeighbourLink({
  service,
  side,
}: {
  service: Service | undefined;
  side: "previous" | "next";
}) {
  if (service === undefined) return <span aria-hidden="true" className="hidden sm:block" />;

  const isNext = side === "next";
  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        "group/nb text-ink-2 hover:text-ink flex flex-col gap-1.5 transition-colors duration-200",
        isNext && "sm:items-end",
      )}
    >
      <span className="label-caps">
        {isNext ? serviceDetail.nextLabel : serviceDetail.previousLabel}
      </span>
      <span className="flex items-center gap-2 text-sm font-light">
        {!isNext && (
          <ArrowRightIcon
            aria-hidden="true"
            className="text-brand size-4 rotate-180 transition-transform duration-200 group-hover/nb:-translate-x-0.5"
          />
        )}
        {service.name}
        {isNext && (
          <ArrowRightIcon
            aria-hidden="true"
            className="text-brand size-4 transition-transform duration-200 group-hover/nb:translate-x-0.5"
          />
        )}
      </span>
    </Link>
  );
}
