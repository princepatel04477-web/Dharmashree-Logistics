"use client";

import { useSyncExternalStore } from "react";

/* SSR-safe media query, same `useSyncExternalStore` shape as the
   reduced-motion and hover hooks: the server and the first client render agree
   on `false`, so nothing can hydrate with layout that only exists at a wider
   breakpoint (the pinned process section is the reason this exists). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
