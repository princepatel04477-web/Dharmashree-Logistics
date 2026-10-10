/* The four forms the site sends to the desk — what each one stores, how its
   columns are labelled in the admin panel and in the Excel export, and the
   server's own checks. One definition, read by:
     functions/api/desk.ts                  stores a submission (D1)
     functions/api/admin/submissions.ts     lists them for the admin panel
     functions/api/admin/export.ts          writes the .xlsx

   It replaces apps-script/Code.gs field for field: same required lists, same
   shape checks, same reference prefixes (DSL- / DSP- / DSM- / DST-), same column
   order — plus the truck form's `state`.

   Pure and alias-free: the Pages Function bundler reads it on its own. */

export const DESK_KINDS = ["truck", "message", "quote", "partner"] as const;
export type DeskKind = (typeof DESK_KINDS)[number];

export function isDeskKind(value: unknown): value is DeskKind {
  return DESK_KINDS.some((kind) => kind === value);
}

/** The sheet and file name for each form's export. */
export const DESK_SHEET_TITLES: Readonly<Record<DeskKind, string>> = {
  truck: "Truck attachments",
  message: "Messages",
  quote: "Quote requests",
  partner: "Delivery partners",
};

export interface DeskColumn {
  key: string;
  label: string;
}

export interface DeskForm {
  kind: DeskKind;
  /** Reference prefix: `DST-261010-4821`. */
  prefix: string;
  /** In export order, after "Received at" and "Reference". */
  columns: readonly DeskColumn[];
  required: readonly string[];
  /** A shape the client already enforces, checked again: the reason, or null. */
  check: (data: Readonly<Record<string, string>>) => string | null;
}

const MOBILE_E164 = /^\+91[6-9]\d{9}$/;

export const DESK_FORMS: Readonly<Record<DeskKind, DeskForm>> = {
  truck: {
    kind: "truck",
    prefix: "DST",
    columns: [
      { key: "ownerName", label: "Owner / business" },
      { key: "entityType", label: "Owner type" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "gstin", label: "GSTIN" },
      { key: "address", label: "Registered address" },
      { key: "operatingCity", label: "Operating city" },
      { key: "state", label: "State" },
      { key: "vehicleNumber", label: "Vehicle number" },
      { key: "makeModel", label: "Make and model" },
      { key: "yearOfMfg", label: "Year of manufacture" },
      { key: "bodyType", label: "Body type" },
      { key: "payloadTons", label: "Payload (tonnes)" },
      { key: "chassisNumber", label: "Chassis number" },
      { key: "permitValidUntil", label: "Permit valid until" },
      { key: "insuranceValidUntil", label: "Insurance valid until" },
      { key: "gps", label: "GPS fitted" },
      { key: "driverName", label: "Driver name" },
      { key: "driverPhone", label: "Driver phone" },
      { key: "driverLicence", label: "Driving licence" },
      { key: "licenceValidUntil", label: "Licence valid until" },
      { key: "policeVerification", label: "Police verification" },
      { key: "accountHolder", label: "Account holder" },
      { key: "bankName", label: "Bank" },
      { key: "accountNumber", label: "Account number" },
      { key: "ifsc", label: "IFSC" },
      { key: "documents", label: "Documents ready" },
      { key: "sourcePage", label: "Source page" },
    ],
    required: [
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
    ],
    check: (data) => {
      if (!MOBILE_E164.test(data["phone"] ?? "") || !MOBILE_E164.test(data["driverPhone"] ?? "")) {
        return "Invalid phone";
      }
      if (!/^\d{9,18}$/.test(data["accountNumber"] ?? "")) return "Invalid account";
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data["ifsc"] ?? "")) return "Invalid IFSC";
      return null;
    },
  },
  message: {
    kind: "message",
    prefix: "DSM",
    columns: [
      { key: "name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "message", label: "Message" },
      { key: "sourcePage", label: "Source page" },
    ],
    required: ["name", "phone", "message"],
    check: (data) => (MOBILE_E164.test(data["phone"] ?? "") ? null : "Invalid phone"),
  },
  quote: {
    kind: "quote",
    prefix: "DSL",
    columns: [
      { key: "name", label: "Name" },
      { key: "company", label: "Company" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "service", label: "Service" },
      { key: "from", label: "From" },
      { key: "to", label: "To" },
      { key: "loadType", label: "Load type" },
      { key: "weightKg", label: "Approx weight (kg)" },
      { key: "vehicle", label: "Vehicle" },
      { key: "pickupDate", label: "Pickup date" },
      { key: "notes", label: "Notes" },
      { key: "sourcePage", label: "Source page" },
    ],
    required: ["name", "phone", "service", "from", "to"],
    check: () => null,
  },
  partner: {
    kind: "partner",
    prefix: "DSP",
    columns: [
      { key: "name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "city", label: "City" },
      { key: "vehicle", label: "Vehicle" },
      { key: "availability", label: "Availability" },
      { key: "sourcePage", label: "Source page" },
    ],
    required: ["name", "phone", "city", "availability"],
    check: () => null,
  },
};

/** The longest value any field keeps (the message box allows less). */
export const MAX_FIELD_LENGTH = 1000;

export type DeskReading =
  | { ok: true; kind: DeskKind; data: Record<string, string> }
  /** The honeypot was filled: answer as if stored, store nothing. */
  | { ok: true; kind: DeskKind; bot: true }
  | { ok: false; error: string };

/** A posted body → the fields to store, or why it is refused. Only the form's
    own columns are kept; each is trimmed and capped. A body with no `kind` is a
    quote, as it always was. */
export function readDeskBody(body: unknown): DeskReading {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Bad request" };
  }
  const source = body as Record<string, unknown>;
  const rawKind = source["kind"] ?? "quote";
  if (!isDeskKind(rawKind)) return { ok: false, error: "Unknown form" };
  const form = DESK_FORMS[rawKind];

  const website = source["website"];
  if (typeof website === "string" && website.trim() !== "") {
    return { ok: true, kind: rawKind, bot: true };
  }

  const data: Record<string, string> = {};
  for (const { key } of form.columns) {
    const value = source[key];
    data[key] =
      typeof value === "string" || typeof value === "number"
        ? String(value).trim().slice(0, MAX_FIELD_LENGTH)
        : "";
  }
  for (const key of form.required) {
    if ((data[key] ?? "") === "") return { ok: false, error: `Missing ${key}` };
  }
  const problem = form.check(data);
  if (problem !== null) return { ok: false, error: problem };
  return { ok: true, kind: rawKind, data };
}

/** `DST-261010-4821`: the prefix, the India date, four random digits. */
export function deskReference(kind: DeskKind, now: Date, random: number): string {
  const ist = new Date(now.getTime() + 330 * 60 * 1000).toISOString();
  const day = `${ist.slice(2, 4)}${ist.slice(5, 7)}${ist.slice(8, 10)}`;
  const digits = String(1000 + Math.floor(random * 9000));
  return `${DESK_FORMS[kind].prefix}-${day}-${digits}`;
}

/** An ISO instant → `2026-10-10 22:19`, India time, as the sheet wrote it. */
export function istStamp(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Date(ms + 330 * 60 * 1000).toISOString().slice(0, 16).replace("T", " ");
}
