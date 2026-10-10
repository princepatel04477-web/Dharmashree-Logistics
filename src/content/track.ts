/* `/track` copy (Prompts 08 and 12). Two modes, chosen at build time by
   `backendMode` (src/lib/backend/config.ts).

   Without a backend — the default — the page is honest by design: there is no
   live tracking behind it, and nothing in the top-level keys below says
   otherwise. The AWB, LR or tracking number — one field, one rule, whichever
   the visitor holds — is checked and handed to the desk through a channel that
   actually exists — WhatsApp when `company.whatsapp` is set, otherwise email,
   otherwise phone, otherwise a line saying the numbers are not published yet
   (house rule 4).

   With the client's backend connected, the copy under `live` replaces the
   off-mode lines that describe the handoff, and the panel runs the LR + SMS-code
   flow. `live` is read only on that branch, so the off-mode text stays exactly
   as it was.

   `lineChannelNote` names WhatsApp, so it is only used when that number exists;
   `lineChannelFallback` carries the same sentence without the promise. Same
   pattern as `responseNote` in `quote.ts`. */

import type { BackendErrorCode, LrChargeKey } from "@/lib/backend/types";
import type { LrCode, MobileCode, OtpCode } from "@/lib/validate";

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

  /** Under the field: sign-in to the billing portal (URLs in `company.portals`). */
  portals: {
    note: "Have a portal account? Sign in to view your consignments and bills.",
    customerLabel: "Customer / Supplier login",
    consigneeLabel: "Consignee login",
    /** Read after each label by screen readers: the link leaves this site. */
    newTabHint: "(opens in a new tab)",
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
        key: "booked",
        answer: "The consignment has been booked and is waiting to be collected.",
      },
      {
        question: "Picked up",
        key: "picked-up",
        answer: "The shipment has been collected from the sender.",
      },
      {
        question: "In transit",
        key: "in-transit",
        answer: "The shipment is moving between pickup and delivery.",
      },
      {
        question: "Arrived at a facility",
        key: "at-facility",
        answer: "The shipment has reached a facility on its journey.",
      },
      {
        question: "Out for delivery",
        key: "out-for-delivery",
        answer: "The shipment is on its way to the receiver.",
      },
      {
        question: "Delivered",
        key: "delivered",
        answer: "The shipment has reached the receiver.",
      },
      {
        question: "Requires attention",
        key: "attention",
        /** Marked with --signal-red on the ladder; every other status is --brand. */
        attention: true,
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

  /* The LR + SMS-code flow (src/components/track/LiveTrackFlow.tsx). Read only
     when a backend is connected; see the header comment. */
  live: {
    line: "Enter your LR number and the mobile number on the booking. We send a one-time code to that number, then show where the consignment is.",
    metadataDescription:
      "Enter your LR number and the mobile number on the booking. A one-time code confirms it is you, then the status and history of the consignment are shown.",

    /* The direct lookup (`direct` mode): the LR number and the mobile number on
       the booking, no SMS code. The mobile is what keeps a booking private. */
    direct: {
      line: "Enter the LR number printed on your slip and the mobile number on the booking to see where the consignment is, along with the booking details on the LR.",
      metadataDescription:
        "Enter your LR number and the mobile number on the booking to see the consignment's status, route, invoice and freight details, and its movement history.",
      lrLabel: "LR number",
      placeholder: "SRT - 3230",
      helper:
        "The whole LR number as printed on your slip: branch code and number, for example SRT - 3230.",
      /** A number without its branch code, or not an LR number at all. */
      wholeNumber:
        "Enter the whole LR number with its branch code, for example SRT - 3230. The number alone is not enough.",
      mobileLabel: "Mobile number on the booking",
      mobilePlaceholder: "98765 43210",
      mobileHelper: "The consignor's or consignee's mobile number given at booking.",
      /** Said once, under the fields — why a second number is asked for. */
      privacyNote:
        "A consignment's details are shown only to the mobile number on its booking, so other people's bookings stay private.",
      /** The hero card asks for the LR only and carries it to /track. */
      submit: "Track",
      /** On /track, where both numbers are given. */
      submitVerified: "Track shipment",
      submitting: "Looking up…",
      askDeskLabel: "Ask the desk",
      askDeskHref: "/contact",
      /** Shown only on a prototype build (`NEXT_PUBLIC_TRACK_DEMO=1`). */
      demoHint:
        "Want to see a result? Use the sample booking: LR DEMO - 1001 with mobile 98765 43210.",
      demoFill: "Fill in the sample",
      /** On a result that came from a sample booking. */
      demoBadge: "Sample booking · for demonstration only",
    },

    details: {
      lrLabel: "LR number",
      mobileLabel: "Mobile number on the booking",
      mobilePlaceholder: "98765 43210",
      mobileHelper: "10-digit mobile number. We send a 6-digit code by SMS.",
      submit: "Send OTP",
      submitting: "Sending code…",
    },

    otp: {
      label: "One-time code",
      placeholder: "6-digit code",
      /** `masked` is already in +91 ••••• •1234 form. */
      sentTo: (masked: string, lr: string): string => `Code sent to ${masked} for LR ${lr}.`,
      /** Without a maskable number, the sentence still tells the visitor where to look. */
      sentToFallback: (lr: string): string => `Code sent by SMS for LR ${lr}.`,
      helper: "Enter the 6-digit code from the SMS. You can paste it.",
      submit: "Verify & track",
      verifying: "Verifying…",
      fetching: "Fetching status…",
      resendIn: (seconds: number): string => `Resend code in ${String(seconds)}s`,
      resend: "Resend code",
      resending: "Sending code…",
      changeNumber: "Change number",
    },

    result: {
      lrLabel: "LR number",
      statusLabel: "Current status",
      progressLabel: "Journey progress",
      progressCurrent: "current step",
      routeLabel: "Route",
      /** Read between origin and destination by screen readers (the arrow is decorative). */
      routeTo: "to",
      consignorLabel: "Consignor",
      consigneeLabel: "Consignee",
      packagesLabel: "Packages",
      weightLabel: "Weight",
      weightValue: (formatted: string): string => `${formatted} kg`,
      bookedLabel: "Booked on",
      expectedLabel: "Expected delivery",
      deliveredLabel: "Delivered on",
      locationLabel: "Last known location",
      /** The desk's own words for the status, under the ladder's label. */
      deskUpdate: (words: string): string => `Latest update: ${words}`,
      vehicleLabel: "Vehicle no.",
      deliveryTypeLabel: "Delivery",
      gstinLabel: "GSTIN",
      contactLabel: "Contact",
      invoiceTitle: "Invoice details",
      invoiceNoLabel: "Invoice no.",
      invoiceDateLabel: "Invoice date",
      invoiceValueLabel: "Invoice value",
      privateMarkLabel: "Private mark",
      containsLabel: "Contains",
      ewayBillLabel: "E-way bill no.",
      packageTypeLabel: "Package type",
      chargeWeightLabel: "Charged weight",
      supplierLabel: "Supplier",
      freightTitle: "Freight details",
      rateTypeLabel: "Rate type",
      charges: {
        freight: "Freight",
        pickup: "Collection / pickup",
        stCharge: "St. charge",
        insurance: "Insurance",
        doorDelivery: "Door delivery",
        loading: "Loading",
        unloading: "Unloading",
        other: "Other charges",
      } satisfies Record<LrChargeKey, string>,
      totalLabel: "Total",
      advanceLabel: "Advance",
      balanceLabel: "Balance",
      deliveryAtTitle: "Delivery at",
      historyTitle: "Shipment history",
      noEvents: "No movement has been recorded for this consignment yet.",
      /** The history opens on the newest few movements; the rest sit behind this. */
      showAllEvents: (count: number): string => `Show all ${String(count)} movements`,
      showFewerEvents: "Show fewer",
      trackAnother: "Track another",
    },

    /** One sentence per failure, keyed by the code `src/lib/backend` returns. */
    errors: {
      Network: "We could not reach the tracking service. Check your connection and try again.",
      Timeout: "The tracking service took too long to answer. Please try again.",
      NotFound:
        "We could not find that LR number. Check it against the slip from pickup and try again.",
      /* Unknown LR, wrong mobile and a booking with no number on file all read
         the same, on purpose: the screen must not tell a stranger which LR
         numbers exist. */
      NotVerified:
        "We could not match that LR number with that mobile number. Check both against your slip and the booking, or ask the desk to help.",
      MobileMismatch:
        "That mobile number is not the one on this booking. Use the number given at booking.",
      OtpInvalid: "That code is not correct. Check the SMS and try again.",
      OtpExpired: "That code has expired. Request a new code.",
      TooManyAttempts: "Too many incorrect codes. Start again to get a new code.",
      RateLimited: "Too many requests just now. Wait a few minutes and try again.",
      SessionExpired: "Your verification has timed out. Start again to get a new code.",
      Server: "The tracking service had a problem. Please try again shortly, or contact the desk.",
      Unconfigured: "Live tracking is not available on this site yet.",
      BadResponse:
        "The tracking service sent a reply we could not read. Please try again, or contact the desk.",
    } satisfies Record<BackendErrorCode, string>,

    /** Field messages for the two new inputs, keyed like `errors` above. */
    fieldErrors: {
      MobileRequired: "Enter the mobile number on the booking.",
      MobileFormat: "That is not a 10-digit Indian mobile number.",
      OtpRequired: "Enter the 6-digit code from the SMS.",
      OtpFormat: "The code is 6 digits.",
    } satisfies Record<MobileCode | OtpCode, string>,
  },
} as const;
