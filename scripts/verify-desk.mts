/* Unit check for the desk: what /api/desk accepts and refuses, references,
   the truck form's city → state, and the Excel writer (the file is written to
   the path in argv[2], when given, for opening in a spreadsheet reader).
   Run with `npm run verify:desk`. */

import { writeFileSync } from "node:fs";
import { deskReference, istStamp, readDeskBody } from "../src/lib/desk/forms";
import { buildXlsx } from "../src/lib/desk/xlsx";
import { stateForCity } from "../src/lib/places";

function fail(message: string): never {
  console.error(`verify:desk FAILED — ${message}`);
  process.exit(1);
}

function check(condition: boolean, message: string): void {
  if (!condition) fail(message);
}

/* ——— Bodies ——— */
const truck = {
  kind: "truck",
  ownerName: "Sample Owner",
  entityType: "Individual owner",
  phone: "+919876543210",
  email: "",
  gstin: "",
  address: "Ring Road, Surat",
  operatingCity: "Surat",
  state: "Gujarat",
  vehicleNumber: "GJ05AB1234",
  makeModel: "Tata 1109",
  yearOfMfg: "2019",
  bodyType: "Open body",
  payloadTons: "9",
  chassisNumber: "",
  permitValidUntil: "2027-01-01",
  insuranceValidUntil: "2027-01-01",
  gps: "Yes",
  driverName: "Sample Driver",
  driverPhone: "+919812345670",
  driverLicence: "GJ0520190012345",
  licenceValidUntil: "2030-01-01",
  policeVerification: "",
  accountHolder: "Sample Owner",
  bankName: "Sample Bank",
  accountNumber: "001234567890",
  ifsc: "SBIN0001234",
  documents: "RC, Insurance",
  sourcePage: "/attach-truck/",
  website: "",
  extra: "dropped",
};
const ok = readDeskBody(truck);
check(ok.ok && !("bot" in ok) && ok.kind === "truck", "a whole truck form refused");
if (ok.ok && !("bot" in ok)) {
  check(ok.data["state"] === "Gujarat", "state not kept");
  check(ok.data["accountNumber"] === "001234567890", "account number changed");
  check(!("extra" in ok.data), "an unknown field was kept");
}
check(!readDeskBody({ ...truck, state: "" }).ok, "a truck form without a state accepted");
check(!readDeskBody({ ...truck, phone: "98765" }).ok, "a bad phone accepted");
check(!readDeskBody({ ...truck, ifsc: "SBIN1234" }).ok, "a bad IFSC accepted");
const bot = readDeskBody({ ...truck, website: "http://spam" });
check(bot.ok && "bot" in bot, "the honeypot was not caught");
check(!readDeskBody({ kind: "nope" }).ok, "an unknown kind accepted");
check(!readDeskBody("text").ok, "a string accepted");

const message = readDeskBody({
  kind: "message",
  name: "A",
  phone: "+919876543210",
  email: "",
  message: "Hello",
  sourcePage: "/contact/",
});
check(message.ok && !("bot" in message) && message.kind === "message", "a message refused");
check(
  !readDeskBody({ kind: "message", name: "A", phone: "9876543210", message: "x" }).ok,
  "a message with a non-E.164 phone accepted",
);
const quote = readDeskBody({
  name: "A",
  phone: "9876543210",
  service: "FTL",
  from: "Surat",
  to: "Kanpur",
});
check(quote.ok && !("bot" in quote) && quote.kind === "quote", "a quote without kind refused");

/* ——— References and stamps ——— */
const at = new Date("2026-10-10T20:00:00Z"); // 01:30 on 11 Oct in India
check(/^DST-261011-\d{4}$/.test(deskReference("truck", at, 0.5)), deskReference("truck", at, 0.5));
check(deskReference("message", at, 0).endsWith("-1000"), "lowest random digits");
check(deskReference("message", at, 0.99999).endsWith("-9999"), "highest random digits");
check(
  istStamp("2026-10-10T20:00:00.000Z") === "2026-10-11 01:30",
  istStamp("2026-10-10T20:00:00.000Z"),
);

/* ——— City → state ——— */
const cases: [string, string | null][] = [
  ["Surat", "Gujarat"],
  ["  surat ", "Gujarat"],
  ["Baroda", "Gujarat"],
  ["Mumbai", "Maharashtra"],
  ["bombay", "Maharashtra"],
  ["Rae Bareli", "Uttar Pradesh"],
  ["Raebareli", "Uttar Pradesh"],
  ["Faizabad (Ayodhya)", "Uttar Pradesh"],
  ["Delhi NCR", "Delhi"],
  ["Gurgaon", "Haryana"],
  ["Jammu", "Jammu and Kashmir"],
  ["Bengaluru", "Karnataka"],
  ["Hosur", "Tamil Nadu"],
  ["Silvassa", "Dadra and Nagar Haveli and Daman and Diu"],
  ["Kim, Gujarat", "Gujarat"],
  ["Somewhere, Rajasthan", "Rajasthan"],
  ["Aurangabad", null],
  ["Bilaspur", null],
  ["Nowhere Town", null],
  ["", null],
];
for (const [city, state] of cases) {
  check(
    stateForCity(city) === state,
    `"${city}" → ${String(stateForCity(city))}, expected ${String(state)}`,
  );
}

/* ——— Excel ——— */
const file = buildXlsx({
  sheetTitle: "Truck attachments",
  header: ["Received at", "Reference", "Phone", "Account number", "Note"],
  rows: [
    [
      "2026-10-11 01:30",
      "DST-261011-1234",
      "+919876543210",
      "001234567890",
      '=HYPERLINK("x") & <tag> "q"',
    ],
    ["2026-10-11 02:00", "DST-261011-5678", "+919812345670", "000000009", "हिंदी · ₹5,160"],
  ],
});
check(file[0] === 0x50 && file[1] === 0x4b, "not a zip");
const out = process.argv[2];
if (out !== undefined) writeFileSync(out, file);

console.log("verify:desk passed");
