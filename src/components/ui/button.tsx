import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

/* Restyle notes: radius from --radius-xs, mono caps voice per the house button
   recipe, no shadows, no ring utilities. `default` is the primary CTA: --brand
   fill, white text, --brand-deep on hover. Every variant carries the house focus
   ring (rule 11: 2px outline, 3px offset) explicitly as well as globally.
   Everything else stays outline or quiet. */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xs font-mono text-[11px] tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-11 px-5",
        icon: "size-11",
        lg: "h-12 px-8",
        sm: "h-9 px-3 text-[10px]",
      },
      variant: {
        default: "bg-brand text-paper hover:bg-brand-deep",
        destructive: "bg-destructive text-destructive-foreground hover:bg-brand-deep",
        ghost: "text-ink-2 hover:bg-paper-3 hover:text-ink",
        link: "text-brand-deep underline-offset-4 hover:underline",
        outline:
          "border border-brand bg-transparent text-brand hover:bg-brand hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-paper-3",
      },
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      data-slot="button"
      {...props}
    />
  );
}

export { Button, buttonVariants };
