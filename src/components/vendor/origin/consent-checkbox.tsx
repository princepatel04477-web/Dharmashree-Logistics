import { useId, type ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ConsentCheckboxProps {
  children: ReactNode;
  id?: string;
  name?: string;
  required?: boolean;
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  /** Extension (Prompt 08): the consent is a required field on the quote form,
      so it needs the same inline error treatment as the inputs. */
  error?: string;
}

export function ConsentCheckbox({
  children,
  id,
  name,
  required,
  checked,
  defaultChecked,
  onCheckedChange,
  error,
}: ConsentCheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const errorId = `${checkboxId}-error`;

  return (
    <div className="space-y-2">
      <div className="flex min-h-11 items-start gap-3">
        <Checkbox
          id={checkboxId}
          name={name}
          required={required}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          aria-describedby={error !== undefined ? errorId : undefined}
          aria-invalid={error !== undefined || undefined}
          className="mt-1"
        />
        <label htmlFor={checkboxId} className="text-ink-2 cursor-pointer text-sm font-light">
          {children}
        </label>
      </div>
      {error !== undefined && (
        <p id={errorId} role="alert" className="text-brand font-mono text-[11px]">
          {error}
        </p>
      )}
    </div>
  );
}
