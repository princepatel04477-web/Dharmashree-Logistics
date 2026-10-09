import type { ReactNode } from "react";
import { CorridorTrace } from "@/components/motion/CorridorTrace";
import { DrawLine } from "@/components/motion/DrawLine";
import { ImageCurtain } from "@/components/motion/ImageCurtain";
import { MarqueeLoop } from "@/components/motion/MarqueeLoop";
import { MicroLift } from "@/components/motion/MicroLift";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";
import { Button } from "@/components/ui/button";
import { company } from "@/content/company";

function DemoPanel({
  index,
  title,
  note,
  children,
}: {
  index: string;
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div className="border-line bg-paper-2 space-y-4 border p-6 sm:p-8">
      <div className="space-y-1">
        <p className="section-index">
          {index} — {title}
        </p>
        <p className="text-muted text-xs font-light">{note}</p>
      </div>
      {children}
    </div>
  );
}

/* Prompt 02 verification: every motion primitive live, in one place.
   Lenis smooth-scrolls the page, the route wipe fires on navigation,
   and everything renders static under prefers-reduced-motion. */
export function MotionShowcase() {
  return (
    <section aria-labelledby="sg-motion" className="space-y-8">
      <div className="wrap space-y-3">
        <p className="section-index">05 — Motion</p>
        <h2 id="sg-motion" className="font-display text-3xl tracking-tight">
          One system: Lenis, GSAP, Motion
        </h2>
      </div>

      <div className="wrap grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DemoPanel
          index="MO-1"
          title="Reveal"
          note="Rises 24px and fades in once at 85% viewport. Transform + opacity only."
        >
          <Reveal>
            <p className="font-display text-2xl">Corridors, documented.</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-ink-2 mt-2 text-sm font-light">
              Staggered 150ms — delay prop, same trigger.
            </p>
          </Reveal>
        </DemoPanel>

        <DemoPanel
          index="MO-2"
          title="SectionHeading"
          note="Index label plus masked line reveal; plain text on the server."
        >
          <SectionHeading
            index="MO-2 — Motion"
            title="Freight, drawn in order"
            as="h3"
            titleClassName="font-display text-3xl tracking-tight"
          />
        </DemoPanel>

        <DemoPanel
          index="MO-3"
          title="ImageCurtain"
          note="Clip-path wipe opens downward; media settles from 1.08 scale."
        >
          <ImageCurtain className="aspect-[16/10]">
            <div className="bg-accent-ink text-paper flex h-full w-full items-center justify-center">
              <p className="font-mono text-xs tracking-[0.2em] uppercase">Media reveals here</p>
            </div>
          </ImageCurtain>
        </DemoPanel>

        <DemoPanel
          index="MO-4"
          title="DrawLine"
          note="Accent hairline at 60% draws itself on entry, both orientations."
        >
          <DrawLine />
          <div className="flex h-24 items-stretch gap-6 pt-4">
            <DrawLine orientation="vertical" />
            <p className="text-ink-2 self-center text-sm font-light">
              Vertical lines fill the parent height.
            </p>
          </div>
        </DemoPanel>

        <DemoPanel
          index="MO-5"
          title="CorridorTrace"
          note="Draws only while its section is the active corridor, then reverses."
        >
          <CorridorTrace>
            <svg
              aria-hidden="true"
              viewBox="0 0 320 120"
              className="block h-auto w-full"
              fill="none"
            >
              <path
                data-trace
                d="M8 100 C 80 100, 90 20, 160 20 S 250 90, 312 40"
                stroke="var(--accent)"
                strokeWidth="2"
              />
              <circle cx="8" cy="100" r="4" fill="var(--accent)" />
              <circle cx="312" cy="40" r="4" fill="var(--accent)" />
            </svg>
          </CorridorTrace>
        </DemoPanel>

        <DemoPanel
          index="MO-6"
          title="MarqueeLoop"
          note="Seamless xPercent −50 loop over a doubled track. No gap, no jump."
        >
          <MarqueeLoop>
            {company.services.map((service) => (
              <span key={service} className="flex items-center">
                <span className="font-display mx-6 text-xl whitespace-nowrap">{service}</span>
                <span aria-hidden="true" className="text-accent">
                  ·
                </span>
              </span>
            ))}
          </MarqueeLoop>
        </DemoPanel>

        <DemoPanel
          index="MO-7"
          title="MicroLift"
          note="Motion finishing layer: fades up into view, lifts on hover, presses on tap."
        >
          <MicroLift>
            <Button type="button">Request a quote</Button>
          </MicroLift>
        </DemoPanel>
      </div>
    </section>
  );
}
