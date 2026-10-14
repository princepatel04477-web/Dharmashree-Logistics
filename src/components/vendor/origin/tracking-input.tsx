"use client";

import { useId, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TrackingInputProps {
  label: string;
  buttonLabel: string;
  placeholder?: string;
  helper?: string;
  defaultValue?: string;
  /** Extension (Prompt 08): inline error for the LR number, in the same dress
      as the field components. */
  error?: string;
  /** Extension (Prompt 08): the LR number is stored upper case, and the control
      shows it that way as it is typed. */
  inputClassName?: string;
  onTrack?: (trackingNumber: string) => void;
}

export function TrackingInput({
  label,
  buttonLabel,
  placeholder,
  helper,
  defaultValue = "",
  error,
  inputClassName = "",
  onTrack,
}: TrackingInputProps) {
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const raw = data.get("tracking-number");
    onTrack?.(typeof raw === "string" ? raw.trim() : "");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          id={inputId}
          name="tracking-number"
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-invalid={error !== undefined || undefined}
          aria-describedby={
            error !== undefined ? errorId : helper !== undefined ? helperId : undefined
          }
          className={cn("flex-1", inputClassName)}
          autoComplete="off"
        />
        <Button type="submit" variant="outline">
          {buttonLabel}
        </Button>
      </div>
      {error !== undefined ? (
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
    </form>
  );
}
