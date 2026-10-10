import localFont from "next/font/local";

/* Self-hosted binaries (see docs/token-map.md §5). Variable files cover the
   full weight range; `display: 'swap'` matches the source. Preload is limited
   to the display face and the body face, per the build brief.

   The display face is Archivo: one variable file with two axes, weight
   (100–900) and width (62–125). Headings use weight 700 at 88% width, so they
   read like highway signage. next/font writes the weight range into the
   @font-face, but not the width range, so `font-stretch` is declared here;
   without it the browser would ignore `font-stretch` on the family and never
   move the width axis.

   The body face declares its upright file only. next/font preloads every file
   in a preloaded family, and no text on the site is set in DM Sans italic, so
   its italic file (~75 KB) was fetched on every first visit and never used. It
   stays in src/fonts: add the entry back here if a design ever sets the body
   face in italic. */

export const fontDisplayFace = localFont({
  src: [
    {
      path: "../fonts/archivo-var-latin-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  display: "swap",
  preload: true,
  variable: "--font-display-face",
});

export const fontBody = localFont({
  src: [
    {
      path: "../fonts/dm-sans-var-latin-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  display: "swap",
  preload: true,
  variable: "--font-body",
});

export const fontMono = localFont({
  src: [
    {
      path: "../fonts/jetbrains-mono-var-latin-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  display: "swap",
  preload: false,
  variable: "--font-mono-face",
});
