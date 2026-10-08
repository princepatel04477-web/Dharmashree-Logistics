/* `/track` copy (Prompt 08). The page is honest by design: there is no live
   tracking behind it, and nothing here says otherwise. The LR number is checked
   and handed to the desk through a channel that actually exists — WhatsApp when
   `company.whatsapp` is set, otherwise email, otherwise phone, otherwise a line
   saying the numbers are not published yet (house rule 4).

   `lineChannelNote` names WhatsApp, so it is only used when that number exists;
   `lineChannelFallback` carries the same sentence without the promise. Same
   pattern as `responseNote` in `quote.ts`. */

import type { LrCode } from "@/lib/validate";

export const track = {
  eyebrow: "Track",
  title: "Track a consignment.",
  line: "Enter your LR number.",
  lineChannelNote: "Our desk will share the latest status on WhatsApp." as string | null,
  lineChannelFallback: "Our desk will share the latest status on request.",

  metadata: {
    title: "Track a consignment",
    description:
      "The desk checks the LR number against the booking and replies on the channel below.",
  },

  panel: {
    label: "LR number",
    placeholder: "DSL-2601-4821",
    helper: "4–20 letters and numbers. Upper case is applied as you type.",
    whatsappButton: "Continue on WhatsApp",
    emailButton: "Email the desk",
    phoneButton: "Call the desk",
    /** Sent as the WhatsApp message text. */
    whatsappMessage: (lr: string): string =>
      `Hello DharmaShree Logistics, please share the status of LR ${lr}.`,
    /** The LR goes into the subject line, so the desk can file the reply. */
    mailSubject: (lr: string): string => `Status of LR ${lr}`,
    /** The phone branch cannot carry the LR number, so it asks for it out loud. */
    callNote: "Keep the LR number to hand — the desk looks the booking up against it.",
    /** No WhatsApp, no email, no phone: say so instead of offering a dead control. */
    unavailable:
      "The desk's WhatsApp, phone and email appear here once they are published. Until then, this page has no way to pass an LR number on.",
  },

  /** Message under the LR field, keyed by the code `validate.ts` returns. */
  errors: {
    LrRequired: "Enter the LR number from the slip.",
    LrFormat: "An LR number is 4–20 letters and numbers.",
  } satisfies Record<LrCode, string>,

  explainer: {
    title: "Where's my LR number?",
    body: [
      "Every consignment has an LR number from day one — it is the number written on the LR slip our desk hands over when the load is picked up.",
      "Cannot find it? Ask the desk. The pickup date and the delivery city are enough to trace the booking against our records.",
    ],
    /** Description of the line art beside these lines. */
    slipCaption: "An LR slip, with the number field marked.",
    slipNumberLabel: "LR No.",
    slipConsignorLabel: "Consignor",
    slipConsigneeLabel: "Consignee",
    slipRouteLabel: "From → To",
  },
} as const;
