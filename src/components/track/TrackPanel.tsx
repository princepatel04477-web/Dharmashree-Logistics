"use client";

import { ArrowUpRightIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrackingInput } from "@/components/vendor/origin";
import { company } from "@/content/company";
import { track } from "@/content/track";
import { backendMode } from "@/lib/backend/config";
import { normalizeLr, validateLr } from "@/lib/validate";
import { DirectTrackFlow } from "./DirectTrackFlow";
import { LiveTrackFlow } from "./LiveTrackFlow";

/* The track card, in one of three modes fixed at build time (`backendMode`,
   src/lib/backend/config.ts).

   Backend off (the default): the LR handoff below, untouched. Direct lookup
   (`direct`, or `mock-direct` locally): the LR number alone, read through this
   site's `/api/lr` (`DirectTrackFlow`). With the client's OTP backend connected
   (or its local mock): the LR + SMS-code flow in `LiveTrackFlow`. The portal sign-in buttons stay under the card in both, and
   the card's root is a `div` whose last child is the portal block in both —
   `HeroTabs` lays the home card out by that shape.

   The LR handoff (Prompt 08)

   Nothing behind this page claims to know where a consignment is: the number is
   validated and passed to a channel the desk actually answers — WhatsApp first,
   then email, then phone, and an honest line when none of the three is
   published yet (house rule 4, and the page's whole point).

   The hop carries the LR, so it cannot be a static `href`: the value is checked
   first and interpolated into the target. `window.open` runs inside the submit
   handler's click gesture, so it is not a popup-blocked call; if the browser
   refuses it anyway, the same URL is opened in the tab rather than silently
   dropped. */

type Destination = "whatsapp" | "email" | "phone" | "none";

function destinationFor(): Destination {
  if (company.whatsapp !== null) return "whatsapp";
  if (company.email !== null) return "email";
  if (company.phone !== null) return "phone";
  return "none";
}

function whatsappDigits(number: string): string {
  return number.replace(/\D/g, "");
}

/** `hero`: the home page's card, too narrow for a whole LR — a direct lookup
    there opens /track with the number instead of answering in place. */
export function TrackPanel({ context = "page" }: { context?: "page" | "hero" }) {
  if (backendMode === "off") return <HandoffPanel />;
  const direct = backendMode === "direct" || backendMode === "mock-direct";
  return (
    <div className="flex flex-col gap-4">
      {direct ? <DirectTrackFlow openOnTrackPage={context === "hero"} /> : <LiveTrackFlow />}
      <PortalLogins />
    </div>
  );
}

function HandoffPanel() {
  const [error, setError] = useState<string | undefined>(undefined);
  const destination = destinationFor();

  function openExternal(href: string, newTab: boolean): void {
    if (!newTab) {
      window.location.assign(href);
      return;
    }
    const opened = window.open(href, "_blank", "noopener,noreferrer");
    if (opened === null) window.location.assign(href);
  }

  function handleTrack(value: string): void {
    const code = validateLr(value);
    if (code !== null) {
      setError(track.errors[code]);
      return;
    }
    setError(undefined);
    const lr = normalizeLr(value);

    if (destination === "whatsapp") {
      const number = company.whatsapp;
      if (number === null) return;
      openExternal(
        `https://wa.me/${whatsappDigits(number)}?text=${encodeURIComponent(track.panel.whatsappMessage(lr))}`,
        true,
      );
      return;
    }
    if (destination === "email") {
      const address = company.email;
      if (address === null) return;
      openExternal(
        `mailto:${address}?subject=${encodeURIComponent(track.panel.mailSubject(lr))}`,
        false,
      );
      return;
    }
    if (destination === "phone") {
      const phone = company.phone;
      if (phone === null) return;
      openExternal(`tel:${phone}`, false);
    }
  }

  if (destination === "none") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted border-line bg-paper-2 max-w-measure leading-body rounded-xs border p-6 text-xs font-light">
          {track.panel.unavailable}
        </p>
        <PortalLogins />
      </div>
    );
  }

  const buttonLabel =
    destination === "whatsapp"
      ? track.panel.whatsappButton
      : destination === "email"
        ? track.panel.emailButton
        : track.panel.phoneButton;

  return (
    <div className="flex flex-col gap-4">
      <TrackingInput
        label={track.panel.label}
        buttonLabel={buttonLabel}
        placeholder={track.panel.placeholder}
        helper={track.panel.helper}
        error={error}
        inputClassName="uppercase"
        onTrack={handleTrack}
      />
      {destination === "phone" && (
        <p className="text-muted max-w-measure leading-body text-xs font-light">
          {track.panel.callNote}
        </p>
      )}
      <PortalLogins />
    </div>
  );
}

/* The billing portal's two sign-in pages, under a hairline — the slot where
   Delhivery's track card keeps its app-store pair. Outline buttons, not fills:
   the page's one filled button stays the quote CTA (house rule 6). They leave
   the site, so they are plain `<a>` tags in a new tab (house rule 10), and a
   `null` URL in `company.portals` drops its button (house rule 4). */
interface PortalLogin {
  href: string | null;
  label: string;
}

function PortalLogins() {
  const candidates: readonly PortalLogin[] = [
    { href: company.portals.customer, label: track.portals.customerLabel },
    { href: company.portals.consignee, label: track.portals.consigneeLabel },
  ];
  const logins = candidates.filter(
    (login): login is PortalLogin & { href: string } => login.href !== null,
  );

  if (logins.length === 0) return null;

  return (
    <div className="border-line mt-2 flex flex-col gap-4 border-t pt-6">
      <p className="text-ink-2 max-w-measure leading-body text-xs font-light">
        {track.portals.note}
      </p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {logins.map((login) => (
          <li key={login.href}>
            <Button asChild variant="outline" className="w-full">
              <a href={login.href} target="_blank" rel="noopener noreferrer">
                {login.label}
                <span className="sr-only"> {track.portals.newTabHint}</span>
                <ArrowUpRightIcon aria-hidden="true" />
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
