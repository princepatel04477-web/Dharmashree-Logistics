import localFont from "next/font/local";

/* Self-hosted Google binaries (see docs/token-map.md §5). Variable files cover
   weights 100–900; `display: 'swap'` matches the source. Preload is limited to
   the display face and the body face, per the build brief. */

export const fontDisplayFace = localFont({
  src: [
    {
      path: "../fonts/fraunces-var-latin-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../fonts/fraunces-var-latin-italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  display: "swap",
  preload: true,
  variable: "--font-display-face",
});

export const fontDisplayAccent = localFont({
  src: [
    {
      path: "../fonts/instrument-serif-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/instrument-serif-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
  preload: false,
  variable: "--font-display-accent",
});

export const fontBody = localFont({
  src: [
    {
      path: "../fonts/dm-sans-var-latin-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../fonts/dm-sans-var-latin-italic.woff2",
      weight: "100 900",
      style: "italic",
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
