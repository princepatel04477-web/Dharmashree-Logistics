import { ImageCurtain } from "@/components/motion/ImageCurtain";
import { SectionHeading } from "@/components/motion/SectionHeading";
import ResponsiveImage, { hasImage } from "@/components/media/ResponsiveImage";
import { ScrollCarousel } from "@/components/vendor/lightswind";
import { sectionHeadings } from "@/content/home";
import { industries, industryImageKey } from "@/content/industries";

/* H5 · Industries. Lightswind's scroll carousel owns this section as-is (GSAP
   pin + horizontal scrub), which is why the heading sits outside it — a pinned
   band should not have to carry a heading through the travel. Reduced motion
   leaves the vendored fallback: the same cards as a native swipeable strip.
   Cards are hairline boxes; no gradients, no tilt. */
export function IndustriesSection() {
  const cards = industries();
  if (cards.length === 0) return null;

  const heading = sectionHeadings.industries;

  return (
    <section className="border-line border-t">
      <div className="wrap pt-24 pb-10 sm:pt-28 lg:pt-32">
        <SectionHeading
          index={heading.index}
          title={heading.title}
          titleClassName="font-display text-headline text-ink leading-headline tracking-display"
        />
      </div>

      <ScrollCarousel className="pb-24 sm:pb-28 lg:pb-32">
        {cards.map((industry) => {
          const imageKey = industryImageKey(industry.name);
          const hasPhoto = hasImage(imageKey);
          return (
            <article
              key={industry.name}
              className="border-line bg-paper-2 flex w-72 shrink-0 flex-col gap-6 rounded-xs border p-6 sm:w-80 sm:p-8"
            >
              {hasPhoto && (
                <ImageCurtain className="aspect-video w-full rounded-xs">
                  <ResponsiveImage
                    imageKey={imageKey}
                    alt={industry.name}
                    sizes="(max-width: 640px) 80vw, 20rem"
                  />
                </ImageCurtain>
              )}
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-ink leading-headline tracking-display text-2xl">
                  {industry.name}
                </h3>
                {/* A name with no note yet renders as a name-only card. */}
                {industry.note !== "" && (
                  <p className="text-ink-2 text-sm font-light">{industry.note}</p>
                )}
              </div>
            </article>
          );
        })}
      </ScrollCarousel>
    </section>
  );
}
