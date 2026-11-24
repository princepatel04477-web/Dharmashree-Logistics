import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

const SelectNative = ({ className, children, ...props }: React.ComponentProps<"select">) => {
  return (
    <div className="relative flex">
      <select
        className={cn(
          "peer border-line bg-paper-2 text-ink has-[option[disabled]:checked]:text-muted aria-invalid:border-brand inline-flex w-full cursor-pointer appearance-none items-center rounded-xs border text-sm font-light transition-colors duration-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          props.multiple ? "[&_option:checked]:bg-paper-3 py-1 *:px-3 *:py-1" : "h-11 ps-3 pe-9",
          className,
        )}
        data-slot="select-native"
        {...props}
      >
        {children}
      </select>
      {!props.multiple && (
        <span className="text-muted peer-aria-invalid:text-brand pointer-events-none absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center peer-disabled:opacity-50">
          <ChevronDownIcon aria-hidden="true" size={16} />
        </span>
      )}
    </div>
  );
};

export { SelectNative };
