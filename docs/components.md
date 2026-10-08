# Component inventory — Prompt 01

Every third-party component lives under `src/components/vendor/<library>/`,
is restyled to `src/styles/tokens.css`, and holds zero `any`, zero hex and
zero font literals. shadcn-style primitives live in `src/components/ui/`.

## Sourcing (network deviation, documented)

The sandbox cannot reach `reactbits.dev`, `originui.com` or `lightswind.com`,
so the registry CLIs could not run. Sources used instead:

- **React Bits** — ported from the Maa Sheetla repo's proven
  `components/react-bits/` (`main` branch, same visual language), converted
  from `framer-motion` to `motion/react`, extended per the brief (char mode,
  en-IN grouping, wrapper-style Magnet).
- **Origin UI** — primitives mirrored from the `cosscom/coss` GitHub repo
  (`apps/origin/registry/default/ui/*`, the current Origin UI home); composed
  Origin-style wrappers hand-built on top in `vendor/origin/`.
- **Lightswind** — slugs verified in the `lightswind@3.2.5` npm package's
  `bin/component-deps.json` (`scroll-carousel`, `interactive-card`, `toast`);
  sources are not bundled on npm, so faithful equivalents were hand-built
  against the documented dependency sets (GSAP / Motion / cva+Motion+lucide).

## Restyle rules applied to every port

- Colours/fonts → token utilities only; `dark:` variants deleted (no dark theme).
- `outline-none` and all `ring-*` focus utilities deleted — the house focus
  ring (`:focus-visible`, 2px accent, 3px offset) is global, and Tailwind's
  `outline-none` utility would override it.
- Radius → `--radius-*` (2px cards/controls, 1px checks); pills kept.
- Shadows removed from form controls; Maa Sheetla's card shadows kept where
  Maa uses them.
- Labels → `.label-caps`; descriptive sentences stay plain text.
- Motion interprets the Lightswind budget as: hover/micro motion ≤12px and
  ≤1.02 scale; the scroll carousel translates by nature; toasts slide 8px.

New runtime dependency: `radix-ui` (single-package Radix primitives for
accordion, checkbox, radio group, label, slot). No other UI deps added.

## Table

| Component         | Library    | File                                                            | Where used                                           | Animation owner                      | Reduced-motion behaviour                                            |
| ----------------- | ---------- | --------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------- |
| SplitText         | React Bits | `vendor/reactbits/split-text.tsx`                               | Hero + section headings                              | self                                 | Renders plain text, no split, no motion                             |
| CountUp           | React Bits | `vendor/reactbits/count-up.tsx`                                 | Stats strip                                          | self                                 | Final formatted value, no counting                                  |
| Magnet            | React Bits | `vendor/reactbits/magnet.tsx`                                   | Primary CTA + WhatsApp button only                   | self                                 | No pull; static wrapper (also static on touch)                      |
| LogoLoop          | React Bits | `vendor/reactbits/logo-loop.tsx`                                | Hub-name marquee                                     | self                                 | Paused at start; also pauses on hover + offscreen                   |
| SpotlightCard     | React Bits | `vendor/reactbits/spotlight-card.tsx`                           | Service tiles (accent 8% max)                        | self                                 | No spotlight layer; static card (also on touch)                     |
| ShinyText         | React Bits | `vendor/reactbits/shiny-text.tsx`                               | Branch announcement label only (gated on `branches`) | self                                 | Solid deep-gold text, no sweep                                      |
| TextField         | Origin UI  | `vendor/origin/text-field.tsx` + `ui/input.tsx`, `ui/label.tsx` | Quote + contact forms                                | none (CSS transition)                | Instant colour change via global rule                               |
| TrackingInput     | Origin UI  | `vendor/origin/tracking-input.tsx`                              | Track page                                           | none (CSS transition)                | Instant colour change via global rule                               |
| SelectField       | Origin UI  | `vendor/origin/select-field.tsx` + `ui/select-native.tsx`       | Vehicle / load selects                               | none (native control)                | Native control, no motion                                           |
| RadioCards        | Origin UI  | `vendor/origin/radio-cards.tsx` + `ui/radio-group.tsx`          | Quote service selection                              | none (CSS transition)                | Instant colour change via global rule                               |
| QuoteStepper      | Origin UI  | `vendor/origin/quote-stepper.tsx` + `ui/stepper.tsx`            | 3-step quote flow                                    | none (CSS transition)                | Instant state swap; spinner frozen via `motion-reduce:animate-none` |
| DateField         | Origin UI  | `vendor/origin/date-field.tsx`                                  | Pickup date                                          | none (native control)                | Native control, no motion                                           |
| NotesField        | Origin UI  | `vendor/origin/notes-field.tsx` + `ui/textarea.tsx`             | Consignment notes + count                            | none (CSS transition)                | Instant colour change via global rule                               |
| FaqAccordion      | Origin UI  | `vendor/origin/faq-accordion.tsx` + `ui/accordion.tsx`          | FAQ (plus/minus)                                     | none (grid-rows CSS transition)      | Instant open/close via global rule                                  |
| HeritageTimeline  | Origin UI  | `vendor/origin/heritage-timeline.tsx` + `ui/timeline.tsx`       | About heritage timeline                              | static now (GSAP draw in later pass) | Static                                                              |
| ConsentCheckbox   | Origin UI  | `vendor/origin/consent-checkbox.tsx` + `ui/checkbox.tsx`        | Form consent line                                    | none (CSS transition)                | Instant colour change via global rule                               |
| ScrollCarousel    | Lightswind | `vendor/lightswind/scroll-carousel.tsx`                         | Industries band                                      | self (GSAP pin+scrub)                | Native swipeable strip, no pin                                      |
| InteractiveCard   | Lightswind | `vendor/lightswind/interactive-card.tsx`                        | Capability cards                                     | self                                 | No tilt/lift; static card (also on touch)                           |
| Toaster / toast() | Lightswind | `vendor/lightswind/toaster.tsx`                                 | Form success/error feedback                          | self (Motion AnimatePresence)        | Zero-duration enter/exit; `aria-live` announcements intact          |

Shared: `useHoverCapable()` (`src/hooks/`) gates all hover-only effects;
`useCharacterLimit()` (`src/hooks/`) backs NotesField. `ui/button.tsx` is the
house button (filled-accent default = the one CTA; outline = Maa `.btn` recipe).

Keyboard: stepper (buttons), selects (native), radio cards (Radix roving
tabindex + arrows), accordion (Radix), date picker (native) and checkbox
(Radix) are all fully operable without a mouse; Magnet/tilt/spotlight never
remove or trap focus.

## Motion system — Prompt 02

One owner per element (house rule 8): Lenis drives scroll, GSAP's ticker
drives Lenis's rAF loop, ScrollTrigger reads scroll position, and Motion
handles the finishing layer (micro-interactions + route transitions).
Timings live in `src/lib/motion-tokens.ts`; GSAP plugins register once in
`src/lib/gsap.ts` and GSAP is imported only through it. `motion/react` is
imported directly by Motion-owned components (rule 8), and vendor
components use their own effect as-is.

| Piece           | Owner  | File                                   | Behaviour                                               |
| --------------- | ------ | -------------------------------------- | ------------------------------------------------------- |
| MotionProviders | bridge | `src/providers/MotionProviders.tsx`    | Lenis (root) + `MotionConfig`; skips Lenis when reduced |
| Page transition | Motion | `src/app/template.tsx`                 | Ink wipe + crossfade; kills dead triggers, scrolls top  |
| Reveal          | GSAP   | `components/motion/Reveal.tsx`         | Rise 24px + fade, once at 85% viewport                  |
| SectionHeading  | GSAP   | `components/motion/SectionHeading.tsx` | Index label + masked line reveal (SplitText)            |
| ImageCurtain    | GSAP   | `components/motion/ImageCurtain.tsx`   | Clip-path wipe + 1.08 → 1 settle                        |
| DrawLine        | GSAP   | `components/motion/DrawLine.tsx`       | Accent hairline 60% draws on entry                      |
| CorridorTrace   | GSAP   | `components/motion/CorridorTrace.tsx`  | Traces `path[data-trace]` while corridor is active      |
| MarqueeLoop     | GSAP   | `components/motion/MarqueeLoop.tsx`    | Seamless xPercent −50 loop, doubled track               |
| MicroLift       | Motion | `components/motion/MicroLift.tsx`      | Fade-up into view; hover lift; tap press                |

Reduced motion (`useReducedMotionSafe`, SSR-safe): Lenis never mounts, all
primitives render their final state, the route transition is skipped, and
`<html data-reduced-motion="true">` mirrors the signal for CSS and E2E.
`CorridorTrace` exposes `data-corridor-active` for the same purpose. Live
demos: `/styleguide` section 05 (MO-1…MO-7); the wipe fires on navigation.

## Network map — Prompt 03

Maa Sheetla's 78-hub geometry, verbatim outline + projection, rebuilt with
a GSAP entrance and Motion finishing. Full port inventory:
`docs/map-port.md`. Live demos: `/styleguide` section 06 (MP-1 hero, MP-2
full + directory).

| Piece             | File                                                                           |
| ----------------- | ------------------------------------------------------------------------------ |
| Outline + islets  | `components/map/india-outline.ts`                                              |
| Projection        | `components/map/projection.ts`                                                 |
| Corridor arcs     | `components/map/corridor.ts`                                                   |
| Map component     | `components/map/IndiaNetworkMap.tsx`                                           |
| Directory         | `components/map/HubDirectory.tsx`                                              |
| Shared selection  | `components/map/MapSelection.tsx`                                              |
| Hub data (gen.)   | `src/content/hubs.ts`                                                          |
| Generator + check | `scripts/generate-hubs.mts`, `scripts/verify-hubs.mts` (`npm run verify:hubs`) |

## Site chrome — Prompt 04

Header, mobile sheet, footer and the WhatsApp affordances. Chrome copy and
link data live in `src/content/navigation.ts`; every `null` fact in
`company.ts` removes its element, so no empty rows render.

| Piece         | Owner      | File                                   | Behaviour                                                                                                                                                                                    | Reduced-motion behaviour                                 |
| ------------- | ---------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Header        | GSAP       | `components/chrome/Header.tsx`         | Hairline fades in past 24px (`toggleClass`); bar hides past 120px on scroll-down, reveals on scroll-up (`yPercent`, 0.35s)                                                                   | Slide resolves instantly; hairline still toggles         |
| Nav underline | Motion     | `components/chrome/Header.tsx`         | 1px accent bar shared by `layoutId="nav-underline"`; inactive links draw on hover (origin-left, 0.3s, CSS)                                                                                   | Underline appears with no travel                         |
| Quote CTA     | React Bits | `components/chrome/Header.tsx`         | The one filled button (`--ink` on paper, `--accent-ink` on hover), wrapped in `Magnet` (strength 10)                                                                                         | `Magnet` renders its static wrapper (also on touch)      |
| Mobile sheet  | Motion     | `components/chrome/MobileMenu.tsx`     | Portaled full-screen `--paper` panel, clip-path circle from the trigger (0.5s), links staggered 24px / 0.06s; hamburger ⇄ ×; focus trapped, Escape closes, `lenis.stop()` + pinned body lock | Panel opens at final clip-path, links land instantly     |
| Footer        | none       | `components/chrome/Footer.tsx`         | One display line + outline quote button, then Company / Services / Help / Reach us columns (empty columns dropped)                                                                           | Static                                                   |
| Hub band      | React Bits | `components/chrome/Footer.tsx`         | `LogoLoop` of hub cities, `.label-caps`, `·` separator in accent, slow (60s), pauses on hover + offscreen, `aria-hidden`                                                                     | Renders the whole list statically, wrapped and unclipped |
| WhatsApp      | Motion     | `components/chrome/WhatsAppButton.tsx` | Header chip (≥`lg`) and mobile FAB (56px, appears past 600px, absent on `/quote`); both absent when `company.whatsapp` is null                                                               | FAB fades in at scale 1 with no travel                   |
| Skip link     | none       | `components/chrome/SkipLink.tsx`       | First focusable element, targets `<main id="main" tabIndex={-1}>`                                                                                                                            | Unchanged                                                |

Two decisions worth keeping:

- **The sheet is portaled to `<body>`.** GSAP leaves a `transform` on the
  header while the bar is hidden, and a transformed ancestor becomes the
  containing block for `position: fixed` — the panel would have collapsed into
  the 64px bar. Portalling also keeps the dialog out of the `banner` landmark.
- **The panel is not `aria-modal`.** The hamburger in the header is the close
  control, so the header has to stay live for AT; the Tab ring is therefore
  trapped by hand across `[trigger, …panel focusables]` and focus returns to
  the trigger on close.

`LogoLoop` gained `separator`, `separatorClassName`, `itemClassName` and
`decorative` props (defaults reproduce the ported Maa Sheetla band) plus the
static wrapped list under reduced motion — it is the only vendor component the
chrome touched.

Layout order (`src/app/layout.tsx`): fonts → `MotionProviders` →
`MapSelectionProvider` → `SkipLink` → `Header` → `<main id="main">` →
`Footer` → floating `WhatsAppButton` → `Toaster` (mounted once, here).
Route transitions stay in `template.tsx` (Prompt 02). Metadata carries
`title.template = "%s · DharmaShree Logistics"` and a description from
`company.tagline` when it is set.

## Home page — Prompt 05

Editorial home page: numbered sections, hairline separators, asymmetric
12-column grids. Page copy lives in `src/content/home.ts`; the industry lines
under the carousel cards are in `src/content/industries.ts`. `src/app/page.tsx`
only orders the sections and exports the route metadata (title + the hero line
as the description).

| Piece       | Owner                 | File                                                     | Behaviour                                                                                                                                     | Reduced-motion behaviour                                |
| ----------- | --------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Hero        | GSAP                  | `components/home/HeroSection.tsx`                        | H1 split by GSAP `SplitText` (lines, `mask: "lines"`, `GSAP_EASES.reveal`, 0.08 stagger); copy, CTAs and map follow at 0 / ×2 / ×3 / ×4 of it | Everything lands in place; the text is never hidden     |
| Hero map    | GSAP (inside the map) | `components/map/MapCanvas.tsx`                           | Map lazy-mounted (`ssr: false`) behind a reserve box sized from `INDIA_VIEWBOX` and capped by width (52vh ⇒ never taller than 60vh)           | Entrance resolves to its final state                    |
| Stats strip | React Bits            | `components/home/StatsStrip.tsx`                         | `<dl>` ledger with hairline dividers, `CountUp` (en-IN) on enter; hidden below two facts; `foundedYear` is a plain "Since 2016"-style value   | Final numbers, no count-up                              |
| Services    | Bits + Motion + GSAP  | `components/home/ServicesSection.tsx`, `ServiceTile.tsx` | Asymmetric 7/5 grid (first tile tall, next two stacked, rest side by side); `SpotlightCard` surface, optional photo in `ImageCurtain`         | No spotlight, no wipe; arrow does not lift (also touch) |
| Network     | GSAP                  | `components/home/NetworkSection.tsx`                     | Derived hub/region count line, `mode="full"` map, then the real `HubDirectory` clipped to a 24rem box at `lg` with `overscroll-contain`       | Section heading static; map entrance resolves           |
| Process     | GSAP                  | `components/home/ProcessSection.tsx`                     | One scrub timeline (`scrub: 0.6`, `+=250%`) pins a `100svh` stage: rail nodes fill with `--accent`, step text and big numeral crossfade       | No pin — four `Reveal`ed rows on a static rail          |
| Industries  | Lightswind            | `components/home/IndustriesSection.tsx`                  | `ScrollCarousel` pin+scrub band, one hairline card per industry (heading outside the pinned band)                                             | Vendored native horizontal strip, no pin                |
| Commitments | GSAP (`DrawLine`)     | `components/home/CommitmentsSection.tsx`                 | Three statements set large with drawn accent hairlines between them; no icons, no cards                                                       | Lines present, undrawn                                  |
| Quote band  | React Bits            | `components/home/QuoteBand.tsx`                          | Inverted `--ink` band with the page's second filled CTA (`--paper` on ink, `Magnet`) + WhatsApp text link                                     | `Magnet` static, no travel                              |

House rules on this page:

- **One filled button per viewport.** The page ships two — hero and quote band
  — and they never share a viewport, because the hero is a full 100svh. The
  header's CTA is chrome from Prompt 04 and behaves identically everywhere.
- **Absent, not empty.** Every `company` number is `null`, so the stats strip
  renders nothing; the branch chip (`company.branches`) and the WhatsApp row
  (`navigation.whatsappLink()`) are gated the same way. The services section was
  gated the same way until Prompt 06 filled `services.ts` — it renders now with
  no component having changed.
- **`useMediaQuery()`** (`src/hooks/`) is the shared matchMedia primitive
  (`useSyncExternalStore`, `false` on the server) behind the process section's
  pin swap and every `useHoverCapable()` hover gate.
- **`hasImage(key)`** (exported by `components/media/ResponsiveImage.tsx`)
  lets a tile skip its image slot entirely instead of showing a placeholder —
  which is what every tile does today, since the manifest is empty.
- **No Tailwind transform utilities on tweened elements.** `scale-0`/`translate-y-*`
  compile to the standalone v4 properties, which a GSAP tween's `transform`
  cannot override; pre-tween states are therefore expressed with `opacity-*`
  (inline styles written by GSAP win over classes).

## Services — Prompt 06

`/services` plus five statically generated `/services/[slug]` pages. The
catalogue _is_ the content: `src/content/services.ts` holds the five entries
(each `name` being the fact mirrored in `company.services`) and the copy for
both routes, while `src/content/fleet.ts` derives the fleet grid as the
deduplicated union of every service's `vehicles` — a vehicle string appears
there and nowhere else, and a vehicle with no note still renders as a name-only
card.

| Piece           | Owner            | File                                                      | Behaviour                                                                                                                                                                                                                                                                                                                 | Reduced-motion behaviour                                             |
| --------------- | ---------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Index rows      | Motion           | `components/services/ServiceRow.tsx`                      | Full-width row (number, name at `--step-4`, summary, arrow) inside an `<ol>` of hairlines; one `whileHover` label drives the `--paper-2` wash and the 6px arrow travel. The whole row is one `<Link>`                                                                                                                     | `whileHover` is never attached, so the row sits at its rest state    |
| Cursor preview  | Motion           | `components/services/ServicesIndexList.tsx`               | One pointer listener on the list, one 280px frame following the cursor through `useSpring`. Because the list clears on its own edge, moving between rows swaps the picture instead of blinking the frame off. Clamped inside the list's own box                                                                           | Not mounted at all                                                   |
| Fleet grid      | Lightswind       | `components/services/FleetSection.tsx`                    | `InteractiveCard` grid; the vendored tilt and lift stay, the hover elevation is switched off with the new `shadow={false}` prop (defaults to on, so the styleguide demo is untouched). Heading is a plain h2                                                                                                              | Card does not tilt or lift                                           |
| Detail blocks   | GSAP + Origin UI | `src/app/services/[slug]/page.tsx`                        | Blocks are assembled in order, then numbered by position _after_ the empty ones are dropped: warehousing has no `vehicles`, so its page runs 01–04 with no gap. "What's included" is a `DrawLine`-divided list, "Questions" the Origin accordion, "Lanes from Surat" the lazy `MapCanvas`                                 | Section headings land in place; the accordion still opens and closes |
| Detail aside    | React Bits       | `src/app/services/[slug]/page.tsx`                        | `lg:sticky lg:top-24 lg:self-start` — `self-start` is what leaves it room to travel, and because the card lives inside the grid it can never reach past the section into the footer. Holds the page's only filled button (`Magnet` + `--ink`, to `/quote/?service=<slug>`) and contact rows that disappear with the facts | `Magnet` static                                                      |
| Index page      | GSAP (heading)   | `src/app/services/page.tsx`                               | H1 band → the rows → the fleet band. No CTA band of its own: the rows lead to pages whose aside already holds the filled button, and a second one here would only compete with the header's                                                                                                                               | `SectionHeading` lands in place, the lede `Reveal` is instant        |
| Catalogue copy  | none             | `src/content/services.ts`, `src/content/fleet.ts`         | The list is the truth and the note is keyed by that exact name; `servicesIndex` / `serviceDetail` carry every string the two routes render                                                                                                                                                                                | Static                                                               |
| Catalogue check | none             | `scripts/verify-services.mts` (`npm run verify:services`) | Fails when `services.ts` and `company.services` stop being one-for-one, when a slug is not url-safe or repeats, when a bullet is shared across two services, or when a fleet note has no service listing it                                                                                                               | n/a                                                                  |

Three supporting moves:

- **`MapCanvas` moved** from `components/home/` to `components/map/` now that the
  service pages mount a mini map too. The reserve box and the width cap that
  keep the hero shift-free are exactly what a small map needs, so nothing about
  the component changed.
- **`ServiceTile` asks `serviceImageKey(service)`** for its manifest key, so
  `Service.image` can point anywhere in the manifest instead of being tied to
  `services/<slug>`. `fleet.ts` follows the same rule with `vehicleImageKey`.
- **The preview is expensive to earn**: mounted only when `useHoverCapable()`,
  not reduced, at `lg`, for `pointerType === "mouse"`, and only if at least one
  service actually has a photo. With `image-manifest.json` empty that is never,
  so the index costs nothing and the keyboard path never sees it.

Filling `services.ts` also flips two things from _absent_ to _real_ without any
component changing: the home page's "01 — What we move" section and the footer's
Services column — both are built from that list, which is why
`scripts/verify-services.mts` exists.

`navigation.ts` gained one function, `quoteHrefForService(slug)`, which returns
`/quote/?service=<slug>`: the trailing slash is written because
`trailingSlash: true` means internal routes resolve that way, and the query is
how `/quote` will know which service the visitor was reading.

`/services/[slug]` is `generateStaticParams`-only, as `output: "export"` can
serve nothing else; an unknown slug falls through `notFound()` to the static
404 (dev logs Next's export validation for that request — closing
`dynamicParams` only trades the 404 for a 500, so it stays open and unused).
Type scale: `globals.css` maps `--text-step-2/3/4` to the three steps below
`--text-headline`, so a row title is set with `text-step-4` rather than a
literal size (house rule 5).
