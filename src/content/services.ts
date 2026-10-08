import type { Service } from "./types";

/* The catalogue (Prompt 06). `company.services` owns the *names* — this file
   owns everything a page says about them — so the two lists must stay
   one-for-one, in order (`npm run verify:services` fails if they drift). The
   footer column, the home tiles and the index rows are all built from this
   array, so a service added here appears in all three without a component
   changing.

   Nothing here is a fact: no rates, no transit hours, no fleet counts. Where a
   lane is named it is a hub from `src/content/hubs.ts`, and where a number
   would belong the sentence says what the desk does instead. */

export const services: Service[] = [
  {
    slug: "full-truckload",
    name: "Full truckload (FTL)",
    summary: "A dedicated vehicle for the whole load, booked door to door.",
    body: [
      "A full load means the vehicle is yours from the moment it is sealed: nothing is consolidated with another consignment, nothing waits for a second booking to fill the body, and the route is whatever the delivery needs.",
      "The vehicle is assigned after the load is measured, not before it is quoted. If your bales fill a 19 footer with room to spare, you are not paying for a 32. Tell us the weight, the number of bales or rolls and the pickup point, and the desk comes back with a rate for that load alone.",
    ],
    bullets: [
      "One vehicle, one consignee, one booking",
      "Loading and unloading windows agreed before the vehicle is assigned",
      "LR and weighbridge slip issued at pickup",
      "Driver contact with the despatch desk for the length of the trip",
      "Proof of delivery returned once the consignee signs",
      "We work from your invoice and e-way bill details, checked before the vehicle leaves",
    ],
    bestFor: [
      "Mill loads and job work that fill a vehicle",
      "Bales and rolls straight to a wholesale market",
      "A delivery with a time on it, for one consignee",
      "Machinery and oversize on open-body vehicles",
      "Any hub on the map, city to city",
    ],
    vehicles: ["19 ft mxl", "32 ft multi-axle", "Open-body lorry"],
    questions: [
      {
        question: "How do I get a rate for a full load?",
        answer:
          "Send the load, the pickup point and the delivery city — WhatsApp, phone or the quote form. The vehicle and the rate are confirmed before anything is booked, and the rate does not move after the truck leaves.",
      },
      {
        question: "Can you load at night, or around market hours?",
        answer:
          "Tell us the window you need and the desk will say whether it works for that lane. Market days set the shape of most schedules out of Surat, and bookings are built around them rather than the other way round.",
      },
      {
        question: "What paperwork do I keep ready?",
        answer:
          "The invoice, and the e-way bill details where the consignment needs them. Our desk checks both at pickup so a vehicle is not held at a barrier for a piece of paper.",
      },
    ],
    image: null,
  },
  {
    slug: "part-load",
    name: "Part load (PTL)",
    summary: "Space on a vehicle that is already going, priced for the space you take.",
    body: [
      "Most dispatch from this city does not need a whole truck. Part load puts your cartons, bales or rolls onto a vehicle that is travelling anyway, and charges you for the fraction of the body your load occupies.",
      "It waits for the vehicle to fill, so it is not the fastest option on the lane. It is usually the sensible one. Loads are put together at the Surat end and broken down at the destination hub, which is where the cross-dock service earns its keep.",
    ],
    bullets: [
      "Charged by the space occupied, not by a whole vehicle",
      "Consolidated and broken down by our own desk, not a terminal",
      "One LR per consignment, so your paperwork stays separate",
      "Cut-off agreed at booking so the load makes the vehicle it was priced on",
      "Delivered by the same last-mile fleet as a full load",
    ],
    bestFor: [
      "Cartons and parcels short of a full vehicle",
      "Replenishment to a distributor point",
      "Samples and small batches between markets",
      "Stock that can wait a day to move cheaper",
      "Several consignees on one lane",
    ],
    vehicles: ["12 ft pickup", "17 ft container", "19 ft mxl"],
    questions: [
      {
        question: "How is my share of the vehicle measured?",
        answer:
          "By the space the load takes once it is packed — feet of body, or the number of bales, whichever the lane is priced on. The measurement is taken at the godown and written on the same sheet you are quoted from.",
      },
      {
        question: "Will my load be delayed while the vehicle fills?",
        answer:
          "That is the trade a part load makes. The desk tells you at booking which vehicle your load is going on, so you know the departure before you commit the stock.",
      },
      {
        question: "Can two of my consignees share one part load?",
        answer:
          "Yes. Each consignee gets its own LR and its own proof of delivery, on one booking.",
      },
    ],
    image: null,
  },
  {
    slug: "textile-parcel-bale-dispatch",
    name: "Textile parcel & bale dispatch",
    summary: "Bales, rolls and parcels to the markets, counted at both ends.",
    body: [
      "This is the freight Surat is known for, and it is handled differently from a carton. Bales are counted and weighed at the godown, rolls are laid or stood according to the fabric, and a parcel list travels with every vehicle so the receiving market can check it against the LR before anything is signed for.",
      "Market days set the pace. Say which market the load is going into — Meerut, Bareilly, Lucknow, Delhi NCR — and the booking is built around that day rather than around ours.",
    ],
    bullets: [
      "Bale, roll and parcel counts recorded at pickup",
      "Parcel list travels with the LR",
      "Covered and tarped loading on request",
      "Delivered to the market gate or the consignee's godown",
      "Shortages and damage noted on the same sheet, at the door, not afterwards",
      "Return loading picked up on the same vehicle where the lane allows",
    ],
    bestFor: [
      "Mill and job-work loads between textile markets",
      "Piece-goods parcels to wholesalers",
      "Rolls and grey fabric on covered vehicles",
      "Return empty bales and tubes coming back to Surat",
      "Consignments timed to a market day",
    ],
    vehicles: ["12 ft pickup", "17 ft container", "19 ft mxl", "32 ft multi-axle"],
    questions: [
      {
        question: "Do you count the bales, or do I?",
        answer:
          "Both, on the same sheet. The count taken at pickup and the count taken at delivery are written against the LR number, which is how a shortage gets settled in a phone call instead of an argument.",
      },
      {
        question: "Can you handle a load that is not ready when the vehicle is?",
        answer:
          "Yes — put it on the cross-dock service. The load is held against the booking and goes on the next vehicle out on that lane, with one reference running through both.",
      },
      {
        question: "Which markets do you deliver into?",
        answer:
          "Wherever the network reaches. The map on this page is the honest list: every hub we run to is on it, and a delivery outside those goes to the desk as a question rather than a promise.",
      },
    ],
    image: null,
  },
  {
    slug: "warehousing-cross-dock",
    name: "Warehousing & cross-dock",
    summary: "Storage between trips and transfer between vehicles, without a second booking.",
    body: [
      "Goods that arrive before their onward vehicle, or after a market has closed, should sit somewhere dry rather than on a roadside. Storage is held against the booking the stock will travel on, so nothing ages on the floor waiting to be noticed.",
      "Cross-dock is the same thing done in hours: the load comes off one vehicle and goes onto another, with the count checked in between. No new consignment number, no second set of paperwork, no gap in the LR trail.",
    ],
    bullets: [
      "Inward and outward counts logged against the same reference",
      "Held against a booking, so stock moves on the vehicle it was priced for",
      "Transfer between vehicles without a new consignment number",
      "Market-day timing absorbed on our side of the move",
      "Covered, lockable storage — no open-yard holding",
      "Consolidation and de-consolidation by the desk that took the booking",
    ],
    bestFor: [
      "Stock waiting on a market day",
      "Several small dispatches assembled into one vehicle",
      "One inbound load split across many consignees",
      "Buyers collecting from several suppliers in one trip",
      "Goods that arrive before their godown can receive them",
    ],
    /* No vehicles: this service is the floor, not the road. The detail page
       drops the block and closes the numbering over it. */
    vehicles: [],
    questions: [
      {
        question: "How long can you hold a consignment?",
        answer:
          "As long as the booking needs. Say at the enquiry whether the hold is a day or a month — storage is quoted with the movement, so it does not arrive later as a separate bill.",
      },
      {
        question: "Is cross-dock the same as storage?",
        answer:
          "No. Cross-dock is a transfer on the same day: one vehicle off, another on, counted in between. Storage is a hold against a booking. Most Surat dispatch uses one or the other, rarely both.",
      },
      {
        question: "Do you pack or repack?",
        answer:
          "We re-cover and re-tie a load that has come apart in transit and note it on the sheet. Repacking a consignment properly is a separate job — ask the desk rather than assuming it.",
      },
    ],
    image: null,
  },
  {
    slug: "last-mile-delivery",
    name: "Last-mile delivery",
    summary: "From the destination hub to the door, with proof of delivery returned.",
    body: [
      "A load that reaches the city but not the shop has not arrived. Last-mile runs are planned against the receiving hours on the other end: a consignee's gate, a market godown, a distributor bay or a home address, each with its own window.",
      "Every stop produces a signature or a photograph of where the goods were left, and an exception is raised at the desk the moment it happens — a refused delivery is a phone call while the vehicle is still outside, not a line on a report next week.",
    ],
    bullets: [
      "Delivery slot agreed with the consignee before the vehicle loads",
      "Smaller vehicles for lanes a truck cannot enter",
      "Signature or photograph at the door on every stop",
      "Exceptions raised at the desk during the run, not after it",
      "Runs carry the same LR reference as the linehaul",
      "Multi-drop routes built by locality, so one vehicle covers a market",
    ],
    bestFor: [
      "Shop and counter deliveries in the destination city",
      "Narrow market lanes a truck cannot turn into",
      "Multi-drop runs across one locality",
      "Home delivery for parcels and cash-on-delivery",
      "Returns collected on the same vehicle",
    ],
    vehicles: ["12 ft pickup", "Three-wheeler load carrier"],
    questions: [
      {
        question: "Do you deliver inside the walled markets?",
        answer:
          "Yes, on the small vehicles. A full-size container stops at the godown and the load goes in on a pickup or a load carrier — which is priced into the delivery, not added at the gate.",
      },
      {
        question: "What counts as proof of delivery?",
        answer:
          "The consignee's signature against the LR number. Where nobody will sign — an open stall, a locked gate — the vehicle sends a photograph of where the goods were left, and the desk calls you.",
      },
      {
        question: "Can you hold a delivery until a buyer is in town?",
        answer:
          "Hold it at the destination hub against the booking and release it when you say. That is the cross-dock service doing the waiting, and it keeps one reference across both legs.",
      },
    ],
    image: null,
  },
];

/* ——— Index page (/services) ——— */
export const servicesIndex = {
  eyebrow: "Services",
  title: "What we move out of Surat.",
  lede: "Five services, one desk. Loads leave the city on the same vehicles and the same paperwork whichever of them you book — the difference is how much of a vehicle you are paying for, and who is holding the list.",
  /** Derived from the catalogue, so it cannot disagree with it. */
  countLine: (count: number, hubCount: number): string =>
    `${count} services · ${hubCount} hubs on the map`,
  fleetTitle: "Vehicles we put on a load",
  fleetNote:
    "The fleet grid is derived from the services above: a vehicle shows here because at least one service lists it. Tell us the load and the desk picks the vehicle, not the other way round.",
  askLine: "Not sure which of these your load is?",
  askLabel: "Ask the desk",
  backLabel: "All services",
  backHref: "/services",
} as const;

/* ——— Detail page (/services/[slug]) ——— */
export const serviceDetail = {
  /** Small-caps line above the H1; the page appends the catalogue position. */
  eyebrow: "Service",
  includedTitle: "What's included",
  bestForTitle: "What it fits",
  vehiclesTitle: "Vehicles on this service",
  lanesTitle: "Lanes from Surat",
  questionsTitle: "Questions",
  /** Line above the map. The hub count comes from `hubs.ts`, never here. */
  lanesLine: (hubCount: number, origin: string): string =>
    `${hubCount} hubs, dispatched from ${origin}.`,
  lanesNote:
    "Every one of them is a place this service can be booked to; a delivery outside the map is a question for the desk, not a promise on a page.",
  asideTitle: "Rates & pickup",
  asideNote:
    "Send the load, the lane and the date. The rate is confirmed before anything is booked.",
  ctaNote: "Phone and WhatsApp appear here once the desk's numbers are published.",
  callLabel: "Call",
  emailLabel: "Email",
  previousLabel: "Previous",
  nextLabel: "Next",
  /** Prefill for the aside's WhatsApp row — the service named in the message,
     so a reply arrives already about the right load. */
  whatsappMessage: (serviceName: string): string =>
    `Hello, I'd like a rate for ${serviceName} from Surat.`,
} as const;

export function findService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

/** Manifest key for a service photo. `Service.image` points anywhere in the
   manifest; the default follows the `assets/originals/<group>/<name>` rule, so
   dropping `services/full-truckload.png` in lights up the tile and the index
   preview without a code change. */
export function serviceImageKey(service: Service): string {
  return service.image ?? `services/${service.slug}`;
}
