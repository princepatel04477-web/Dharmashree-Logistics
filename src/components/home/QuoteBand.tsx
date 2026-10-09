"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import ResponsiveImage, { hasImage } from "@/components/media/ResponsiveImage";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { Magnet } from "@/components/vendor/reactbits";
import { quoteBand } from "@/content/home";
import { images } from "@/content/images";
import { whatsappLink } from "@/content/navigation";

/* H7 · Quote band. The loading-yard photograph behind a `--brand-deep`
   overlay at 80%, a white heading, the brand-filled quote button ringed in
   white, and a WhatsApp link that is a plain `<a>` and simply isn't there when
   the number is null. With no photo yet the band is plain `--brand-deep`. */
export function QuoteBand() {
  const whatsappHref = whatsappLink();
  const slot = images.pages.quote;

  return (
    <section className="bg-brand-deep text-on-deep relative isolate overflow-hidden py-20 sm:py-24 lg:py-28">
      {hasImage(slot.key) && (
        <div className="absolute inset-0 -z-20" aria-hidden="true">
          <ResponsiveImage imageKey={slot.key} alt={slot.alt} sizes="100vw" />
        </div>
      )}
      <div aria-hidden="true" className="bg-brand-deep/80 absolute inset-0 -z-10" />

      <div className="wrap flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <Reveal className="flex max-w-3xl items-start gap-4">
          <span aria-hidden="true" className="bg-highway mt-3 block h-0.5 w-10 shrink-0 sm:mt-5" />
          <h2 className="font-display text-on-deep text-step-4 leading-headline tracking-display sm:text-5xl">
            {quoteBand.line}
          </h2>
        </Reveal>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <Magnet strength={10}>
            <Button
              asChild
              variant="default"
              size="lg"
              className="ring-paper focus-visible:outline-paper ring-2"
            >
              <Link href={quoteBand.ctaHref}>{quoteBand.ctaLabel}</Link>
            </Button>
          </Magnet>

          {whatsappHref !== null && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener"
              className="group/wa text-on-deep-text hover:text-on-deep focus-visible:outline-paper inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
            >
              <span className="relative">
                {quoteBand.whatsappLabel}
                <span
                  aria-hidden="true"
                  className="bg-on-deep-text absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/wa:scale-x-100"
                />
              </span>
              <ArrowRightIcon
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover/wa:translate-x-0.5"
              />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
