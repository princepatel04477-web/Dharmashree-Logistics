"use client";

import { useRef } from "react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { GSAP_EASES, MOTION_DURATIONS, MOTION_STAGGER } from "@/lib/motion-tokens";

type HeadingTag = "h1" | "h2" | "h3";

interface SectionHeadingProps {
  index: string;
  title: string;
  as?: HeadingTag;
  className?: string;
  titleClassName?: string;
  /** Extra classes for the index label, e.g. a colour for a dark ground. */
  indexClassName?: string;
}

/* Section index label + masked line-reveal title. The plain title is
   server-rendered (SEO + no-JS); the split happens client-side and reverts
   on unmount. Static text when reduced. */
export function SectionHeading({
  index,
  title,
  as = "h2",
  className = "",
  titleClassName = "",
  indexClassName = "",
}: SectionHeadingProps) {
  const reduced = useReducedMotionSafe();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const Tag = as;

  useGSAP(
    () => {
      const node = titleRef.current;
      if (reduced || node === null) return;
      const split = new SplitText(node, { type: "lines,words", mask: "lines" });
      gsap.from(split.words, {
        yPercent: 110,
        duration: MOTION_DURATIONS.md,
        ease: GSAP_EASES.reveal,
        stagger: MOTION_STAGGER.words,
        scrollTrigger: { trigger: node, start: "top 85%", once: true },
      });
      return () => {
        split.revert();
      };
    },
    { scope: titleRef, dependencies: [reduced, title] },
  );

  return (
    <div className={className}>
      <p className={`section-index ${indexClassName}`}>{index}</p>
      <Tag ref={titleRef} className={titleClassName}>
        {title}
      </Tag>
    </div>
  );
}
