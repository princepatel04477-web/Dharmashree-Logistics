import { quoteCta } from "./navigation";
import type { Partner } from "./types";

/* `/partners` (Prompt 13). The directory is a fact list from the company
   profile — each partner's name, address and phone numbers exactly as the
   profile prints them (E.164 here, grouped `+91 XXXXX XXXXX` on screen). A
   partner whose city is a network hub names it in `hubId`; one whose city is
   not (Hardoi) carries `null`, and the map pins it from `latLng`, which is
   geography rather than a claim. Sandila's profile entry carries no phone, so
   its list is empty and the row shows no call link. */

export const partners: readonly Partner[] = [
  {
    id: "lucknow-krc",
    name: "KRC Transport",
    city: "Lucknow",
    addressLines: ["Aishbagh, Malviya Nagar Tiraha", "Gupta Market, Lucknow", "Uttar Pradesh"],
    phones: ["+918090408899", "+919628180992", "+919305182357", "+919424092450"],
    hubId: "lucknow",
    latLng: [26.8467, 80.9462],
  },
  {
    id: "kanpur-roshan",
    name: "Roshan Freight Carrier",
    city: "Kanpur",
    addressLines: ["Transport Nagar, Cooperganj", "Kanpur, Uttar Pradesh – 208023"],
    phones: ["+919336113507", "+919424092450"],
    hubId: "kanpur",
    latLng: [26.4499, 80.3319],
  },
  {
    id: "sandila-verma",
    name: "Verma Transport",
    city: "Sandila",
    addressLines: ["Sandila", "Uttar Pradesh"],
    phones: [],
    hubId: "sandila",
    latLng: [27.0667, 80.5],
  },
  {
    id: "hardoi-dwivedi",
    name: "Dwivedi Transport Corporation (Regd)",
    city: "Hardoi",
    addressLines: ["Near FCI, Lucknow Road", "Hardoi, Uttar Pradesh"],
    phones: ["+919335900903", "+917518266307", "+919424092450"],
    hubId: null,
    latLng: [27.3964, 80.1316],
  },
  {
    id: "raebareli-raunak",
    name: "Raunak Goods Carriers",
    city: "Raebareli",
    addressLines: ["Fish Market, Opposite Station Road", "Raebareli, Uttar Pradesh"],
    phones: ["+919336778571", "+918090408899", "+919424092450", "+919628180992"],
    hubId: "rai-barelly",
    latLng: [26.2124, 81.2325],
  },
];

export const partnersPage = {
  metaTitle: "Delivery partners",
  metaDescription:
    "Join the DharmaShree Logistics delivery partner network: flexible work, regular assignments and a supportive onboarding process. Meet the transport partners we work with across Uttar Pradesh.",
  eyebrow: "Delivery partners",
  title: "Give your hard work a new direction.",
  lede: "Join the delivery partner network and become part of a growing logistics community. Flexible earning opportunities for people who want to use their time, commitment and delivery experience to support businesses and customers.",
  intro:
    "Whether you are looking for a regular delivery opportunity or flexible work that fits around your schedule, becoming a delivery partner can help you build a dependable source of income while contributing to reliable movement across your city.",
  joinLabel: "Join as a partner",
  joinHref: "#join",

  benefits: {
    index: "01",
    title: "Why partner with us",
    items: [
      {
        title: "Flexible work opportunities",
        body: "Every delivery partner has different availability and personal commitments. Depending on operational requirements and service availability, you can take delivery assignments that suit your preferred working time and location.",
      },
      {
        title: "Regular delivery assignments",
        body: "Through the growing logistics network, eligible partners are connected with regular assignments based on local demand — documents, parcels, e-commerce orders, business shipments and local deliveries.",
      },
      {
        title: "Supportive onboarding",
        body: "Eligible partners are guided through the requirements, documentation and basic operating procedures, with clear guidance at every important stage.",
      },
      {
        title: "New opportunities for growth",
        body: "As the network expands, new opportunities may become available for committed partners. Consistent performance, reliability and customer-focused service build a stronger working relationship over time.",
      },
    ],
  },

  onboarding: {
    index: "02",
    title: "How joining works",
    note: "Starting a new delivery partnership should be simple and clear. These are the stages the onboarding process walks through.",
    label: "Onboarding steps",
    steps: [
      {
        title: "Apply",
        body: "Tell us who you are, where you work and when you are available, using the form below.",
      },
      {
        title: "Requirements",
        body: "The team explains what is required of an eligible partner.",
      },
      {
        title: "Documentation",
        body: "You are told which documents are needed, and guided through them.",
      },
      {
        title: "Operating procedures",
        body: "You receive the basic operating procedures and the information needed to begin handling assignments responsibly and professionally.",
      },
    ],
  },

  network: {
    index: "03",
    title: "Our delivery partners",
    body: "Dharmashree Logistics works with trusted local transport partners to provide reliable service across Uttar Pradesh. The partner network helps coordinate pickup, delivery and freight movement with stronger local support.",
    mapLabel: "Map of partner cities in Uttar Pradesh",
    listLabel: "Transport partners",
    selectLabel: "Show partner",
    callLabel: "Call",
    noPhone: "No phone number is listed for this partner yet.",
    addressLabel: "Address",
    closeLabel: "Back to all partners",
  },

  join: {
    index: "04",
    title: "Move forward with us",
    body: "We value the people who make every delivery possible. Delivery partners connect businesses with their customers and keep local commerce moving. Tell us about yourself and the team will get in touch.",
    nameLabel: "Your name",
    phoneLabel: "Mobile number",
    phoneHelper: "Indian mobile — the team calls this number.",
    cityLabel: "Your city",
    cityPlaceholder: "Choose a city",
    cityOther: "Another city",
    vehicleLabel: "Vehicle you would use",
    vehiclePlaceholder: "Choose a vehicle",
    vehicles: ["Two-wheeler", "Three-wheeler", "Pickup", "Truck", "Other"],
    availabilityLabel: "How would you like to work?",
    availability: [
      {
        value: "Regular assignments",
        title: "Regular assignments",
        description: "A regular delivery opportunity.",
      },
      {
        value: "Flexible hours",
        title: "Flexible work",
        description: "Work that fits around your schedule.",
      },
    ],
    consentLabel: "I agree to be contacted about becoming a delivery partner.",
    submitLabel: "Apply to join",
    sendingLabel: "Sending",
    errors: {
      Required: "This one is needed before the team can reach you.",
      Phone: "An Indian mobile number: 10 digits, or +91 and 10 digits.",
      Consent: "We need your agreement before the application can be sent.",
    },
    toastTitle: "Application sent",
    toastBody: "Thank you. The team will get in touch on the number you left.",
    failureTitle: "Not sent",
    failure: "That didn't go through. Try again, or use the quote desk's contact details.",
    reasons: {
      Unconfigured: "The form is not connected to the desk's sheet yet.",
      Network: "The application could not leave this device.",
      Timeout: "The desk's sheet did not answer in time.",
      Rejected: "The desk's sheet refused the application.",
      Server: "The desk's sheet answered with something unexpected.",
    },
    successTitle: "Application received.",
    successReference: "Reference",
    againLabel: "Send another application",
    truckNote: "Own a goods vehicle? Attach it to the network instead.",
    truckLabel: "Attach your truck",
    truckHref: "/attach-truck",
    quoteNote: "Looking to send freight instead?",
    quoteLabel: quoteCta.label,
    quoteHref: quoteCta.href,
  },
} as const;
