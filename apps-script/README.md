# Quote intake — Google Apps Script

`Code.gs` is the whole backend for `/quote`, the `/partners` application, the
`/attach-truck` application and the "Send us a message" box. It appends one row
per submission to a Google Sheet (`Quotes`, `Partners`, `Truck attachments` or
`Messages` tab) and emails the desk. There is no server to run and nothing to
deploy besides the script itself.

## Setup

1. Create a Google Sheet named **DharmaShree Quotes**.
2. In the sheet: **Extensions › Apps Script**.
3. Replace the editor's contents with `Code.gs` and save.
4. **Project Settings › Script properties › Add script property**
   - `NOTIFY_EMAIL` → the desk's inbox (where each enquiry is mailed).
   - Leave it unset and the row is still written; only the email is skipped.
5. **Deploy › New deployment › Web app**
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
   - Copy the `/exec` URL.
6. Put that URL in the site's environment:
   - locally: `.env.local` → `NEXT_PUBLIC_QUOTE_ENDPOINT="https://script.google.com/macros/s/…/exec"`
   - Cloudflare Pages: **Settings › Environment variables**, same name.

   `next.config.ts` is `output: "export"`, so `NEXT_PUBLIC_*` is **inlined at
   build time** — set the variable before the Pages build, then rebuild. A
   variable added afterwards changes nothing until the next deploy.
7. Open the deployment URL in a browser. You should see
   `{"ok":true,"service":"dharmashree-quotes"}` — that is the script answering,
   and it means the deployment is public.

`.env.example` carries the variable name so a new checkout knows what to set.

## Redeploying

Editing the script does **not** change the live URL, but **Deploy › New
deployment** creates a *new* URL. To keep the one already in the site's
environment: **Deploy › Manage deployments › Edit (pencil) › Version: New
version › Deploy**. The URL stays, the code updates.

Delivery-partner applications from `/partners` arrive at the same URL with `kind: "partner"`; they are appended to a `Partners` tab (created on the first application, with its own header row) and mailed to `NOTIFY_EMAIL` with a `DSP-` reference.

### Truck attachments (`kind: "truck"`) need a redeploy

The truck attachment form on `/attach-truck` posts to the same URL with
`kind: "truck"`. Until the updated `Code.gs` is pasted in and deployed as a **new
version** (Deploy › Manage deployments › edit › New version), the live script
treats those posts as quotes and refuses them, and the form reports "The desk's
sheet refused the application." After the redeploy each application is appended
to a `Truck attachments` tab (created with its header row on the first one) and
mailed to `NOTIFY_EMAIL` with a `DST-` reference. The sheet holds the full bank
account number as text; the email shows only its last four digits, so restrict
who the workbook is shared with.

### The message box (`kind: "message"`) needs a redeploy

The "Send us a message" box on `/contact` and in the footer posts to the same
URL with `kind: "message"`. A script deployed **before** that change does not know
the kind and would file the message as a quote that fails with `Missing service`.
So after pulling this change: paste the new `Code.gs` into the editor, save, then
**Deploy › Manage deployments › Edit (pencil) › Version: New version › Deploy**.
Do **not** use *New deployment* — that mints a new `/exec` URL and the site's
`NEXT_PUBLIC_QUOTE_ENDPOINT` would have to change and be rebuilt. The first time
a script change adds a service the editor may ask you to re-authorise (the
message handler uses `LockService`); accept it, then redeploy.

Messages are appended to a `Messages` tab (created on the first message, with its
own frozen header row: `Received at`, `Reference`, `Name`, `Phone`, `Email`,
`Message`, `Source page`) and mailed to `NOTIFY_EMAIL` with the subject
`Website message DSM-<yyMMdd>-<4 digits> — <name>`; `replyTo` is the visitor's
email when they gave one. The phone arrives as E.164 (`+91XXXXXXXXXX`) and is
stored as plain text; the script refuses anything else with `Invalid phone`.
Required: `name`, `phone`, `message`. The honeypot and `clean_()` apply as for
the other kinds.

The first submission after a fresh sheet creates the `Quotes` tab with its
header row and freezes it. Re-running with an existing sheet appends only.

## Why `text/plain`

The site sends:

```
Content-Type: text/plain;charset=utf-8
body: {"name":"…","phone":"…"}
```

That content type is CORS-safelisted, so the browser treats the POST as a
*simple* request and never sends the `OPTIONS` preflight that Apps Script
cannot answer. Switch it to `application/json` and every submission breaks with
a CORS error before it leaves the browser. `scripts/verify-quote.mts` fails the
build if that header string ever changes.

Apps Script answers a POST with a 302 to `script.googleusercontent.com`, which
the fetch follows (`redirect: "follow"`); the JSON body survives the hop.

## Interaction with the site

- **Columns**: the row is written in `HEADERS` order. `verify:quote` checks the
  header count against the client's payload fields, so a field added to one side
  fails the check until the other side matches.
- **Honeypot**: a submission that fills the field the client names `website`
  returns `{"ok":true}` and writes nothing — the bot sees success, the sheet
  stays clean.
- **Required fields**: `name`, `phone`, `service`, `from`, `to`. The client
  validates the same five (plus its own rules) before sending, so a rejection
  here means a request that did not come from the site.
- **Reference**: `DSL-<yyMMdd>-<4 random digits>` in `Asia/Kolkata`, returned to
  the visitor and shown in the confirmation panel. It is the number the desk
  quotes against.
- **Formula injection**: every value is passed through `clean_()`, which caps
  length and prefixes a `'` when a value starts with `=`, `+`, `-` or `@` so a
  pasted payload cannot become a formula in the sheet.
- **Email**: sent only when `NOTIFY_EMAIL` is set; `replyTo` is the visitor's
  address, so replying to the notification answers the enquiry directly.
