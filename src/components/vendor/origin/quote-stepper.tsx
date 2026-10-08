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
  /** Extension (Prompt 08): steps above this number are disabled, so a wizard
      can keep its rail on the steps the visitor has actually earned. */
  maxStep?: number;
  /** Extension (Prompt 08): the step titles are the only accessible name each
      trigger has, so they are hidden visually at the narrow breakpoint with
      `sr-only` rather than dropped. */
  titleClassName?: string;
  label?: string;
}

/* Horizontal stepper with labels. Steps are 1-based; callers pass the active
   step number (controlled) or a starting step (uncontrolled). */
export function QuoteStepper({
  steps,
  value,
  defaultValue = 1,
  onValueChange,
  maxStep,
  titleClassName = "",
  label,
}: QuoteStepperProps) {
  return (
    <Stepper
      aria-label={label}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      orientation="horizontal"
    >
      {steps.map((step, index) => (
        <Fragment key={step}>
          <StepperItem
            step={index + 1}
            className="flex-1"
            disabled={maxStep !== undefined && index + 1 > maxStep}
          >
            <StepperTrigger>
              <StepperIndicator />
              <StepperTitle className={titleClassName}>{step}</StepperTitle>
            </StepperTrigger>
          </StepperItem>
          {index < steps.length - 1 && <StepperSeparator />}
        </Fragment>
      ))}
    </Stepper>
  );
}
