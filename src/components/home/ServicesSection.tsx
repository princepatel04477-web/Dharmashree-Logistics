import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { sectionHeadings, sectionLinks } from "@/content/home";
import { services } from "@/content/services";
import { SECTION_INDEX_CLASS, SECTION_TITLE_CLASS } from "./shared";
import { ServiceTile } from "./ServiceTile";

/* H2 · Services, on white. Four photo cards, two by two from `md` up and one
   column on phones. While `services.ts` is empty the whole section is absent:
   an index label with nothing under it is worse than no section at all. */
export function ServicesSection() {
  if (services.length === 0) return null;

  const heading = sectionHeadings.services;

  return (
    <section className="bg-paper py-20 sm:py-24 lg:py-28">
      <div className="wrap flex flex-col gap-10 sm:gap-12">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            index={heading.index}
            title={heading.title}
            className={SECTION_INDEX_CLASS}
            titleClassName={SECTION_TITLE_CLASS}
          />
          <Link
            href={sectionLinks.services.href}
            className="group/all text-brand inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase sm:pb-2"
          >
            <span className="relative">
              {sectionLinks.services.label}
              <span
                aria-hidden="true"
                className="bg-brand absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/all:scale-x-100"
              />
            </span>
            <ArrowRightIcon
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover/all:translate-x-0.5"
            />
          </Link>
        </div>

        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {services.map((service, index) => (
            <ServiceTile key={service.slug} service={service} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}
