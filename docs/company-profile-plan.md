# Company Profile → site — plan (Prompts 09–14)

Source: the eight files in `Company_Profile/` (About, Express Parcel, Full
Truckload, Local On-Demand, Warehousing, Track Shipment, Support, Delivery
Partner). This plan moves that copy into `src/content/**` and gives each page
an interactive treatment built only from the components already vendored
(Origin UI, React Bits, Lightswind) plus GSAP and Motion, under the house
rules in `AGENTS.md`.

---

## 0. Decisions needed before Prompt 09

The profile and the current site disagree in places. Each item has a
recommendation; nothing below Prompt 09 starts until these are answered.

| # | Conflict | Profile says | Site says now | Recommendation |
| - | -------- | ------------ | ------------- | -------------- |
| D1 | Service catalogue | Express Parcel · Full Truckload · Local On-Demand Delivery · Warehousing & Fulfilment | FTL · Part load · Textile parcel & bale · Warehousing & cross-dock · Last-mile | Adopt the profile's four as the catalogue. Fold the old FTL and warehousing operational bullets into the new pages where they don't contradict. Ask whether Part load and Textile dispatch stay as a fifth/sixth service or are retired. |
| D2 | Shipment reference | AWB / tracking number | LR number | Accept both: field label "AWB, LR or tracking number", validator unchanged (4–20 alphanumerics). Copy says "AWB / LR" throughout. |
| D3 | Live tracking | "The tracking page will show the latest status" | No backend; honest hand-off to the desk | Keep the honest hand-off. Show the seven statuses as an explainer, never as a fake result. |
| D4 | Placeholders in Support | Phone `+91 00000 00000`, "Add your official support hours here" | `company.phone = null` | Not shipped (rules 3 and 4). Add `supportHours: null` to `Company`; the UI hides it until a real value arrives. |
| D5 | Email | `hello@dharmashreelogistics.com` | `company.email = null` | Confirm the mailbox is live, then set `company.email`. That one change lights up the footer, contact, track and quote fallbacks. |
| D6 | Tagline | "Hum sirf shipments nahi, bharosa move karte hai." | `company.tagline = null` | Set `company.tagline`. Confirm the spelling: "karte **hain**" is the standard form. |
| D7 | Partner directory | Five UP transport partners, with phone numbers | Nothing | Publish the partners on `/partners` (their numbers appear in the profile, so the company has chosen to list them). Confirm before going live. Hardoi is **not** in `hubs.ts`; either add it as a hub or show it in the directory only, without a map pin. |
| D8 | Partner sign-up | "Join us" (no form specified) | Apps Script pipeline exists for `/quote` | Reuse the Apps Script endpoint with a `kind: "partner"` column, so there's one pipeline and one sheet. The alternative is a WhatsApp/email hand-off like `/track`. |

---

## 1. Where every profile section lands

| Profile file | Route | Content file | Notes |
| ------------ | ----- | ------------ | ----- |
| ABOUT DHARMASHREE | `/about` (rewrite) + home hero line | `about.ts`, `company.ts` (tagline) | Four commitments replace the "What you can hold us to" block |
| EXPRESS PARCEL | `/services/express-parcel` (new) | `services.ts` | |
| FULL TRUCKLOAD | `/services/full-truckload` (rewrite) | `services.ts` | Keeps its slug, so existing links still work |
| LOCAL ON-DEMAND | `/services/local-on-demand` (new) | `services.ts` | |
| WAREHOUSING | `/services/warehousing-fulfilment` (new slug) | `services.ts` | Redirect the old `warehousing-cross-dock` slug |
| TRACK SHIPMENT | `/track` (extend) | `track.ts` | |
| SUPPORT PAGE | `/support` (new), linked from Help nav | `support.ts`, `faq.ts` | `/contact#faq` points to `/support` |
| DELIVERY PARTNER | `/partners` (new) | `partners.ts` (new) | Directory, benefits, onboarding, join form |

`company.services` and `services.ts` stay one-for-one. `npm run verify:services`
is updated for the new slugs, and the footer, home tiles and index rows rebuild
from the array with no component changes.

---

## 2. Page-by-page interaction design

Owner key: **G** = GSAP, **M** = Motion (`motion/react`), **RB** = React
Bits, **OU** = Origin UI, **LW** = Lightswind. One owner per element.

### 2.1 `/about`: "Hum sirf shipments nahi, bharosa move karte hain"

| Block | Interaction | Components | Owner |
| ----- | ----------- | ---------- | ----- |
| Hero | Tagline split into masked lines, then the English lede rises in | `SectionHeading` / GSAP SplitText, `Reveal` | G |
| "Logistics is more than moving goods" | Three short statements (keeping promises · enabling growth · long-term partnerships), each with a drawn accent hairline between | `DrawLine` | G |
| **What drives us: four commitments** | Pinned `100svh` stage, scrubbed. A 4-node rail on the left fills node by node; the commitment title and body crossfade on the right, with a large index numeral. Same pattern as `ProcessSection`, so no new motion code. Mobile and reduced motion: four stacked blocks | Rail as `ui/timeline.tsx` nodes | G |
| **"Which business are you?"** selector | Online seller / Manufacturer / Retailer / Distributor as radio cards. Choosing one swaps a panel that names the services the profile pairs with it (seller → Express Parcel; manufacturer → FTL, Warehousing, Local) with links. The mapping is written in `about.ts` from the profile's own sentence | `RadioCards` (OU), panel in `AnimatePresence` (M), links with `MicroLift` | M |
| Reach | Existing network sentence + link to the map | — | — |
| Timeline | `HeritageTimeline` stays data-gated (no dates in the profile, so it stays hidden) | OU | G |

### 2.2 Service detail pages (4)

The `[slug]` template stays as it is: numbered blocks, sticky aside with the
one filled CTA in `Magnet`, and `FaqAccordion`. Each page adds one
**signature block** after the intro. The `Service` type gets an optional
`signature` discriminant, so the template picks the block by data instead of
by slug.

| Page | Signature block | Components | Owner |
| ---- | --------------- | ---------- | ----- |
| Express Parcel: "Every parcel. Right place. Right time." | **Pickup journey**: an inline SVG line from *Your door* → *Pickup* → *In transit* → *Delivered*, drawn by scroll, and each node's caption fades in as the trace reaches it. Below it, a **B2B / B2C / Bulk** segmented switch with a shared `layoutId` underline; the copy panel swaps from the profile's three paragraphs | `CorridorTrace`/`DrawLine` (G); tabs + `AnimatePresence` (M) | G / M |
| Full Truckload: "Your dedicated truck. Your planned movement." | **Supply-chain flow**: Factory → Warehouse → Distributor → Store as a horizontal pinned band, one hairline card per leg using the profile's distribution copy | `ScrollCarousel` (LW) | LW |
| | **Dedicated vs shared**: an outline truck body drawn in hairline. On toggle, other consignments' outlines fade out and only yours remains (outline only, no fill, rule 6) | SVG draw (G), toggle (M) | G / M |
| Local On-Demand: "Fast delivery across the city, whenever you need it." | **What are you sending?** Document / Parcel / Cartons / Inventory as radio cards. The answer panel names the vehicle class from the profile (two-wheeler for documents and small parcels, a larger vehicle for cartons and inventory) and links to `/quote?service=local-on-demand` | `RadioCards` (OU), `AnimatePresence` (M) | M |
| | **Scheduled ↔ Urgent** toggle swapping the two profile paragraphs | Motion `layout` toggle | M |
| Warehousing & Fulfilment: "From storage to delivery, with one trusted partner." | **Fulfilment loop**: a pinned scrub through Storage → Inventory → Pick & pack → Dispatch, then a curved Returns arrow drawn back to Inventory | GSAP pin + `drawSVG` | G |
| | Capability cards (secure storage, stock visibility, packing, returns) in an **asymmetric** 7/5 layout, not an equal grid (rule 7) | `InteractiveCard` (LW, `shadow={false}`) | LW |

`/services` index: rows and cursor preview unchanged. The rows rebuild from the
new catalogue, and `SpotlightCard` tiles on home pick up the new names.

### 2.3 `/track`: "Track your shipment. Stay informed at every step."

| Block | Interaction | Components | Owner |
| ----- | ----------- | ---------- | ----- |
| Lookup | Existing panel, relabelled "AWB, LR or tracking number" (D2). Hand-off is unchanged | `TrackingInput` (OU) | none |
| **What each status means** | Vertical ladder of the seven profile statuses (Booked · Picked up · In transit · Arrived at facility · Out for delivery · Delivered · Requires attention). It draws on entry; clicking a status expands its explanation. It is an explainer: no shipment is shown | `ui/timeline.tsx`, drawn by `DrawLine` (G); expand via `FaqAccordion` (OU) | G |
| **No AWB?** | Disclosure that reveals "booking or invoice reference" guidance + a checklist (sender, receiver, pickup date, destination) | `AnimatePresence` (M), `ConsentCheckbox`-style `ui/checkbox` as a local, unsaved checklist | M |
| LR slip art | Existing `LrSlip`, label updated | G | G |

### 2.4 `/support`: "Your question is our priority."

| Block | Interaction | Components | Owner |
| ----- | ----------- | ---------- | ----- |
| Hero + "have these ready" | The four identifiers (AWB/tracking number, booking reference, sender & receiver, shipment date) as a hairline checklist strip | `ui/checkbox` | none |
| **Topic filter** | Chips: Tracking · Pickup · Delivery time · Delays · Damage · Booking. Filtering re-flows the accordion with `layout`; the active chip carries a `layoutId` outline | Motion `layout` + `LayoutGroup` (M) | M |
| FAQ | The five profile Q&As merged with the current `faq.ts`, each tagged by topic | `FaqAccordion` (OU) | CSS |
| Pickup request | "How do I raise a pickup request?" ends in a link to `/quote?intent=pickup`, which pre-selects step 1 (extends `resolveQuoteEntry()`) | — | — |
| Need more help | Contact rows from `contactLinks()`. Hours appear only when `company.supportHours` is set | plain `<a>` (rule 10) | — |

### 2.5 `/partners` (new): "Give your hard work a new direction."

| Block | Interaction | Components | Owner |
| ----- | ----------- | ---------- | ----- |
| Hero | Masked headline + lede | `SectionHeading` | G |
| **Four benefits** (flexible work · regular assignments · supportive onboarding · growth) | Asymmetric list, large type with hover lift. Not four equal cards | `InteractiveCard` (LW) or `MicroLift` rows (M) | LW / M |
| **Onboarding path** | Step rail: Apply → Documents → Orientation → First assignment. The step labels come from the profile's onboarding paragraph; no timings are invented | `QuoteStepper` (OU) in read-only mode | none |
| **Partner network map** | `IndiaNetworkMap` with a new `focus="uttar-pradesh"` prop: it zooms to UP and pins the partner cities. Selecting a pin, or a row in the directory list beside it, opens `MapPanel` with the partner name, address and `tel:` links (+91 XXXXX XXXXX). List and map share the `MapSelection` context; every pin is keyboard-reachable (rule 11) | Map (G), panel (M) | G / M |
| Partner name band | Partner names on a slow loop, `aria-hidden` (the real list is the directory) | `LogoLoop` (RB) | RB |
| **Join form** | Name, mobile, city (select from partner cities + "Other"), vehicle type, availability (`RadioCards`: full-time / flexible), consent → Apps Script (D8). Success and error go through `toast()` | `TextField`, `SelectField`, `RadioCards`, `ConsentCheckbox` (OU); `Toaster` (LW) | LW |

### 2.6 Home + chrome

- Hero: `company.tagline` as the eyebrow line above the existing H1.
- Services section rebuilds from the new catalogue with no code change.
- Commitments section: the three current statements become the four profile commitments (titles only; the full text lives on `/about`).
- `StatsStrip`: the profile has **no numbers**, so it stays hidden. `CountUp` gets no new figures; derived counts (partners, hubs) appear only as plain text.
- Nav: Help column gains Support and Partners; primary nav stays at 5 items, with Partners in the footer and the mobile menu.
- `ShinyText` stays on the branch announcement only (its documented use), and `Magnet` stays on the primary CTA and WhatsApp only.

---

## 3. Component coverage check

Every vendored component appears in the new work, and each stays inside its
documented role.

| Library | Component | New use |
| ------- | --------- | ------- |
| React Bits | SplitText | About, Support, Partners headings |
| | CountUp | Unchanged (no profile figures; stays data-gated) |
| | Magnet | Primary CTA in the service aside, header |
| | LogoLoop | Partners name band |
| | SpotlightCard | Home service tiles (new catalogue) |
| | ShinyText | Unchanged (branch announcement) |
| Origin UI | TextField, SelectField, ConsentCheckbox | Partner join form |
| | RadioCards | About business selector, Local vehicle selector, partner availability |
| | TrackingInput | Track (AWB/LR) |
| | QuoteStepper | Partner onboarding path; quote `?intent=pickup` |
| | FaqAccordion | Support, Track status ladder, each service page |
| | HeritageTimeline | Unchanged (data-gated) |
| | DateField, NotesField | Quote pickup intent |
| Lightswind | ScrollCarousel | FTL supply-chain band (Industries band unchanged) |
| | InteractiveCard | Warehousing capabilities, Partner benefits |
| | Toaster | Partner join success/error |
| GSAP | pin/scrub, SplitText, drawSVG, ScrollTrigger | About commitments, Express journey, Warehousing loop, Track ladder, map focus |
| Motion | `layoutId`, `layout`, `AnimatePresence`, `MicroLift` | Selectors, tab switches, Support filter, map panel |

---

## 4. Prompt sequence

| Prompt | Scope | Done when |
| ------ | ----- | --------- |
| **09: Content migration** | `company.ts` (tagline, email, `supportHours`), `types.ts` (`Service.signature`, `Partner`, `SupportTopic`), `services.ts` rewritten for the four services, `partners.ts`, `support.ts`, `track.ts` + `faq.ts` updates, slug redirect, `verify:services` updated, new `verify:partners` (phone format, city ↔ hub match) | `typecheck`, `lint`, `verify:*` green; no UI change beyond the new names |
| **10: About** | Rewrite page, commitments pin, business selector | 4 widths + reduced motion screenshots |
| **11: Service signatures** | `signature` switch in `[slug]`; four signature blocks | Each page at 4 widths; pins release cleanly on route change (`template.tsx` kills triggers) |
| **12: Track + Support** | Status ladder, no-AWB disclosure, `/support` with topic filter, `?intent=pickup` | `verify:quote` covers the new intent |
| **13: Partners** | Page, map `focus` prop + partner pins, directory, join form + Apps Script `kind` column | Keyboard walk of pins; form round-trip to the sheet |
| **14: Home + chrome + QA** | Tagline, commitments, nav/footer, `docs/components.md` sections for 09–13 | Full sweep below |

### QA sweep (every prompt)

- `npm run typecheck && npm run lint && npm run verify:services && npm run verify:quote && npm run build`
- Screenshots at 360 / 768 / 1280 / 1440 with `prefers-reduced-motion: reduce` emulated (the automation browser throttles rAF, so animated captures are unreliable)
- Reduced motion: every pin becomes stacked blocks, every draw is already drawn, Lenis is off
- Grep gates: no `any`, no `console.`, no hex or font literals outside `tokens.css`, no `next/link` on `tel:`/`mailto:`/`wa.me`
- Accent audit: no accent fills except the one filled CTA
