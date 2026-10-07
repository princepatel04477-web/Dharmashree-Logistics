import { DrawLine } from "@/components/motion/DrawLine";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { commitments, sectionHeadings } from "@/content/home";

/* H6 · How we work. Three statements set large in a two-column editorial
   spread — heading left, promises right, separated by accent hairlines that
   draw themselves on entry. No icon grid, no cards: the promises carry it. */
export function CommitmentsSection() {
  if (commitments.length === 0) return null;

  const heading = sectionHeadings.commitments;

  return (
    <section className="border-line border-t py-24 sm:py-28 lg:py-32">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <SectionHeading
            index={heading.index}
            title={heading.title}
            titleClassName="font-display text-headline text-ink leading-headline font-light tracking-display"
          />
        </div>

        <div className="flex flex-col lg:col-span-8">
          {commitments.map((line, index) => (
            <div
              key={line}
              className={index === 0 ? "flex flex-col" : "flex flex-col pt-10 sm:pt-12"}
            >
              {index > 0 && <DrawLine className="mb-10 sm:mb-12" />}
              <p className="font-display text-ink leading-headline tracking-display text-2xl font-light sm:text-3xl">
                {line}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
