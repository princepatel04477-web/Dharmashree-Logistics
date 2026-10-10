import { Reveal } from "@/components/motion/Reveal";
import { scaleSection, scaleStops } from "@/content/home";
import { ScaleTrail } from "./ScaleTrail";
import { SECTION_TITLE_CLASS } from "./shared";

/* H1b · Scale. "Flexibility, reliability and reach — the answer is DharmaShree":
   a two-line heading over a short `--brand` rule, then the figures on their
   winding trail (`ScaleTrail`). On `--paper-2`, between the brand-blue facts
   strip and the white services section. Every figure comes from `scaleStops()`;
   with fewer than three the section is not rendered at all. */
export function ScaleSection() {
  const stops = scaleStops();
  if (stops.length === 0) return null;

  return (
    <section className="bg-paper-2 py-20 sm:py-24 lg:py-28">
      <div className="wrap flex flex-col gap-12 lg:gap-16">
        <Reveal className="flex flex-col gap-5">
          <h2 className={SECTION_TITLE_CLASS}>
            <span className="text-ink-2 block text-2xl font-light sm:text-3xl">
              {scaleSection.lead}
            </span>
            <span className="block">{scaleSection.title}</span>
          </h2>
          <span aria-hidden="true" className="bg-brand block h-1 w-20" />
        </Reveal>
        <ScaleTrail stops={stops} label={scaleSection.listLabel} />
      </div>
    </section>
  );
}
