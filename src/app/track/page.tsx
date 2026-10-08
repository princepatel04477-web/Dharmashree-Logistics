import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { LrSlip } from "@/components/track/LrSlip";
import { TrackPanel } from "@/components/track/TrackPanel";
import { company } from "@/content/company";
import { track } from "@/content/track";

/* `/track` — the LR handoff (Prompt 08).

   Honest by design: there is no live tracking behind this page and nothing here
   says otherwise. The visitor's LR number is validated and passed to the desk's
   own channel, and the page says exactly that much — no status table, no
   progress rail, no "in transit" badge that nothing could keep true.

   The line under the H1 names a channel, so it is built from the facts: with the
   WhatsApp number set it promises WhatsApp, and until then it says the desk will
   share status on request. `company.ts` can make that sentence true without this
   file changing. */

const lineChannelNote =
  company.whatsapp === null
    ? track.lineChannelFallback
    : (track.lineChannelNote ?? track.lineChannelFallback);

export const metadata: Metadata = {
  title: track.metadata.title,
  description: track.metadata.description,
  alternates: { canonical: "/track/" },
};

export default function TrackPage() {
  return (
    <>
      <section className="border-line border-b">
        <div className="wrap grid grid-cols-1 gap-8 py-16 sm:py-20 lg:grid-cols-12 lg:gap-10 lg:py-24">
          <div className="lg:col-span-7">
            <SectionHeading
              as="h1"
              index={track.eyebrow}
              title={track.title}
              titleClassName="font-display text-ink text-display leading-display tracking-display font-light"
            />
          </div>
          <Reveal
            as="p"
            className="text-ink-2 max-w-measure leading-body text-base font-light lg:col-span-5 lg:pt-10"
          >
            {track.line} {lineChannelNote}
          </Reveal>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20">
        <div className="wrap">
          <div className="max-w-xl">
            <TrackPanel />
          </div>
        </div>
      </section>

      {/* ——— Where the number comes from ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 items-start gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-6">
            <SectionHeading
              index="01"
              title={track.explainer.title}
              titleClassName="font-display text-ink text-step-3 leading-headline tracking-display font-light"
            />
            <div className="flex flex-col gap-4">
              {track.explainer.body.map((paragraph) => (
                <Reveal
                  as="p"
                  key={paragraph}
                  className="text-ink-2 max-w-measure leading-body text-sm font-light"
                >
                  {paragraph}
                </Reveal>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <LrSlip />
          </div>
        </div>
      </section>
    </>
  );
}
