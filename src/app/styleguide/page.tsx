import type { Metadata } from "next";
import { ComponentsShowcase } from "./components-showcase";
import { TokenGrid } from "./token-grid";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

/* Temporary verification route (build step 7): every colour token with its
   contrast ratio vs paper, the full type scale in both faces, label styles,
   a hairline and the focus ring. Token values resolve at runtime so this file
   holds no colour literals. Removed before launch hardening. */

const STEPS = ["--1", "0", "1", "2", "3", "4", "5", "6"] as const;

function specimenFor(step: (typeof STEPS)[number]): string {
  return step === "5" || step === "6" ? "Ag" : "AaBbCc 0123456789";
}

export default function StyleguidePage() {
  return (
    <main className="bg-paper w-full">
      <div className="wrap space-y-20 py-24 sm:py-32">
        <header className="space-y-3">
          <p className="section-index">00 — Styleguide</p>
          <h1 className="font-display text-headline leading-headline tracking-display font-light">
            Tokens, <i className="text-gold-deep">verified.</i>
          </h1>
          <p className="max-w-measure text-ink-2 text-sm font-light">
            Source of truth: <span className="font-mono text-xs">src/styles/tokens.css</span>.
            Provenance: <span className="font-mono text-xs">docs/token-map.md</span>.
          </p>
        </header>

        <section aria-labelledby="sg-colour" className="space-y-8">
          <div className="space-y-3">
            <p className="section-index">01 — Colour</p>
            <h2 id="sg-colour" className="font-display text-3xl font-light tracking-tight">
              Every token against paper
            </h2>
          </div>
          <TokenGrid />
        </section>

        <section aria-labelledby="sg-type" className="space-y-8">
          <div className="space-y-3">
            <p className="section-index">02 — Type scale</p>
            <h2 id="sg-type" className="font-display text-3xl font-light tracking-tight">
              Display and body faces
            </h2>
          </div>
          <div>
            {STEPS.map((step) => (
              <div
                key={step}
                className="border-line grid grid-cols-1 gap-2 border-t py-6 sm:grid-cols-[10rem_1fr_1fr] sm:items-baseline sm:gap-6"
              >
                <p className="text-muted font-mono text-xs">{`--step-${step}`}</p>
                <p
                  className="font-display tracking-display font-light"
                  style={{ fontSize: `var(--step-${step})`, lineHeight: "var(--leading-display)" }}
                >
                  {specimenFor(step)}
                </p>
                <p
                  className="font-sans font-light"
                  style={{ fontSize: `var(--step-${step})`, lineHeight: "var(--leading-body)" }}
                >
                  {specimenFor(step)}
                </p>
              </div>
            ))}
            <div className="border-line grid grid-cols-1 gap-2 border-y py-6 sm:grid-cols-[10rem_1fr_1fr] sm:items-baseline sm:gap-6">
              <p className="text-muted font-mono text-xs">mono</p>
              <p className="font-mono text-sm font-light">AaBbCc 0123456789</p>
              <p className="font-display text-gold-deep text-2xl font-light italic">farther.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="sg-labels" className="space-y-8">
          <div className="space-y-3">
            <p className="section-index">03 — Labels and rules</p>
            <h2 id="sg-labels" className="font-display text-3xl font-light tracking-tight">
              Caps, index, hairline, focus
            </h2>
          </div>
          <div className="border-line bg-paper-2 space-y-6 border p-6 sm:p-10">
            <p className="label-caps">Label caps — small caps in muted ink</p>
            <p className="section-index">04 — Section index in deep gold</p>
            <hr className="hairline" />
            <p className="max-w-measure text-ink-2 text-sm font-light">
              Body measure sample: this paragraph is capped at the measure token so line lengths
              stay readable at any viewport width.
            </p>
            <a
              href="#sg-labels"
              className="border-accent text-accent inline-flex items-center border px-4 py-3 font-mono text-[10px] tracking-[0.14em] uppercase"
            >
              Focus me to see the ring
            </a>
          </div>
        </section>
      </div>
      <div className="pb-24 sm:pb-32">
        <ComponentsShowcase />
      </div>
    </main>
  );
}
