import type { TruckFieldCode } from "@/lib/truck";
import type { QuoteError } from "@/lib/quote";
import { company } from "./company";
import { HUBS, ORIGIN } from "./hubs";
import { quoteCta } from "./navigation";

/* `/attach-truck` — the truck attachment and vendor onboarding application. An
   owner attaches a vehicle to the network: who they are, the truck and its
   papers, its primary driver, the account settlements are paid into, and which
   document copies they have ready. Every label and sentence the form shows is
   here; the rules that pick an error live in `src/lib/truck.ts`.

   No promise of loads, rates or timelines: those are not facts in
   `company.ts`, so the page says what happens next and nothing more. */

/** Suggestions for the operating city: the network's own cities. A typed city
    outside the list is accepted. */
export const operatingCities: readonly string[] = [ORIGIN.name, ...HUBS.map((hub) => hub.name)];

export interface TruckDocument {
  readonly id: string;
  readonly label: string;
}

export const truckPage = {
  metaTitle: "Attach your truck",
  metaDescription: `Attach your truck to the ${company.name} network. Tell us about the owner, the vehicle and its papers, the primary driver and the settlement account, and the team will call to verify.`,
  eyebrow: "Truck attachment",
  title: "Attach your truck to the network.",
  lede: "Own a goods vehicle? Send the owner, vehicle, driver and settlement details in one application. The team checks them against your papers and calls you on the number you leave.",

  aside: {
    title: "What happens next",
    steps: [
      "The application reaches the desk with a reference number.",
      "The team calls the owner to go over the details.",
      "Copies of the papers you ticked are collected and checked.",
      "Once the papers are verified, the truck is attached and the driver is briefed.",
    ],
    contactLead: "Questions before you apply? Write to",
    contactEmail: company.email,
    partnersNote: "Delivering on a two-wheeler or a pickup instead?",
    partnersLabel: "Join as a delivery partner",
    partnersHref: "/partners/#join",
  },

  formLabel: "Truck attachment application",
  requiredNote: "Fields marked * are required.",

  owner: {
    index: "01",
    title: "Owner or business",
    ownerNameLabel: "Owner / business name *",
    ownerNameHelper: "As it appears on the RC or your GST registration.",
    entityTypeLabel: "Owner type *",
    entityTypePlaceholder: "Choose one",
    entityTypes: [
      "Individual owner",
      "Proprietorship",
      "Partnership firm",
      "Private limited company",
      "Fleet operator / transport company",
    ],
    phoneLabel: "Mobile number *",
    phoneHelper: "Indian mobile — the team calls this number.",
    emailLabel: "Email",
    emailHelper: "Optional.",
    gstinLabel: "GSTIN",
    gstinHelper: "Optional — for a GST-registered business.",
    addressLabel: "Registered address *",
    addressHelper: "Street, area, city, state and PIN code.",
    operatingCityLabel: "Primary operating city *",
    operatingCityHelper: "Start typing — any city in India.",
  },

  vehicle: {
    index: "02",
    title: "Vehicle and compliance",
    vehicleNumberLabel: "Registration number *",
    vehicleNumberPlaceholder: "GJ05AB1234",
    makeModelLabel: "Make and model *",
    makeModelHelper: "For example, Tata Signa 4825.T.",
    yearLabel: "Year of manufacture *",
    yearPlaceholder: "YYYY",
    bodyTypeLabel: "Body type *",
    bodyTypePlaceholder: "Choose a body type",
    bodyTypes: [
      "Open body",
      "Closed body / container",
      "Half body",
      "Flatbed / trailer",
      "Tipper",
      "Refrigerated",
      "Tanker",
      "Other",
    ],
    payloadLabel: "Payload capacity (tonnes) *",
    payloadHelper: "As registered on the RC.",
    chassisLabel: "Chassis number",
    chassisHelper: "Optional — usually 17 characters.",
    permitLabel: "Permit valid until *",
    insuranceLabel: "Insurance valid until *",
    gpsLabel: "GPS tracker fitted?",
    gpsOptions: [
      { value: "Yes", title: "Yes", description: "A working GPS unit is fitted." },
      { value: "No", title: "No", description: "No GPS unit yet." },
    ],
  },

  driver: {
    index: "03",
    title: "Primary driver",
    selfDrivenLabel: "I drive this truck myself.",
    selfDrivenNote: "The driver's name and number will be the owner's.",
    nameLabel: "Driver's full name *",
    phoneLabel: "Driver's mobile number *",
    licenceLabel: "Driving licence number *",
    licencePlaceholder: "GJ0520190012345",
    licenceExpiryLabel: "Licence valid until *",
    policeLabel: "Police verification",
    policePlaceholder: "Choose one",
    policeOptions: ["Verified", "Applied, awaiting result", "Not done yet"],
  },

  bank: {
    index: "04",
    title: "Settlement bank account",
    note: "Payments for the trips this truck runs are settled into this account. The team confirms it against a cancelled cheque before the first payment.",
    holderLabel: "Account holder name *",
    bankNameLabel: "Bank name *",
    accountLabel: "Account number *",
    accountConfirmLabel: "Re-enter account number *",
    ifscLabel: "IFSC *",
    ifscPlaceholder: "SBIN0001234",
  },

  documents: {
    index: "05",
    title: "Documents you have ready",
    note: "Tick the copies you can share. Nothing is uploaded here — the team collects them from you during verification.",
    items: [
      { id: "rc", label: "Registration certificate (RC)" },
      { id: "insurance", label: "Insurance policy" },
      { id: "permit", label: "National / state permit" },
      { id: "fitness", label: "Fitness certificate" },
      { id: "owner-id", label: "Owner ID proof (Aadhaar / PAN)" },
      { id: "licence", label: "Driver's licence" },
      { id: "cheque", label: "Cancelled cheque" },
      { id: "photos", label: "Truck photos (front and side)" },
    ] satisfies readonly TruckDocument[],
  },

  declaration: {
    index: "06",
    title: "Declaration",
    label: `I declare that the vehicle, driver and business details above are true and complete, and I agree to attach this vehicle to the ${company.name} network under its operating guidelines — roadworthy, with a disciplined driver and secure transit — and to be contacted about this application.`,
  },

  submitLabel: "Submit application",
  sendingLabel: "Sending",

  errors: {
    Required: "This one is needed before the application can be sent.",
    Phone: "An Indian mobile number: 10 digits, or +91 and 10 digits.",
    Email: "That doesn't look like an email address.",
    Gstin: "A GSTIN is 15 characters, like 24ABCDE1234F1Z5.",
    VehicleNumber: "A registration number like GJ05AB1234, or 22BH1234AA.",
    Year: "A four-digit year, not later than this year.",
    Payload: "Tonnes as a number, for example 9 or 25.5.",
    Chassis: "Letters and digits only, up to 17 characters.",
    Date: "Choose a date from the calendar.",
    Expired: "This date has passed. The papers need to be valid to attach the truck.",
    Licence: "A licence number like GJ0520190012345 — the state code, then the digits.",
    Account: "An account number is 9 to 18 digits.",
    AccountMismatch: "The two account numbers don't match.",
    Ifsc: "An IFSC is 11 characters, like SBIN0001234.",
    Declaration: "Please confirm the declaration before sending.",
  } satisfies Record<TruckFieldCode, string>,

  toastTitle: "Application sent",
  toastBody: "Thank you. The team will call the owner on the number you left.",
  failureTitle: "Not sent",
  failure: "That didn't go through. Your answers are still here — try again.",
  reasons: {
    Unconfigured: "The form is not connected to the desk's sheet yet.",
    Network: "The application could not leave this device.",
    Timeout: "The desk's sheet did not answer in time.",
    Rejected: "The desk's sheet refused the application.",
    Server: "The desk's sheet answered with something unexpected.",
  } satisfies Record<QuoteError, string>,

  successTitle: "Application received.",
  successBody:
    "Keep this reference handy. The team will call the owner to verify the details and collect the papers.",
  successReference: "Reference",
  againLabel: "Attach another truck",
  quoteLabel: quoteCta.label,
  quoteHref: quoteCta.href,
} as const;
