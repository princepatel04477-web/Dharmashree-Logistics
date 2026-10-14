/* The truck attachment application (`/attach-truck`): an owner attaching a
   vehicle to the network, with its papers, its primary driver and the bank
   account settlements are paid into. It travels the same road as the quote form
   and the partner application — `postToDesk` in `./quote`, the site's own
   /api/desk (functions/api/desk.ts) — and is stored as a `truck` row the admin
   panel lists and exports.

   The field rules are short and typed; every sentence the UI shows lives in
   `src/content/truck.ts`, keyed by the code returned here. */

import { toE164 } from "./message";
import { postToDesk, type QuoteResult } from "./quote";
import { isEmail, isISODate, isIndianMobile } from "./validate";

export interface TruckPayload {
  kind: "truck";
  /* ——— 01 · Owner ——— */
  ownerName: string;
  entityType: string;
  /** E.164 once it leaves the form (`+91XXXXXXXXXX`). */
  phone: string;
  /** Optional. */
  email: string;
  /** Optional: GSTIN for a registered business, blank for an individual owner. */
  gstin: string;
  address: string;
  operatingCity: string;
  /** One of `INDIAN_STATES`; filled from the operating city when it is known. */
  state: string;
  /* ——— 02 · Vehicle ——— */
  vehicleNumber: string;
  makeModel: string;
  yearOfMfg: string;
  bodyType: string;
  payloadTons: string;
  /** Optional. */
  chassisNumber: string;
  permitValidUntil: string;
  insuranceValidUntil: string;
  /** Optional: "Yes" / "No" / "". */
  gps: string;
  /* ——— 03 · Primary driver ——— */
  driverName: string;
  /** E.164 once it leaves the form. */
  driverPhone: string;
  driverLicence: string;
  licenceValidUntil: string;
  /** Optional. */
  policeVerification: string;
  /* ——— 04 · Settlement account ——— */
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  /* ——— 05 · Documents ready ——— */
  /** The ticked document names, joined with ", ". */
  documents: string;
  sourcePage: string;
  /** Honeypot — never filled by a person. */
  website: string;
}

export const EMPTY_TRUCK: TruckPayload = {
  kind: "truck",
  ownerName: "",
  entityType: "",
  phone: "",
  email: "",
  gstin: "",
  address: "",
  operatingCity: "",
  state: "",
  vehicleNumber: "",
  makeModel: "",
  yearOfMfg: "",
  bodyType: "",
  payloadTons: "",
  chassisNumber: "",
  permitValidUntil: "",
  insuranceValidUntil: "",
  gps: "",
  driverName: "",
  driverPhone: "",
  driverLicence: "",
  licenceValidUntil: "",
  policeVerification: "",
  accountHolder: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
  documents: "",
  sourcePage: "",
  website: "",
};

/** Fields the visitor fills in, plus the two that never leave the form: the
    repeated account number and the declaration. */
export type TruckFieldName =
  | Exclude<keyof TruckPayload, "kind" | "documents" | "sourcePage" | "website">
  | "accountConfirm"
  | "declaration";

export type TruckFieldCode =
  | "Required"
  | "Phone"
  | "Email"
  | "Gstin"
  | "VehicleNumber"
  | "Year"
  | "Payload"
  | "Chassis"
  | "Date"
  | "Expired"
  | "Licence"
  | "Account"
  | "AccountMismatch"
  | "Ifsc"
  | "Declaration";

export type TruckFieldErrors = Partial<Record<TruckFieldName, TruckFieldCode>>;

/** In form order, which is also the order the visitor meets them. */
export const TRUCK_FIELD_ORDER: readonly TruckFieldName[] = [
  "ownerName",
  "entityType",
  "phone",
  "email",
  "operatingCity",
  "state",
  "gstin",
  "address",
  "vehicleNumber",
  "makeModel",
  "yearOfMfg",
  "bodyType",
  "payloadTons",
  "chassisNumber",
  "permitValidUntil",
  "insuranceValidUntil",
  "gps",
  "driverName",
  "driverPhone",
  "driverLicence",
  "licenceValidUntil",
  "policeVerification",
  "accountHolder",
  "bankName",
  "accountNumber",
  "accountConfirm",
  "ifsc",
  "declaration",
];

/** Mirrors the truck form's `required` list in `src/lib/desk/forms.ts`. */
export const REQUIRED_TRUCK_FIELDS: readonly (keyof TruckPayload)[] = [
  "ownerName",
  "entityType",
  "phone",
  "address",
  "operatingCity",
  "state",
  "vehicleNumber",
  "makeModel",
  "yearOfMfg",
  "bodyType",
  "payloadTons",
  "permitValidUntil",
  "insuranceValidUntil",
  "driverName",
  "driverPhone",
  "driverLicence",
  "licenceValidUntil",
  "accountHolder",
  "bankName",
  "accountNumber",
  "ifsc",
];

/** The oldest model year the form takes. */
export const OLDEST_MODEL_YEAR = 1990;
/** The largest payload, in tonnes, a goods vehicle on Indian roads carries. */
export const MAX_PAYLOAD_TONS = 60;

/* ——— Normalisers: what the sheet receives ——— */

/** Upper case, no spaces, hyphens, dots or slashes: `gj 05 ab-1234` → `GJ05AB1234`. */
export function compactCode(value: string): string {
  return value.replace(/[\s\-./]/g, "").toUpperCase();
}

export function accountDigits(value: string): string {
  return value.replace(/[\s-]/g, "");
}

/* ——— Format rules ——— */

/** State series (`GJ05AB1234`, `UP32T1234`) or Bharat series (`22BH1234AA`). */
export function isVehicleNumber(value: string): boolean {
  const code = compactCode(value);
  return /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}$/.test(code) || /^\d{2}BH\d{4}[A-Z]{1,2}$/.test(code);
}

/** 15 characters: state code, PAN, entity number, `Z`, check character. */
export function isGstin(value: string): boolean {
  return /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(compactCode(value));
}

/** IFSC: four letters, a zero, six letters or digits. */
export function isIfsc(value: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(compactCode(value));
}

/** Indian bank account numbers run from 9 to 18 digits. */
export function isAccountNumber(value: string): boolean {
  return /^\d{9,18}$/.test(accountDigits(value));
}

/** Driving licences vary by state and era, so the rule is the common shape: a
    state code, then 11 to 14 more letters and digits. */
export function isLicenceNumber(value: string): boolean {
  return /^[A-Z]{2}[0-9A-Z]{11,14}$/.test(compactCode(value));
}

/** Chassis (VIN) numbers on Indian vehicles are 17 characters; older ones are
    shorter, so anything from 6 to 17 letters and digits is taken. */
export function isChassisNumber(value: string): boolean {
  return /^[A-Z0-9]{6,17}$/.test(compactCode(value));
}

export function isModelYear(value: string, today: string): boolean {
  const trimmed = value.trim();
  if (!/^\d{4}$/.test(trimmed)) return false;
  const year = Number(trimmed);
  const thisYear = Number(today.slice(0, 4));
  return year >= OLDEST_MODEL_YEAR && year <= thisYear;
}

export function isPayloadTons(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) return false;
  const tons = Number(trimmed);
  return tons > 0 && tons <= MAX_PAYLOAD_TONS;
}

/* ——— The rules ——— */

function checkValidUntil(value: string, today: string): TruckFieldCode | null {
  if (value.trim() === "") return "Required";
  if (!isISODate(value)) return "Date";
  /* Before hydration `today` is "" and the past-date rule waits for it. */
  if (today !== "" && value < today) return "Expired";
  return null;
}

export interface TruckFormExtras {
  accountConfirm: string;
  declaration: boolean;
  /** The owner drives the truck: the driver's name and number are the owner's. */
  selfDriven: boolean;
}

/** The payload as it will be sent: the driver filled from the owner when the
    owner drives, everything else as typed. */
export function resolveDriver(values: Readonly<TruckPayload>, selfDriven: boolean): TruckPayload {
  return selfDriven
    ? { ...values, driverName: values.ownerName, driverPhone: values.phone }
    : { ...values };
}

export function validateTruck(
  input: Readonly<TruckPayload>,
  extras: Readonly<TruckFormExtras>,
  today: string,
): TruckFieldErrors {
  const values = resolveDriver(input, extras.selfDriven);
  const errors: TruckFieldErrors = {};
  const required = (field: keyof TruckPayload & TruckFieldName): boolean => {
    if (values[field].trim() !== "") return true;
    errors[field] = "Required";
    return false;
  };

  /* Owner */
  required("ownerName");
  required("entityType");
  if (required("phone") && !isIndianMobile(values.phone)) errors.phone = "Phone";
  if (values.email.trim() !== "" && !isEmail(values.email.trim())) errors.email = "Email";
  if (values.gstin.trim() !== "" && !isGstin(values.gstin)) errors.gstin = "Gstin";
  required("address");
  required("operatingCity");
  required("state");

  /* Vehicle */
  if (required("vehicleNumber") && !isVehicleNumber(values.vehicleNumber)) {
    errors.vehicleNumber = "VehicleNumber";
  }
  required("makeModel");
  if (required("yearOfMfg") && today !== "" && !isModelYear(values.yearOfMfg, today)) {
    errors.yearOfMfg = "Year";
  }
  required("bodyType");
  if (required("payloadTons") && !isPayloadTons(values.payloadTons)) {
    errors.payloadTons = "Payload";
  }
  if (values.chassisNumber.trim() !== "" && !isChassisNumber(values.chassisNumber)) {
    errors.chassisNumber = "Chassis";
  }
  const permit = checkValidUntil(values.permitValidUntil, today);
  if (permit !== null) errors.permitValidUntil = permit;
  const insurance = checkValidUntil(values.insuranceValidUntil, today);
  if (insurance !== null) errors.insuranceValidUntil = insurance;

  /* Driver. When the owner drives, the name and number are the owner's and were
     checked above; their own fields are not on screen. */
  if (!extras.selfDriven) {
    required("driverName");
    if (required("driverPhone") && !isIndianMobile(values.driverPhone)) {
      errors.driverPhone = "Phone";
    }
  }
  if (required("driverLicence") && !isLicenceNumber(values.driverLicence)) {
    errors.driverLicence = "Licence";
  }
  const licence = checkValidUntil(values.licenceValidUntil, today);
  if (licence !== null) errors.licenceValidUntil = licence;

  /* Settlement account */
  required("accountHolder");
  required("bankName");
  if (required("accountNumber")) {
    if (!isAccountNumber(values.accountNumber)) errors.accountNumber = "Account";
    else if (accountDigits(extras.accountConfirm) !== accountDigits(values.accountNumber)) {
      errors.accountConfirm = "AccountMismatch";
    }
  }
  if (required("ifsc") && !isIfsc(values.ifsc)) errors.ifsc = "Ifsc";

  if (!extras.declaration) errors.declaration = "Declaration";
  return errors;
}

export function firstInvalidTruckField(errors: TruckFieldErrors): TruckFieldName | null {
  for (const field of TRUCK_FIELD_ORDER) {
    if (errors[field] !== undefined) return field;
  }
  return null;
}

/** What reaches the sheet: codes compacted and upper-cased, phones in E.164,
    the account number as bare digits, free text trimmed. */
export function normalizeTruck(values: Readonly<TruckPayload>): TruckPayload {
  return {
    kind: "truck",
    ownerName: values.ownerName.trim(),
    entityType: values.entityType,
    email: values.email.trim(),
    address: values.address.trim(),
    operatingCity: values.operatingCity.trim(),
    state: values.state,
    makeModel: values.makeModel.trim(),
    yearOfMfg: values.yearOfMfg.trim(),
    bodyType: values.bodyType,
    payloadTons: values.payloadTons.trim(),
    permitValidUntil: values.permitValidUntil,
    insuranceValidUntil: values.insuranceValidUntil,
    gps: values.gps,
    driverName: values.driverName.trim(),
    licenceValidUntil: values.licenceValidUntil,
    policeVerification: values.policeVerification,
    accountHolder: values.accountHolder.trim(),
    bankName: values.bankName.trim(),
    documents: values.documents,
    sourcePage: values.sourcePage,
    website: values.website,
    phone: toE164(values.phone),
    driverPhone: toE164(values.driverPhone),
    gstin: compactCode(values.gstin),
    vehicleNumber: compactCode(values.vehicleNumber),
    chassisNumber: compactCode(values.chassisNumber),
    driverLicence: compactCode(values.driverLicence),
    accountNumber: accountDigits(values.accountNumber),
    ifsc: compactCode(values.ifsc),
  };
}

export function submitTruck(payload: TruckPayload): Promise<QuoteResult> {
  return postToDesk({ ...normalizeTruck(payload) });
}
