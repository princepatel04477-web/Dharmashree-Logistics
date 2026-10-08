/* `/quote` copy (Prompt 08). Every string the page and the form render lives
   here (house rule 3); the field *rules* live in `src/lib/validate.ts` and are
   keyed by code, so a message can be rewritten without touching a validator.

   Two lines name a channel or a timing, and both are gated rather than assumed:
   `responseNote` disappears when the desk cannot commit to it, and the failure
   sentence mentioning WhatsApp is only used when `company.whatsapp` is set (the
   component asks `whatsappLink()` — house rule 4). */

import type { QuoteError } from "@/lib/quote";
import type { QuoteFieldCode } from "@/lib/validate";

/** The soft half of the line under the H1. Set to `null` to drop it: the
    sentence still reads whole ("Our desk replies with a confirmed rate."). */
export const responseNote: string | null = "Usually the same working day.";

const failureWithWhatsapp = "That didn't go through. Try again, or WhatsApp us your details.";
const failureWithoutWhatsapp = "That didn't go through. Try again.";

export const quote = {
  eyebrow: "Quote",
  title: "Tell us about the load.",
  responseLine: "Our desk replies with a confirmed rate.",
  responseNote,

  metadata: {
    title: "Request a quote",
    description: `${responseNote === null ? "" : `${responseNote} `}Three steps: the lane, the load, and where the rate should go.`,
  },

  /** Accessible name for the form and its step rail. */
  formLabel: "Quote request",
  stepperLabel: "Quote request steps",
  stepper: ["Lane & service", "The load", "Contact"],

  lane: {
    title: "Lane & service",
    note: "What is moving, and between where. The desk picks the vehicle from this — leave the vehicle itself to them if you have no preference.",
    serviceLabel: "Service",
    serviceHelper:
      "Pick the closest fit. A mixed load is fine — the desk will say which service it prices as.",
    fromLabel: "From",
    fromHelper: "The pickup point. The gated address goes in the notes.",
    toLabel: "To",
    toHelper:
      "Start typing and choose from the list, or type a city that is not on it — the desk will answer for that lane.",
    hubListLabel: "Hubs on the map",
  },

  load: {
    title: "The load",
    note: "What is going, roughly how much of it, and when it is ready. Approximate is fine — the desk confirms the numbers against the actual load.",
    loadTypeLabel: "Load type",
    loadTypePlaceholder: "Choose a load type",
    loadTypes: ["Bales", "Parcels", "Cartons", "Machinery", "Mixed", "Other"],
    weightLabel: "Approx weight (kg)",
    weightHelper: "Optional. Bale or parcel counts work too — put those in the notes.",
    vehicleLabel: "Vehicle preference",
    vehicleDecide: "Let DharmaShree decide",
    vehicleHelper: "A preference only: the vehicle is assigned after the load is measured.",
    pickupLabel: "Pickup date",
    pickupHelper: "When the load is ready to go — today or later.",
    notesLabel: "Notes",
    notesPlaceholder: "Bale or parcel count, packing, loading window, consignee…",
    notesHelper: "Anything the desk should know before quoting.",
    notesMaxLength: 500,
  },

  contact: {
    title: "Contact",
    note: "Where the rate should go. The reference number is issued against this name.",
    nameLabel: "Your name",
    companyLabel: "Company",
    companyHelper: "Optional.",
    phoneLabel: "Phone",
    phoneHelper: "Indian mobile — the desk calls this number with the rate.",
    emailLabel: "Email",
    emailHelper: "Optional. Add it if you want the quotation in writing.",
    consentLabel: "I agree to be contacted about this request.",
    /** Honeypot: never seen, never tabbed to, never filled by a person. */
    honeypotLabel: "Leave this field empty",
  },

  review: {
    title: "Check the request",
    note: "One enquiry reaches the desk, with these answers in it. Edit any step and the request goes back there.",
    editLabel: "Edit",
    backLabel: "Back",
    nextLabel: "Continue",
    submitLabel: "Send request",
    sendingLabel: "Sending",
  },

  success: {
    title: "Request received.",
    referenceLabel: "Reference",
    notice: "Save this reference — our desk will quote against it.",
    /** Only rendered when `whatsappLink()` resolves. */
    whatsappLabel: "Message the desk",
    whatsappMessage: (reference: string): string => `Hello, my quote reference is ${reference}.`,
    againLabel: "Start another request",
    /** Second line of the confirmation toast. */
    toastTitle: "Quote request sent",
  },

  failure: {
    title: "Not sent",
    withWhatsapp: failureWithWhatsapp,
    withoutWhatsapp: failureWithoutWhatsapp,
    kept: "Your answers are still here.",
    retryLabel: "Try again",
    /** One line per code, for the desk's side of the screen. */
    reasons: {
      Unconfigured: "The form is not connected to the desk's sheet yet.",
      Network: "The request could not leave this device.",
      Timeout: "The desk's sheet did not answer in time.",
      Rejected: "The desk's sheet refused the request.",
      Server: "The desk's sheet answered with something unexpected.",
    } satisfies Record<QuoteError, string>,
  },

  /** Message under each field, keyed by the code `validate.ts` returns. */
  errors: {
    Required: "This one is needed before the desk can quote.",
    Phone: "An Indian mobile number: 10 digits, or +91 and 10 digits.",
    Email: "That address doesn't look complete.",
    Weight: "Weight in kilograms, as a number above zero.",
    DatePast: "Pick a date from today onwards.",
    DateInvalid: "Pick a date from the calendar.",
    Consent: "We need your agreement before the request can be sent.",
  } satisfies Record<QuoteFieldCode, string>,

  /** Replaces the form for visitors without JavaScript: the POST is a fetch,
    so there is nothing for the browser to submit on its own. */
  noscript:
    "This form needs JavaScript to send. Turn it on and the request reaches the desk's sheet.",

  aside: {
    title: "The desk",
    note: "The rate and the vehicle are confirmed before anything is booked.",
    steps: [
      "The load is read against the lane it is going to.",
      "You get the rate, the vehicle and the pickup window.",
      "Nothing is booked until you confirm the rate.",
    ],
    /** Mirrors `serviceDetail.ctaNote`: the numbers appear when they exist. */
    contactNote: "Phone and WhatsApp appear here once the desk's numbers are published.",
  },
} as const;
