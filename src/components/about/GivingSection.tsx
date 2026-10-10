import { HeartHandshakeIcon } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { about } from "@/content/about";

/* `/about` · Giving back. A short section straight after the commitments: the
   heading on the left, an icon badge on `--brand-tint` and the statement on the
   right. The figure arrives pre-formatted in `about.giving`; with
   `company.givingPercent` null that is null and the section is absent. */
export function GivingSection() {
  const giving = about.giving;
  if (giving === null) return null;

  return (
    <section className="border-line border-t py-14 sm:py-16 lg:py-20">
      <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading
            index={giving.index}
            title={giving.title}
            titleClassName="font-display text-ink text-4xl leading-headline tracking-display"
          />
        </div>
        <Reveal className="flex items-start gap-5 lg:col-span-7 lg:col-start-6 lg:pt-10">
          <span className="bg-brand-tint text-brand flex size-12 shrink-0 items-center justify-center rounded-full">
            <HeartHandshakeIcon aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </span>
          <div className="max-w-measure flex flex-col gap-4">
            {giving.body.map((paragraph, index) => (
              <p
                key={paragraph}
                className={
                  index === 0
                    ? "font-display text-ink leading-headline tracking-display text-2xl sm:text-3xl"
                    : "text-ink-2 leading-body text-base font-light"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
