# Backend integration — LR tracking with an SMS code

The site is ready for the client's backend. The tracking flow is built and tested
against a documented *assumed* contract. Connecting the real API means editing
**one file** (`src/lib/backend/adapter.ts`) and setting **one environment variable**
(`NEXT_PUBLIC_DSL_API_BASE`).

Until the variable is set, nothing changes: `/track` and the home hero's Track tab
keep validating the AWB / LR number and handing it to WhatsApp / email / phone.

## Direct LR lookup (no SMS) — the client's E-Transport API

The client's own software (E-Transport, at `dharmashreegroup.in`) publishes an LR
inquiry API. `/track` looks an LR up by its number **and the mobile number on the
booking**:

```
browser ──▶ POST /api/lr  { no: "SRT-3230", mobile: "9876543210" }
               │            functions/api/lr.ts (Cloudflare Pages Function)
               │  parses SRT-3230 → code=SRT, lrno=3230 (the whole number only: a bare 3230 is refused)
               ▼
   https://dharmashreegroup.in/api/LRInquiry.ashx?apiname=lrinquiry&code=SRT&lrno=3230
               │  src/lib/backend/vendor-lr.ts maps the record to the contract below
               ▼
   200 { lrNumber, bookedOn, origin, destination, consignor, consignee, packages,
         weightKg, status, statusText, currentLocation, expectedDelivery,
         deliveredOn, events[], details{…} }     → parseLrRecord (adapter.ts)
```

- **Privacy — a number alone never opens a booking.** LR numbers run in sequence
  (3230, 3231, …), so anyone could read a stranger's consignment. The function
  returns the record only when `mobile` is one of the consignor's / consignee's
  mobiles in the LR itself (`customerMobiles` in `vendor-lr.ts`, read from
  `ConsignorMobile` / `ConsigneeMobile` and their `…MobileNo` / `…Contact`
  variants). Rules:
  - The delivery station's numbers (in `StationAddress`) are **never** accepted —
    they are the branch's own and are public on the site.
  - An unknown LR, a wrong mobile and a booking with no customer mobile on file all
    get the **same** answer, `404 { "code": "NOT_VERIFIED" }`, so the reply can't be
    used to discover which LRs exist.
  - The mobile travels in the POST body, not the URL.
  - Misses are limited harder than lookups: 8 misses per address per 15 minutes
    (then `429`), on top of 30 lookups per 5 minutes.
  - `GET /api/lr` is `405`.
- **Blocked on the vendor's data (2026-10-10):** the LR record E-Transport returns
  carries **no consignor or consignee mobile** — the only phone numbers in it are the
  delivery station's (checked across several LRs). Until it does, every lookup is
  `NOT_VERIFIED` and `/track` points the visitor to the desk. To switch verification
  on, ask the vendor to include the consignor and consignee mobile in
  `LRInquiry.ashx`'s record, then confirm the field names against
  `vendorDetails()` (`ConsignorMobile` / `ConsigneeMobile` are assumed) and adjust
  that one function. Local QA: `NEXT_PUBLIC_DSL_API_BASE=mock-direct` — SRT-1001
  with `9876543210`, SRT-1002 with `9812345670`; anything else is `NotVerified`.
- **Switch it on:** `NEXT_PUBLIC_DSL_API_BASE=direct` at build time, then redeploy.
  Local QA: `NEXT_PUBLIC_DSL_API_BASE=mock-direct npm run dev` (LRs `SRT-1001`,
  `SRT-1002`, `SRT-1003` → network error; anything else → not found).
- **What the customer sees:** what the printed LR carries — status and the desk's own
  words for it, route, dates, vehicle, consignor and consignee (with GSTIN and
  contact), invoice details, e-way bill, freight details, delivery address and its
  numbers, and the movement history. A field the booking does not carry is left out.
- **What never leaves the server:** the vendor's raw record. The function returns
  only the contract above.
- **In the home hero** a lookup opens `/track/?lr=…`; `/track` reads `lr` on arrival.
- **Abuse:** LR numbers run in sequence, so one address is limited to 30 lookups in
  5 minutes per Cloudflare isolate. Add a Cloudflare rate-limiting rule on `/api/lr`
  (Security › WAF › Rate limiting rules) for a limit that holds across the network.
- **Status:** read from the record's milestones (delivery date → delivered, receive
  date → arrived, a challan or vehicle → in transit, otherwise booked), refined by
  the words in `Status`. Tested in `npm run verify:lr`.

**Access (2026-10-10):** `LRInquiry.ashx` answers `401 Unauthorized` unless the
vendor's key is sent in the `Authorization` header (the raw key and `Bearer <key>`
are both accepted; a wrong or missing key is 401). The key lives only as the
encrypted Pages variable `DSL_LR_API_KEY`, read by `functions/api/lr.ts`:

```
# from the repo root, with wrangler logged in to the account that owns the project
printf '%s' "<the key>" | npx wrangler pages secret put DSL_LR_API_KEY --project-name dharmashree-logistics
```

It is never committed, never in `.env*`, and never in a `NEXT_PUBLIC_*` variable
(those are inlined into the public bundle). A secret change applies to the *next*
deployment, so redeploy after setting it. If the vendor rotates the key, repeat the
command above and redeploy. A `503 UPSTREAM_LOCKED` from `/api/lr` means the key is
missing, wrong or revoked.

Checking the live function: `curl -s -X POST https://dharmashree-logistics.pages.dev/api/lr -d '{"no":"SRT-1234","mobile":"<10 digits>"}'`.

## What the visitor gets

1. Enters the **LR number** and the **mobile number on the booking**, presses *Send OTP*.
2. Receives a 6-digit **SMS code**, enters it (paste and one-time-code autofill work),
   presses *Verify & track*. Resend is available after a countdown; *Change number* goes back.
3. Sees the LR: route, consignor / consignee, packages and weight (when the API sends
   them), booked date, expected or delivered date, current status, a progress bar and
   the movement history as a timeline.

The session token that proves the code was verified lives in React state only — never
`localStorage`, never the URL. Reloading the page asks for a new code.

## Code map

| File | Role |
| --- | --- |
| `src/lib/backend/adapter.ts` | **The only file the integration edits.** Paths, request bodies, JSON → domain mapping, status vocabulary, HTTP error → error code. |
| `src/lib/backend/config.ts` | Reads `NEXT_PUBLIC_DSL_API_BASE` → mode `live` / `mock` / `off`. |
| `src/lib/backend/client.ts` | `requestOtp`, `verifyOtp`, `fetchLr`. Timeout (15 s), CORS fetch without cookies, never throws (returns a `BackendResult`). |
| `src/lib/backend/types.ts` | Domain types (`LrRecord`, `OtpChallenge`, `VerifiedSession`, error codes). |
| `src/lib/backend/guards.ts` | Hand-written runtime checks for `unknown` JSON and IST date handling. |
| `src/lib/backend/mock.ts` | Local-QA simulator. Unreachable in a production build. |
| `src/content/track.ts` (`live`) | Every sentence the flow shows, including one message per error code. |
| `src/components/track/` | `LiveTrackFlow` (the 3 steps), `LrResult`, `LrProgress`. |

## Assumed contract (until the client's API is confirmed)

Base URL = `NEXT_PUBLIC_DSL_API_BASE`, https. JSON in, JSON out.

```
POST {base}/otp/send
  { "lrNumber": "DSL12345", "mobile": "9876543210" }          // 10 digits, no +91
  200 { "requestId": "…", "maskedMobile": "XXXXXX3210", "expiresIn": 300, "resendAfter": 30 }

POST {base}/otp/verify
  { "requestId": "…", "otp": "123456" }
  200 { "token": "…", "expiresIn": 900 }

GET  {base}/lr/{lrNumber}          Authorization: Bearer {token}
  200 {
    "lrNumber": "DSL12345",
    "bookedOn": "2026-10-03",                  // date or date-time
    "origin": "Surat", "destination": "Jaipur",
    "consignor": "…", "consignee": "…",
    "packages": 24, "weightKg": 1180.5,        // either may be null
    "status": "IN_TRANSIT",
    "currentLocation": "Ahmedabad hub",        // may be null
    "expectedDelivery": "2026-10-08", "deliveredOn": null,
    "events": [
      { "at": "2026-10-05T18:40:00+05:30", "location": "Ahmedabad hub",
        "status": "AT_FACILITY", "note": null }
    ]
  }
```

Failures: HTTP status, optionally `{ "code": "…", "message": "…" }`.

| Situation | Status | Our code |
| --- | --- | --- |
| LR (or request id) unknown | 404 | `NotFound` |
| Mobile is not the one on the LR (`/otp/send`) | 403 | `MobileMismatch` |
| Wrong code (`/otp/verify`) | 401 (or 400 / 422) | `OtpInvalid` |
| Code expired | 410 | `OtpExpired` |
| Too many wrong codes | 429 + `code: "TOO_MANY_ATTEMPTS"` | `TooManyAttempts` |
| Rate limited | 429 | `RateLimited` |
| Token rejected on `/lr` | 401 / 403 | `SessionExpired` |
| Anything else 5xx | 5xx | `Server` |
| 200 but not the shape above | — | `BadResponse` |
| Timeout / offline / CORS refusal | — | `Timeout` / `Network` |

A `code` in the error body wins over the status (see `ERROR_CODE_BY_KEY` in the adapter).
Date-times with no offset are read as India time; dates are kept as India calendar dates.

## What we need from the client's backend team

Please answer these (or send a sample request and response for each call):

1. **Endpoints**: base URL, and the exact paths / methods for *send code*, *verify code*,
   *get LR*. Is the LR looked up by LR number, by consignment id, or by something else?
2. **Request fields**: names and formats. Does `mobile` want `9876543210`, `919876543210`
   or `+919876543210`? Is the LR number case-sensitive? Do LR numbers contain `/` or `-`?
3. **Auth model**: does verify return a token we send back as `Authorization: Bearer`?
   Or a cookie / session id / signed URL? How long does it live? Is it bound to one LR?
4. **LR response**: a real sample for an in-transit and a delivered LR. Which fields exist
   (consignor, consignee, packages, weight, expected delivery)? Date formats and time zone.
   Is the event list newest-first or oldest-first (we sort either way)? Are `events`
   customer-safe (no internal remarks)?
5. **Status vocabulary**: the full list of status words the API can return, and for each
   which of our seven it maps to — Booked, Picked up, In transit, Arrived at a facility,
   Out for delivery, Delivered, Requires attention. A word that is not mapped makes the
   whole reply fail (`BadResponse`) on purpose: a wrong status is worse than an error.
6. **OTP rules**: code length (we assume 6 digits), lifetime, resend interval, maximum wrong
   attempts, per-mobile and per-LR rate limits. Do they return `resendAfter` / `expiresIn`?
7. **Privacy**: who may see an LR? We assume "whoever holds the mobile number on the
   booking". Is that the consignor's, the consignee's, or either? What if the booking has
   no mobile number?
8. **Errors**: do they send a `code` in the body? Which values? (Our mapping table above is
   a guess.)
9. **Do they need a server-side secret to call the API?** See "No secrets in the browser".
10. **CORS** (next section) and the staging environment for testing.

## CORS

The site is a static export. The visitor's browser calls the client's API **directly**.
The API must therefore answer cross-origin requests from:

- `https://dharmashreegroup.in` (the production site, per the plan) — and whichever
  origin the site is finally served from, e.g. `https://www.dharmashreegroup.in`;
- the Cloudflare Pages preview domain(s), e.g. `https://<project>.pages.dev` and
  `https://<branch>.<project>.pages.dev`, so previews can be tested.

Required behaviour:

- `Access-Control-Allow-Origin` echoing one of the allowed origins (an explicit origin is better than `*`);
- the **preflight**: our POSTs send `Content-Type: application/json`, so the browser first
  sends `OPTIONS`. The API must answer it with `Access-Control-Allow-Methods: GET, POST, OPTIONS`
  and `Access-Control-Allow-Headers: Content-Type, Authorization`. (ASP.NET: enable CORS for
  those origins and make sure `OPTIONS` is not blocked by the auth filter.)
- no cookies are sent (`credentials: "omit"`), so `Access-Control-Allow-Credentials` is not needed.

A CORS failure is indistinguishable from "offline" in the browser: the visitor sees the
*Network* message. If that is all you get on integration day, look at the browser's
Network tab: a red preflight is the CORS settings.

## No secrets in the browser

`output: "export"` means the site is plain files; there is no server of ours. Anything in
`NEXT_PUBLIC_*` is shipped to every visitor. So **no API key, client secret, or password may
be used by this site.**

If the client's API needs a key (or IP allow-listing, or Basic auth), do not put it in the
site. Add a small proxy that holds the secret and exposes only the three calls:

```
browser ──https──▶ Cloudflare Pages Function  /api/track/*   (holds DSL_API_KEY as an encrypted env var)
                       │  adds the key, enforces the origin, rate-limits per IP
                       ▼
                  client's API
```

Shape (Pages Functions, `functions/api/track/[[path]].ts`):

- accept only `POST /api/track/otp/send`, `POST /api/track/otp/verify`, `GET /api/track/lr/:lr`;
- check `Origin` against the allow-list; reject everything else with 403;
- forward to the client's API with the secret header; never forward the browser's cookies;
- return their JSON and status unchanged (the adapter already handles the contract);
- add a coarse rate limit (Cloudflare rate-limiting rule or KV counter) in front of `/otp/send`
  — an SMS endpoint is a cost and an abuse target.

Then set `NEXT_PUBLIC_DSL_API_BASE=https://<site>/api/track` and keep the adapter as is.
CORS is no longer an issue (same origin). A Pages Function means the site is no longer purely
static, so decide that deliberately.

## Integration-day checklist

1. **Get the facts** — walk through the questions above with the backend team; collect a sample
   request/response for each call (a curl or Postman export is ideal) and a staging base URL.
2. **Edit `src/lib/backend/adapter.ts`** only:
   - update the contract comment at the top to the real one;
   - `buildSendOtpRequest`, `buildVerifyOtpRequest`, `buildFetchLrRequest`: paths, body field
     names, mobile format, auth header;
   - `parseOtpChallenge`, `parseVerifiedSession`, `parseLrRecord`: key names (each reader takes a
     list of alternative keys), date formats;
   - `STATUS_BY_KEY`: add every status word they can return;
   - `ERROR_CODE_BY_KEY` and `mapErrorResponse`: their error codes and statuses.
   If a field they cannot provide is *required* by `parseLrRecord` (origin, destination, booked
   date), decide with the client whether to make it optional in `LrRecord` before relaxing it.
3. **Try it locally against staging**: `NEXT_PUBLIC_DSL_API_BASE=https://staging…` in `.env.local`
   (never committed), `npm run dev`, open `/track/`. Local `http://localhost:3000` must be on the
   API's CORS list for this step.
4. **Test cases** (each should show the sentence in `track.live.errors`, not a blank screen):
   - valid LR + matching mobile → code arrives → correct code → result matches the billing portal;
   - unknown LR → *NotFound*; LR with a non-matching mobile → *MobileMismatch*;
   - wrong code → *OtpInvalid*, can retry; repeat to the limit → *TooManyAttempts*, back to step 1;
   - wait past expiry → *OtpExpired*; *Resend code* works after the countdown;
   - rapid repeat sends → *RateLimited*;
   - an LR in each status (booked … delivered, and one needing attention) → right label and bar;
   - an LR with no packages / weight / expected date → those lines are simply absent;
   - an LR with no movements → the "no movement recorded" line;
   - airplane mode → *Network*; throttle to a very slow connection → *Timeout* (15 s);
   - a status word the adapter does not know → *BadResponse* (add it to `STATUS_BY_KEY`);
   - reload on the result → asks for a new code (nothing stored);
   - check `/track/` and the home hero tab at 360, 768, 1280, 1440.
5. **Set the variable** on Cloudflare Pages (Production and Preview): `NEXT_PUBLIC_DSL_API_BASE`
   = the https base. It is inlined at build time, so **redeploy** after setting it.
6. **Confirm CORS** from the deployed origin(s): run the happy path on the Pages preview, then on
   production.
7. **Rollback** is removing the variable and redeploying — the page returns to the WhatsApp /
   email / phone handoff with no code change.

## Local QA without the client (mock)

`NEXT_PUBLIC_DSL_API_BASE=mock npm run dev` (set it for that process only, or in `.env.local`).
The simulator, in `src/lib/backend/mock.ts`:

- LR `DSL12345` is found; any other LR is *NotFound*.
- Code `123456` is accepted; `000000` → *OtpExpired*; `111111` → *TooManyAttempts*; anything else
  → *OtpInvalid*, and the third wrong code in a row → *TooManyAttempts*.
- Mobile `9999999999` → *MobileMismatch*; `9000000000` → *RateLimited*; `…01` → *Network*;
  `…02` → *Timeout*; `…03` → *Server*; `…04` → *BadResponse*. Any other valid mobile gets a code.
- Resend countdown is 10 s.

A production build treats `mock` as unset (the flow stays off) and drops the simulator from the
bundle, so it can never answer a real customer.
