/* The client's own LR API (E-Transport, at dharmashreegroup.in) → the tracking
   contract this site reads.

   Used by the Cloudflare Pages Function `functions/api/lr.ts`, which calls

     {base}/LRInquiry.ashx?apiname=lrinquiry&code=BRANCHCODE&lrno=LRNO

   (`code=0` searches every branch) and answers the browser with the JSON
   `parseLrRecord` in `adapter.ts` already reads — so the UI needs no second
   reader, and the vendor's full record (freight, amounts, vehicle and phone
   numbers, internal remarks) never leaves the server.

   What is known about the vendor's reply, from the sibling Party Invoice API on
   the same server, which answers in the same envelope and record shape:

     { "statuscode": "200", "message": "success", "count": 1,
       "data": [[ { "Lrdate": "/Date(1760000000000)/", "FromBranchCode": "SRT",
                    "BranchName": …, "FromStation": …, "Station": …,
                    "ToBranchName": …, "ConsignorName": …, "ConsigneeName": …,
                    "Package": 1, "GrossWeight": 65, "Status": "…",
                    "ChallanNo": …, "VehicleNo": …, "RecieveDate": …,
                    "DeliveryDate": …, "EDDDate": …, "GodownName": …,
                    "TrackingDetail": … } ]] }

   Not found is `statuscode: "401"`, `data: []`, or a record whose `Lrdate` is
   .NET's `DateTime.MinValue` and whose names are null. Dates come as
   `/Date(ms)/`, or as `dd/MM/yyyy[ HH:mm[:ss]]` strings (India time).

   The vendor's `Status` is free text ("Stock available at Booking Location"),
   so the ladder position is read from the record's own milestones first —
   delivered, received at destination, on a challan — and the words only refine
   it. The raw words travel as `statusText`, shown beside the ladder's label.

   No path aliases in this file: the Pages Function bundles it on its own. */

/* ——— The query ——— */

export interface LrQuery {
  /** Branch code (`SRT`), or `"0"` for every branch. */
  code: string;
  /** The number part, digits only. */
  lrno: string;
  /** How the LR is shown back: `SRT-3230`, or `3230` with no branch. */
  display: string;
}

/** `SRT-3230`, `srt 3230`, `SRT/3230`, `SRT3230` or a bare `3230`. */
export function parseLrQuery(input: string): LrQuery | null {
  const value = input.trim().toUpperCase().replace(/\s+/g, "");
  const branched = /^([A-Z]{2,6})[-/]?(\d{1,10})$/.exec(value);
  if (branched !== null && branched[1] !== undefined && branched[2] !== undefined) {
    return { code: branched[1], lrno: branched[2], display: `${branched[1]}-${branched[2]}` };
  }
  if (/^\d{1,10}$/.test(value)) return { code: "0", lrno: value, display: value };
  return null;
}

export function vendorLrUrl(base: string, query: LrQuery): string {
  const params = new URLSearchParams({ apiname: "lrinquiry", code: query.code, lrno: query.lrno });
  return `${base.replace(/\/+$/, "")}/LRInquiry.ashx?${params.toString()}`;
}

/* ——— Reading the vendor's values ——— */

type Row = Record<string, unknown>;

function isRow(value: unknown): value is Row {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(row: Row, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return null;
}

function positive(row: Row, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = row[key];
    const n =
      typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

const IST_OFFSET_MS = 330 * 60 * 1000;
/** Anything before this is a .NET default (`DateTime.MinValue`), not a date. */
const EARLIEST_REAL_MS = Date.UTC(2000, 0, 1);

/** A vendor date → an ISO instant (`…+05:30`), or `null` for blank or default. */
export function readVendorInstant(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const raw = value.trim();
  let ms: number | null = null;

  const dotnet = /^\/Date\((-?\d+)(?:[+-]\d{4})?\)\/$/.exec(raw);
  if (dotnet !== null && dotnet[1] !== undefined) {
    ms = Number(dotnet[1]);
  } else {
    const indian =
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i.exec(
        raw,
      );
    if (indian !== null) {
      const [, d, m, y, hh, mm, ss, ampm] = indian;
      let hour = Number(hh ?? "0");
      if (ampm !== undefined) hour = (hour % 12) + (ampm.toUpperCase() === "PM" ? 12 : 0);
      const utc = Date.UTC(
        Number(y),
        Number(m) - 1,
        Number(d),
        hour,
        Number(mm ?? "0"),
        Number(ss ?? "0"),
      );
      const check = new Date(utc);
      if (check.getUTCDate() === Number(d) && check.getUTCMonth() === Number(m) - 1) {
        ms = utc - IST_OFFSET_MS;
      }
    } else if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(raw) ? raw : `${raw.replace(" ", "T")}+05:30`;
      const parsed = Date.parse(iso.length === 16 ? `${iso.slice(0, 10)}T00:00:00+05:30` : iso);
      ms = Number.isNaN(parsed) ? null : parsed;
    }
  }

  if (ms === null || !Number.isFinite(ms) || ms < EARLIEST_REAL_MS) return null;
  /* Written in India time so the calendar date reads the same everywhere. */
  const ist = new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 19);
  return `${ist}+05:30`;
}

/* ——— Status ——— */

export type WireStatus =
  "BOOKED" | "IN_TRANSIT" | "AT_FACILITY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "ATTENTION";

const ATTENTION_WORDS = /\b(hold|damag|short|missing|return|cancel|undeliver|refus)/i;

/** The ladder position: the record's milestones first, the words second. */
export function vendorStatus(row: Row): WireStatus {
  const words = text(row, "Status") ?? "";
  if (readVendorInstant(row["DeliveryDate"]) !== null) return "DELIVERED";
  if (ATTENTION_WORDS.test(words)) return "ATTENTION";
  if (/out\s*for\s*deliver/i.test(words)) return "OUT_FOR_DELIVERY";
  if (/\bdelivered\b/i.test(words)) return "DELIVERED";
  if (
    readVendorInstant(row["RecieveDate"]) !== null ||
    /(arriv|receiv|unload|destination|delivery\s*(location|godown|branch))/i.test(words)
  ) {
    return "AT_FACILITY";
  }
  if (
    text(row, "ChallanNo", "VehicleNo", "TruckNo") !== null ||
    /(transit|dispatch|despatch|loaded|challan|on\s*the\s*way)/i.test(words)
  ) {
    return "IN_TRANSIT";
  }
  return "BOOKED";
}

/* ——— The record ——— */

export interface WireEvent {
  at: string;
  location: string;
  status: WireStatus;
  note: string | null;
}

/** The contract `parseLrRecord` reads (see the comment at the top of adapter.ts). */
export interface WireLr {
  lrNumber: string;
  bookedOn: string;
  origin: string;
  destination: string;
  consignor: string;
  consignee: string;
  packages: number | null;
  weightKg: number | null;
  status: WireStatus;
  /** The vendor's own words for the status, shown as given. */
  statusText: string | null;
  currentLocation: string | null;
  expectedDelivery: string | null;
  deliveredOn: string | null;
  events: WireEvent[];
  details: WireDetails;
}

/** The LR slip's own sections, as printed for the consignor and consignee.
    Every field is optional: the record carries what was entered at booking. */
export type WireChargeKey =
  | "freight"
  | "pickup"
  | "stCharge"
  | "insurance"
  | "doorDelivery"
  | "loading"
  | "unloading"
  | "other";

export interface WireDetails {
  vehicleNo: string | null;
  deliveryType: string | null;
  paymentMode: string | null;
  consignorGstin: string | null;
  consignorContact: string | null;
  consigneeGstin: string | null;
  consigneeContact: string | null;
  invoiceNo: string | null;
  invoiceDate: string | null;
  invoiceValue: number | null;
  privateMark: string | null;
  contains: string | null;
  ewayBill: string | null;
  packageType: string | null;
  chargeWeightKg: number | null;
  rateType: string | null;
  charges: { key: WireChargeKey; amount: number }[];
  total: number | null;
  advance: number | null;
  balance: number | null;
  supplier: string | null;
  deliveryAddress: string | null;
  deliveryContacts: string[];
}

export type VendorReading =
  { kind: "found"; record: WireLr } | { kind: "not-found" } | { kind: "unreadable" };

function titleCase(value: string): string {
  return value.toLowerCase().replace(/\b([a-z])/g, (letter) => letter.toUpperCase());
}

/** A place name as people write it (`SURAT` → `Surat`). */
function place(row: Row, ...keys: string[]): string | null {
  const value = text(row, ...keys);
  return value === null ? null : titleCase(value);
}

function rowsOf(body: unknown): Row[] {
  if (!isRow(body)) return [];
  const data = body["data"];
  if (!Array.isArray(data)) return [];
  return data.flat().filter(isRow);
}

function isRealRow(row: Row): boolean {
  return (
    readVendorInstant(row["Lrdate"]) !== null ||
    text(row, "ConsignorName", "ConsigneeName", "FromBranchCode") !== null
  );
}

/** Movements the vendor lists in `TrackingDetail`, read leniently: any entry
    with a readable date becomes a movement; anything else is skipped. */
function trackingEvents(row: Row, fallback: WireStatus): WireEvent[] {
  const detail = row["TrackingDetail"];
  const items = Array.isArray(detail) ? detail.flat().filter(isRow) : [];
  const events: WireEvent[] = [];
  for (const item of items) {
    const at =
      readVendorInstant(item["Date"]) ??
      readVendorInstant(item["TrackDate"]) ??
      readVendorInstant(item["EntryDate"]) ??
      readVendorInstant(item["DateTime"]);
    if (at === null) continue;
    const words = text(item, "Status", "Remark", "Remarks", "Description") ?? "";
    events.push({
      at,
      location: place(item, "Station", "Location", "BranchName", "City") ?? "",
      status: words === "" ? fallback : vendorStatus({ Status: words }),
      note: words === "" ? null : words,
    });
  }
  return events;
}

/* ——— The slip's sections ———
   Field names marked "seen" are in the vendor's record (from the Party Invoice
   API); the rest are the names this software family uses for the same slip
   lines and are read if present. Confirm them against a real LR reply. */

/** A money or weight field: a number, zero included (a 0.00 charge is a fact). */
function amount(row: Row, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = row[key];
    const n =
      typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
    if (typeof value !== "boolean" && value !== null && value !== "" && Number.isFinite(n)) {
      return n;
    }
  }
  return null;
}

const CHARGE_FIELDS: readonly { key: WireChargeKey; fields: readonly string[] }[] = [
  { key: "freight", fields: ["Freight"] }, // seen
  { key: "pickup", fields: ["CollPickup", "CollectionCharge", "PickupCharge"] },
  { key: "stCharge", fields: ["StCharge", "StationaryCharge", "StatisticalCharge"] },
  { key: "insurance", fields: ["InsAmount", "InsuranceAmount"] },
  { key: "doorDelivery", fields: ["DDAmount", "DoorDeliveryCharge", "DDCharge"] },
  { key: "loading", fields: ["Loading", "LoadingCharge"] },
  { key: "unloading", fields: ["Unloading", "UnloadingCharge"] },
  { key: "other", fields: ["OtherCharge", "OtherCharges"] },
];

/** `9424092450 | 9838838676`, `9424092450, 9838838676` → each mobile once. */
function phoneList(...values: (string | null)[]): string[] {
  const found = new Set<string>();
  for (const value of values) {
    if (value === null) continue;
    for (const match of value.matchAll(/(?:\+?91[\s-]?)?([6-9]\d{9})\b/g)) {
      if (match[1] !== undefined) found.add(match[1]);
    }
  }
  return [...found];
}

/** `DOOR DELIVERY` → `Door delivery`; codes such as `GSTIN` stay as written. */
function sentenceCase(value: string | null): string | null {
  if (value === null) return null;
  if (/\d/.test(value)) return value;
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function vendorDetails(row: Row): WireDetails {
  /* The "Delivery at" block often carries the branch's numbers after the
     address ("… UTTAR PRADESH. CONTACT NO : 8090408899 | 9628180992"). */
  const deliveryRaw = text(row, "StationAddress", "DeliveryAddress", "DeliveryAt"); // seen: StationAddress
  const contactSplit = deliveryRaw === null ? -1 : deliveryRaw.search(/contact\s*(no)?\.?\s*:?/i);
  const deliveryAddress =
    deliveryRaw === null
      ? null
      : (contactSplit === -1 ? deliveryRaw : deliveryRaw.slice(0, contactSplit))
          .replace(/[\s,.|]+$/, "")
          .trim() || null;

  const charges = CHARGE_FIELDS.flatMap(({ key, fields }) => {
    const value = amount(row, ...fields);
    return value === null ? [] : [{ key, amount: value }];
  });

  return {
    vehicleNo: text(row, "VehicleNo", "TruckNo", "CrossingVehicle"), // seen
    deliveryType: sentenceCase(text(row, "DeliveryType", "BookingTerms")), // seen: BookingTerms
    paymentMode: sentenceCase(text(row, "CNType", "MOP", "PaymentMode")), // seen: CNType
    consignorGstin: text(row, "ConsignorGSTNo", "ConsignorGstNo", "ConsignorGSTIN"),
    consignorContact: text(row, "ConsignorMobile", "ConsignorMobileNo", "ConsignorContact"),
    consigneeGstin: text(row, "ConsigneeGSTNo", "ConsigneeGstNo", "ConsigneeGSTIN"),
    consigneeContact: text(row, "ConsigneeMobile", "ConsigneeMobileNo", "ConsigneeContact"),
    invoiceNo: text(row, "PartyInvoiceNo", "InvoiceNo"), // seen: PartyInvoiceNo
    invoiceDate: readVendorInstant(row["PartyInvoiceDate"] ?? row["InvoiceDate"]),
    invoiceValue: positive(row, "InvoiceValue", "PartyInvoiceValue", "InvValue"),
    privateMark: text(row, "PrivateMarkSingle", "PrivateMark"), // seen: PrivateMarkSingle
    contains: sentenceCase(text(row, "Contains")), // seen
    ewayBill: text(row, "EWayBillNo", "EwayBillNo"), // seen: EWayBillNo
    packageType: sentenceCase(text(row, "PackageType")), // seen
    chargeWeightKg: positive(row, "ChargeWeight", "ChargedWeight"),
    rateType: text(row, "RateType"),
    charges,
    total: amount(row, "Total", "TotalFreight"), // seen: Total
    advance: amount(row, "Advance", "AdvanceAmount"),
    balance: amount(row, "Balance", "BalanceAmount"),
    supplier: text(row, "SupplierName", "Supplier"),
    deliveryAddress,
    deliveryContacts: phoneList(
      contactSplit === -1 || deliveryRaw === null ? null : deliveryRaw.slice(contactSplit),
      text(row, "StationContact", "StationMobile", "DeliveryContact"),
    ),
  };
}

export function readVendorLr(body: unknown, query: LrQuery): VendorReading {
  if (!isRow(body)) return { kind: "unreadable" };
  const rows = rowsOf(body).filter(isRealRow);
  const code = text(body, "statuscode");
  if (rows.length === 0) {
    return code === null || code === "200" || code === "401" || code === "404"
      ? { kind: "not-found" }
      : { kind: "unreadable" };
  }

  /* With a branch given, the LR booked there; otherwise the first match. */
  const row =
    rows.find(
      (candidate) =>
        query.code !== "0" && text(candidate, "FromBranchCode")?.toUpperCase() === query.code,
    ) ??
    rows.find(() => query.code === "0") ??
    null;
  if (row === null) return { kind: "not-found" };

  const bookedAt = readVendorInstant(row["Lrdate"]);
  const origin = place(row, "FromStation", "BranchName");
  const destination = place(row, "Station", "ToBranchName");
  if (bookedAt === null || origin === null || destination === null) return { kind: "unreadable" };

  const status = vendorStatus(row);
  const statusText = text(row, "Status");
  const receivedAt = readVendorInstant(row["RecieveDate"]);
  const deliveredAt = readVendorInstant(row["DeliveryDate"]);
  const branch = text(row, "FromBranchCode")?.toUpperCase() ?? null;

  /* The record's own milestones, then whatever `TrackingDetail` adds. */
  const events: WireEvent[] = [
    { at: bookedAt, location: origin, status: "BOOKED", note: null },
    ...(receivedAt === null
      ? []
      : [{ at: receivedAt, location: destination, status: "AT_FACILITY" as const, note: null }]),
    ...(deliveredAt === null
      ? []
      : [{ at: deliveredAt, location: destination, status: "DELIVERED" as const, note: null }]),
    ...trackingEvents(row, status),
  ];
  events.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  const consignor = text(row, "ConsignorName") ?? "";
  const consignee = text(row, "ConsigneeName") ?? "";
  const currentLocation =
    status === "BOOKED"
      ? origin
      : status === "AT_FACILITY" || status === "OUT_FOR_DELIVERY" || status === "DELIVERED"
        ? (place(row, "GodownName") ?? destination)
        : null;

  return {
    kind: "found",
    record: {
      lrNumber: branch === null ? query.display : `${branch}-${query.lrno}`,
      bookedOn: bookedAt,
      origin,
      destination,
      consignor,
      consignee,
      packages: positive(row, "Package", "TotalPackage"),
      weightKg: positive(row, "GrossWeight", "ChargeWeight"),
      status,
      statusText,
      currentLocation,
      expectedDelivery: readVendorInstant(row["EDDDate"]),
      deliveredOn: deliveredAt,
      events,
      details: vendorDetails(row),
    },
  };
}
