"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Magnet } from "@/components/vendor/reactbits";
import { quoteBand } from "@/content/home";
import { whatsappLink } from "@/content/navigation";

/* H7 · Quote band. The page's only dark band, and the only filled button in
   this viewport — inverted (paper on ink) so it stays the single CTA without
   reintroducing the accent as a fill. The header's own CTA has scrolled away
   by the time this is on screen. The WhatsApp row is a plain `<a>` and simply
   isn't there when the number is null. */
export function QuoteBand() {
  const whatsappHref = whatsappLink();

  return (
    <section className="bg-ink text-paper py-20 sm:py-24 lg:py-28">
      <div className="wrap flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <h2 className="font-display text-headline text-paper leading-headline tracking-display">
          {quoteBand.line}
        </h2>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <Magnet strength={10}>
            <Button asChild variant="default" className="bg-paper text-ink hover:bg-paper-3">
              <Link href={quoteBand.ctaHref}>{quoteBand.ctaLabel}</Link>
            </Button>
          </Magnet>

          {whatsappHref !== null && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener"
              className="group/wa text-paper/80 hover:text-paper inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
            >
              <span className="relative">
                {quoteBand.whatsappLabel}
                <span
                  aria-hidden="true"
                  className="bg-paper/60 absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/wa:scale-x-100"
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
