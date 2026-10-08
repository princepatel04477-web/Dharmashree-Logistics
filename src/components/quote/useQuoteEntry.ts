"use client";

import { useSyncExternalStore } from "react";
import { HUBS } from "@/content/hubs";
import { findService } from "@/content/services";
import { EMPTY_QUOTE, type QuotePayload } from "@/lib/quote";
import { readQuoteDraft } from "@/lib/quote-draft";
import type { QuoteStep } from "@/lib/validate";

/* What the form should already know when it mounts (Prompt 08): the draft this
   tab left behind, with the link's prefill applied on top — the click that
   brought the visitor here is newer than the tab's memory.

   Both sources are browser-only, so this is a store rather than an effect
   (`useSyncExternalStore`, the same primitive the media-query hooks use):
   `null` on the server and for the first client render, the real entry from the
   render after hydration, and the form is mounted once with it as its initial
   state. Reading it in an effect and setting state there would work too, and
   would also cascade a render for something that is known before the form is
   ever interactive.

   The entry is read once per page load — prefills are not re-applied later, so
   typing is never overwritten by the URL it came in on. */

export interface QuoteEntry {
  readonly values: QuotePayload;
  readonly consent: boolean;
  readonly step: QuoteStep;
}

function emptyEntry(): QuoteEntry {
  return { values: { ...EMPTY_QUOTE }, consent: false, step: 1 };
}

function readEntry(): QuoteEntry {
  const draft = readQuoteDraft();
  const entry: QuoteEntry = draft ?? emptyEntry();

  const params = new URLSearchParams(window.location.search);
  const serviceSlug = params.get("service");
  const hubId = params.get("to");
  if (serviceSlug === null && hubId === null) return entry;

  const values: QuotePayload = { ...entry.values };
  if (serviceSlug !== null) {
    const service = findService(serviceSlug);
    if (service !== undefined) values.service = service.name;
  }
  if (hubId !== null) {
    const hub = HUBS.find((candidate) => candidate.id === hubId);
    if (hub !== undefined) values.to = hub.name;
  }
  return { values, consent: entry.consent, step: entry.step };
}

let cached: QuoteEntry | null = null;

function getSnapshot(): QuoteEntry {
  cached ??= readEntry();
  return cached;
}

/* A stable object: the server render and the first client render have to agree. */
const serverEntry: QuoteEntry = emptyEntry();

function getServerSnapshot(): QuoteEntry {
  return serverEntry;
}

const subscribe = (): (() => void) => () => {};

/** `null` until the browser can answer, then the draft + prefill for this tab. */
export function useQuoteEntry(): QuoteEntry | null {
  const entry = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return entry === serverEntry ? null : entry;
}
