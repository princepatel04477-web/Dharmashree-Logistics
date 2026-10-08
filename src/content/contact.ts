import { company } from "./company";
import { contactLinks } from "./navigation";

/* `/contact` copy. The channels themselves are facts and come from
   `contactLinks()` / `contactLines()`, which drop anything `company.ts` has as
   null. The lede is chosen by whether any channel exists, so the page never
   promises a number it cannot show. */

const hasChannels = contactLinks().length > 0;

export const contact = {
  metaTitle: "Contact",
  metaDescription: `Reach the ${company.name} desk in ${company.headquarters.city}, or send a load through the quote form. Answers to common questions about booking, rates and delivery.`,
  eyebrow: "Contact",
  title: "Talk to the desk.",
  lede: hasChannels
    ? "Call, write or message — the same people take every booking and stay with it until delivery."
    : "The desk’s phone, WhatsApp and email go up on this page as soon as they are published. Until then the quote form reaches the same people, and they reply on the number you leave.",

  channelsIndex: "01",
  channelsTitle: "Reach us",
  channelLabels: {
    phone: "Call",
    email: "Write",
    whatsapp: "Message",
    route: "",
  },
  officeLabel: "Desk",
  office: `${company.headquarters.city}, ${company.headquarters.state}`,
  branchesLabel: "Also dispatching from",

  quoteIndex: "02",
  quoteTitle: "Have a load ready?",
  quoteBody:
    "The quick way to a rate is the quote form: the lane, the load and the date in three short steps. The desk confirms the vehicle and the rate before anything moves.",
  quoteLink: "Start a quote",
  trackBody: "Already booked? Your AWB, LR or tracking number is all the desk needs.",
  trackLink: "Track your shipment",

  faqIndex: "03",
  faqTitle: "Common questions",
  faqMoreLabel: "Support & FAQ",
  hoursLabel: "Hours",
};
