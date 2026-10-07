import { useId, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TextFieldProps extends ComponentProps<"input"> {
  label: string;
  helper?: string;
  error?: string;
}

export function TextField({ label, helper, error, id, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        aria-describedby={
          error !== undefined ? errorId : helper !== undefined ? helperId : undefined
        }
        aria-invalid={error !== undefined || undefined}
        {...props}
      />
      {error !== undefined ? (
        <p id={errorId} role="alert" className="text-accent font-mono text-[11px]">
          {error}
        </p>
      ) : helper !== undefined ? (
        <p id={helperId} className="text-muted text-xs font-light">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
