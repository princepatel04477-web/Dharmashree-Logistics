"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCharacterLimit } from "@/hooks/use-character-limit";

interface NotesFieldProps {
  label: string;
  maxLength?: number;
  defaultValue?: string;
  helper?: string;
  name?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

export function NotesField({
  label,
  maxLength = 500,
  defaultValue = "",
  helper,
  name,
  placeholder,
  onValueChange,
}: NotesFieldProps) {
  const fieldId = useId();
  const countId = `${fieldId}-count`;
  const helperId = `${fieldId}-helper`;
  const { value, characterCount, handleChange } = useCharacterLimit({
    maxLength,
    initialValue: defaultValue,
  });

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Textarea
        id={fieldId}
        name={name}
        value={value}
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
          {characterCount} / {maxLength}
        </p>
      </div>
    </div>
  );
}
