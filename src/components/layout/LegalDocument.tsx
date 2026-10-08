import { PageIntro } from "@/components/layout/PageIntro";
import type { LegalDoc } from "@/content/legal";
import { formatDateIN } from "@/lib/format";

/* `/privacy` and `/terms`: the intro band, then numbered sections on a
   reading measure, each title in the left four columns at `lg`. */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageIntro
        eyebrow={doc.eyebrow}
        title={doc.title}
        lede={doc.lede}
        footnote={`${doc.updatedLabel} ${formatDateIN(doc.updated)}`}
      />

      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap">
          <ol className="divide-line border-line divide-y border-y">
            {doc.sections.map((section, index) => (
              <li
                key={section.title}
                className="grid grid-cols-1 gap-4 py-8 sm:py-10 lg:grid-cols-12 lg:gap-10"
              >
                <div className="flex items-baseline gap-4 lg:col-span-4">
                  <span className="section-index">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="font-display text-ink text-2xl leading-tight font-light">
                    {section.title}
                  </h2>
                </div>
                <div className="text-ink-2 leading-body max-w-2xl space-y-4 text-base font-light lg:col-span-8">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.items !== undefined && section.items.length > 0 && (
                    <ul className="border-line space-y-2 border-l pl-5">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
