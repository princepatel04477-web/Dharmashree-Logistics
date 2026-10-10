"use client";

import { company } from "@/content/company";
import { whatsapp, whatsappLink } from "@/content/navigation";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

/* WhatsApp affordances. Both variants vanish entirely when `company.whatsapp` is
   null — no disabled button, no empty href. Plain `<a target="_blank"
   rel="noopener">` per house rule 10. */

interface GlyphProps {
  className?: string;
}

/** The mark drawn as stroke only. */
function WhatsAppGlyph({ className = "" }: GlyphProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
    >
      <path d="M12 3.4a8.6 8.6 0 0 0-7.3 13.1l-1 3.6 3.7-1A8.6 8.6 0 1 0 12 3.4Z" />
      <path d="M9.2 8.6c.2-.5.7-.7 1.2-.6l.9.2c.4.1.7.6.6 1l-.2.8c-.1.3 0 .6.2.9a6.3 6.3 0 0 0 2.1 2c.3.2.6.2.9.1l.8-.3c.4-.1.9.1 1 .5l.3.9c.1.5-.2 1-.6 1.2-1 .4-2.2.2-3.3-.4a10.4 10.4 0 0 1-3.4-3.1c-.7-1.1-.9-2.3-.5-3.2Z" />
    </svg>
  );
}

interface WhatsAppButtonProps {
  /** `header` = outlined chip in the header cluster · `floating` = the button
      fixed to the corner of every page. */
  variant?: "header" | "floating";
  className?: string;
}

export function WhatsAppButton({ variant = "header", className = "" }: WhatsAppButtonProps) {
  const href = whatsappLink();
  if (href === null) return null;
  if (variant === "floating") return <FloatingButton href={href} className={className} />;
  return <HeaderButton href={href} className={className} />;
}

function HeaderButton({ href, className }: { href: string; className: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={`Chat with ${company.name} on WhatsApp`}
      className={cn(
        "border-line text-ink hover:border-brand hover:text-brand-deep inline-flex h-11 items-center gap-2 rounded-xs border px-3 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200",
        className,
      )}
    >
      <WhatsAppGlyph className="size-4" />
      <span>{whatsapp.label}</span>
    </a>
  );
}

/* On screen from the first paint, bottom right, on every page and at every
   width: a floating button that waits for a scroll, or exists only on phones,
   is one people do not find. It sits above the page (z-30) and clear of the
   home indicator (safe-area inset). */
function FloatingButton({ href, className }: { href: string; className: string }) {
  const reduced = useReducedMotionSafe();

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={`Chat with ${company.name} on WhatsApp`}
      className={cn(
        "border-line bg-paper text-brand hover:border-brand-deep hover:text-brand-deep",
        "fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30",
        "flex size-14 items-center justify-center rounded-full border shadow-sm",
        "transition-colors duration-200 sm:right-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
        className,
      )}
      initial={reduced ? false : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduced ? 0 : MOTION_DURATIONS.sm, ease: MOTION_EASES.out }}
    >
      <WhatsAppGlyph className="size-6" />
    </motion.a>
  );
}
