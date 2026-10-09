"use client";

import Link from "next/link";
import { useRef } from "react";
import ResponsiveImage, { hasImage, type ArtDirection } from "@/components/media/ResponsiveImage";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Magnet } from "@/components/vendor/reactbits";
import { company } from "@/content/company";
import { hero } from "@/content/home";
import { images } from "@/content/images";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS } from "@/lib/motion-tokens";
import { HeroTabs } from "./HeroTabs";

/* H0 · Hero. A full-bleed photograph under a single-hue `--brand-deep` overlay
   (85% at the left edge, 10% at the right), the headline and the one filled
   "Enquire now" button on the left, and the track / quote card below the
   text. From `lg` the card is a wide bar that straddles the foot of the hero
   (about 80px of it hangs below the edge), so the photo's truck on the right
   stays clear; the photo is anchored to the bottom there so the truck sits
   above the bar. On phones the card is simply stacked under the text.
   Entrance is GSAP's: the eyebrow, lede and actions rise on a 0.08 stagger
   while the H1 runs its own line-mask reveal.

   The photo is art-directed: the 16:9 frame from 768 px up, the 4:5 portrait
   below. A slot with no file yet leaves the section on plain `--brand-deep`,
   so the headline stays fully legible on its own. */

const HERO_LINE_STAGGER = 0.08;
/* Below this viewport width the portrait photo is used. */
const PORTRAIT_BELOW_PX = 768;
const firstBranch = company.branches[0];

/* Same masked-line technique as `SectionHeading`, but on an `h1` with the
   hero's own eyebrow above it, hence not the shared component. The plain
   title is server-rendered (SEO, no-JS, and it is the LCP text); the split
   happens client-side and reverts on unmount. */
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
      className="font-display text-step-4 text-on-deep leading-headline tracking-display sm:text-5xl lg:text-6xl"
    >
      {hero.title}
    </h1>
  );
}

function HeroPhoto() {
  const landscape = images.hero.desktop;
  const portrait = images.hero.mobile;
  const hasLandscape = hasImage(landscape.key);
  const hasPortrait = hasImage(portrait.key);
  if (!hasLandscape && !hasPortrait) return null;

  const base = hasLandscape ? landscape : portrait;
  const art: ArtDirection | undefined =
    hasLandscape && hasPortrait ? { imageKey: portrait.key, below: PORTRAIT_BELOW_PX } : undefined;

  return (
    <ResponsiveImage
      imageKey={base.key}
      alt={base.alt}
      sizes="100vw"
      priority
      art={art}
      className="absolute inset-0"
      imgClassName="object-[70%_center] md:object-[70%_bottom]"
    />
  );
}

export function HeroSection() {
  return (
    <section className="bg-brand-deep relative isolate lg:mb-28">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <HeroPhoto />
      </div>
      {/* One hue only: --brand-deep, fading from the text side to the card side. */}
      <div
        aria-hidden="true"
        className="from-brand-deep/85 to-brand-deep/70 md:from-brand-deep/85 md:to-brand-deep/10 absolute inset-0 -z-10 bg-linear-to-b md:bg-linear-to-r"
      />
      {/* Same hue again, top edge only: the bright sky behind the headline
          would otherwise leave the 60px title under 3:1. It is clear by 55%. */}
      <div
        aria-hidden="true"
        className="from-brand-deep/45 absolute inset-0 -z-10 hidden bg-linear-to-b via-transparent via-55% to-transparent md:block"
      />

      <div className="wrap flex w-full flex-col gap-10 py-12 sm:py-16 lg:gap-12 lg:pt-16 lg:pb-0">
        <div className="flex max-w-3xl flex-col items-start gap-6 lg:max-w-[44rem]">
          <Reveal as="p" delay={0} className="flex items-center gap-3">
            <span aria-hidden="true" className="bg-highway block h-0.5 w-10" />
            <span className="label-caps text-on-deep-text">{hero.eyebrow}</span>
          </Reveal>

          <HeroTitle />

          <Reveal
            as="p"
            delay={HERO_LINE_STAGGER * 2}
            className="text-on-deep-text max-w-xl text-base font-light sm:text-lg"
          >
            {hero.body}
          </Reveal>

          <Reveal
            delay={HERO_LINE_STAGGER * 3}
            className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-1"
          >
            <Magnet strength={10}>
              <Button
                asChild
                variant="default"
                size="lg"
                className="ring-paper focus-visible:outline-paper ring-2"
              >
                <Link href={hero.cta.href}>{hero.cta.label}</Link>
              </Button>
            </Magnet>
          </Reveal>

          {firstBranch !== undefined && (
            <Reveal as="p" delay={HERO_LINE_STAGGER * 4} className="label-caps text-on-deep-text">
              {`${hero.branchPrefix} ${firstBranch.city}`}
            </Reveal>
          )}
        </div>

        {/* The static offset lives on this wrapper; the Reveal inside owns the
            entrance transform (one animation owner per element, house rule 8). */}
        <div className="relative z-10 lg:translate-y-20">
          <Reveal delay={HERO_LINE_STAGGER * 2}>
            <HeroTabs />
          </Reveal>
        </div>
      </div>

      {/* A highway centre line along the foot of the hero: amber dashes, a highlight. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1 bg-[repeating-linear-gradient(90deg,var(--highway)_0_28px,transparent_28px_52px)]"
      />
    </section>
  );
}
