import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { commitments, sectionHeadings, sectionLinks } from "@/content/home";
import { commitmentIcon, HomeIcon, SECTION_TITLE_CLASS } from "./shared";

/* H6 · How we work, on white. The commitments from the company profile, each
   with a lucide icon in a `--brand-tint` circle, a `--brand` number and its
   title. The titles are the content; the full text lives on `/about`, which
   this section links to. Every commitment in `about.ts` is shown (the page
   never trims the profile), followed by the giving line while
   `company.givingPercent` is set; with none the section is absent. */
export function CommitmentsSection() {
  if (commitments.length === 0) return null;

  const heading = sectionHeadings.commitments;

  return (
    <section className="bg-paper py-20 sm:py-24 lg:py-28">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col items-start gap-6 lg:col-span-4">
          <SectionHeading
            index={heading.index}
            title={heading.title}
            titleClassName={SECTION_TITLE_CLASS}
          />
          <Link
            href={sectionLinks.commitments.href}
            className="group/about text-brand inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase"
          >
            <span className="relative">
              {sectionLinks.commitments.label}
              <span
                aria-hidden="true"
                className="bg-brand absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/about:scale-x-100"
              />
            </span>
            <ArrowRightIcon
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover/about:translate-x-0.5"
            />
          </Link>
        </div>

        <ol className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-8">
          {commitments.map((title, index) => {
            return (
              <li key={title}>
                <Reveal
                  delay={(index % 2) * 0.08}
                  className="border-line flex h-full flex-col gap-5 border-t pt-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-brand-tint text-brand flex size-12 items-center justify-center rounded-full">
                      <HomeIcon
                        name={commitmentIcon(index)}
                        aria-hidden="true"
                        className="size-5"
                        strokeWidth={1.75}
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-brand font-display tracking-display text-3xl leading-none"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="font-display text-ink leading-headline tracking-display text-2xl">
                    {title}
                  </p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
