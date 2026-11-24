import { company } from "./company";
import { faqs as generalFaqs } from "./faq";
import type { Faq } from "./types";

/* `/support` (Prompt 12). The six questions from the company profile's Support
   page, verbatim in substance, are the backbone; the general questions from
   `faq.ts` that the contact page also uses are filed under a topic so the
   filter chips can narrow all of them. Nothing here promises a delivery time
   (the profile says an estimate is "not a guaranteed delivery commitment unless
   specifically agreed in writing") or invents a phone number: contact rows come
   from `contactLinks()`, and the hours row appears only when
   `company.supportHours` is set. */

export type SupportTopic = "tracking" | "pickup" | "delivery" | "delays" | "damage" | "booking";

export interface SupportFaq extends Faq {
  readonly topic: SupportTopic;
}

export const supportTopics: readonly { readonly id: SupportTopic; readonly label: string }[] = [
  { id: "tracking", label: "Tracking" },
  { id: "pickup", label: "Pickup" },
  { id: "delivery", label: "Delivery time" },
  { id: "delays", label: "Delays" },
  { id: "damage", label: "Damage" },
  { id: "booking", label: "Booking" },
];

/** Which of the general FAQ entries belongs to which topic, by question. */
const topicOfGeneral: Readonly<Record<string, SupportTopic>> = {
  "How do I book a load?": "booking",
  "Can the rate change after pickup?": "booking",
  "What is an LR number, and when do I get one?": "tracking",
  "Can I track a consignment online?": "tracking",
  "Which cities do you deliver to?": "delivery",
  "What counts as proof of delivery?": "delivery",
  "What paperwork do I keep ready?": "pickup",
};

const profileFaqs: readonly SupportFaq[] = [
  {
    topic: "tracking",
    question: "How do I track my shipment?",
    answer:
      "Enter its AWB or tracking number on the tracking page. It will show the latest available shipment-status information: the consignment may be booked, picked up, in transit, arrived at a facility, out for delivery or delivered. If you cannot find your shipment or the status needs clarification, contact the support team with your tracking number.",
  },
  {
    topic: "pickup",
    question: "How do I raise a pickup request?",
    answer:
      "Use the pickup request on the quote form, the telephone number or the official business contact channel. Please provide the pickup address, contact person, mobile number, shipment type, approximate weight or dimensions, number of parcels and destination details. The team reviews the request and coordinates the available pickup option; availability, timing and serviceability may depend on the location, shipment requirement and operating schedule.",
  },
  {
    topic: "delivery",
    question: "How long will delivery take?",
    answer:
      "It depends on the pickup and destination locations, the selected service, the shipment type, route conditions and operational requirements. Local deliveries may be completed on the same day or the next working day where service is available, while regional and intercity shipments may take longer. The estimated timeline shared during booking is an expected timeframe and not a guaranteed delivery commitment unless specifically agreed in writing.",
  },
  {
    topic: "delays",
    question: "What should I do if my shipment is delayed?",
    answer:
      "First check its latest status on the tracking page. Delays can occur due to weather conditions, traffic restrictions, operational constraints, incomplete address details, recipient unavailability, security checks or other circumstances outside normal control. If you need further help, contact the support team with the AWB or tracking number; they will review the available shipment information and guide you on the next steps.",
  },
  {
    topic: "damage",
    question: "What should I do if my shipment is damaged?",
    answer:
      "Inform Dharmashree Logistics as soon as possible. Keep the shipment, packaging, invoice and any relevant photographs available for review. The team may ask for the AWB number, booking details, a description of the issue and supporting images or documents. Damage-related queries are reviewed according to the shipment booking terms, declared value, packaging condition and applicable service policies.",
  },
];

export const supportFaqs: readonly SupportFaq[] = [
  ...profileFaqs,
  ...generalFaqs.map((entry) => ({
    ...entry,
    topic: topicOfGeneral[entry.question] ?? ("booking" as const),
  })),
];

export const support = {
  metaTitle: "Support & FAQ",
  metaDescription: `Answers on tracking, pickup, delivery time, delays and damage from the ${company.name} support team — and how to reach them.`,
  eyebrow: "Support & FAQ",
  title: "Your question is our priority.",
  lede: "For help with shipping, tracking, pickup, freight or any other service-related requirement, connect with the support team. They are here to give clear guidance and help you understand the next steps for your shipment.",

  ready: {
    index: "01",
    title: "Have these ready",
    note: "To help us assist you faster, keep these to hand when you contact support.",
    items: [
      "AWB or tracking number",
      "Booking reference",
      "Sender and receiver details",
      "Shipment date",
    ],
  },

  faq: {
    index: "02",
    title: "Common questions",
    filterLabel: "Filter by topic",
    allLabel: "All",
    resultsLine: (shown: number, total: number): string =>
      shown === total ? `${shown} questions` : `${shown} of ${total} questions`,
    emptyLine: "No questions under this topic yet.",
  },

  help: {
    index: "03",
    title: "Need more help?",
    body: "For any query related to shipment booking, pickup, tracking, delivery, freight, billing or returns, the support team is ready to assist. Share your shipment reference and a clear description of your concern so they can give you the most relevant support.",
    hoursLabel: "Hours",
    pickupLabel: "Raise a pickup request",
    pickupHref: "/quote/?intent=pickup",
    trackLabel: "Track a shipment",
    trackHref: "/track",
    noChannels:
      "The support team's phone, WhatsApp and email appear here once they are published. Until then the quote form reaches the same people.",
  },
} as const;
