import { useId, type ComponentProps, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

interface SelectFieldProps extends ComponentProps<"select"> {
  label: string;
  helper?: string;
  error?: string;
  children: ReactNode;
}

export function SelectField({ label, helper, error, id, children, ...props }: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={selectId}>{label}</Label>
      <SelectNative
        id={selectId}
        aria-describedby={
          error !== undefined ? errorId : helper !== undefined ? helperId : undefined
        }
        aria-invalid={error !== undefined || undefined}
        {...props}
      >
        {children}
      </SelectNative>
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
