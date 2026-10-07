import type * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "border-line bg-paper-2 text-ink placeholder:text-muted/70 aria-invalid:border-accent flex min-h-19.5 w-full rounded-xs border px-3 py-2 text-sm font-light transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      data-slot="textarea"
      {...props}
    />
  );
}
Textarea.displayName = "Textarea";

export { Textarea };
