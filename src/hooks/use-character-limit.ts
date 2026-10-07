"use client";

import { type ChangeEvent, useState } from "react";

type UseCharacterLimitProps = {
  maxLength: number;
  initialValue?: string;
};

export function useCharacterLimit({ maxLength, initialValue = "" }: UseCharacterLimitProps) {
  const [value, setValue] = useState(initialValue);
  const [characterCount, setCharacterCount] = useState(initialValue.length);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    if (nextValue.length <= maxLength) {
      setValue(nextValue);
      setCharacterCount(nextValue.length);
    }
  };

  return {
    characterCount,
    handleChange,
    maxLength,
    value,
  };
}
