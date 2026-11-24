"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

/* Restyle notes: plus/minus trigger (no chevron), hairline dividers, and a
   grid-rows open/close transition instead of keyframe animations — the global
   reduced-motion rule collapses it to an instant toggle for free. */
function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn("border-line border-b last:border-b-0", className)}
      data-slot="accordion-item"
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "group text-ink hover:text-brand-deep flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-xs py-4 text-left text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        data-slot="accordion-trigger"
        {...props}
      >
        {children}
        <span className="text-brand pointer-events-none relative size-4 shrink-0">
          <PlusIcon
            aria-hidden="true"
            className="absolute inset-0 size-4 group-data-[state=open]:hidden"
            size={16}
          />
          <MinusIcon
            aria-hidden="true"
            className="absolute inset-0 hidden size-4 group-data-[state=open]:block"
            size={16}
          />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="grid text-sm transition-[grid-template-rows] duration-200 data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]"
      data-slot="accordion-content"
      {...props}
    >
      <div className={cn("min-h-0 overflow-hidden", className)}>
        <div className="text-ink-2 pt-0 pb-4 text-sm font-light">{children}</div>
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
