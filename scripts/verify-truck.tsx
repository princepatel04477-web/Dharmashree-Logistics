/* Unit check for the truck attachment application (`/attach-truck`): the form's
   rules, the payload against the /api/desk definition that stores it (required
   list, field order, the server's own acceptance) and the text/plain post. Run
   with `npm run verify:truck`. */

import { truckPage } from "../src/content/truck";
import { DESK_FORMS, readDeskBody } from "../src/lib/desk/forms";
import {
  EMPTY_TRUCK,
  REQUIRED_TRUCK_FIELDS,
  firstInvalidTruckField,
  isGstin,
  isIfsc,
  isLicenceNumber,
  isVehicleNumber,
  normalizeTruck,
  submitTruck,
  validateTruck,
  type TruckPayload,
} from "../src/lib/truck";

const TODAY = "2026-10-10";

function fail(message: string): never {
  console.error(`verify:truck FAILED — ${message}`);
  process.exit(1);
}

function check(condition: boolean, message: string): void {
  if (!condition) fail(message);
}

const GOOD: TruckPayload = {
  ...EMPTY_TRUCK,
  ownerName: "Ramesh Patel",
  entityType: "Individual owner",
  phone: "98765 43210",
  address: "Ring Road, Surat, Gujarat 395002",
  operatingCity: "Surat",
  state: "Gujarat",
  vehicleNumber: "gj 05 ab-1234",
  makeModel: "Tata Signa 4825.T",
  yearOfMfg: "2021",
  bodyType: "Closed body / container",
  payloadTons: "25.5",
  permitValidUntil: "2027-03-31",
  insuranceValidUntil: "2027-01-15",
  driverName: "Suresh Kumar",
  driverPhone: "+91 91234 56789",
  driverLicence: "GJ05 20190012345",
  licenceValidUntil: "2030-06-01",
  accountHolder: "Ramesh Patel",
  bankName: "State Bank of India",
  accountNumber: "0012 3456 7890",
  ifsc: "sbin0001234",
};
const GOOD_EXTRAS = { accountConfirm: "001234567890", declaration: true, selfDriven: false };

async function main(): Promise<void> {
  /* ——— Format rules ——— */
  for (const plate of ["GJ05AB1234", "UP32T1234", "DL1C1234", "22BH1234AA", "mh 12 de 1433"]) {
    check(isVehicleNumber(plate), `${plate} should be a vehicle number`);
  }
  for (const plate of ["1234", "GJAB1234", "GJ05AB12345"]) {
    check(!isVehicleNumber(plate), `${plate} should not be a vehicle number`);
  }
  check(isGstin("24ABCDE1234F1Z5") && !isGstin("24ABCDE1234F1X5"), "GSTIN rule");
  check(isIfsc("SBIN0001234") && !isIfsc("SBIN1001234"), "IFSC rule");
  check(isLicenceNumber("GJ05 20190012345") && !isLicenceNumber("12345"), "licence rule");

  /* ——— Validation ——— */
  check(
    Object.keys(validateTruck(GOOD, GOOD_EXTRAS, TODAY)).length === 0,
    `a valid application was rejected: ${JSON.stringify(validateTruck(GOOD, GOOD_EXTRAS, TODAY))}`,
  );
  const blank = validateTruck(
    EMPTY_TRUCK,
    { accountConfirm: "", declaration: false, selfDriven: false },
    TODAY,
  );
  check(
    firstInvalidTruckField(blank) === "ownerName",
    "an empty form should focus the owner first",
  );
  for (const field of REQUIRED_TRUCK_FIELDS) {
    check(
      blank[field as keyof typeof blank] === "Required",
      `${field} is not required on the client`,
    );
  }
  check(blank.declaration === "Declaration", "the declaration is not required");
  check(
    validateTruck({ ...GOOD, insuranceValidUntil: "2026-10-09" }, GOOD_EXTRAS, TODAY)
      .insuranceValidUntil === "Expired",
    "expired insurance was accepted",
  );
  check(
    validateTruck(GOOD, { ...GOOD_EXTRAS, accountConfirm: "001234567891" }, TODAY)
      .accountConfirm === "AccountMismatch",
    "a mismatched account number was accepted",
  );
  check(
    validateTruck({ ...GOOD, yearOfMfg: "2027" }, GOOD_EXTRAS, TODAY).yearOfMfg === "Year",
    "a future model year was accepted",
  );
  check(
    validateTruck({ ...GOOD, payloadTons: "0" }, GOOD_EXTRAS, TODAY).payloadTons === "Payload",
    "a zero payload was accepted",
  );
  const selfDriven = validateTruck(
    { ...GOOD, driverName: "", driverPhone: "" },
    { ...GOOD_EXTRAS, selfDriven: true },
    TODAY,
  );
  check(Object.keys(selfDriven).length === 0, "an owner-driven truck still asks for a driver");
  for (const code of Object.keys(truckPage.errors) as (keyof typeof truckPage.errors)[]) {
    check(truckPage.errors[code].trim() !== "", `errors.${code} is empty`);
  }

  /* ——— Client ↔ /api/desk (src/lib/desk/forms.ts) ——— */
  const server = DESK_FORMS.truck;
  check(
    server.required.length === REQUIRED_TRUCK_FIELDS.length &&
      server.required.every((field) => REQUIRED_TRUCK_FIELDS.some((c) => c === field)),
    "the server's required list and REQUIRED_TRUCK_FIELDS differ",
  );
  const sent = Object.keys(EMPTY_TRUCK).filter((field) => field !== "kind" && field !== "website");
  const columns = server.columns.map((column) => column.key);
  check(
    JSON.stringify(columns) === JSON.stringify(sent),
    `the server's columns are not the payload order:\n  ${columns.join(",")}\n  ${sent.join(",")}`,
  );
  const accepted = readDeskBody({ ...normalizeTruck(GOOD), sourcePage: "/attach-truck/" });
  check(
    accepted.ok && !("bot" in accepted),
    `the server refused a valid application: ${JSON.stringify(accepted)}`,
  );

  /* ——— Normalised payload: what the script's own checks accept ——— */
  const normal = normalizeTruck(GOOD);
  check(normal.phone === "+919876543210", `owner phone sent as ${normal.phone}`);
  check(normal.driverPhone === "+919123456789", `driver phone sent as ${normal.driverPhone}`);
  check(normal.vehicleNumber === "GJ05AB1234", `vehicle number sent as ${normal.vehicleNumber}`);
  check(normal.accountNumber === "001234567890", `account number sent as ${normal.accountNumber}`);
  check(normal.ifsc === "SBIN0001234", `IFSC sent as ${normal.ifsc}`);

  /* ——— The post ——— */
  const realFetch = globalThis.fetch;
  let seenBody = "";
  let seenType = "";
  globalThis.fetch = ((_input: unknown, init?: RequestInit) => {
    seenBody = typeof init?.body === "string" ? init.body : "";
    seenType = new Headers(init?.headers).get("Content-Type") ?? "";
    return Promise.resolve(
      new Response(JSON.stringify({ ok: true, reference: "DST-261010-1234" }), { status: 200 }),
    );
  }) as typeof fetch;
  process.env.NEXT_PUBLIC_QUOTE_ENDPOINT = "https://script.example/exec";
  try {
    const result = await submitTruck(GOOD);
    check(result.ok && result.reference === "DST-261010-1234", "submitTruck lost the reference");
    check(
      seenType === "text/plain;charset=utf-8",
      "the truck post must be text/plain (CORS-simple)",
    );
    check(seenBody.includes('"kind":"truck"'), "the truck post is not tagged kind: truck");
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.NEXT_PUBLIC_QUOTE_ENDPOINT;
  }

  console.log(
    `verify:truck OK — format rules, ${String(REQUIRED_TRUCK_FIELDS.length)} required fields ↔ /api/desk, ${String(columns.length)} stored columns, normalised text/plain post`,
  );
}

main().catch((error: unknown) => {
  console.error("verify:truck FAILED —", error);
  process.exit(1);
});
