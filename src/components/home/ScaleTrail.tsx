"use client";

import {
  CalendarIcon,
  FactoryIcon,
  HeartHandshakeIcon,
  LayersIcon,
  MapIcon,
  MapPinnedIcon,
  PackageIcon,
  TruckIcon,
  type LucideIcon,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { CountUp } from "@/components/vendor/reactbits";
import type { ScaleIcon, ScaleStop } from "@/content/home";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { gsap, useGSAP } from "@/lib/gsap";
import { GSAP_EASES } from "@/lib/motion-tokens";

/* The figures of the scale section, joined by one line that winds over and
   under them like a road: down the left edge of the first stop, along its
   foot, up into the next stop's head, and so on, leaving off to the right.
   Each stop sits against the edge the line closes, with a short `--brand` bar
   laid over the line there.

   From `lg` the stops are a row and the line is an SVG drawn from the row's
   measured size (a ResizeObserver keeps it true), so the rounded corners never
   stretch. GSAP draws it once on entry; under reduced motion it is simply
   there. Below `lg` the stops stack, each on a left rule with its bar on top. */

const ICONS: Readonly<Record<ScaleIcon, LucideIcon>> = {
  hub: MapPinnedIcon,
  map: MapIcon,
  layers: LayersIcon,
  factory: FactoryIcon,
  giving: HeartHandshakeIcon,
  truck: TruckIcon,
  package: PackageIcon,
  calendar: CalendarIcon,
};

/* `lg:grid-cols-*` must appear whole in the source for Tailwind to emit it. */
const COLUMNS: Readonly<Record<number, string>> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

const STROKE = 2;
const RADIUS = 28;
/* The draw takes longer than a hairline's: the line is several screens wide. */
const DRAW_SECONDS = 1.8;

interface Trail {
  width: number;
  height: number;
  d: string;
  /** Where the line leaves off, for the arrowhead. */
  endY: number;
}

/** The meander through the stops' left edges: down at the first, up at the
    second, and so on; it starts on the top edge and ends on whichever edge the
    last stop closes. */
function buildTrail(width: number, height: number, edges: readonly number[]): Trail {
  const top = STROKE / 2;
  const bottom = height - STROKE / 2;
  const r = Math.min(RADIUS, (bottom - top) / 2);
  const parts: string[] = [`M 0 ${top}`];
  let y = top;

  edges.forEach((x, index) => {
    if (index % 2 === 0) {
      parts.push(`L ${x - r} ${top}`, `A ${r} ${r} 0 0 1 ${x} ${top + r}`);
      parts.push(`L ${x} ${bottom - r}`, `A ${r} ${r} 0 0 0 ${x + r} ${bottom}`);
      y = bottom;
    } else {
      parts.push(`L ${x - r} ${bottom}`, `A ${r} ${r} 0 0 0 ${x} ${bottom - r}`);
      parts.push(`L ${x} ${top + r}`, `A ${r} ${r} 0 0 1 ${x + r} ${top}`);
      y = top;
    }
  });
  parts.push(`L ${width - 10} ${y}`);

  return { width, height, d: parts.join(" "), endY: y };
}

function StopFigure({ stop }: { stop: ScaleStop }) {
  if (stop.count === null) return <>{stop.staticText}</>;
  return <CountUp to={stop.count} suffix={stop.suffix} duration={1.4} />;
}

export function ScaleTrail({ stops, label }: { stops: readonly ScaleStop[]; label: string }) {
  const reduced = useReducedMotionSafe();
  const listRef = useRef<HTMLOListElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const drawn = useRef(false);
  const [trail, setTrail] = useState<Trail | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list === null) return;

    const measure = (): void => {
      const items = Array.from(list.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      const width = list.clientWidth;
      const height = list.clientHeight;
      if (width === 0 || height === 0 || items.length === 0) return;
      setTrail(
        buildTrail(
          width,
          height,
          items.map((item) => item.offsetLeft),
        ),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [stops.length]);

  const ready = trail !== null;

  useGSAP(
    () => {
      const path = pathRef.current;
      if (reduced || !ready || drawn.current || path === null) return;
      drawn.current = true;
      gsap.fromTo(
        path,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: DRAW_SECONDS,
          ease: GSAP_EASES.draw,
          scrollTrigger: { trigger: listRef.current, start: "top 85%", once: true },
          /* The dash lengths are measured once; a later resize redraws the
             path, so hand it back to a plain stroke when the draw is done. */
          onComplete: () => {
            gsap.set(path, { clearProps: "strokeDasharray,strokeDashoffset" });
          },
        },
      );
    },
    { dependencies: [reduced, ready] },
  );

  return (
    <div className="relative">
      {trail !== null && (
        <svg
          aria-hidden="true"
          width={trail.width}
          height={trail.height}
          viewBox={`0 0 ${trail.width} ${trail.height}`}
          className="pointer-events-none absolute inset-0 hidden overflow-visible lg:block"
        >
          <path
            ref={pathRef}
            d={trail.d}
            fill="none"
            stroke="var(--line-strong)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          <circle cx={0} cy={STROKE / 2} r={4} fill="var(--line-strong)" />
          <path
            d={`M ${trail.width - 10} ${trail.endY - 6} L ${trail.width} ${trail.endY} L ${trail.width - 10} ${trail.endY + 6} Z`}
            fill="var(--line-strong)"
          />
        </svg>
      )}

      <ol
        ref={listRef}
        aria-label={label}
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-0 lg:px-10 ${COLUMNS[stops.length] ?? "lg:grid-cols-5"}`}
      >
        {stops.map((stop, index) => {
          const Icon = ICONS[stop.icon];
          /* Even stops close at the foot, odd ones at the head. */
          const closesBelow = index % 2 === 0;
          return (
            <li
              key={stop.id}
              className={`border-line relative flex flex-col gap-3 border-l-2 py-6 pl-6 lg:min-h-64 lg:border-l-0 lg:px-8 lg:py-10 ${
                closesBelow ? "lg:justify-end" : "lg:justify-start"
              }`}
            >
              <span
                aria-hidden="true"
                className={`bg-brand absolute top-0 left-6 h-1 w-16 lg:left-8 lg:w-3/5 ${
                  closesBelow ? "lg:top-auto lg:-bottom-px" : "lg:-top-px"
                }`}
              />
              <span
                aria-hidden="true"
                className="bg-brand-tint text-brand inline-flex size-11 items-center justify-center rounded-md"
              >
                <Icon className="size-5" strokeWidth={1.5} />
              </span>
              <p className="font-display text-ink tracking-display text-4xl leading-none sm:text-5xl">
                <StopFigure stop={stop} />
              </p>
              <p className="text-ink-2 leading-body max-w-[16rem] text-sm font-light">
                {stop.label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
