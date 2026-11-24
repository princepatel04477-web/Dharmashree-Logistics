import type { Metadata } from "next";
import { ArrowLink } from "@/components/layout/ArrowLink";
import { PageIntro } from "@/components/layout/PageIntro";
import { TruckForm } from "@/components/truck/TruckForm";
import { truckPage } from "@/content/truck";

/* `/attach-truck` — the truck attachment and vendor onboarding application.

   The intro band and the rail are server-rendered; only the form is a client
   component, so the page's headline and what happens after applying are in the
   exported HTML before JavaScript arrives. The rail is a plain aside, sticky
   beside the long form from 1024px up. The page's filled buttons are the
   header's "Enquire now" and the form's submit (house rule 6). */

export const metadata: Metadata = {
  title: truckPage.metaTitle,
  description: truckPage.metaDescription,
  alternates: { canonical: "/attach-truck/" },
};

export default function AttachTruckPage() {
  const { aside } = truckPage;

  return (
    <>
      <PageIntro eyebrow={truckPage.eyebrow} title={truckPage.title} lede={truckPage.lede} />

      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 items-start gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <TruckForm />
          </div>

          <aside className="border-line bg-paper-2 flex flex-col gap-6 rounded-xs border p-6 sm:p-8 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
            <p className="label-caps">{aside.title}</p>
            <ol className="flex flex-col gap-3">
              {aside.steps.map((line, index) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="text-brand shrink-0 font-mono text-[11px] leading-6">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-ink-2 leading-body text-sm font-light">{line}</span>
                </li>
              ))}
            </ol>
            {aside.contactEmail !== null && (
              <p className="text-ink-2 border-line border-t pt-6 text-sm font-light">
                {aside.contactLead}{" "}
                <a
                  href={`mailto:${aside.contactEmail}`}
                  className="text-brand-deep hover:text-ink underline underline-offset-4"
                >
                  {aside.contactEmail}
                </a>
              </p>
            )}
            <div className="border-line flex flex-col gap-3 border-t pt-6">
              <p className="text-muted text-sm font-light">{aside.partnersNote}</p>
              <ArrowLink href={aside.partnersHref} label={aside.partnersLabel} />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
