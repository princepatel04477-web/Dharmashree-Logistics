import { company } from "./company";
import { ORIGIN } from "./hubs";
import { contactLinks } from "./navigation";

/* `/privacy` and `/terms`. Written from what the code actually does — the
   quote form's fields and endpoint (`src/lib/quote.ts`), the session-only
   draft (`src/lib/quote-draft.ts`), the hand-off-only /track page, fonts
   served from this site, no analytics — so every sentence can be checked
   against the build. The terms cover the website only; carriage itself is
   governed by each consignment's own LR and booking, which this page names
   but never restates or varies. Have both reviewed before relying on them. */

export interface LegalSection {
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly items?: readonly string[];
}

export interface LegalDoc {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lede: string;
  /** ISO date this text last changed. */
  readonly updated: string;
  readonly updatedLabel: string;
  readonly sections: readonly LegalSection[];
}

const owner = company.legalName ?? company.name;

export const privacy: LegalDoc = {
  metaTitle: "Privacy",
  metaDescription: `What ${company.name}'s website collects, where it goes and what it is used for.`,
  eyebrow: "Privacy",
  title: "What this site keeps, and why.",
  lede: "Short version: the only personal details this site handles are the ones you type into its forms, and they go to the desk so it can answer you. No analytics, no advertising trackers, no cookies.",
  updated: "2026-10-10",
  updatedLabel: "Last updated",
  sections: [
    {
      title: "The quote form",
      paragraphs: ["When you send a quote request, the form sends these details to the desk:"],
      items: [
        "your name, and your company if you give one",
        "your phone number, and your email if you give one",
        "the service, the pickup and delivery cities, the load type, approximate weight, vehicle preference and pickup date",
        "any notes you add, and which page of the site you started from",
      ],
    },
    {
      title: "The truck attachment form",
      paragraphs: [
        "When you apply to attach a truck, the form sends these details to the desk so the team can verify the vehicle and pay settlements for its trips:",
      ],
      items: [
        "the owner’s name, owner type, phone number, address and operating city, and the email and GSTIN if you give them",
        "the vehicle’s registration number, make and model, year, body type, payload, chassis number if you give it, permit and insurance dates, and whether GPS is fitted",
        "the primary driver’s name, phone number, driving licence number and its expiry date, and police verification status",
        "the settlement bank account: holder name, bank, account number and IFSC",
        "which document copies you have ready, and which page of the site you started from",
      ],
    },
    {
      title: "Where it goes",
      paragraphs: [
        `The request is delivered to the desk’s spreadsheet through a Google Apps Script web app, so it is stored with Google on the desk’s behalf. ${owner} uses it to reply to you about the load and the booking that follows, and for nothing else. It is not sold, shared for marketing or added to a mailing list.`,
        `A truck attachment application goes the same way, to its own tab of that spreadsheet. ${owner} uses it to verify the vehicle, the driver and the papers, and to pay settlements into the account you give. The email that tells the desk about a new application shows only the last four digits of the account number.`,
      ],
    },
    {
      title: "Your unsent draft",
      paragraphs: [
        "While you fill in the quote form, what you have typed is kept in your browser’s session storage so a refresh does not lose it. It stays in that tab, is never sent anywhere until you submit, and is deleted when the tab closes or the request goes through.",
      ],
    },
    {
      title: "Tracking a consignment",
      paragraphs: [
        "The Track page checks the format of your LR number in your browser and hands it to the desk’s own channel. The site itself does not store the number or look anything up.",
      ],
    },
    {
      title: "What this site does not do",
      paragraphs: [
        "There are no analytics, advertising or social-media trackers on this site, and it sets no cookies. Fonts and images are served from this site, not from third-party services.",
        "Like any website, the host that serves these pages may keep standard request logs — the address a request came from, the time and the page asked for — for security and to keep the site running.",
      ],
    },
    {
      title: "Your details, your call",
      paragraphs: [
        contactLinks().length > 0
          ? `To see, correct or remove what you sent through the quote form or the truck attachment form, ask the ${ORIGIN.name} desk using any channel on the contact page, quoting the phone number you used.`
          : `To see, correct or remove what you sent through the quote form, send a new request with your request in the notes and the same phone number — the ${ORIGIN.name} desk will act on it and reply on that number.`,
      ],
    },
  ],
};

export const terms: LegalDoc = {
  metaTitle: "Terms",
  metaDescription: `Terms for using ${company.name}'s website.`,
  eyebrow: "Terms",
  title: "Using this site.",
  lede: "These terms cover the website. Carriage itself — every load the desk moves — is governed by that consignment’s own LR and the booking the desk confirms with you.",
  updated: "2026-10-08",
  updatedLabel: "Last updated",
  sections: [
    {
      title: "Information on the site",
      paragraphs: [
        "Services, vehicles, lanes and hubs are described here in good faith and in general terms. They are not an offer: the vehicle, the rate and the dates for any load are the ones the desk confirms for that booking.",
        `Distances on the network map are straight-line distances from ${ORIGIN.name}, worked out from map coordinates. They are not road distances and say nothing about transit time.`,
      ],
    },
    {
      title: "Quote requests",
      paragraphs: [
        "Sending the quote form is a request, not a booking. Nothing is booked, and nothing is owed, until the desk has confirmed the vehicle and the rate with you and you have agreed them.",
      ],
    },
    {
      title: "Carriage",
      paragraphs: [
        "Each consignment is carried on the terms of its lorry receipt (LR) and the booking confirmed for it. Nothing on this website adds to, removes or changes those terms.",
      ],
    },
    {
      title: "Using the site fairly",
      paragraphs: [
        "Please use the forms for real enquiries only. Automated or bulk submissions are filtered out and are not answered.",
      ],
    },
    {
      title: "Content",
      paragraphs: [
        `The text, design and images on this site belong to ${owner} or are used with permission. You are welcome to link to any page.`,
      ],
    },
    {
      title: "Changes",
      paragraphs: [
        "These terms may be updated as the site changes. The date at the top always shows when they last changed.",
      ],
    },
  ],
};
