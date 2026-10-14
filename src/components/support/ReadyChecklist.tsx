"use client";

import { ConsentCheckbox } from "@/components/vendor/origin";

interface ReadyChecklistProps {
  label: string;
  items: readonly string[];
}

/* "Have these ready" as a tick-list (Prompts 12). The ticks are local to the
   page and kept nowhere: it is a prompt for the visitor, not a form, so nothing
   is stored, sent or required. Origin UI's checkbox does the work. */
export function ReadyChecklist({ label, items }: ReadyChecklistProps) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="label-caps mb-2">{label}</legend>
      <ul className="divide-line border-line divide-y border-y">
        {items.map((item) => (
          <li key={item}>
            <ConsentCheckbox>{item}</ConsentCheckbox>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
