"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { MapCanvas } from "@/components/map/MapCanvas";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Magnet, ShinyText } from "@/components/vendor/reactbits";
import { company } from "@/content/company";
import { hero } from "@/content/home";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS } from "@/lib/motion-tokens";

/* H0 · Hero. 100svh minus the fixed header, asymmetric 5/7 at `lg` and up,
   copy above the map when stacked. Entrance is GSAP's: the label, body and
   actions rise on a 0.08 stagger while the H1 runs its own line-mask reveal
   and the map plays its entrance in parallel. */

const HERO_LINE_STAGGER = 0.08;
const firstBranch = company.branches[0];

/* Same masked-line technique as `SectionHeading`, but on an `h1` with the
   hero's own small-caps eyebrow above it — hence not the shared component.
   The plain title is server-rendered (SEO, no-JS, and it is the LCP element);
   the split happens client-side and reverts on unmount. */
function HeroTitle() {
  const reduced = useReducedMotionSafe();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const node = titleRef.current;
      if (reduced || node === null) return;
      const split = new SplitText(node, { type: "lines,words", mask: "lines" });
      gsap.from(split.words, {
        yPercent: 110,
        duration: MOTION_DURATIONS.md,
        ease: GSAP_EASES.reveal,
        stagger: HERO_LINE_STAGGER,
        scrollTrigger: { trigger: node, start: "top 92%", once: true },
      });
      return () => {
        split.revert();
      };
    },
    { scope: titleRef, dependencies: [reduced] },
  );

  return (
    <h1
      ref={titleRef}
      className="font-display text-display text-ink leading-display tracking-display"
    >
      {hero.title}
    </h1>
  );
}

export function HeroSection() {
  return (
    <section className="flex min-h-[calc(100svh-4rem)] items-center lg:min-h-[calc(100svh-4.5rem)]">
      <div className="wrap grid w-full grid-cols-1 items-center gap-14 py-16 lg:grid-cols-12 lg:gap-10 lg:py-20">
        <div className="flex flex-col items-start gap-6 lg:col-span-5">
          <Reveal as="p" delay={0} className="label-caps">
            {hero.eyebrow}
          </Reveal>

          <HeroTitle />

          <Reveal
            as="p"
            delay={HERO_LINE_STAGGER * 2}
            className="text-ink-2 max-w-measure text-base font-light"
          >
            {hero.body}
          </Reveal>

          <Reveal
            delay={HERO_LINE_STAGGER * 3}
            className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-1"
          >
            <Magnet strength={10}>
              <Button asChild variant="default" className="bg-ink text-paper hover:bg-accent-ink">
                <Link href={hero.cta.href}>{hero.cta.label}</Link>
              </Button>
            </Magnet>

            <Link
              href={hero.trackHref}
              className="group/track text-ink inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
            >
              <span className="relative">
                {hero.trackLabel}
                <span
                  aria-hidden="true"
                  className="bg-accent absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/track:scale-x-100"
                />
              </span>
              <ArrowRightIcon
                aria-hidden="true"
                className="text-accent size-4 transition-transform duration-200 group-hover/track:translate-x-0.5"
              />
            </Link>
          </Reveal>

          {firstBranch !== undefined && (
            <Reveal as="p" delay={HERO_LINE_STAGGER * 4} className="label-caps">
              <ShinyText text={`${hero.branchPrefix} ${firstBranch.city}`} speed={5} />
            </Reveal>
          )}
        </div>

        <div className="lg:col-span-7">
          <MapCanvas mode="hero" className="mx-auto w-full max-w-[min(34rem,52vh)]" />
        </div>
      </div>
    </section>
  );
}
