"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { quote } from "@/content/quote";

/* The confirmation, in place of the form.

   The panel takes the focus with it when it replaces the form: a screen reader
   left on a control that no longer exists has no way back into the page. The
   reference is set in the display face because it is the one thing the visitor
   has to keep. */

interface SuccessPanelProps {
  reference: string;
  whatsappHref: string | null;
  onReset: () => void;
}

export function SuccessPanel({ reference, whatsappHref, onReset }: SuccessPanelProps) {
  const headingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby="quote-success"
      className="border-line bg-paper-2 flex flex-col gap-8 rounded-xs border p-6 sm:p-8"
    >
      <div className="flex flex-col gap-4">
        <p
          ref={headingRef}
          id="quote-success"
          tabIndex={-1}
          className="text-ink text-step-3 leading-headline"
        >
          {quote.success.title}
        </p>

        <div className="flex flex-col gap-1">
          <p className="label-caps">{quote.success.referenceLabel}</p>
          <p className="font-display text-ink text-step-4 tracking-display">{reference}</p>
        </div>

        <p className="text-ink-2 max-w-measure leading-body text-sm font-light">
          {quote.success.notice}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {whatsappHref !== null && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener"
            className="text-accent-ink hover:text-ink font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200"
          >
            {quote.success.whatsappLabel}
          </a>
        )}
        <Button type="button" variant="ghost" onClick={onReset}>
          {quote.success.againLabel}
        </Button>
      </div>
    </section>
  );
}
