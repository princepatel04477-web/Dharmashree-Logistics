"use client";

import { useId, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TrackingInputProps {
  label: string;
  buttonLabel: string;
  placeholder?: string;
  helper?: string;
  defaultValue?: string;
  onTrack?: (trackingNumber: string) => void;
}

export function TrackingInput({
  label,
  buttonLabel,
  placeholder,
  helper,
  defaultValue = "",
  onTrack,
}: TrackingInputProps) {
  const inputId = useId();
  const helperId = `${inputId}-helper`;

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
          aria-describedby={helper !== undefined ? helperId : undefined}
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" variant="outline">
          {buttonLabel}
        </Button>
      </div>
      {helper !== undefined && (
        <p id={helperId} className="text-muted text-xs font-light">
          {helper}
        </p>
      )}
    </form>
  );
}
