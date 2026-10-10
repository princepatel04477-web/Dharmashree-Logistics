/* Unit check for the direct LR lookup: the client's E-Transport reply →
   `vendor-lr.ts` → JSON → `parseLrRecord`, the same chain the Pages Function
   and the browser run. Run with `npm run verify:lr`. */

import { parseLrRecord } from "../src/lib/backend/adapter";
import {
  parseLrQuery,
  readVendorInstant,
  readVendorLr,
  vendorLrUrl,
  vendorStatus,
} from "../src/lib/backend/vendor-lr";

function fail(message: string): never {
  console.error(`verify:lr FAILED — ${message}`);
  process.exit(1);
}

function check(condition: boolean, message: string): void {
  if (!condition) fail(message);
}

/* ——— LR numbers ——— */
for (const input of ["SRT-3230", "srt - 3230", "SRT/3230", "SRT3230", "SRT - 3230"]) {
  const parsed = parseLrQuery(input);
  check(
    parsed?.code === "SRT" && parsed.lrno === "3230" && parsed.display === "SRT - 3230",
    `"${input}" → ${JSON.stringify(parsed)}`,
  );
}
for (const input of ["3230", "SRT-", "12-AB", ""]) {
  check(parseLrQuery(input) === null, `"${input}" accepted, but it is not a whole LR number`);
}
const query = parseLrQuery("SRT-3230");
if (query === null) fail("SRT-3230 not parsed");
check(
  vendorLrUrl("https://dharmashreegroup.in/api/", query) ===
    "https://dharmashreegroup.in/api/LRInquiry.ashx?apiname=lrinquiry&code=SRT&lrno=3230",
  "vendor URL",
);

/* ——— Dates ——— */
check(readVendorInstant("/Date(-62135596800000)/") === null, ".NET MinValue is not a date");
check(
  readVendorInstant(`/Date(${String(Date.UTC(2026, 9, 9, 5, 30))})/`) ===
    "2026-10-09T11:00:00+05:30",
  "/Date(ms)/ to IST",
);
check(readVendorInstant("09/10/2026") === "2026-10-09T00:00:00+05:30", "dd/MM/yyyy");
check(readVendorInstant("09/10/2026 02:15 PM") === "2026-10-09T14:15:00+05:30", "12-hour time");
check(readVendorInstant("31/02/2026") === null, "impossible date accepted");
check(readVendorInstant(null) === null && readVendorInstant("") === null, "blank date");

/* ——— Status: milestones first, words second ——— */
check(vendorStatus({ Status: "Stock available at Booking Location" }) === "BOOKED", "booked");
check(vendorStatus({ Status: "x", ChallanNo: "CH-1" }) === "IN_TRANSIT", "on a challan");
check(vendorStatus({ RecieveDate: "10/10/2026" }) === "AT_FACILITY", "received");
check(vendorStatus({ Status: "Out for delivery" }) === "OUT_FOR_DELIVERY", "out for delivery");
check(vendorStatus({ DeliveryDate: "11/10/2026", Status: "x" }) === "DELIVERED", "delivered");
check(vendorStatus({ Status: "Goods on hold" }) === "ATTENTION", "attention");

/* ——— Not found: the three shapes the vendor uses ——— */
for (const body of [
  { statuscode: "401", message: "error", data: [], count: 0 },
  {
    statuscode: "200",
    message: "success",
    count: 0,
    data: [[{ Lrdate: "/Date(-62135596800000)/", Status: "Stock available at Booking Location" }]],
  },
  { statuscode: "200", data: [] },
]) {
  check(readVendorLr(body, query).kind === "not-found", `not found: ${JSON.stringify(body)}`);
}
check(readVendorLr("<html>", query).kind === "unreadable", "HTML is unreadable");

/* ——— A full record, through JSON and the adapter ——— */
const booked = `/Date(${String(Date.UTC(2026, 9, 9, 5, 30))})/`;
const reading = readVendorLr(
  {
    statuscode: "200",
    message: "success",
    count: 2,
    data: [
      [
        { Lrdate: booked, FromBranchCode: "IND", FromStation: "DELHI", Station: "PATNA" },
        {
          Lrdate: booked,
          FromBranchCode: "SRT",
          FromStation: "SURAT",
          Station: "LUCKNOW",
          ConsignorName: "SAMPLE TEXTILE",
          ConsignorGSTNo: "24ABCDE1234F1Z5",
          ConsigneeName: "SAMPLE TRADERS",
          Package: 1,
          PackageType: "PARCEL",
          GrossWeight: 65,
          ChargeWeight: 65,
          Status: "Dispatched",
          VehicleNo: "GJ05AB1234",
          BookingTerms: "DOOR DELIVERY",
          CNType: "TO PAY",
          PartyInvoiceNo: "11741",
          PartyInvoiceDate: "07/10/2026",
          InvoiceValue: "92789",
          EWayBillNo: "682197133510",
          Freight: 480,
          StCharge: 20,
          Loading: 20,
          Unloading: 0,
          Total: 520,
          Freightx: "ignored",
          StationAddress: "AISHBAGH, LUCKNOW. CONTACT NO : 8090408899 | 9628180992",
        },
      ],
    ],
  },
  query,
);
if (reading.kind !== "found") fail(`full record → ${reading.kind}`);
const wire = reading.record;
check(wire.lrNumber === "SRT - 3230", "the SRT row is chosen over the IND one, shown as printed");
check(wire.origin === "Surat" && wire.destination === "Lucknow", "places in title case");
check(wire.status === "IN_TRANSIT" && wire.statusText === "Dispatched", "status and words");
check(wire.details.deliveryAddress === "AISHBAGH, LUCKNOW", "address without its numbers");
check(
  wire.details.deliveryContacts.join(",") === "8090408899,9628180992",
  "numbers out of the address",
);
check(wire.details.charges.length === 4, "freight, st. charge, loading, unloading");
check(!JSON.stringify(wire).includes("Freightx"), "unknown vendor fields are not passed on");

const record = parseLrRecord(JSON.parse(JSON.stringify(wire)) as unknown, "SRT - 3230");
if (record === null) fail("the adapter refused the function's reply");
check(record.bookedOn === "2026-10-09", "booked date");
check(record.details.invoiceDate === "2026-10-07", "invoice date");
check(record.details.invoiceValue === 92789, "invoice value");
check(record.details.deliveryType === "Door delivery", "delivery terms");
check(record.details.paymentMode === "To pay", "payment mode");
check(record.details.total === 520 && record.packages === 1, "totals and packages");
check(record.events.length === 1 && record.events[0]?.status === "booked", "history");

console.log(
  "verify:lr OK — whole LR numbers only, vendor dates, status rules, not-found shapes, a full record through the adapter",
);
