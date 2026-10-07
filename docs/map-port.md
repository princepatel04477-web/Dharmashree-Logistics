# Map port — Maa Sheetla → DharmaShree Logistics (Prompt 03, Step 1)

Source of truth: `github.com/princepatel04477-web/maa_sheetla@main`
(local `../maa-sheetla` does not exist; fetched via the GitHub contents API
with `Accept: application/vnd.github.raw`). Fetched 2026-10-07.

| Source file                    | Size    | SHA-16 (fetched copy) | Role                                             |
| ------------------------------ | ------- | --------------------- | ------------------------------------------------ |
| `components/india-geometry.ts` | 257,740 | `59100db58253f20c`    | ViewBox, projection, nation + 35 state paths     |
| `components/IndiaReachMap.tsx` | 29,646  | `fbe8cad93af096a0`    | Map component, origin + 78 nodes, all map motion |
| `components/ReachSection.tsx`  | 15,156  | —                     | Region tabs, ledger/directory, instruction copy  |
| `app/reach/page.tsx`           | 6,263   | —                     | Stats, second map instance, dispatch-desk CTA    |

## Geometry

- **Outline**: inline SVG path strings, not external files or canvas.
  `NATION_PATH` (~12 KB, starts `M237.0,799.0L226.8,786.9…`, ends `…243.8,805.0L237.0,799.0Z`)
  is the national boundary, drawn once as a stroked path (`fill="none"`,
  `stroke="rgba(28,25,23,.35)"`, `strokeWidth={1.1}`, non-scaling-stroke).
- **viewBox**: `0 0 760 860`, from `VIEW_BOX = { w: 760, h: 860 }`.
- **Node positions**: stored as **lon/lat** (`coords: [lon, lat]`, e.g. Surat
  `[72.8311, 21.1702]`) and projected at render time by `projectPoint(lon,
lat): [x, y]` — a Mercator projection with fixed constants (`scale
1416.401060, ox 18.0, oy 19.739628, mx0 1.188578859, myTop 0.697670680`).
  File header: "AUTO-GENERATED — Complete 35-State India Geometry,
  Mercator-projected to a 760x860 viewBox. Source: Indian States GeoJSON."
- **State layer**: `INDIA_STATES` (35 polygons, ~244 KB) rendered under the
  routes with supplied/active-state highlighting, plus 5 `ISLET_MARKERS`
  dots (`[135.4,491.9] [88.8,483.9] [140.1,802.7] [367.4,588.6]
[202.0,716.0]`) and an `ACTIVE_STATE_IDS` set of 15 supplied states
  (delhi, gujarat, madhya-pradesh, uttar-pradesh, chhattisgarh, jharkhand,
  punjab, rajasthan, bihar, haryana, west-bengal, uttarakhand,
  jammu-and-kashmir, andhra-pradesh, maharashtra).
- **Port decision**: only `NATION_PATH` + `ISLET_MARKERS` + `VIEW_BOX` +
  `projectPoint` are ported verbatim. The 244 KB state-polygon layer is
  intentionally omitted — the Prompt 03 spec defines a single `<g
class="outline">` treatment with no per-state fills, and the acceptance
  overlay compares outline + hub positions only.

## Hub data (78 nodes + 1 origin)

`ReachNode` fields: `id` (kebab-case slug), `name`, `region` (display state
name), `stateId`, `coords` ([lon, lat]), `hub` (market/counter description),
`isPrimary?` (21 of 78), `since?` (year joined, e.g. `2013`), `anchor?`,
`curve?` (per-route arc 0.04–0.24, default 0.12), `labelOffsetY?`.

- Origin `surat` (Surat, Gujarat, coords `[72.8311, 21.1702]`) is in the
  source — no fallback projection needed.
- Marketing copy says "70+"; the actual array length is **78**. The verify
  script asserts 78.
- **No ISO verification dates exist**: the ledger shows `Since {year}` + a
  "Verified" tag, so `verifiedOn` is `null` for every hub. No transit-day
  data exists either (`transitDays: null`), and the per-node `hub` market
  copy plus `since` years have no field in the Prompt 03 `Hub` interface,
  so they are documented here and dropped from the port.

## Region assignments

Verbatim tab labels: "All Hubs", "Uttar Pradesh", "Bihar & Jharkhand",
"NCR & North", "Central & Others" (source ids: `all`, `up`,
`bihar-jharkhand`, `ncr-north`, `central-south`). Source filter rules:

| Tab               | stateIds                                         |
| ----------------- | ------------------------------------------------ |
| Uttar Pradesh     | uttar-pradesh                                    |
| Bihar & Jharkhand | bihar, jharkhand                                 |
| NCR & North       | delhi, punjab                                    |
| Central & Others  | madhya-pradesh, rajasthan, chhattisgarh, gujarat |

Quirk: Haryana, Uttarakhand, J&K, West Bengal and Andhra Pradesh nodes match
no tab (visible under "All Hubs" only). Since every `Hub` needs a
`RegionId`, the port extends the obvious readings and documents it:
`ncr-north` += haryana, uttarakhand, jammu-and-kashmir ("North");
`central-others` += west-bengal, andhra-pradesh ("Others"). Gujarat holds
only the origin, assigned `central-others` as the catch-all for `ORIGIN`.

## Source interactions & animation (all in `IndiaReachMap.tsx`)

- Hover/focus/click a node → active id; mouse-leave/blur → cleared.
  Controlled (`activeId` + `onActiveChange`) or uncontrolled.
- Active route: gradient thread (`#8B2628 → #A67C26 → #C2953B`) with glow
  filter + SMIL `animateMotion` shuttle dot (2.2 s loop).
- Background mesh: dashed gold routes fade in with a capped stagger
  (`min(idx*40ms, 900ms)`) on first scroll-in (IntersectionObserver 0.15);
  secondary dots scale/opacity-stagger the same way. SSR renders visible.
- Origin (Surat): two SMIL ping rings (r 5→24, opacity .75→0, 3 s,
  1.5 s offset); primary nodes get always-on mono labels + leader lines.
- Active secondary node: cross-fading callout card (AnimatePresence,
  0.22 s) with name + truncated market text.
- Reduced motion: no stagger delays, no shuttle, no pings.
- `ReachSection`: search box, region chips with a `layoutId` sliding pill,
  `AnimatePresence popLayout` ledger rows (name, region · market, Since
  year, Hub badge), scroll-active-row-into-view, empty-state expansion
  card, "Total Network Scope 70+ Cities" footnote, link to `/reach`.
- Verbatim copy reused: "Tap any node to inspect its dispatch corridor",
  "Active Network (… Cities)", "Hover or click any node to view details".

## What Prompt 03 changes (not verbatim)

Curve math (uniform 18%-perpendicular north-bowing arcs replace per-node
`curve` values), GSAP entrance + CorridorTrace + Motion finishing replace
CSS/SMIL/Framer animation, state polygons are dropped (see above), and the
ledger becomes the `HubDirectory` + side panel. Outline path, viewBox,
projection, node ids/names/states/coords and region labels stay verbatim.
