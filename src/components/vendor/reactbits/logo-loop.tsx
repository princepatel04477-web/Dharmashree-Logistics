"use client";

import { useScroll, useVelocity } from "motion/react";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

interface LogoLoopProps {
  items: string[];
  reverse?: boolean;
  /** Base loop duration at rest, in seconds. */
  duration?: number;
  className?: string;
  /** Glyph between items. Kept as the ported diamond by default. */
  separator?: string;
  /** Extra classes for every item, so consumers can set the label voice. */
  itemClassName?: string;
  /** Separator colour (it is decoration, so it is never announced). */
  separatorClassName?: string;
  /** Bands that repeat content already listed elsewhere are decorative. */
  decorative?: boolean;
}

/* Infinite text marquee. Speeds up with page scroll velocity, pauses on hover
   and while offscreen, and — under reduced motion — renders a static wrapped
   list instead of a clipped track, so nothing is hidden by the loop. */
export function LogoLoop({
  items,
  reverse = false,
  duration = 35,
  className = "",
  separator = "◆",
  itemClassName = "",
  separatorClassName = "",
  decorative = false,
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotionSafe();
  const [isInView, setIsInView] = useState(true);
  const [currentDuration, setCurrentDuration] = useState(duration);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  useEffect(() => {
    const node = containerRef.current;
    if (node === null || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry?.isIntersecting === true),
      {
        threshold: 0.05,
        rootMargin: "100px 0px 100px 0px",
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReduced === true || !isInView) return;

    let targetDuration = duration;
    let easedDuration = duration;
    let frameId = 0;

    const unsubscribe = scrollVelocity.on("change", (latestVelocity) => {
      const speedMultiplier = Math.min(2.5, Math.max(1.0, 1 + Math.abs(latestVelocity) / 800));
      targetDuration = duration / speedMultiplier;
    });

    const smoothStep = (): void => {
      easedDuration += (targetDuration - easedDuration) * 0.12;
      targetDuration += (duration - targetDuration) * 0.08;
      setCurrentDuration(Math.round(easedDuration * 10) / 10);
      frameId = requestAnimationFrame(smoothStep);
    };
    frameId = requestAnimationFrame(smoothStep);

    return () => {
      unsubscribe();
      cancelAnimationFrame(frameId);
    };
  }, [scrollVelocity, prefersReduced, isInView, duration]);

  const renderItem = (item: string, key: string): ReactElement => (
    <span key={key} className="flex items-center gap-8">
      <span className={cn("hover:text-gold-deep transition-colors", itemClassName)}>{item}</span>
      <span aria-hidden="true" className={cn("text-signal/50 text-xs", separatorClassName)}>
        {separator}
      </span>
    </span>
  );

  /* Reduced motion: the full list, wrapped, no loop and no clipping. */
  if (prefersReduced === true) {
    return (
      <div
        ref={containerRef}
        aria-hidden={decorative || undefined}
        className={cn(
          "border-line bg-paper-2/30 text-ink-2 flex w-full flex-wrap items-center gap-x-8 gap-y-1 border-y py-3 font-mono text-[11px] tracking-[0.22em] whitespace-normal uppercase",
          className,
        )}
      >
        {items.map((item, index) => renderItem(item, `static-${index}`))}
      </div>
    );
  }

  /* Reduced motion already returned above with the static list, so the only
     remaining reason to rest is being offscreen. */
  const isPaused = !isInView;
  const looped = items.concat(items);

  const renderTrack = (hidden: boolean) => (
    <div
      aria-hidden={hidden || undefined}
      className={cn(
        "marquee-track items-center gap-8",
        reverse ? "animate-marquee-reverse" : "animate-marquee",
        "group-hover:[animation-play-state:paused]",
      )}
      style={{
        animationDuration: `${currentDuration}s`,
        animationPlayState: isPaused ? "paused" : undefined,
        willChange: isInView && !isPaused ? "transform" : "auto",
      }}
    >
      {looped.map((item, index) => renderItem(item, hidden ? `dup-${index}` : `${index}`))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      aria-hidden={decorative || undefined}
      className={cn(
        "border-line bg-paper-2/30 text-ink-2 group flex w-full overflow-hidden border-y py-3 font-mono text-[11px] tracking-[0.22em] whitespace-nowrap uppercase select-none",
        className,
      )}
      style={{ contain: "content" }}
    >
      {renderTrack(false)}
      {renderTrack(true)}
    </div>
  );
}
