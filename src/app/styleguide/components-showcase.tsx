import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { company } from "@/content/company";
import { timeline } from "@/content/timeline";
import type { Faq } from "@/content/types";
import { Toaster } from "@/components/vendor/lightswind";
import { InteractiveCard } from "@/components/vendor/lightswind";
import { ScrollCarousel } from "@/components/vendor/lightswind";
import {
  ConsentCheckbox,
  DateField,
  FaqAccordion,
  HeritageTimeline,
  NotesField,
  QuoteStepper,
  RadioCards,
  SelectField,
  TextField,
  TrackingInput,
} from "@/components/vendor/origin";
import {
  CountUp,
  LogoLoop,
  Magnet,
  ShinyText,
  SplitText,
  SpotlightCard,
} from "@/components/vendor/reactbits";
import { RevealDemo, ToastDemo } from "./interactive-demos";

const QUOTE_STEPS = ["Route", "Load", "Contact"];

const FAQS: Faq[] = [
  {
    question: `Where is ${company.name} headquartered?`,
    answer: `${company.headquarters.city}, ${company.headquarters.state}.`,
  },
  {
    question: "Which services do you run?",
    answer: `${company.services.join("; ")}.`,
  },
  {
    question: "Which industries do you serve?",
    answer: `${company.industries.join("; ")}.`,
  },
];

function DemoPanel({
  index,
  title,
  note,
  children,
}: {
  index: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="border-line bg-paper-2 space-y-4 border p-6 sm:p-8">
      <div className="space-y-1">
        <p className="section-index">
          {index} — {title}
        </p>
        {note !== undefined && <p className="text-muted text-xs font-light">{note}</p>}
      </div>
      {children}
    </div>
  );
}

export function ComponentsShowcase() {
  return (
    <section aria-labelledby="sg-components" className="space-y-8">
      <div className="wrap space-y-3">
        <p className="section-index">04 — Components</p>
        <h2 id="sg-components" className="font-display text-3xl tracking-tight">
          Vendor set, restyled to tokens
        </h2>
      </div>

      <div className="wrap grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DemoPanel index="RB-1" title="SplitText" note="Word mode, company name.">
          <SplitText
            tag="h3"
            mode="word"
            text={company.name}
            className="font-display text-3xl tracking-tight"
          />
        </DemoPanel>
        <DemoPanel index="RB-2" title="SplitText + onComplete" note="Character mode, HQ line.">
          <RevealDemo />
        </DemoPanel>
        <DemoPanel index="RB-3" title="CountUp" note="en-IN grouping, derived counts.">
          <div className="flex gap-10">
            <div className="space-y-1">
              <p className="font-display text-signal text-5xl">
                <CountUp to={company.services.length} duration={1.2} />
              </p>
              <p className="label-caps">Core services</p>
            </div>
            <div className="space-y-1">
              <p className="font-display text-signal text-5xl">
                <CountUp to={company.industries.length} duration={1.2} />
              </p>
              <p className="label-caps">Industries served</p>
            </div>
          </div>
        </DemoPanel>
        <DemoPanel
          index="RB-4"
          title="Magnet"
          note="Reserved for the primary CTA and WhatsApp button. Production target: /quote."
        >
          <Magnet>
            <Button asChild>
              <Link href="/">Request a quote</Link>
            </Button>
          </Magnet>
        </DemoPanel>
        <DemoPanel
          index="RB-6"
          title="ShinyText"
          note="Announcement-label atom (production use gated on branches)."
        >
          <ShinyText
            text={`${company.headquarters.city} · ${company.headquarters.state}`}
            className="font-mono text-xs tracking-[0.2em] uppercase"
          />
        </DemoPanel>
        <DemoPanel index="RB-5" title="SpotlightCard" note="Service tiles, accent 8% max.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {company.services.slice(0, 2).map((service, position) => (
              <SpotlightCard key={service} className="p-6">
                <p className="section-index">0{position + 1}</p>
                <p className="font-display mt-2 text-xl">{service}</p>
              </SpotlightCard>
            ))}
          </div>
        </DemoPanel>
      </div>

      <div className="space-y-4">
        <p className="wrap section-index">RB-7 — LogoLoop, services (production: hub names)</p>
        <LogoLoop items={company.services} />
      </div>

      <div className="wrap grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DemoPanel index="OR-1a" title="TextField" note="Label + helper + error wiring.">
          <TextField label="Firm name" helper="As printed on your GST certificate." />
        </DemoPanel>
        <DemoPanel index="OR-1b" title="TrackingInput" note="Track page pattern.">
          <TrackingInput
            label="Consignment number"
            buttonLabel="Track"
            helper="Found on your booking receipt."
          />
        </DemoPanel>
        <DemoPanel index="OR-2" title="SelectField" note="Native-backed, fully keyboard operable.">
          <SelectField label="Service" defaultValue="">
            <option value="" disabled>
              Select a service
            </option>
            {company.services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </SelectField>
        </DemoPanel>
        <DemoPanel index="OR-5" title="DateField" note="Native date picker.">
          <DateField label="Pickup date" />
        </DemoPanel>
        <DemoPanel index="OR-3" title="RadioCards" note="Service selection cards.">
          <RadioCards
            label="Service"
            defaultValue={company.services[0]}
            options={company.services.map((service) => ({ value: service, title: service }))}
          />
        </DemoPanel>
        <DemoPanel index="OR-6" title="NotesField" note="Textarea with live count.">
          <NotesField
            label="Consignment notes"
            maxLength={500}
            helper="Anything the crew should know before loading."
          />
        </DemoPanel>
        <DemoPanel index="OR-4" title="QuoteStepper" note="3-step quote flow, step 2 active.">
          <QuoteStepper steps={QUOTE_STEPS} defaultValue={2} />
        </DemoPanel>
        <DemoPanel index="OR-9" title="ConsentCheckbox" note="Form consent line.">
          <ConsentCheckbox>I agree to be contacted about this enquiry.</ConsentCheckbox>
        </DemoPanel>
        <DemoPanel index="OR-7" title="FaqAccordion" note="Plus/minus, facts-derived entries.">
          <FaqAccordion items={FAQS} />
        </DemoPanel>
        <DemoPanel index="OR-8" title="HeritageTimeline" note="Renders when timeline.ts is filled.">
          {timeline.length > 0 ? (
            <HeritageTimeline entries={timeline} />
          ) : (
            <p className="label-caps">Heritage entries land with the About page.</p>
          )}
        </DemoPanel>
      </div>

      <div className="space-y-4">
        <p className="wrap section-index">LW-1 — ScrollCarousel, industries band</p>
        <ScrollCarousel>
          {company.industries.map((industry, position) => (
            <article
              key={industry}
              className="border-line bg-paper-2 w-[76vw] shrink-0 space-y-2 border p-8 sm:w-[340px]"
            >
              <p className="section-index">0{position + 1}</p>
              <h3 className="font-display text-2xl">{industry}</h3>
            </article>
          ))}
        </ScrollCarousel>
      </div>

      <div className="wrap grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DemoPanel index="LW-2" title="InteractiveCard" note="Capability cards, tilt ≤3.5°.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {company.services.slice(0, 3).map((service) => (
              <InteractiveCard key={service} className="p-6">
                <p className="label-caps">Capability</p>
                <p className="font-display mt-2 text-lg">{service}</p>
              </InteractiveCard>
            ))}
          </div>
        </DemoPanel>
        <DemoPanel index="LW-3" title="Toaster" note="Form success/error feedback, bottom-right.">
          <ToastDemo />
        </DemoPanel>
      </div>

      <Toaster />
    </section>
  );
}
