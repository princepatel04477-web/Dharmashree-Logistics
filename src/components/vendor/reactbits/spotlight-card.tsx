"use client";

import { useEffect, useRef, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { useHoverCapable } from "@/hooks/use-hover-capable";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

const DEFAULT_SPOTLIGHT = "color-mix(in srgb, var(--accent) 8%, transparent)";

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
  children: ReactNode;
}

/* Card with a cursor-following accent wash (8% alpha max). Static — no
   spotlight layer at all — on touch devices and under reduced motion. */
export function SpotlightCard({
  spotlightColor = DEFAULT_SPOTLIGHT,
  className = "",
  children,
  style,
  ...props
}: SpotlightCardProps) {
  const canHover = useHoverCapable();
  const prefersReduced = useReducedMotionSafe();
  const divRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const enabled = canHover && prefersReduced !== true;

  useEffect(() => {
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>): void => {
    if (!enabled || divRef.current === null || spotlightRef.current === null) return;
    if (rafId.current !== null) return;
    const clientX = event.clientX;
    const clientY = event.clientY;

    rafId.current = requestAnimationFrame(() => {
      if (divRef.current !== null && spotlightRef.current !== null) {
        const rect = divRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        spotlightRef.current.style.background = `radial-gradient(450px circle at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`;
      }
      rafId.current = null;
    });
  };

  const handleMouseEnter = (): void => {
    if (enabled && spotlightRef.current !== null) {
      spotlightRef.current.style.opacity = "1";
    }
  };

  const handleMouseLeave = (): void => {
    if (spotlightRef.current !== null) {
      spotlightRef.current.style.opacity = "0";
    }
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  return (
    <div
      ref={divRef}
      onMouseMove={enabled ? handleMouseMove : undefined}
      onMouseEnter={enabled ? handleMouseEnter : undefined}
      onMouseLeave={enabled ? handleMouseLeave : undefined}
      className={`border-line bg-paper-2 relative overflow-hidden rounded-xs border transition-colors duration-300 ${className}`}
      style={{ contain: "paint", ...style }}
      {...props}
    >
      {enabled && (
        <div
          ref={spotlightRef}
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(450px circle at 0px 0px, ${spotlightColor}, transparent 80%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
