"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCharacterLimit } from "@/hooks/use-character-limit";

interface NotesFieldProps {
  label: string;
  maxLength?: number;
  defaultValue?: string;
  /** Extension (Prompt 08): controlled value. Without it the field is
      uncontrolled and a value restored after mount (a saved draft, a prefill
      from the URL) could never appear in the textarea. */
  value?: string;
  helper?: string;
  name?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

export function NotesField({
  label,
  maxLength = 500,
  defaultValue = "",
  value,
  helper,
  name,
  placeholder,
  onValueChange,
}: NotesFieldProps) {
  const fieldId = useId();
  const countId = `${fieldId}-count`;
  const helperId = `${fieldId}-helper`;
  const {
    value: internalValue,
    characterCount: internalCount,
    handleChange,
  } = useCharacterLimit({
    maxLength,
    initialValue: defaultValue,
  });
  const isControlled = value !== undefined;
  const shown = value ?? internalValue;
  const count = isControlled ? shown.length : internalCount;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Textarea
        id={fieldId}
        name={name}
        value={shown}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-describedby={helper !== undefined ? `${countId} ${helperId}` : countId}
        onChange={(event) => {
          handleChange(event);
          onValueChange?.(event.target.value);
        }}
      />
      <div className="flex items-baseline justify-between gap-4">
        {helper !== undefined ? (
          <p id={helperId} className="text-muted text-xs font-light">
            {helper}
          </p>
        ) : (
          <span />
        )}
        <p id={countId} aria-live="polite" className="text-muted shrink-0 font-mono text-[11px]">
          {count} / {maxLength}
        </p>
      </div>
    </div>
  );
}
