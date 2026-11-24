/* Sample bookings for demonstrating the tracking flow end to end (a prototype
   hand-over), switched on only by `NEXT_PUBLIC_TRACK_DEMO=1` at build time and
   only in "direct" mode.

   The numbers use the branch code `DEMO`, which no real branch has, so a sample
   can never be mistaken for — or shadow — a customer's LR. They run through the
   same reader and the same mobile rule as a real booking (`readVendorLr`,
   `mobileMatchesBooking`), so what the demonstration shows is what a verified
   customer would get. Every sample result is labelled as such on screen
   (`isDemoLr`). Unset the variable and this module is unreachable: the browser
   goes to `/api/lr` for every number.

   The names, GST numbers, invoice and phone numbers below are invented. */

import { parseLrRecord } from "./adapter";
import type { BackendResult, LrRecord } from "./types";
import { mobileMatchesBooking, parseLrQuery, readVendorLr } from "./vendor-lr";

/** The branch code that marks a sample booking. */
export const DEMO_BRANCH = "DEMO";

/** What the demonstration hint offers to fill in. */
export const DEMO_SAMPLE = { lr: "DEMO - 1001", mobile: "98765 43210" } as const;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const IST_OFFSET_MS = 5.5 * HOUR_MS;

/** `/Date(ms)/`, as the vendor writes a date: `days` ago (negative: ahead), at
    an India wall-clock time. */
function vendorDate(days: number, hour: number, minute: number): string {
  const shifted = new Date(Date.now() - days * DAY_MS + IST_OFFSET_MS);
  const ms =
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate(), hour, minute) -
    IST_OFFSET_MS;
  return `/Date(${String(ms)})/`;
}

/** The vendor's record for a sample number, or null. Same field names the real
    API returns, so nothing here is special-cased downstream. */
function sampleRow(lrno: string): Record<string, unknown> | null {
  if (lrno === "1001") {
    return {
      Lrdate: vendorDate(2, 11, 0),
      FromBranchCode: DEMO_BRANCH,
      FromStation: "SURAT",
      Station: "LUCKNOW",
      ConsignorName: "SAMPLE TEXTILE MILLS",
      ConsignorGSTNo: "24ABCDE1234F1Z5",
      ConsigneeName: "SAMPLE TRADERS",
      ConsigneeGSTNo: "09ABCDE1234F1Z5",
      ConsigneeMobile: "9876543210",
      Package: 12,
      PackageType: "BALES",
      GrossWeight: 640,
      ChargeWeight: 640,
      Status: "Dispatched from Surat",
      ChallanNo: "CH-118",
      VehicleNo: "GJ05AB1234",
      BookingTerms: "DOOR DELIVERY",
      CNType: "TO PAY",
      PartyInvoiceNo: "11741",
      PartyInvoiceDate: "07/10/2026",
      InvoiceValue: 92789,
      PrivateMarkSingle: "837*12",
      Contains: "FABRIC",
      EWayBillNo: "682197133510",
      RateType: "PER PKG",
      Freight: 4800,
      StCharge: 120,
      Loading: 240,
      Total: 5160,
      Advance: 0,
      Balance: 5160,
      SupplierName: "SAMPLE DESIGNER",
      StationAddress:
        "MALVIYA NAGAR TIRAHA, LUCKNOW, UTTAR PRADESH. CONTACT NO : 9876500001 | 9876500002",
      EDDDate: vendorDate(-2, 18, 0),
    };
  }
  if (lrno === "1002") {
    return {
      Lrdate: vendorDate(7, 10, 30),
      FromBranchCode: DEMO_BRANCH,
      FromStation: "SURAT",
      Station: "KANPUR",
      ConsignorName: "SAMPLE FABRICS",
      ConsignorMobile: "9812345670",
      ConsigneeName: "SAMPLE STORES",
      Package: 4,
      GrossWeight: 210,
      Status: "Delivered",
      RecieveDate: vendorDate(3, 9, 15),
      DeliveryDate: vendorDate(2, 15, 40),
      CNType: "PAID",
      Total: 0,
    };
  }
  return null;
}

/** True for a sample booking's LR number (`DEMO - 1001`). */
export function isDemoLr(lr: string): boolean {
  return parseLrQuery(lr)?.code === DEMO_BRANCH;
}

/** The direct lookup, answered locally for sample numbers. A wrong mobile, an
    unknown sample and a sample with no mobile on file all answer `NotVerified`,
    exactly as the server does for a real booking. */
export async function demoLookupLr(lr: string, mobile: string): Promise<BackendResult<LrRecord>> {
  /* A short wait, so the "Looking up…" state is seen as it would be live. */
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 600);
  });

  const query = parseLrQuery(lr);
  if (query === null) return { ok: false, error: "NotFound" };

  const row = sampleRow(query.lrno);
  const reading = readVendorLr(
    row === null
      ? { statuscode: "401", message: "error", data: [], count: 0 }
      : { statuscode: "200", message: "success", data: [[row]], count: 1 },
    query,
  );
  if (reading.kind === "unreadable") return { ok: false, error: "BadResponse" };
  if (reading.kind === "not-found") return { ok: false, error: "NotVerified" };
  if (!mobileMatchesBooking(reading.record.details, mobile)) {
    return { ok: false, error: "NotVerified" };
  }

  /* Through JSON and the adapter, exactly as the browser would receive it. */
  const record = parseLrRecord(JSON.parse(JSON.stringify(reading.record)) as unknown, lr);
  return record === null ? { ok: false, error: "BadResponse" } : { ok: true, data: record };
}
