"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/* Single registration point. All GSAP plugins ship in the free `gsap`
   package. Every consumer imports from here — never from "gsap" directly. */
gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin, SplitText);

let settleTimer: ReturnType<typeof setTimeout> | undefined;

/** Re-measures every ScrollTrigger, in page order. Pins push everything below
    them down by their spacer, so a trigger measured *before* the pin above it
    existed (the pinned sections only mount after the media query resolves, the
    carousel mounts at once) starts in the wrong place — the pinned stage then
    draws over the next band. `sort()` puts triggers back in page order and
    `refresh()` measures them in that order. Calls coalesce: every pin creator,
    the font-load and the page-height observer can ask, and it runs once. */
export function settleScrollTriggers(delay = 0): void {
  if (typeof window === "undefined") return;
  if (settleTimer !== undefined) clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    settleTimer = undefined;
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, delay);
}

export { gsap, ScrollTrigger, DrawSVGPlugin, MotionPathPlugin, SplitText, useGSAP };
