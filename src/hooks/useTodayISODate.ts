"use client";

import { useSyncExternalStore } from "react";
import { todayISODate } from "@/lib/validate";

/* The visitor's calendar day, in the same shape as the other browser-only hooks
   in this folder: `""` on the server and on the first client render, the real
   date from the render after hydration. Nothing sets state to get there, so
   there is no cascading render — the value is simply read again on every render.

   The server's day and the visitor's can differ by hours, which is exactly why
   the date field's `min` and the past-date rule wait for this instead of
   guessing. An open tab crossing midnight picks the new date up on its next
   render. */

const subscribe = (): (() => void) => () => {};

function getSnapshot(): string {
  return todayISODate();
}

function getServerSnapshot(): string {
  return "";
}

export function useTodayISODate(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
