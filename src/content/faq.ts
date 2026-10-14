import { HUBS, ORIGIN, REGIONS } from "./hubs";
import type { Faq } from "./types";

/* General questions for `/contact#faq`. Each answer restates something the
   site already commits to elsewhere — the home commitments and process, the
   honest /track page, the service-page answers — so the FAQ can never
   promise more than the rest of the site does. Counts come from `hubs.ts`. */

const regionCount = REGIONS.filter((entry) => entry.id !== "all").length;

export const faqs: Faq[] = [
  {
    question: "How do I book a load?",
    answer:
      "Send the load, the lane and the date through the quote form. The desk confirms the vehicle and the rate with you before anything is picked up, then collects from your godown or shop.",
  },
  {
    question: "Can the rate change after pickup?",
    answer: "No. The rate is confirmed before pickup and is not revised after the truck leaves.",
  },
  {
    question: "What is an LR number, and when do I get one?",
    answer:
      "The lorry receipt number. Every consignment has one from the day it is booked, and it is the only reference you need for a status, a question at the destination, or the proof of delivery.",
  },
  {
    question: "Can I track a consignment online?",
    answer:
      "There is no live tracking on this site, and it does not pretend otherwise. Enter your AWB, LR or tracking number on the Track page and the desk shares the status with you directly.",
  },
  {
    question: "Which cities do you deliver to?",
    answer: `Every hub on the network map — ${String(HUBS.length)} of them across ${String(regionCount)} regions, each a corridor from ${ORIGIN.name}. A city that is not on the map is a question for the desk, not a refusal.`,
  },
  {
    question: "What counts as proof of delivery?",
    answer: "The consignee’s signature against the LR number, shared with you once it is signed.",
  },
  {
    question: "What paperwork do I keep ready?",
    answer:
      "The invoice, and the e-way bill details where the consignment needs them. The desk checks both at pickup so a vehicle is not held at a barrier for a piece of paper.",
  },
];
