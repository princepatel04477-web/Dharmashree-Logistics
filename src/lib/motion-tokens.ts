/* Single source of timing for GSAP and Motion. Durations in seconds. */

export const MOTION_DURATIONS = {
  xs: 0.2,
  sm: 0.4,
  md: 0.7,
  lg: 1.1,
  xl: 1.6,
} as const;

export type MotionDurationName = keyof typeof MOTION_DURATIONS;

export const GSAP_EASES = {
  reveal: "expo.out",
  draw: "power2.inOut",
  loop: "none",
} as const;

/* Mutable tuples: motion's Easing type requires [number, number, number, number]. */
export const MOTION_EASES: {
  out: [number, number, number, number];
  inOut: [number, number, number, number];
} = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
};

export const MOTION_STAGGER = {
  chars: 0.018,
  words: 0.06,
  items: 0.08,
} as const;
