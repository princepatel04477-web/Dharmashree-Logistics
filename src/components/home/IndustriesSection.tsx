import { SectionHeading } from "@/components/motion/SectionHeading";
import { sectionHeadings } from "@/content/home";
import { industryImage } from "@/content/images";
import { industries } from "@/content/industries";
import { IndustryTile } from "./IndustryTile";
import { industryIcon, SECTION_TITLE_CLASS } from "./shared";

/* H5 · Industries, on `--brand-tint`. One photo tile per entry in
   `company.industries`: the photo fills the tile, a single-hue `--brand-deep`
   gradient on the lower part carries the name and note in white. From `lg` the
   tiles share one row; below it they are a horizontal scroll-snap strip that is
   itself a keyboard-focusable region. A name with no photo slot still renders,
   on a plain `--brand-deep` tile. */
export function IndustriesSection() {
  const cards = industries();
  if (cards.length === 0) return null;

  const heading = sectionHeadings.industries;

  return (
    <section className="bg-brand-tint py-20 sm:py-24 lg:py-28">
      <div className="wrap flex flex-col gap-10 sm:gap-12">
        <SectionHeading
          index={heading.index}
          title={heading.title}
          titleClassName={SECTION_TITLE_CLASS}
        />

        <ul
          tabIndex={0}
          aria-label={heading.title}
          className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-4 sm:-mx-12 sm:scroll-px-12 sm:px-12 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {cards.map((industry, index) => {
            const slot = industryImage(industry.name);
            return (
              <IndustryTile
                key={industry.name}
                name={industry.name}
                note={industry.note}
                slot={slot}
                icon={industryIcon(slot === null ? null : slot.key)}
                index={index}
              />
            );
          })}
        </ul>
      </div>
    </section>
  );
}
