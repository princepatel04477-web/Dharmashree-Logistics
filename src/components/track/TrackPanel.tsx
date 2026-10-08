"use client";

import { useState } from "react";
import { TrackingInput } from "@/components/vendor/origin";
import { company } from "@/content/company";
import { track } from "@/content/track";
import { normalizeLr, validateLr } from "@/lib/validate";

/* The LR handoff (Prompt 08).

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

export function TrackPanel() {
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
      <p className="text-muted border-line bg-paper-2 max-w-measure leading-body rounded-xs border p-6 text-xs font-light">
        {track.panel.unavailable}
      </p>
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
    </div>
  );
}
