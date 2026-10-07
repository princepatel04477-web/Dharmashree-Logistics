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
}

export function ConsentCheckbox({
  children,
  id,
  name,
  required,
  checked,
  defaultChecked,
  onCheckedChange,
}: ConsentCheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <div className="flex min-h-11 items-start gap-3">
      <Checkbox
        id={checkboxId}
        name={name}
        required={required}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
      <label htmlFor={checkboxId} className="text-ink-2 cursor-pointer text-sm font-light">
        {children}
      </label>
    </div>
  );
}
