import { Fragment } from "react";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";

interface QuoteStepperProps {
  steps: string[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}

/* Horizontal stepper with labels. Steps are 1-based; callers pass the active
   step number (controlled) or a starting step (uncontrolled). */
export function QuoteStepper({ steps, value, defaultValue = 1, onValueChange }: QuoteStepperProps) {
  return (
    <Stepper
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      orientation="horizontal"
    >
      {steps.map((step, index) => (
        <Fragment key={step}>
          <StepperItem step={index + 1} className="flex-1">
            <StepperTrigger>
              <StepperIndicator />
              <StepperTitle>{step}</StepperTitle>
            </StepperTrigger>
          </StepperItem>
          {index < steps.length - 1 && <StepperSeparator />}
        </Fragment>
      ))}
    </Stepper>
  );
}
