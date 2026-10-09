import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import { QuoteAside } from "@/components/quote/QuoteAside";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { quote } from "@/content/quote";
import { InnerPage } from "@/components/layout/InnerPage";

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
    <InnerPage>
      <PageIntro eyebrow={quote.eyebrow} title={quote.title} lede={responseLine} />

      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 items-start gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <QuoteForm />
          </div>
          <QuoteAside />
        </div>
      </section>
    </InnerPage>
  );
}
