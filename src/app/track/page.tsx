import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { ArrowLink } from "@/components/layout/ArrowLink";
import { LrSlip } from "@/components/track/LrSlip";
import { NoNumberPanel } from "@/components/track/NoNumberPanel";
import { StatusLadder } from "@/components/track/StatusLadder";
import { TrackPanel } from "@/components/track/TrackPanel";
import { company } from "@/content/company";
import { images } from "@/content/images";
import { track } from "@/content/track";
import { backendMode } from "@/lib/backend/config";

/* `/track` — the AWB / LR handoff (Prompts 08 and 12), or the live LR lookup
   once the client's backend is connected (`backendMode`, fixed at build time).

   Without a backend — the default — the page is honest by design: there is no
   live tracking behind it and nothing here says otherwise. The visitor's AWB, LR
   or tracking number is validated and passed to the desk's own channel, and the
   page says exactly that much — no status table, no progress rail, no "in
   transit" badge that nothing could keep true.

   The line under the H1 names a channel, so it is built from the facts: with the
   WhatsApp number set it promises WhatsApp, and until then it says the desk will
   share status on request. `company.ts` can make that sentence true without this
   file changing.

   With a backend, the card runs the LR + SMS-code flow and shows the real status,
   so the lede and the meta description switch to `track.live`. The sections
   below (where the number comes from, what each status means) hold true in both
   modes and are not touched. */

const lineChannelNote =
  company.whatsapp === null
    ? track.lineChannelFallback
    : (track.lineChannelNote ?? track.lineChannelFallback);

const live = backendMode !== "off";

export const metadata: Metadata = {
  title: track.metadata.title,
  description: live ? track.live.metadataDescription : track.metadata.description,
  alternates: { canonical: "/track/" },
};

export default function TrackPage() {
  return (
    <>
      <PageIntro
        eyebrow={track.eyebrow}
        title={track.title}
        lede={live ? track.live.line : `${track.line} ${lineChannelNote}`}
        imageKey={images.pages.track.key}
        imageAlt={images.pages.track.alt}
        overlap
      />

      {/* The lookup sits in a white card pulled up 64px over the bottom of the
          band: the form is the first thing under the heading. */}
      <section className="relative z-10 -mt-16 pb-14 sm:pb-16 lg:pb-20">
        <div className="wrap">
          <div className="bg-paper border-line shadow-card-lift max-w-2xl rounded-md border p-6 sm:p-8">
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
              titleClassName="font-display text-ink text-step-3 leading-headline tracking-display"
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

      {/* ——— What each status means (an explainer — no shipment is shown) ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <SectionHeading
              index={track.statuses.index}
              title={track.statuses.title}
              titleClassName="font-display text-ink text-step-3 leading-headline tracking-display"
            />
            <Reveal as="p" className="text-ink-2 max-w-measure leading-body text-sm font-light">
              {track.statuses.note}
            </Reveal>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <StatusLadder items={track.statuses.items} />
          </div>
        </div>
      </section>

      {/* ——— No number to hand ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              index={track.noNumber.index}
              title={track.noNumber.title}
              titleClassName="font-display text-ink text-step-3 leading-headline tracking-display"
            />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <NoNumberPanel />
          </div>
        </div>
      </section>

      {/* ——— Help ——— */}
      <section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <div className="wrap grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              index={track.help.index}
              title={track.help.title}
              titleClassName="font-display text-ink text-step-3 leading-headline tracking-display"
            />
          </div>
          <div className="flex flex-col items-start gap-6 lg:col-span-7 lg:col-start-6">
            <Reveal as="p" className="text-ink-2 max-w-measure leading-body text-sm font-light">
              {track.help.body}
            </Reveal>
            <ArrowLink href={track.help.linkHref} label={track.help.linkLabel} />
          </div>
        </div>
      </section>
    </>
  );
}
