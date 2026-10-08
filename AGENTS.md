# DharmaShree Logistics — house rules

1. TypeScript strict. Never use `any`. Prefer explicit types for props and data.
2. No `console.log` / `console.*` anywhere in shipped code. Surface errors in UI state.
3. Complete working code only: no stubs, TODOs, "lorem ipsum" or placeholder copy. All copy comes from `src/content/**`.
4. Facts (years, fleet size, hub counts, phone numbers) come ONLY from `src/content/company.ts`. If a field is `null`, the UI hides that element. Never invent a number.
5. Visual language = Maa Sheetla. Tokens live in `src/styles/tokens.css`. Never hard-code a hex value or font-family in a component.
6. Accent restraint: the accent colour appears only as hairlines, outlines, icon strokes, dividers, small caps labels and the map's corridor trace. Never as a large fill. The ONE filled button on any page is the primary "Request a quote" CTA.
7. Forbidden: countdown timers, star ratings, fake testimonials, trust-badge rows, "limited offer" banners, pop-up modals on load, emoji in UI, stock gradients, glassmorphism stacks, generic 3-equal-card feature grids.
8. Animation ownership (one owner per element, never two):
   - GSAP: anything scroll-driven, pinned, scrubbed, SVG-drawn, or timeline-sequenced (map, section reveals, process pin).
   - Framer Motion (`motion/react`): the finishing layer — hover/tap micro-interactions, `layout`/`layoutId` transitions, `AnimatePresence` for panels, drawers, route transitions.
   - React Bits / Lightswind: used as-is for their own effect only, restyled to tokens, never wrapped in another animation.
9. `prefers-reduced-motion: reduce` → every animation resolves to its final state instantly. Lenis disabled.
10. Contact actions (`tel:`, `mailto:`, `https://wa.me/`) are plain `<a>` tags, never `next/link`.
11. Accessibility: semantic landmarks, visible focus ring (2px accent outline, 3px offset), all interactive SVG nodes keyboard reachable, AA contrast at real size.
12. Mobile-first. Verify every page at 360, 768, 1280, 1440 widths.
13. Indian formatting: `Intl.NumberFormat('en-IN')` for numbers; phone shown as +91 XXXXX XXXXX grouping.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
