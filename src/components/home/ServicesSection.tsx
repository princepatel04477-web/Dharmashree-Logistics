import { SectionHeading } from "@/components/motion/SectionHeading";
import { sectionHeadings } from "@/content/home";
import { services } from "@/content/services";
import { ServiceTile } from "./ServiceTile";

/* H2 · Services. An editorial grid rather than a row of equal cards: the
   first service takes seven columns and two rows, the next two stack in the
   five columns beside it, and any remainder share the last row. While
   `services.ts` is still empty the whole section is absent — an index label
   with nothing under it is worse than no section at all. */
export function ServicesSection() {
  if (services.length === 0) return null;

  const heading = sectionHeadings.services;

  return (
    <section className="border-line border-t py-24 sm:py-28 lg:py-32">
      <div className="wrap flex flex-col gap-12">
        <SectionHeading
          index={heading.index}
          title={heading.title}
          titleClassName="font-display text-headline text-ink leading-headline tracking-display"
        />

        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {services.map((service, index) => (
            <ServiceTile
              key={service.slug}
              service={service}
              index={index}
              total={services.length}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
