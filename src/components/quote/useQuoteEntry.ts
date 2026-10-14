"use client";

import { useSyncExternalStore } from "react";
import { HUBS } from "@/content/hubs";
import { quote } from "@/content/quote";
import { findService } from "@/content/services";
import { EMPTY_QUOTE, type QuotePayload } from "@/lib/quote";
import { readQuoteDraft, type QuoteDraft } from "@/lib/quote-draft";
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

/** Longest lane text the query may write into From / To. */
const MAX_LANE_TEXT = 60;

function laneText(raw: string): string {
  return raw.trim().slice(0, MAX_LANE_TEXT);
}

/** The draft, with the query applied on top. Pure, and exported for
    `scripts/verify-quote.tsx`: `?service=` takes a slug from `services.ts` and
    resolves it to the service *name* the sheet stores; `?intent=pickup` seeds
    the notes. `?from=` and `?to=` are the lane typed into the home page's quote
    tab: `to` resolves a hub id or hub name to the hub's name and otherwise keeps
    the text as typed, because a city that is not on the map is a question for
    the desk (the form's own "To" field accepts it too); `from` is free text.
    An unknown service slug or intent is ignored rather than written into the
    form. */
export function resolveQuoteEntry(draft: QuoteDraft | null, search: string): QuoteEntry {
  const entry: QuoteEntry = draft ?? emptyEntry();

  const params = new URLSearchParams(search);
  const serviceSlug = params.get("service");
  const toParam = params.get("to");
  const fromParam = params.get("from");
  const intent = params.get("intent");
  if (serviceSlug === null && toParam === null && fromParam === null && intent === null) {
    return entry;
  }

  const values: QuotePayload = { ...entry.values };
  if (serviceSlug !== null) {
    const service = findService(serviceSlug);
    if (service !== undefined) values.service = service.name;
  }
  if (toParam !== null && laneText(toParam) !== "") {
    const wanted = laneText(toParam).toLowerCase();
    const hub =
      HUBS.find((candidate) => candidate.id === wanted) ??
      HUBS.find((candidate) => candidate.name.toLowerCase() === wanted);
    values.to = hub !== undefined ? hub.name : laneText(toParam);
  }
  if (fromParam !== null && laneText(fromParam) !== "") {
    values.from = laneText(fromParam);
  }
  /* `?intent=pickup` seeds the notes with what a pickup needs — only into an
     empty field, so a draft the visitor already typed is never overwritten. */
  if (intent === "pickup" && values.notes.trim() === "") {
    values.notes = quote.intents.pickup.notes;
  }
  return { values, consent: entry.consent, step: entry.step };
}

function readEntry(): QuoteEntry {
  return resolveQuoteEntry(readQuoteDraft(), window.location.search);
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
