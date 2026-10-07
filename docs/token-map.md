# Token map — Maa Sheetla → DharmaShree Logistics

Source: `princepatel04477-web/maa_sheetla` (`main` branch, plain HTML + Next.js
App Router hybrid). Every stylesheet was read in full:

- `assets/css/tokens.css` (primitive vars)
- `assets/css/base.css` (type, buttons, reveal)
- `assets/css/components.css` (rail, nav, hero panels, stats, map, tiles, footer)
- `app/globals.css` (Tailwind v3 base + custom utilities)
- `tailwind.config.js` (theme extension — colours, fonts, radius, shadows, keyframes)
- All 13 `.html` files link the same three CSS files; none contain inline
  `<style>` blocks (verified via repo tree + `index.html` head audit).
- TSX class usage (`components/*.tsx`, `app/page.tsx`, `app/layout.tsx`) was
  sampled for arbitrary values (`text-[10.5px]`, `tracking-[0.24em]`,
  `leading-[0.95]`, hex literals) to capture values that never became variables.

Precedence: the Next.js layer (`app/globals.css`, `tailwind.config.js`, TSX)
wins over the legacy static layer (`assets/css/*`, which still contains TODO
copy and is superseded). Conflicts are noted below.

No dark theme exists in the source (`colorScheme: 'light'`, light `themeColor`
for both schemes) — so none is created here.

Contrast ratios below are relative luminance vs `--paper` (#FCFBF7) unless noted.

## 1. Colour roles

| Our token           | Value                | Source value                                   | Contrast | Notes                                                                                                                                                                                                            |
| ------------------- | -------------------- | ---------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--paper`           | `#FCFBF7`            | `--warp: #FCFBF7` (verbatim, all layers)       | —        | Required value.                                                                                                                                                                                                  |
| `--paper-2`         | `#FFFFFF`            | `--selvedge: #FFFFFF` (verbatim)               | —        | Cards, header, ledger band.                                                                                                                                                                                      |
| `--paper-3`         | `#F6F2EC`            | `--selvedge-light: #F6F2EC` (verbatim)         | —        | Deepest neutral, badges, inputs, photo backdrop.                                                                                                                                                                 |
| `--ink`             | `#1C1917`            | `--khadi: #1C1917` (verbatim)                  | 16.89:1  | Primary text.                                                                                                                                                                                                    |
| `--ink-2`           | `#665E59`            | `--ash: #665E59` (verbatim)                    | 6.13:1   | Secondary text.                                                                                                                                                                                                  |
| `--muted`           | `#665E59`            | `--ash` (deliberate alias)                     | 6.13:1   | Source has no separate caption colour; captions use ash (sometimes `ash/70`, `ash/60` — those fades fail AA and are not ported). Alias keeps one canonical muted. ✓ ≥ 4.5:1                                      |
| `--line`            | `rgba(28,25,23,.08)` | `--hairline` (verbatim)                        | —        | Hairlines, borders.                                                                                                                                                                                              |
| `--line-strong`     | `rgba(28,25,23,.18)` | `--hairline-strong` (verbatim, globals+config) | —        | Stronger borders. (Legacy `tokens.css` lacks it; globals wins.)                                                                                                                                                  |
| `--accent`          | `#8B2628`            | `--kumkum: #8B2628` (verbatim)                 | 8.43:1   | Brand maroon: outline buttons, fills, `::selection`, focus ring, badges. White-on-accent 8.73:1 ✓ (the one filled CTA).                                                                                          |
| `--accent-ink`      | `#6D1B1D`            | `--kumkum-deep: #6D1B1D` (verbatim)            | 11.11:1  | Darker accent for small text on paper.                                                                                                                                                                           |
| `--signal`          | `#A67C26`            | `--marigold: #A67C26` (verbatim)               | 3.67:1   | Source HAS a distinct highlight, so `--signal` ≠ accent. Display-size numerals/accents (≥24px, passes 3:1), icon strokes, dividers, map corridor trace. NEVER small text (fails 4.5:1).                          |
| `--gold-deep`       | `#8A6715`            | `--haldi: #8A6715` (verbatim)                  | 5.03:1   | Small gold text: section indexes, italic display accents, stat numerals at small sizes. Extra token beyond the prompt's list — required so components never hard-code the source's second brand colour (rule 5). |
| `--scrollbar-thumb` | `#E5DFC8`            | `::-webkit-scrollbar-thumb` (verbatim)         | —        | WebKit scrollbar; hover is `--signal` (verbatim).                                                                                                                                                                |
| `--map-ground`      | `#111016`            | `.mapbox` background (verbatim)                | —        | Dark map panel (Prompt 03).                                                                                                                                                                                      |
| `--map-land`        | `#29232a`            | `.india` fill (verbatim)                       | —        | Map landmass (Prompt 03).                                                                                                                                                                                        |
| `--map-land-stroke` | `#665154`            | `.india` stroke (verbatim)                     | —        | Map land outline (Prompt 03).                                                                                                                                                                                    |

### Deliberate deviations & omissions

- **Section index colour.** Maa Sheetla's `02 — THE REACH` eyebrow is marigold
  (`#A67C26`, 3.67:1 — fails AA at 10.5px). House rule 11 (AA at real size)
  overrides strict fidelity: `.section-index` uses `--gold-deep` (same hue
  family, 5.03:1 ✓). The marigold look is preserved at display sizes and in
  non-text accents.
- **No dark theme.** Source has none; none created.
- **Loader palette not ported.** `WebsiteLoader` uses ~20 one-off hexes
  (`#F7EFE9`, `#E5C383`, `#E0A899`, `#D8C6A5`, `#D0B8B0`, `#A69E96`, `#8C837B`,
  `#EDE6DF`, `#FAF8F5`, `#C2953B`, `#2D1214`, `#1D0C0D`, …). They are local to
  the loader cinematic; if Prompt 04 ports the loader, its tokens are added then.
- **Static-HTML-only values not ported.** `.tile` gradient (`#2b2021→#171319`),
  `.panel` overlay (`rgba(12,10,14,…)`), `.rail` bar — no TSX usage; superseded
  by Next components.
- **`.btn` recipe preserved (no token).** Outline button = 1px `--accent`
  border, mono 10px, `.14em` tracking, uppercase, `13px 17px` padding
  (`base.css`). Prompt 04/05 builds `Button` from this; no token needed.

## 2. Typography

### Families (verbatim stacks)

| Our token        | Value                                                                         | Source                                                                                                                                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--font-display` | `var(--font-display-face), var(--font-display-accent), Georgia, serif`        | `globals.css`: `'Fraunces', 'Instrument Serif', Georgia, serif`. The two `var()`s are `next/font/local` families (self-hosted, see §5); fallbacks match the source order.                                                                |
| `--font-sans`    | `var(--font-body), "DM Sans", system-ui, sans-serif`                          | `globals.css`: `'DM Sans', system-ui, sans-serif`. (Legacy `tokens.css` lists Inter — superseded.)                                                                                                                                       |
| `--font-mono`    | `var(--font-mono-face), "JetBrains Mono", "DM Mono", ui-monospace, monospace` | Merged from `globals.css` (`'JetBrains Mono', 'DM Mono', monospace`) + `tailwind.config.js` (`var(--font-mono), JetBrains Mono, ui-monospace, monospace`). `DM Mono` is an unloaded name fallback (never reached while JetBrains loads). |

Weights in use (TSX census): `font-light` (65×, display + body 300),
`font-medium` (53×, mono labels/badges 500), `font-semibold` (18×, year pills
600), `font-normal` (7×, 400), `font-bold` (1×). Variable files cover 100–900.

### Size scale

The source has no `--step` scale (legacy `--step: 8px` is spacing, not type).
Static steps are taken from the Tailwind scale points used in TSX; fluid steps
are the two verbatim `clamp()`s from `base.css`.

| Our token   | Value                                      | Source                                                                                                                         |
| ----------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `--step--1` | `0.65625rem` (10.5px)                      | `.eyebrow` 10.5px (globals; `base.css` says 10px — globals wins). Also `9.5px` ledger micro-labels (secondary, utility class). |
| `--step-0`  | `0.875rem` (14px)                          | Dominant body size (`text-sm`).                                                                                                |
| `--step-1`  | `1rem` (16px)                              | Base/lede (`text-base`).                                                                                                       |
| `--step-2`  | `1.25rem` (20px)                           | Card titles (`text-xl`).                                                                                                       |
| `--step-3`  | `1.875rem` (30px)                          | `text-3xl` display subheads.                                                                                                   |
| `--step-4`  | `2.25rem` (36px)                           | `text-4xl` (mobile side of `text-4xl sm:text-6xl` heroes).                                                                     |
| `--step-5`  | `clamp(2.625rem, 5vw, 4.375rem)` (42→70px) | Verbatim `h2.display` clamp (`base.css`).                                                                                      |
| `--step-6`  | `clamp(3.25rem, 8vw, 7.5rem)` (52→120px)   | Verbatim `.display` clamp (`base.css`).                                                                                        |

`--step-0…4` intentionally equal Tailwind's `text-sm/base/xl/3xl/4xl`, so either
spelling renders identically; the fluid steps are additionally exposed as
`text-headline` (`--step-5`) and `text-display` (`--step-6`) utilities.

### Line-height, tracking, measure

| Our token            | Value           | Source                                                                                                                                 |
| -------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `--leading-display`  | `0.88`          | Verbatim `.display` (`base.css`).                                                                                                      |
| `--leading-headline` | `0.95`          | Verbatim `leading-[0.95]` heroes (TSX, 5×).                                                                                            |
| `--leading-body`     | `1.65`          | Verbatim `body` (`base.css`); TSX `leading-relaxed` (1.625) is the near-twin.                                                          |
| `--tracking-caps`    | `0.24em`        | Verbatim `.eyebrow` (`globals.css`; `base.css` says `.22em` — globals wins). `tracking-[0.2em]` ledger labels are the secondary voice. |
| `--tracking-display` | `-0.04em`       | Verbatim `.display` (`base.css`); TSX `tracking-tight` (−0.025em) is the secondary voice.                                              |
| `--measure`          | `28rem` (448px) | Prose measure = `max-w-md` (TSX, current). Static `.panel-copy p` 380px noted as predecessor.                                          |

## 3. Spacing, container, radius, shadow

| Our token                                  | Value                                                                     | Source                                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `--container`                              | `80rem` (1280px)                                                          | Verbatim `.wrap` max-width + `max-w-7xl` (9×). ≡ Tailwind `max-w-7xl`.                                                                 |
| `--gutter` / `--gutter-wide`               | `1.5rem` / `3rem`                                                         | `px-6 sm:px-12` section rhythm (24→48px). Static `6vw` noted as predecessor.                                                           |
| `--space-section` / `--space-section-wide` | `6rem` / `8rem`                                                           | `py-24 sm:py-32` section rhythm (96→128px). Static `.wrap` 120px/80px noted as predecessor.                                            |
| (spacing scale)                            | Tailwind v4 dynamic                                                       | Source extends v3 with `0.2/5.5/13/17/18`; v4 derives any multiple from `--spacing`, so `pl-5.5`, `h-13/17/18` resolve with no config. |
| `--radius-2xs`                             | `1px`                                                                     | Verbatim (`tailwind.config.js`). Badges.                                                                                               |
| `--radius-xs`                              | `2px`                                                                     | Verbatim. Cards, inputs.                                                                                                               |
| `--radius-sm`                              | `2px`                                                                     | Source `rounded-sm` = 2px (v3 default); v4 default is 4px, so overridden back to 2px for fidelity.                                     |
| `--shadow-2xs`                             | `0 1px 2px rgba(28,25,23,0.04)`                                           | Verbatim.                                                                                                                              |
| `--shadow-xs`                              | `0 1px 3px rgba(28,25,23,0.07), 0 1px 2px rgba(28,25,23,0.04)`            | Verbatim.                                                                                                                              |
| `--shadow-accent-glow`                     | `0 0 30px rgba(139,38,40,0.18)`                                           | Verbatim `kumkum-glow`, renamed to our colour name.                                                                                    |
| `--shadow-signal-glow`                     | `0 0 30px rgba(166,124,38,0.18)`                                          | Verbatim `marigold-glow`, renamed.                                                                                                     |
| `--shadow-card`                            | `0 4px 20px -2px rgba(28,25,23,0.06), 0 2px 6px -1px rgba(28,25,23,0.04)` | Verbatim `selvedge-card`, renamed.                                                                                                     |
| `--shadow-card-lift`                       | `0 4px 20px -2px rgba(28,25,23,0.10), 0 2px 6px -1px rgba(28,25,23,0.06)` | Verbatim `agency-card`, renamed.                                                                                                       |

Header geometry (for Prompt 04; not tokens): fixed header `h-20 sm:h-24`
(80/96px) → anchor `scroll-margin-top: 5.5rem / 7rem` (ported to `globals.css`).

## 4. Motion keyframes (ported to `globals.css`, not tokens)

Verbatim from `tailwind.config.js` + `globals.css`: `shimmer` (4.5s text sheen —
`.shimmer-text` class ported although currently unused in TSX, brand gradient
not stock), `pulseSubtle` 3s, `float` 6s, `marquee`/`marqueeReverse` 35s linear,
plus the `.marquee-track` GPU wrapper. iOS/Android guards ported verbatim:
16px-min form text under 768px, 44px coarse-pointer targets, `safe-x`/`safe-b`
insets, `overscroll-behavior-y: contain`, tap-highlight removal,
`-webkit-text-size-adjust: 100%`.

`prefers-reduced-motion` ported verbatim (durations → 0.01ms) and extended per
house rule 9 by the motion layer in Prompt 02.

Focus ring (house rule 11) has no source equivalent (only one ad-hoc
`focus-visible:ring` in TSX): derived as `2px solid var(--accent)` with `3px`
offset (8.43:1 on paper ✓), documented here as an addition, not a port.

## 5. Fonts — self-hosted via `next/font/local`

Maa Sheetla loads Google Fonts via `<link>` (Fraunces opsz+wght + italics,
DM Sans opsz+wght + italics, JetBrains Mono 300–500, Instrument Serif 400 +
italic, DM Mono). This repo self-hosts byte-identical Google binaries sourced
from Fontsource npm packages (the build sandbox has no Google Fonts access,
and self-hosting removes a render-blocking third party for the static export):

| File (`src/fonts/`)                                 | Provenance                                                                       | Coverage                   |
| --------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------- |
| `fraunces-var-latin-normal.woff2` (65.8 KB)         | `@fontsource-variable/fraunces` → `fraunces-latin-standard-normal.woff2`         | wght 100–900, latin        |
| `fraunces-var-latin-italic.woff2` (79.6 KB)         | same package, italic file                                                        | wght 100–900 italic, latin |
| `dm-sans-var-latin-normal.woff2` (61.2 KB)          | `@fontsource-variable/dm-sans` → `dm-sans-latin-standard-normal.woff2`           | wght 100–900, latin        |
| `dm-sans-var-latin-italic.woff2` (74.5 KB)          | same package, italic file                                                        | wght 100–900 italic, latin |
| `jetbrains-mono-var-latin-normal.woff2` (39.5 KB)   | `@fontsource-variable/jetbrains-mono` → `jetbrains-mono-latin-wght-normal.woff2` | wght 100–900, latin        |
| `instrument-serif-latin-400-normal.woff2` (20.5 KB) | `@fontsource/instrument-serif`                                                   | 400, latin                 |
| `instrument-serif-latin-400-italic.woff2` (21.6 KB) | same package                                                                     | 400 italic, latin          |

`display: 'swap'` everywhere (verbatim behaviour). Preload: display face +
body regular/italic variable files only (prompt requirement); mono and
Instrument Serif load on demand. `latin-ext` subsets omitted (copy is English;
`latin` covers U+0000–00FF incl. accented Latin). DM Mono + Inter kept as
unloaded fallback names only (see §2).
