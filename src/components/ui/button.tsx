import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

/* Restyle notes: radius → 2px, mono caps voice per the house button recipe,
   no shadows, no ring utilities (the house focus ring is global). `default`
   is the ONE filled CTA (accent); everything else stays outline or quiet. */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xs font-mono text-[11px] tracking-[0.14em whitespace-nowrap uppercase transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
        default: "bg-primary text-primary-foreground hover:bg-accent-ink",
        destructive: "bg-destructive text-destructive-foreground hover:bg-accent-ink",
        ghost: "text-ink-2 hover:bg-paper-3 hover:text-ink",
        link: "text-accent-ink underline-offset-4 hover:underline",
        outline:
          "border border-accent bg-transparent text-accent hover:bg-accent hover:text-primary-foreground",
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
