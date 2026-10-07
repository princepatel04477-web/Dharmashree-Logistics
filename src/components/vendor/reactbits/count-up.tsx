"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { formatNumberIN } from "@/lib/format";

interface CountUpProps {
  to?: number;
  value?: number;
  from?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

function formatCount(value: number, prefix: string, suffix: string): string {
  return `${prefix}${formatNumberIN(value)}${suffix}`;
}

export function CountUp({
  to,
  value,
  from = 0,
  duration = 1.4,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const target = to ?? value ?? 0;
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (el === null || prefersReduced === true) return;
    if (typeof IntersectionObserver === "undefined") {
      el.textContent = formatCount(target, prefix, suffix);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry === undefined || !entry.isIntersecting || started.current) return;
        started.current = true;
        const node = ref.current;
        if (node === null) return;
        node.textContent = formatCount(from, prefix, suffix);

        const startTime = performance.now();
        const durationMs = duration * 1000;
        const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

        const update = (currentTime: number): void => {
          const progress = Math.min((currentTime - startTime) / durationMs, 1);
          const currentVal = Math.round(from + (target - from) * easeOutExpo(progress));
          const live = ref.current;
          if (live === null) return;
          live.textContent = formatCount(currentVal, prefix, suffix);
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            live.textContent = formatCount(target, prefix, suffix);
          }
        };

        requestAnimationFrame(update);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, from, duration, prefix, suffix, prefersReduced]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {formatCount(target, prefix, suffix)}
    </span>
  );
}
