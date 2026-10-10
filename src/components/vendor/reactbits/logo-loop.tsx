"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

interface LogoLoopProps {
  items: string[];
  reverse?: boolean;
  /** Travel speed in pixels per second, whatever the length of the list. */
  speed?: number;
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

/* Infinite text marquee at a constant, readable speed. Two identical tracks
   slide by one track width per cycle, so the loop has no seam. The cycle
   length is the measured track width divided by `speed`, re-measured when
   the width changes (web fonts swapping in), so long and short lists move at
   the same pace. It pauses on hover and while offscreen. Under reduced
   motion it renders a static wrapped list instead, so nothing is hidden.

   Changed from the vendored original: that one sped up with scroll velocity
   by rewriting `animation-duration` every frame, and a running CSS animation
   re-derives its position from a new duration, so the band jumped back and
   forth by thousands of pixels whenever the page moved. */
export function LogoLoop({
  items,
  reverse = false,
  speed = 40,
  className = "",
  separator = "◆",
  itemClassName = "",
  separatorClassName = "",
  decorative = false,
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotionSafe();
  const [isInView, setIsInView] = useState(false);
  const [cycleSeconds, setCycleSeconds] = useState<number | null>(null);
  /* How many times the list repeats inside one track. A track narrower than
     the band would open a gap before the second track arrives, so short
     lists repeat until one track spans the band. */
  const [copies, setCopies] = useState(1);
  const copiesRef = useRef(1);

  useEffect(() => {
    const node = containerRef.current;
    if (node === null || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry?.isIntersecting === true),
      { rootMargin: "100px 0px 100px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (track === null || container === null || prefersReduced === true) return;
    const measure = (): void => {
      const single = track.getBoundingClientRect().width / copiesRef.current;
      if (single <= 0) return;
      const needed = Math.max(1, Math.ceil(container.getBoundingClientRect().width / single));
      copiesRef.current = needed;
      setCopies(needed);
      setCycleSeconds(Math.round(((single * needed) / speed) * 10) / 10);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(container);
    return () => observer.disconnect();
  }, [prefersReduced, speed, items]);

  /* Spacing sits on the right of every item (not as a flex gap), so the
     join between the two tracks is spaced exactly like every other join. */
  const renderItem = (item: string, key: string): ReactElement => (
    <span key={key} className="flex shrink-0 items-center gap-8 pr-8">
      <span className={cn("hover:text-brand transition-colors", itemClassName)}>{item}</span>
      <span aria-hidden="true" className={cn("text-brand/50 text-xs", separatorClassName)}>
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
          "border-line bg-paper-2/30 text-ink-2 flex w-full flex-wrap items-center gap-y-1 border-y py-3 font-mono text-[11px] tracking-[0.22em] whitespace-normal uppercase",
          className,
        )}
      >
        {items.map((item, index) => renderItem(item, `static-${index}`))}
      </div>
    );
  }

  /* Rest until the cycle is measured and while the band is offscreen. */
  const isRunning = isInView && cycleSeconds !== null;

  const renderTrack = (hidden: boolean) => (
    <div
      ref={hidden ? undefined : trackRef}
      aria-hidden={hidden || undefined}
      className={cn(
        "marquee-track items-center",
        reverse ? "animate-marquee-reverse" : "animate-marquee",
        "group-hover:[animation-play-state:paused]",
      )}
      style={{
        animationDuration: cycleSeconds === null ? undefined : `${cycleSeconds}s`,
        animationPlayState: isRunning ? undefined : "paused",
        willChange: isRunning ? "transform" : "auto",
      }}
    >
      {Array.from({ length: copies }, (_, copy) =>
        items.map((item, index) => renderItem(item, `${hidden ? "dup" : "main"}-${copy}-${index}`)),
      )}
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
