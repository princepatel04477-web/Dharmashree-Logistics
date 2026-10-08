/* `/track` copy (Prompts 08 and 12). The page is honest by design: there is no live
   tracking behind it, and nothing here says otherwise. The AWB, LR or tracking
   number — one field, one rule, whichever the visitor holds — is checked
   and handed to the desk through a channel that actually exists — WhatsApp when
   `company.whatsapp` is set, otherwise email, otherwise phone, otherwise a line
   saying the numbers are not published yet (house rule 4).

   `lineChannelNote` names WhatsApp, so it is only used when that number exists;
   `lineChannelFallback` carries the same sentence without the promise. Same
   pattern as `responseNote` in `quote.ts`. */

import type { LrCode } from "@/lib/validate";

export const track = {
  eyebrow: "Track",
  title: "Track your shipment.",
  line: "Enter your AWB, LR or tracking number to stay informed at every step.",
  lineChannelNote: "Our desk will share the latest status on WhatsApp." as string | null,
  lineChannelFallback: "Our desk will share the latest status on request.",

  metadata: {
    title: "Track your shipment",
    description:
      "Enter your AWB, LR or tracking number. The desk checks it against the booking and replies on the channel below.",
  },

  panel: {
    label: "AWB, LR or tracking number",
    placeholder: "DSL-2601-4821",
    helper: "4–20 letters and numbers. Upper case is applied as you type.",
    whatsappButton: "Continue on WhatsApp",
    emailButton: "Email the desk",
    phoneButton: "Call the desk",
    /** Sent as the WhatsApp message text. */
    whatsappMessage: (lr: string): string =>
      `Hello DharmaShree Logistics, please share the status of AWB/LR ${lr}.`,
    /** The LR goes into the subject line, so the desk can file the reply. */
    mailSubject: (lr: string): string => `Status of AWB/LR ${lr}`,
    /** The phone branch cannot carry the LR number, so it asks for it out loud. */
    callNote: "Keep the number to hand — the desk looks the booking up against it.",
    /** No WhatsApp, no email, no phone: say so instead of offering a dead control. */
    unavailable:
      "The desk's WhatsApp, phone and email appear here once they are published. Until then, this page has no way to pass a tracking number on.",
  },

  /** Message under the LR field, keyed by the code `validate.ts` returns. */
  errors: {
    LrRequired: "Enter the AWB, LR or tracking number.",
    LrFormat: "That number is 4–20 letters and numbers.",
  } satisfies Record<LrCode, string>,

  explainer: {
    title: "Where's my number?",
    body: [
      "Every shipment is assigned a unique Air Waybill (AWB) or tracking number; consignments by road carry an LR number. Whichever you hold, it is the number written on the slip the desk hands over when the load is picked up.",
      "Cannot find it? Ask the desk. The pickup date and the delivery city are enough to trace the booking against our records.",
    ],
    /** Description of the line art beside these lines. */
    slipCaption: "A consignment slip, with the number field marked.",
    slipNumberLabel: "AWB / LR No.",
    slipConsignorLabel: "Consignor",
    slipConsigneeLabel: "Consignee",
    slipRouteLabel: "From → To",
  },

  statuses: {
    index: "02",
    title: "What each status means",
    note: "Tracking shows the latest available operational information. Actual delivery times may vary due to route conditions, weather, security checks, address availability or other factors outside normal control.",
    items: [
      {
        question: "Booked",
        answer: "The consignment has been booked and is waiting to be collected.",
      },
      {
        question: "Picked up",
        answer: "The shipment has been collected from the sender.",
      },
      {
        question: "In transit",
        answer: "The shipment is moving between pickup and delivery.",
      },
      {
        question: "Arrived at a facility",
        answer: "The shipment has reached a facility on its journey.",
      },
      {
        question: "Out for delivery",
        answer: "The shipment is on its way to the receiver.",
      },
      {
        question: "Delivered",
        answer: "The shipment has reached the receiver.",
      },
      {
        question: "Requires attention",
        answer:
          "Something needs a decision or a correction before the shipment can move on. Contact support with your number and a short description of the query.",
      },
    ],
  },

  noNumber: {
    index: "03",
    title: "No AWB or tracking number?",
    toggleOpen: "Show what to keep ready",
    toggleClose: "Hide",
    body: "Your booking reference or invoice reference may help the support team locate the shipment details. For business customers managing multiple consignments, these references make it easier to identify one specific shipment and get the right assistance.",
    checklistLabel: "Keep these ready",
    checklist: ["Sender name", "Receiver name", "Pickup date", "Destination"],
  },

  help: {
    index: "04",
    title: "Dedicated help when you need it",
    body: "Sometimes you need more than a tracking update. If a status is unclear, you need to correct delivery information, have a booking query or need help with a delayed consignment, share your number along with your query so the team can give more relevant guidance.",
    linkLabel: "Support & FAQ",
    linkHref: "/support",
  },
} as const;
