"use client";

import { useSyncExternalStore } from "react";

function subscribeHover(onChange: () => void): () => void {
  const query = window.matchMedia("(hover: hover) and (pointer: fine)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getHoverSnapshot(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function getHoverServerSnapshot(): boolean {
  return false;
}

/* True only on devices with a fine pointer that can hover. Hover-driven
   flourishes (magnetism, spotlights, tilts) mount solely behind this so
   touch devices never pay for — or flash — pointer-only effects. */
export function useHoverCapable(): boolean {
  return useSyncExternalStore(subscribeHover, getHoverSnapshot, getHoverServerSnapshot);
}
