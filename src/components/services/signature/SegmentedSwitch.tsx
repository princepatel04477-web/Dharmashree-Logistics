"use client";

import { LayoutGroup, motion } from "motion/react";
import { useId } from "react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

interface SegmentedSwitchProps {
  label: string;
  options: readonly { readonly id: string; readonly label: string }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

/* A row of mono-caps choices with one 1px accent bar that slides between them
   (Motion `layoutId`). It is the house tab idiom — the header's nav underline
   works the same way — so a switch never needs a filled pill. Buttons carry
   `aria-pressed`; the panel it drives announces itself with `aria-live`. Under
   reduced motion the bar jumps. */
export function SegmentedSwitch({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedSwitchProps) {
  const groupId = useId();
  const reduced = useReducedMotionSafe();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="label-caps">{label}</p>
      <LayoutGroup id={groupId}>
        <div role="group" aria-label={label} className="border-line flex flex-wrap border-b">
          {options.map((option, position) => {
            const active = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(option.id)}
                className={cn(
                  "relative min-h-11 pr-5 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-200",
                  position > 0 && "pl-5",
                  active ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {option.label}
                {active && (
                  <motion.span
                    layoutId="segment-underline"
                    aria-hidden="true"
                    className={cn(
                      "bg-brand absolute -bottom-px h-px",
                      position > 0 ? "right-5 left-5" : "right-5 left-0",
                    )}
                    transition={{
                      duration: reduced ? 0 : MOTION_DURATIONS.sm,
                      ease: MOTION_EASES.out,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
