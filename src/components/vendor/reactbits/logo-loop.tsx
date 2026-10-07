"use client";

import { useReducedMotion, useScroll, useVelocity } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface LogoLoopProps {
  items: string[];
  reverse?: boolean;
  /** Base loop duration at rest, in seconds. */
  duration?: number;
  className?: string;
}

/* Infinite text marquee. Speeds up with page scroll velocity, pauses on hover
   and while offscreen, and rests static under reduced motion. */
export function LogoLoop({ items, reverse = false, duration = 35, className = "" }: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
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

  const isPaused = prefersReduced === true || !isInView;
  const looped = items.concat(items);

  const renderTrack = (hidden: boolean) => (
    <div
      aria-hidden={hidden || undefined}
      className={`marquee-track items-center gap-8 ${
        reverse ? "animate-marquee-reverse" : "animate-marquee"
      } group-hover:[animation-play-state:paused]`}
      style={{
        animationDuration: `${currentDuration}s`,
        animationPlayState: isPaused ? "paused" : undefined,
        willChange: isInView && !isPaused ? "transform" : "auto",
      }}
    >
      {looped.map((item, index) => (
        <div key={hidden ? `dup-${index}` : index} className="flex items-center gap-8">
          <span className="hover:text-gold-deep transition-colors">{item}</span>
          <span aria-hidden="true" className="text-signal/50 text-xs">
            ◆
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`group border-line bg-paper-2/30 text-ink-2 flex w-full overflow-hidden border-y py-3 font-mono text-[11px] tracking-[0.22em] whitespace-nowrap uppercase select-none ${className}`}
      style={{ contain: "content" }}
    >
      {renderTrack(false)}
      {renderTrack(true)}
    </div>
  );
}
