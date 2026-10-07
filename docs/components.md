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
