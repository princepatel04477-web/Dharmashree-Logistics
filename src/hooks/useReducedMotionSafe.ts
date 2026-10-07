"use client";

import { useSyncExternalStore } from "react";

function subscribeReducedMotion(onChange: () => void): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedServerSnapshot(): boolean {
  return false;
}

/* SSR-safe reduced-motion flag. False on the server and first client render
   (no hydration mismatch), then tracks the OS setting live. MotionProviders
   mirrors the same signal onto <html data-reduced-motion> for CSS and E2E. */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedSnapshot, getReducedServerSnapshot);
}
