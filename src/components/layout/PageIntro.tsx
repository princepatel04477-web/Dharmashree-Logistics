import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  lede: string;
  /** Optional line under the band (small caps), e.g. a count or a date. */
  footnote?: ReactNode;
}

/* The H1 band every inner page opens with — the same 7/5 split as
   `/services` and `/track`: masked-line H1 left, lede right, hairline under. */
export function PageIntro({ eyebrow, title, lede, footnote }: PageIntroProps) {
  return (
    <section className="border-line border-b">
      <div className="wrap flex flex-col gap-10 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <SectionHeading
              as="h1"
              index={eyebrow}
              title={title}
              titleClassName="font-display text-ink text-display leading-display tracking-display font-light"
            />
          </div>
          <Reveal
            as="p"
            className="text-ink-2 max-w-measure leading-body text-base font-light lg:col-span-5 lg:pt-10"
          >
            {lede}
          </Reveal>
        </div>
        {footnote !== undefined && <p className="label-caps">{footnote}</p>}
      </div>
    </section>
  );
}
