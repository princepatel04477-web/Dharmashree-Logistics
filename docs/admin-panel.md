# Form storage and the admin panel

Every form on the site — the quote request, the delivery-partner and truck
attachment applications, and the "Send us a message" box — posts to the site's
own Cloudflare Pages Function, **`/api/desk`** (`functions/api/desk.ts`). Each
submission is one row in the Cloudflare D1 database **`dharmashree-desk`**
(binding `DESK_DB`, see `wrangler.toml`). The client reads them at **`/admin`**.

The forms find the endpoint through `NEXT_PUBLIC_QUOTE_ENDPOINT="/api/desk"`
(inlined at build time, see `.env.example`). This replaces the Google Apps Script
(`apps-script/`), which was never deployed: until this change the forms had
nowhere to send to.

## What the admin panel does

`/admin` — one shared password, then five tabs:

| Tab               | What it shows                                             |
| ----------------- | --------------------------------------------------------- |
| Truck attachments | every `/attach-truck` application, including the State    |
| Messages          | the "Send us a message" box (contact page and footer)     |
| Quote requests    | `/quote`                                                  |
| Delivery partners | `/partners`                                               |
| Announcement      | the notice shown at the top of the home page's track card |

Each list: newest first, a search box, **Refresh**, and **Download Excel** — a real
`.xlsx` with every row ("Received at" in India time, "Reference", then the form's
columns). Phone numbers keep their `+91`, account numbers their leading zeros, and
nothing typed into a form can run as a spreadsheet formula.

The announcement is on/off plus up to 200 characters. The home page reads it from
`/api/announcement` at runtime (cached for 60 s), so a change shows within about a
minute with no rebuild.

## Where things live

| File                                                            | Role                                                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/lib/desk/forms.ts`                                         | Each form's columns, labels, required fields and checks — one definition for storing, listing and Excel. |
| `src/lib/desk/server.ts`                                        | D1 types, JSON replies, limits, the admin session cookie, the announcement.                              |
| `src/lib/desk/xlsx.ts`                                          | The Excel writer (no library).                                                                           |
| `functions/api/desk.ts`                                         | Stores a submission.                                                                                     |
| `functions/api/announcement.ts`                                 | The public announcement.                                                                                 |
| `functions/api/admin/*`                                         | Login, logout, session, submissions, export, announcement — all behind `_middleware.ts`.                 |
| `src/components/admin/AdminPanel.tsx`, `src/app/admin/page.tsx` | The panel.                                                                                               |
| `src/components/home/AnnouncementBar.tsx`                       | The bar on the home card.                                                                                |
| `migrations/0001_desk.sql`                                      | The tables.                                                                                              |

## Security

- The password is the encrypted Pages secret `DSL_ADMIN_PASSWORD`; sessions are
  signed with `DSL_ADMIN_SESSION_KEY` (48+ random characters). Neither is in the repo.
- The session cookie is `HttpOnly; Secure; SameSite=Strict; Path=/api/admin` and
  lasts 12 hours. Requests from other sites are refused.
- Five wrong passwords from one address lock it out for 15 minutes; `/api/desk`
  takes 12 submissions per address per 10 minutes. Both are per Cloudflare isolate
  (best effort); a Cloudflare rate-limiting rule on `/api/*` makes them firm.
- The truck table holds full bank account numbers: share the password only with
  people who should see them.
- No email is sent for a new submission (the Apps Script did that); the desk checks
  `/admin`.

## Setting up (once) and deploying

```
# tables in the live database
npx wrangler d1 migrations apply dharmashree-desk --remote

# the two secrets (then redeploy for them to apply)
npx wrangler pages secret put DSL_ADMIN_PASSWORD    --project-name dharmashree-logistics
npx wrangler pages secret put DSL_ADMIN_SESSION_KEY --project-name dharmashree-logistics

npm run build
npx wrangler pages deploy out --project-name dharmashree-logistics --branch main
```

To change the password, run the first `secret put` again and redeploy. Changing
`DSL_ADMIN_SESSION_KEY` signs everyone out.

Local run with the functions: put both secrets in a `.dev.vars` file (git-ignored),
`npx wrangler d1 migrations apply dharmashree-desk --local`, `npm run build`, then
`npx wrangler pages dev out`. Checks: `npm run verify:desk` and `npm run verify:truck`.
