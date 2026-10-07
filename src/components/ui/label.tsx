"use client";

import { Label as LabelPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

/* Field labels speak in label-caps. Descriptive consent/option sentences in
   composed wrappers use plain text spans instead of this primitive. */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "label-caps select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      data-slot="label"
      {...props}
    />
  );
}

export { Label };
