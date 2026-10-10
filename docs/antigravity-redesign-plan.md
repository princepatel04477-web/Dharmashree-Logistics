# Colour & logistics redesign: plan for Antigravity

**Why:** the client's feedback is that the site is not colourful enough and
does not read as a logistics business. The current look comes from the Maa
Sheetla direction: cream paper, maroon hairlines, a serif display face and no
photography. That suits an editorial brand, but a freight company needs to show
trucks, roads, cartons and warehouses, in its own brand colours.

**What stays:** the routes, the content files (`src/content/**`), the honest
track hand-off, the India network map and its data, the quote flow, the
Apps Script pipeline, TypeScript strict, no `console.*`, rule 4 (facts only from
`company.ts`), reduced-motion support, accessibility and Indian formatting.

**What changes:** the palette, display type, photography, section backgrounds
and the footer. Rules 5–7 in `AGENTS.md` are rewritten in Phase 0. Antigravity's
agent reads `AGENTS.md` and will refuse colour fills and photos while the old
rules are in place.

How to use this file: run the phases in order. Each phase has a prompt block
you paste into Antigravity's agent panel as one task. Review its diff and the
browser check before starting the next phase.

---

## Brand palette (from the logo)

Sampled from `public/brand/dharmashree-logo.png`:

| Token          | Hex       | Source / use                                                                                                                                |
| -------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `--brand`      | `#2860B0` | The "dharma" lettering. Primary colour: links, icons, active nav, filled CTA. White text on it is about 6.2:1 (AA).                         |
| `--brand-deep` | `#123A73` | Darker blue for full-width bands (hero overlay, quote band, footer).                                                                        |
| `--brand-tint` | `#EAF1FB` | Pale blue section ground, alternating with white.                                                                                           |
| `--signal-red` | `#FF3131` | The dot after श्री. Small accents only: status dots, the map's Surat pin, small badges. Never body text (too low contrast on white).        |
| `--highway`    | `#F5A623` | Highway-sign amber, for highlights such as step numbers, map corridors on dark ground and underline marks. Text on amber is always `--ink`. |
| `--ink`        | `#14171F` | Body text, a cooler near-black that sits better beside the blue than the current warm ink.                                                  |
| `--paper`      | `#FFFFFF` | Main ground (from the current cream).                                                                                                       |
| `--paper-2`    | `#F5F7FA` | Card ground on tinted sections.                                                                                                             |

The maroon `--accent` and gold `--signal` are retired. Keep their token names
as aliases for one release (`--accent: var(--brand)`) so nothing breaks, then
remove the aliases in Phase 6.

---

## Phase 0: rules and tokens

```text
Read AGENTS.md, docs/token-map.md, src/styles/tokens.css and src/app/globals.css.

The client wants a more colourful site that reads clearly as a logistics
company. Update the house rules and tokens. Do not touch any page yet.

1. In AGENTS.md, replace rules 5, 6 and 7 with:
   5. Visual language = "DharmaShree Blue". Tokens live in src/styles/tokens.css.
      Never hard-code a hex value or font-family in a component.
   6. Colour use: --brand (logo blue) is the primary colour for links, icons, the
      active nav item and the filled primary CTA. --brand-deep is for full-width
      bands (hero overlay, quote band, footer). --brand-tint and --paper-2
      alternate as section grounds. --signal-red is only for small marks (status
      dots, the Surat pin, badges). --highway amber is only for highlights, and
      text on it is always --ink. Every page has at most two filled buttons: the
      primary "Request a quote" (brand fill) and one secondary action.
   7. Forbidden: countdown timers, star ratings, fake testimonials, invented
      client logos, "limited offer" banners, pop-up modals on load, emoji in UI,
      glassmorphism stacks, rainbow or multi-hue gradients. Allowed: photography
      from assets/originals (through ResponsiveImage), a single-hue --brand-deep
      overlay on photos for text legibility, and icon badges on --brand-tint.
      No AI-generated image may show readable text, logos, number plates, or
      people presented as DharmaShree staff or customers.
   Keep every other rule unchanged.

2. In src/styles/tokens.css, add --brand #2860B0, --brand-deep #123A73,
   --brand-tint #EAF1FB, --signal-red #FF3131, --highway #F5A623, set --ink
   #14171F, --paper #FFFFFF, --paper-2 #F5F7FA, --paper-3 #EEF2F7, set --line to
   rgba(20,23,31,.10) and --line-strong to rgba(20,23,31,.20). Alias the old
   names for now: --accent: var(--brand); --accent-ink: var(--brand-deep);
   --signal: var(--highway). Raise --radius-xs and --radius-sm to 6px and add
   --radius-md 12px. Re-map the --map-* tokens: land --paper-2, served land
   --brand-tint, corridors color-mix(in srgb, var(--brand) 35%, transparent).

3. Expose the new tokens as Tailwind utilities in globals.css (bg-brand,
   text-brand, bg-brand-deep, bg-brand-tint, text-signal-red, bg-highway…) in
   the same way the existing tokens are exposed.

4. Update docs/token-map.md with the new table and the reason (client
   feedback, palette sampled from the logo).

Run `npm run typecheck` and `npm run lint`. Open /, /track and /styleguide at
1280 px and confirm nothing is broken before you finish.
```

---

## Phase 1: type

The serif display (Fraunces / Instrument Serif) is a big part of why the site
reads as a magazine and not a freight company. Switch headings to a sturdy sans
with a condensed axis, so they read like highway signage.

```text
Replace the display font. Download Archivo (variable, wght 400–800, wdth 62–125,
latin subset) as woff2 into src/fonts/, register it in src/app/fonts.ts in place
of Fraunces and Instrument Serif, and point --font-display-face at it. Keep DM
Sans for body text and JetBrains Mono for the small-caps labels.

Display headings: weight 700, font-stretch 88%, tracking -0.02em, leading 1.0.
Remove `font-light` from every heading that uses `font-display` (search the
repo), and change --leading-display to 1.0 and --leading-headline to 1.05.
Delete the unused serif woff2 files.

Check /, /about, /services/full-truckload and /track at 360 and 1440 px. No
heading may overflow or clip.
```

---

## Phase 2: generate the photographs

Generate every image below with Antigravity's image tool (or Gemini / Imagen,
Midjourney or similar), save it as PNG at the given path, then run
`npm run images`. The pipeline writes AVIF, WebP and JPG at 480–2400 px plus the
blur placeholders, and `ResponsiveImage` picks them up by key (`group/name`).

**Replace with real photos when you can.** Real photos of DharmaShree's own
trucks, godown and Surat desk always beat generated ones. Keep the same file
names and the swap needs no code change.

### Style block: prepend this to every prompt

```text
Photorealistic commercial photography for an Indian freight and logistics
company based in Surat, Gujarat. Shot on a full-frame camera, 35mm lens,
natural light, crisp detail, realistic colour. Colour accents that appear
naturally in the scene: cobalt blue (#2860B0) truck bodies, tarpaulins, crates
or uniforms, with small touches of red and highway-amber. Clean, modern,
optimistic, organised. Indian setting, Indian roads and architecture.
Strictly no readable text, no letters, no logos, no brand names, no number
plates, no watermarks, no signatures. No faces in close-up: people appear at a
distance, from behind, or as hands only.
```

### Negative prompt (if the tool accepts one)

```text
text, letters, words, logo, brand name, watermark, signature, number plate,
license plate, distorted wheels, extra wheels, melted vehicles, warped
perspective, cartoon, illustration, CGI look, oversaturated, HDR halos, heavy
film grain, face close-up, deformed hands, extra fingers
```

### Shot list

| #   | Save as                                              | Ratio / min size | Where it is used                       | Prompt (after the style block)                                                                                                                                                                                                                                                                                                                                                                        |
| --- | ---------------------------------------------------- | ---------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `assets/originals/hero/highway-golden-hour.png`      | 16:9, 2400×1350  | Home hero, desktop                     | A cobalt-blue 32-foot closed-container truck driving on a wide six-lane Indian expressway at golden hour, shot from a low three-quarter front angle on the roadside. Flat Gujarat farmland and a distant line of trees, warm sun low on the left, long shadows, slight motion blur on the road. The truck sits in the right third of the frame and the left half is open sky and road for a headline. |
| 2   | `assets/originals/hero/highway-portrait.png`         | 4:5, 1600×2000   | Home hero, mobile                      | The same scene as a vertical frame: the cobalt-blue container truck coming towards the camera on an Indian expressway at golden hour, filling the lower half, with open warm sky in the upper half for text.                                                                                                                                                                                          |
| 3   | `assets/originals/services/express-parcel.png`       | 3:2, 2400×1600   | Express Parcel tile and page           | A modern parcel sorting hub in India: a long conveyor of brown cartons and blue poly mailers, workers in cobalt-blue T-shirts and hi-vis vests sorting by hand, seen from a slightly high angle, bright even overhead lighting, depth of field on the conveyor.                                                                                                                                       |
| 4   | `assets/originals/services/full-truckload.png`       | 3:2, 2400×1600   | Full Truckload tile and page           | Workers loading large wrapped bales of fabric into the open rear of a cobalt-blue closed-body truck backed up to a loading dock at a Surat textile mill, morning light, a hand pallet truck in the foreground, workers seen from behind.                                                                                                                                                              |
| 5   | `assets/originals/services/local-on-demand.png`      | 3:2, 2400×1600   | Local On-Demand tile and page          | A compact blue electric cargo three-wheeler moving through a busy, colourful Surat textile market street in the morning, shops with stacked fabric rolls, gentle motion blur, the vehicle sharp in the centre-left.                                                                                                                                                                                   |
| 6   | `assets/originals/services/warehousing.png`          | 3:2, 2400×1600   | Warehousing tile and page              | The interior of a clean, high-bay warehouse in India: tall blue steel racking with palletised cartons, an orange forklift in the aisle, polished concrete floor with yellow lane markings, LED high-bay lights, a strong one-point perspective down the aisle.                                                                                                                                        |
| 7   | `assets/originals/industries/textiles.png`           | 4:3, 2000×1500   | Industries: Textiles & apparel         | Close view of rolls of bright saree and dress fabric (saffron, magenta, emerald, cobalt) stacked on a warehouse shelf, some wrapped in clear poly, soft side light.                                                                                                                                                                                                                                   |
| 8   | `assets/originals/industries/diamonds-jewellery.png` | 4:3, 2000×1500   | Industries: Diamonds & jewellery       | Gloved hands placing a small sealed, tamper-evident courier pouch into a steel lockbox inside a secure vehicle, dark interior, a single cool light source, discreet and secure mood.                                                                                                                                                                                                                  |
| 9   | `assets/originals/industries/fmcg-retail.png`        | 4:3, 2000×1500   | Industries: FMCG & retail              | Shrink-wrapped pallets of plain brown cartons waiting in a distribution centre staging lane, a blue pallet jack, bright and orderly.                                                                                                                                                                                                                                                                  |
| 10  | `assets/originals/industries/pharma.png`             | 4:3, 2000×1500   | Industries: Pharma                     | Plain white medicine cartons on clean steel shelving in a bright, tidy storage room, blue shelf edges, a gloved hand scanning a carton with a handheld barcode scanner.                                                                                                                                                                                                                               |
| 11  | `assets/originals/industries/engineering.png`        | 4:3, 2000×1500   | Industries: Engineering & industrial   | Heavy machine parts and steel components strapped onto wooden pallets on a flatbed trailer, blue tarpaulin half pulled back, industrial yard in daylight.                                                                                                                                                                                                                                             |
| 12  | `assets/originals/process/enquiry.png`               | 1:1, 1600×1600   | Home "How a consignment moves", step 1 | Over-the-shoulder view of a logistics booking desk: a hand holding a phone, a laptop showing an abstract map with route lines (no readable text), a printed consignment slip, a blue pen, a bright office.                                                                                                                                                                                            |
| 13  | `assets/originals/process/pickup.png`                | 1:1, 1600×1600   | Step 2                                 | Cartons being lifted into the back of a blue light commercial truck outside a small Surat warehouse shutter, workers seen from behind, morning light.                                                                                                                                                                                                                                                 |
| 14  | `assets/originals/process/in-transit.png`            | 1:1, 1600×1600   | Step 3                                 | Aerial drone shot of a blue truck on a long straight Indian highway through green fields, the road making a strong diagonal line.                                                                                                                                                                                                                                                                     |
| 15  | `assets/originals/process/delivered.png`             | 1:1, 1600×1600   | Step 4                                 | Hands handing a sealed carton to another pair of hands at a shop counter, with a handheld scanner and signed slip on the counter, warm interior light.                                                                                                                                                                                                                                                |
| 16  | `assets/originals/pages/network-night.png`           | 21:9, 2400×1030  | `/network` page intro                  | Aerial long exposure of a large Indian highway interchange at dusk, white and red light trails, deep-blue sky, city lights at the horizon.                                                                                                                                                                                                                                                            |
| 17  | `assets/originals/pages/about-surat.png`             | 21:9, 2400×1030  | `/about` page intro                    | Wide view of the Surat skyline and the Tapi river at blue hour, a bridge with traffic light trails, calm water reflections.                                                                                                                                                                                                                                                                           |
| 18  | `assets/originals/pages/track-scan.png`              | 3:2, 2400×1600   | `/track` page intro                    | Close-up of a hand scanning the barcode on a parcel label (label blank, no readable text) with a handheld scanner, blue-toned warehouse background out of focus.                                                                                                                                                                                                                                      |
| 19  | `assets/originals/pages/partners-fleet.png`          | 21:9, 2400×1030  | `/partners` page intro                 | A row of three blue trucks parked side by side at a highway truck stop at sunrise, seen from a low angle, drivers walking away in the distance.                                                                                                                                                                                                                                                       |
| 20  | `assets/originals/pages/support-desk.png`            | 3:2, 2400×1600   | `/support` page intro                  | A support desk seen from behind: a person with a headset in front of two monitors with abstract dashboards (no readable text), bright office, blue accents.                                                                                                                                                                                                                                           |
| 21  | `assets/originals/pages/quote-yard.png`              | 21:9, 2400×1030  | Home quote band, `/quote` intro        | Top-down drone shot of a truck loading yard: rows of blue and white trucks at loading bays, cartons on pallets, strong geometric pattern.                                                                                                                                                                                                                                                             |
| 22  | `assets/originals/social/og-default.png`             | 1200×630         | Open Graph / WhatsApp link preview     | The image 1 scene reframed to 1.91:1, with the truck right of centre and open sky on the left.                                                                                                                                                                                                                                                                                                        |

**Check every image** before running `npm run images`. Look at the wheels
(count and shape), the truck cab, hands and fingers, and any surface where a
text-like scribble has appeared. Regenerate or crop if anything is wrong.

### Phase 2 prompt for the agent

```text
Generate the 22 images listed in docs/antigravity-redesign-plan.md ("Shot
list"), using the style block and the negative prompt. Save each one as PNG at
exactly the path given. Look at each result and regenerate any image that shows
readable text, a logo, a number plate, malformed wheels or malformed hands.
Then run `npm run images` and confirm that src/content/image-manifest.json has
22 entries.

Add an `images.ts` file in src/content/ that maps every slot to its manifest
key and its alt text (alt text describes what is in the photo, in plain
English, and never names DharmaShree as the owner of the vehicle or premises).
Components get keys and alt text from there, never from string literals.
```

---

## Phase 3: header, footer and new footer logo

```text
Header: white ground, logo unchanged (public/brand/dharmashree-logo.png). The
active nav item is --brand with a 2px --brand underline. "Request a quote" is
filled --brand with white text and goes --brand-deep on hover. Add a slim
utility bar above the header on lg+ only (32px, --brand-deep, white text): left
side `company.email` as a mailto link and `company.phone` if not null; right
side "Customer login" and "Consignee login" as plain <a> tags to
company.portals.customer and company.portals.consignee (target _blank, rel
noopener noreferrer). Every item hides when its value is null. The header must
keep its current hide-on-scroll behaviour, with the utility bar moving with it.

Footer: --brand-deep ground, white text at 0.85 opacity for links and full white
for headings, hairlines rgba(255,255,255,.12). The footer uses its own logo:
a) The client's footer logo source goes at
   assets/brand/dharmashree-footer-logo-source.png.
b) Extend scripts/build-brand.mts so it trims that file into
   public/brand/dharmashree-footer-logo.png and also writes a white version
   (every opaque pixel white, alpha kept) to
   public/brand/dharmashree-footer-logo-light.png for the blue ground.
   Print both sizes.
c) Add `footerLogo` to src/content/navigation.ts (src, width, height from the
   built file) and use it in src/components/chrome/Footer.tsx. The header keeps
   `logo`. Do not use the footer logo anywhere else.
The hub marquee band sits on rgba(255,255,255,.06) with amber separators. The
outline quote button in the footer becomes white outline with white text.

Run `npm run brand`, then check the footer at 360, 768, 1280 and 1440 px, and
check AA contrast for every text colour on --brand-deep.
```

---

## Phase 4: home page

Reference the Delhivery home page (`https://www.delhivery.com/`) for the
hero-plus-track-card layout only. Do not copy its copy, colours or imagery.

```text
Rebuild the home page sections in place. Copy stays in src/content/home.ts, and
any new strings are added there. Reuse existing components where they exist.

1. Hero (HeroSection.tsx): full-bleed photo (hero/highway-golden-hour,
   hero/highway-portrait below 768 px, via <picture> media or two
   ResponsiveImage slots), with a --brand-deep overlay from 85% on the left to
   10% on the right for text legibility. Left: eyebrow, H1 in white, the lede,
   and the brand-filled "Request a quote" button. Right (lg+), or below the
   text on mobile: a white card (radius --radius-md, shadow-card) with two
   tabs, "Track shipment" and "Get a quote". The Track tab renders the existing
   <TrackPanel /> from src/components/track/TrackPanel.tsx unchanged, including
   its Customer / Supplier and Consignee login buttons. The Quote tab shows
   origin and destination city fields and a button linking to /quote with
   those values as query params, which /quote already reads (check
   useQuoteEntry.ts; if it doesn't, add support there). Tabs use Motion
   layoutId for the active underline.

2. Facts strip (StatsStrip.tsx) on --brand: renders only the company.ts facts
   that are not null (rule 4). If all are null, it renders the four services as
   icon + label chips instead of numbers. Never invent a number.

3. Services (ServicesSection.tsx + ServiceTile.tsx): four photo cards in a
   2×2 grid on lg (one column on mobile). Photo on top (services/*), a
   --brand-tint icon badge with a lucide icon (Package, Truck, Bike, Warehouse),
   title, one line, and an arrow link. Hover lifts the card 4px and zooms the
   photo to 1.04 (Motion; GSAP owns the reveal).

4. Network (NetworkSection.tsx): keep the map. On a --brand-tint ground,
   corridors are --brand at 35%, hubs are --brand dots, Surat is a --signal-red
   pin with a pulsing ring (GSAP, static under reduced motion).

5. How a consignment moves (ProcessSection.tsx): keep the GSAP pin. Each step
   gets its process/* photo in a rounded frame next to the text, and a large
   amber step number.

6. Industries (IndustriesSection.tsx): five photo tiles with the photo filling
   the tile, a --brand-deep gradient on the lower third (single hue) and the
   industry name in white. Horizontal scroll-snap row on mobile.

7. Commitments (CommitmentsSection.tsx): white ground, three items with a
   lucide icon in a --brand-tint circle and a --brand number.

8. Quote band (QuoteBand.tsx): pages/quote-yard photo behind a --brand-deep
   overlay at 80%, white heading, brand-filled quote button with a white ring,
   and the WhatsApp link if company.whatsapp is set.

Sections alternate white / --brand-tint / white so the page has rhythm.
Check at 360, 768, 1280 and 1440 px with reduced motion on and off.
```

---

## Phase 5: inner pages

```text
Give every inner page a photo intro. Extend src/components/layout/PageIntro.tsx
with an optional `imageKey`: when it is set, the intro becomes a 21:9 (desktop)
/ 4:5 (mobile) photo band with a --brand-deep overlay and white heading; when
it is not set, it keeps the current text intro on --brand-tint.

- /services and each /services/[slug]: its services/* photo in the intro, and
  icon badges on --brand-tint for each feature bullet.
- /network: pages/network-night.
- /about: pages/about-surat. The four commitments use the --brand numbering.
- /track: pages/track-scan. The TrackPanel sits in a white card that overlaps
  the bottom of the photo by 64 px. The status ladder uses --brand dots and
  --signal-red for "Requires attention".
- /partners: pages/partners-fleet.
- /support: pages/support-desk.
- /quote and /contact: text intro on --brand-tint (no photo; keep the form
  above the fold).
Legal pages (/privacy, /terms) stay plain.
```

---

## Phase 6: clean-up and QA

```text
1. Remove the --accent / --accent-ink / --signal aliases. Replace every use
   with the right new token, and remove unused Maa Sheetla tokens.
2. Search src/ for hard-coded hex values and font names (rule 5) and remove
   them.
3. Run npm run typecheck, npm run lint, npm run build, and every verify:*
   script.
4. In the browser, check every route at 360, 768, 1280 and 1440 px, with
   prefers-reduced-motion on and off. Check: no horizontal scroll, visible focus
   ring on every control, AA contrast for all text (pay attention to white on
   photo overlays and anything on --highway), images load with blur
   placeholders, and the two portal login buttons on /track and in the
   utility bar open the right URLs in a new tab.
5. Lighthouse on / and /track (mobile): performance ≥ 85 and accessibility
   100. The hero photo is `priority`; no other image is.
```

---

## What the client must supply

These lift the site the most and cannot be generated:

1. **The footer logo file** (the one shared on WhatsApp) at full resolution,
   ideally SVG or a transparent PNG at least 1000 px wide.
2. **Real numbers** for `company.ts`: years in business, fleet size, hubs
   served, monthly consignments. With these set, the facts strip shows them
   automatically. Without them it shows the service chips.
3. **Phone and WhatsApp numbers** (`company.phone`, `company.whatsapp`). They
   switch on the call / WhatsApp buttons site-wide and in the track panel.
4. **Real photos** of their trucks, godown and team, if they want any of the
   generated images replaced. Same file names, no code change.
