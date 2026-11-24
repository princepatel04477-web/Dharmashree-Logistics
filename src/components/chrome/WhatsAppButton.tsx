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

/** The WhatsApp mark, filled (Simple Icons, CC0), so it reads as WhatsApp at a
    glance rather than as a generic chat bubble. */
function WhatsAppGlyph({ className = "" }: GlyphProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("shrink-0", className)}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
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
   home indicator (safe-area inset).

   Phones get the round WhatsApp-green mark alone, so it covers as little of the
   page as possible; from `sm` up it opens into a pill with a label. Two soft
   rings ripple out shortly after load to draw the eye, then stop for good — a
   button that pulses forever is noise. Reduced motion: no rings, no lift. */
function FloatingButton({ href, className }: { href: string; className: string }) {
  const reduced = useReducedMotionSafe();

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={`Chat with ${company.name} on WhatsApp`}
      className={cn(
        "group fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30",
        "sm:right-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
        "flex items-center rounded-full",
        "bg-whatsapp text-on-deep shadow-[0_8px_24px_-6px_var(--whatsapp-glow),0_2px_6px_-1px_var(--line-strong)]",
        "sm:bg-whatsapp-deep sm:p-1.5 sm:pr-5",
        className,
      )}
      initial={reduced ? false : { opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={reduced ? undefined : { y: -3 }}
      whileTap={reduced ? undefined : { scale: 0.94 }}
      transition={{ duration: reduced ? 0 : MOTION_DURATIONS.sm, ease: MOTION_EASES.out }}
    >
      <span className="bg-whatsapp relative flex size-14 items-center justify-center rounded-full sm:size-11">
        {!reduced &&
          [0, 1].map((ring) => (
            <motion.span
              key={ring}
              aria-hidden="true"
              className="bg-whatsapp-glow pointer-events-none absolute inset-0 rounded-full"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
              transition={{
                duration: MOTION_DURATIONS.xl,
                ease: MOTION_EASES.out,
                delay: 1.2 + ring * 0.5,
                repeat: 2,
                repeatDelay: 2.4,
              }}
            />
          ))}
        <WhatsAppGlyph className="relative size-7 sm:size-6" />
      </span>
      <span className="hidden pl-3 text-sm font-medium tracking-wide sm:inline">
        {whatsapp.floatingLabel}
      </span>
    </motion.a>
  );
}
