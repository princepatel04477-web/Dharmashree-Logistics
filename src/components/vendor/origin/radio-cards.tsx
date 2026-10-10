"use client";

import { useId, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export interface RadioCardOption {
  value: string;
  title: string;
  description?: string;
  disabled?: boolean;
}

interface RadioCardsProps {
  label: string;
  options: RadioCardOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  helper?: string;
  /** Extension (Prompt 08): inline error, in the same dress as the field
      components — accent mono under the group, `aria-invalid` on it. */
  error?: string;
  /** Extension (Prompt 08): id on the group itself, so the quote wizard can put
      focus on the first card of an unanswered question. */
  id?: string;
  className?: string;
}

export function RadioCards({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  helper,
  error,
  id,
  className = "",
}: RadioCardsProps) {
  const labelId = useId();
  const helperId = `${labelId}-helper`;
  const errorId = `${labelId}-error`;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = value ?? internalValue;
  const isInvalid = error !== undefined;

  return (
    <div className="space-y-2">
      <span id={labelId} className="label-caps block">
        {label}
      </span>
      <RadioGroup
        id={id}
        aria-labelledby={labelId}
        aria-invalid={isInvalid || undefined}
        aria-describedby={isInvalid ? errorId : helper !== undefined ? helperId : undefined}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => {
          setInternalValue(next);
          onValueChange?.(next);
        }}
        className={className}
      >
        {options.map((option) => {
          const isSelected = selected === option.value;
          const isDisabled = option.disabled === true;
          return (
            <label
              key={option.value}
              className={cn(
                "bg-paper-2 flex cursor-pointer items-start gap-3 rounded-xs border p-4 transition-colors duration-200",
                isSelected
                  ? "border-brand"
                  : isInvalid
                    ? "border-brand/60"
                    : "border-line hover:border-line-strong",
                isDisabled && "cursor-not-allowed opacity-50",
              )}
            >
              <RadioGroupItem value={option.value} disabled={isDisabled} className="mt-1" />
              <span>
                <span className="text-ink block text-sm font-medium">{option.title}</span>
                {option.description !== undefined && (
                  <span className="text-muted mt-1 block text-xs font-light">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </RadioGroup>
      {isInvalid ? (
        <p id={errorId} role="alert" className="text-brand font-mono text-[11px]">
          {error}
        </p>
      ) : (
        helper !== undefined && (
          <p id={helperId} className="text-muted text-xs font-light">
            {helper}
          </p>
        )
      )}
    </div>
  );
}
