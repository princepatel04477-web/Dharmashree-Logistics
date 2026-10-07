"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

type SplitTag = "h1" | "h2" | "h3" | "p" | "span" | "div";

const TAG_COMPONENTS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
  div: motion.div,
} as const;

interface SplitTextProps {
  text: string;
  className?: string;
  tag?: SplitTag;
  mode?: "word" | "char";
  /** Pause before the first piece moves, in seconds. */
  delay?: number;
  /** Gap between consecutive pieces, in seconds. */
  stagger?: number;
  duration?: number;
  onComplete?: () => void;
}

const CHILD_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function SplitText({
  text,
  className = "",
  tag = "div",
  mode = "word",
  delay = 0,
  stagger = 0.025,
  duration = 0.45,
  onComplete,
}: SplitTextProps) {
  const reduceMotion = useReducedMotion();
  const Tag = TAG_COMPONENTS[tag];

  if (reduceMotion === true) {
    return <Tag className={className}>{text}</Tag>;
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const words = text.split(" ");
  const lastWordIndex = words.length - 1;

  return (
    <Tag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      aria-label={text}
    >
      <span aria-hidden="true" className="inline-block">
        {words.map((word, wordIndex) => {
          const isLastWord = wordIndex === lastWordIndex;
          if (mode === "char") {
            const chars = word.split("");
            const lastCharIndex = chars.length - 1;
            return (
              <span key={wordIndex} className="mr-[0.26em] inline-block whitespace-nowrap">
                {chars.map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    className="inline-block"
                    variants={CHILD_VARIANTS}
                    transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
                    onAnimationComplete={
                      isLastWord && charIndex === lastCharIndex ? onComplete : undefined
                    }
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            );
          }
          return (
            <motion.span
              key={wordIndex}
              className="mr-[0.26em] inline-block whitespace-nowrap"
              variants={CHILD_VARIANTS}
              transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={isLastWord ? onComplete : undefined}
            >
              {word}
            </motion.span>
          );
        })}
      </span>
    </Tag>
  );
}
