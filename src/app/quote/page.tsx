import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { QuoteAside } from "@/components/quote/QuoteAside";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { quote } from "@/content/quote";

/* `/quote` — the enquiry form (Prompt 08).

   The H1 band and the desk rail are server-rendered; only the wizard itself is a
   client component, so the page's copy and its headline are in the exported HTML
   and the page is readable — and complete — without JavaScript having arrived
   yet. The one filled button on the page is the form's submit.

   `?service=<slug>` and `?to=<hub id>` are read on mount by the form (see
   `QuoteForm`): `output: "export"` rules out `searchParams` here, and the CTAs
   that write those parameters already come from `quoteHrefForService()`. */

const responseLine =
  quote.responseNote === null ? quote.responseLine : `${quote.responseLine} ${quote.responseNote}`;

export const metadata: Metadata = {
  title: quote.metadata.title,
  description: quote.metadata.description,
  alternates: { canonical: "/quote/" },
};

export default function QuotePage() {
  return (
    <>
      <section className="border-line border-b">
        <div className="wrap grid grid-cols-1 gap-8 py-16 sm:py-20 lg:grid-cols-12 lg:gap-10 lg:py-24">
          <div className="lg:col-span-7">
            <SectionHeading
              as="h1"
              index={quote.eyebrow}
              title={quote.title}
              titleClassName="font-display text-ink text-display leading-display tracking-display"
            />
          </div>
          <Reveal
            as="p"
            className="text-ink-2 max-w-measure leading-body text-base font-light lg:col-span-5 lg:pt-10"
          >
            {responseLine}
          </Reveal>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 items-start gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <QuoteForm />
          </div>
          <QuoteAside />
        </div>
      </section>
    </>
  );
}
