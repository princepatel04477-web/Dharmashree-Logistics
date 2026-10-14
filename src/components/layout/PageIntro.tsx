import type { ReactNode } from "react";
import ResponsiveImage, { hasImage } from "@/components/media/ResponsiveImage";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/motion/SectionHeading";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  lede: string;
  /** Optional line under the band (small caps), e.g. a count or a date. */
  footnote?: ReactNode;
  /** Manifest key from `content/images.ts`. Set, the intro is a photo band;
     unset, it is a text intro on --brand-tint. */
  imageKey?: string;
  /** Alt text from the same `images.ts` slot. */
  imageAlt?: string;
  /** Text only, no ground: the legal pages. Ignored when `imageKey` is set. */
  plain?: boolean;
  /** Leave room under the band for a card that is pulled up over its bottom
     edge by 64px (`/track`). */
  overlap?: boolean;
}

/* The H1 sizes for every intro. The home hero keeps `--step-6`; inner pages
   run smaller so the heading stays within three lines from 1280px up and four
   at 360px, and the lede lands above the fold. */
const TITLE_SIZE = "font-display text-4xl sm:text-5xl lg:text-6xl leading-display tracking-display";

/* The H1 band every inner page opens with. Three grounds, one structure:

   - photo: the `imageKey` photo under a single-hue --brand-deep overlay, white
     heading. Anchored to the bottom-left of the band.
   - deep: `imageKey` is set but the file has not been produced yet
     (`hasImage` is false). Same layout on a --brand-deep ground (a faint same-hue lift to --brand at the lower right), so the
     page is finished before the photograph arrives and never shows a missing
     image label. Dropping the file in later switches the band to the photo
     with no code change.
   - tint / plain: no `imageKey`. Masked-line H1 left, lede right, on
     --brand-tint (plain for the legal pages). */
export function PageIntro({
  eyebrow,
  title,
  lede,
  footnote,
  imageKey,
  imageAlt = "",
  plain = false,
  overlap = false,
}: PageIntroProps) {
  if (imageKey !== undefined) {
    const photo = hasImage(imageKey);

    return (
      <section className="bg-brand-deep text-on-deep relative isolate overflow-hidden">
        {!photo && (
          <div
            aria-hidden="true"
            className="from-brand-deep via-brand-deep to-brand/45 absolute inset-0 -z-10 bg-linear-to-br"
          />
        )}
        {photo && (
          <>
            <div className="absolute inset-0 -z-10">
              <ResponsiveImage imageKey={imageKey} alt={imageAlt} sizes="100vw" priority />
            </div>
            <div
              aria-hidden="true"
              className="bg-brand-deep/80 lg:from-brand-deep/95 lg:via-brand-deep/70 lg:to-brand-deep/25 absolute inset-0 -z-10 lg:bg-linear-to-r"
            />
          </>
        )}
        <div
          className={`wrap flex min-h-[24rem] flex-col justify-end gap-6 pt-16 lg:min-h-[26rem] lg:pt-20 ${
            overlap ? "pb-24 sm:pb-28 lg:pb-32" : "pb-12 sm:pb-16 lg:pb-20"
          }`}
        >
          <div className="flex max-w-4xl flex-col gap-6">
            <SectionHeading
              as="h1"
              index={eyebrow}
              title={title}
              indexClassName="!text-on-deep-text"
              titleClassName={`${TITLE_SIZE} text-on-deep text-balance`}
            />
            <Reveal
              as="p"
              className="text-on-deep-text leading-body max-w-2xl text-sm font-light sm:text-base"
            >
              {lede}
            </Reveal>
          </div>
          {footnote !== undefined && <p className="label-caps text-on-deep-text">{footnote}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className={plain ? "border-line border-b" : "bg-brand-tint border-line border-b"}>
      <div className="wrap flex flex-col gap-8 py-12 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <SectionHeading
              as="h1"
              index={eyebrow}
              title={title}
              indexClassName={plain ? "" : "text-brand"}
              titleClassName={`${TITLE_SIZE} text-ink text-balance`}
            />
          </div>
          <Reveal
            as="p"
            className="text-ink/80 max-w-measure leading-body text-base font-light lg:col-span-5 lg:pt-10"
          >
            {lede}
          </Reveal>
        </div>
        {footnote !== undefined && <p className="label-caps">{footnote}</p>}
      </div>
    </section>
  );
}
