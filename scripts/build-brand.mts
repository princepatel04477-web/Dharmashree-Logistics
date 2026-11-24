/* Builds the brand files from the supplied logo (`assets/brand/`). The source is
   the client's opaque RGB square: blue "dharma", red श्री and a red square mark
   on a near-white ground. The white is keyed out to alpha and the result
   trimmed to its ink for the header logo; the footer gets a white twin for the
   --brand-deep ground; the favicon and app icon are the red श्री glyph alone,
   padded to a square. Run with `npm run brand`; the outputs in `public/brand/`
   and `src/app/` are committed. */

import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "assets/brand/dharmashree-logo-source.png";
const OUT = "public/brand";
/* Alpha from how far each pixel sits from white: speckle below KEY_LO drops
   out, ink above KEY_HI is solid. */
const KEY_LO = 24;
const KEY_HI = 140;
/** Red ink: the श्री strokes and the square mark (red channel high, others low). */
const isRed = (r: number, g: number, b: number, a: number): boolean =>
  a > 128 && r > 150 && g < 110 && b < 110;

await mkdir(OUT, { recursive: true });

/* ——— Key the white ground out ——— */
const source = await sharp(SOURCE).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const sw = source.info.width;
const sh = source.info.height;
const keyed = Buffer.alloc(sw * sh * 4);
let minX = sw;
let minY = sh;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < sh; y += 1) {
  for (let x = 0; x < sw; x += 1) {
    const i = (y * sw + x) * 3;
    const o = (y * sw + x) * 4;
    const r = source.data[i] ?? 255;
    const g = source.data[i + 1] ?? 255;
    const b = source.data[i + 2] ?? 255;
    const distance = 255 - Math.min(r, g, b);
    const a = Math.min(1, Math.max(0, (distance - KEY_LO) / (KEY_HI - KEY_LO)));
    /* Un-mix the colour from the white it was blended over. */
    const unmix = (c: number): number =>
      a === 0 ? 0 : Math.min(255, Math.max(0, Math.round((c - (1 - a) * 255) / a)));
    keyed[o] = unmix(r);
    keyed[o + 1] = unmix(g);
    keyed[o + 2] = unmix(b);
    keyed[o + 3] = Math.round(a * 255);
    if (a > 0.5) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

/* ——— Header logo: cropped to the solid ink's bounding box ——— */
const PAD = 2;
const left = Math.max(0, minX - PAD);
const top = Math.max(0, minY - PAD);
const logo = await sharp(keyed, { raw: { width: sw, height: sh, channels: 4 } })
  .extract({
    left,
    top,
    width: Math.min(sw, maxX + PAD + 1) - left,
    height: Math.min(sh, maxY + PAD + 1) - top,
  })
  .png()
  .toBuffer({ resolveWithObject: true });
await writeFile(`${OUT}/dharmashree-logo.png`, logo.data);
console.log(`logo ${String(logo.info.width)}×${String(logo.info.height)}`);

/* ——— Footer logo: a white twin for the --brand-deep ground (every opaque
   pixel white, alpha kept, so anti-aliased edges stay smooth) ——— */
const logoRaw = await sharp(logo.data).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = logoRaw.info;
const whitened = Buffer.from(logoRaw.data);
for (let i = 0; i < whitened.length; i += channels) {
  whitened[i] = 255;
  whitened[i + 1] = 255;
  whitened[i + 2] = 255;
}
await sharp(whitened, { raw: { width, height, channels } })
  .png()
  .toFile(`${OUT}/dharmashree-logo-light.png`);
console.log(`logo light ${String(width)}×${String(height)}`);

/* ——— Icon glyph: the red श्री without the square mark ———
   The square sits to the right of the glyph across a gap of empty columns, so
   the glyph is the widest run of columns holding red ink. */
const redColumns: boolean[] = Array.from({ length: width }, () => false);
let gMinY = height;
let gMaxY = 0;
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * channels;
    if (
      isRed(
        logoRaw.data[i] ?? 0,
        logoRaw.data[i + 1] ?? 0,
        logoRaw.data[i + 2] ?? 0,
        logoRaw.data[i + 3] ?? 0,
      )
    ) {
      redColumns[x] = true;
    }
  }
}
let runStart = -1;
let gMinX = 0;
let gMaxX = -1;
for (let x = 0; x <= width; x += 1) {
  const red = x < width && redColumns[x] === true;
  if (red && runStart === -1) runStart = x;
  if (!red && runStart !== -1) {
    if (x - 1 - runStart > gMaxX - gMinX) {
      gMinX = runStart;
      gMaxX = x - 1;
    }
    runStart = -1;
  }
}
for (let y = 0; y < height; y += 1) {
  for (let x = gMinX; x <= gMaxX; x += 1) {
    const i = (y * width + x) * channels;
    if (
      isRed(
        logoRaw.data[i] ?? 0,
        logoRaw.data[i + 1] ?? 0,
        logoRaw.data[i + 2] ?? 0,
        logoRaw.data[i + 3] ?? 0,
      )
    ) {
      gMinY = Math.min(gMinY, y);
      gMaxY = Math.max(gMaxY, y);
    }
  }
}
/* Only the red pixels of that box, so the blue "dharma" bar that runs into the
   glyph's headline does not ride along. */
const glyphWidth = gMaxX - gMinX + 1;
const glyphHeight = gMaxY - gMinY + 1;
const glyphRaw = Buffer.alloc(glyphWidth * glyphHeight * 4);
for (let y = 0; y < glyphHeight; y += 1) {
  for (let x = 0; x < glyphWidth; x += 1) {
    const i = ((y + gMinY) * width + (x + gMinX)) * channels;
    const o = (y * glyphWidth + x) * 4;
    const r = logoRaw.data[i] ?? 0;
    const g = logoRaw.data[i + 1] ?? 0;
    const b = logoRaw.data[i + 2] ?? 0;
    const a = logoRaw.data[i + 3] ?? 0;
    const blue = b > r;
    glyphRaw[o] = r;
    glyphRaw[o + 1] = g;
    glyphRaw[o + 2] = b;
    glyphRaw[o + 3] = blue ? 0 : a;
  }
}
const glyph = await sharp(glyphRaw, {
  raw: { width: glyphWidth, height: glyphHeight, channels: 4 },
})
  .png()
  .toBuffer();
console.log(`glyph ${String(glyphWidth)}×${String(glyphHeight)}`);

/* A square icon: the glyph on its own, contained with breathing room. */
async function icon(size: number, path: string): Promise<void> {
  const inner = Math.round(size * 0.72);
  const mark = await sharp(glyph)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 252, g: 250, b: 246, alpha: 1 },
    },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toFile(path);
}
await icon(192, "src/app/icon.png");
await icon(180, "src/app/apple-icon.png");
console.log("icons written");
