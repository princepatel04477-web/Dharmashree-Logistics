import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Faq } from "@/content/types";

interface FaqAccordionProps {
  items: Faq[];
  defaultValue?: string;
}

export function FaqAccordion({ items, defaultValue }: FaqAccordionProps) {
  return (
    <Accordion type="single" collapsible defaultValue={defaultValue}>
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`item-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
