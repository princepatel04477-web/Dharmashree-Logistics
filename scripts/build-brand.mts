/* Builds the brand files from the supplied logo (`assets/brand/`). The source is
   a 500×500 transparent PNG with the mark floating in the middle, so the header
   logo is the source trimmed to its ink; the favicon and app icon are the
   श्री glyph alone (the dark strokes), padded to a square. Run with
   `npm run brand`; the outputs in `public/brand/` and `src/app/` are committed. */

import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "assets/brand/dharmashree-logo-source.png";
const OUT = "public/brand";
/** Dark ink: the श्री strokes. The "dharma" lettering is blue (blue channel high). */
const isDark = (r: number, g: number, b: number, a: number): boolean =>
  a > 40 && r < 110 && g < 110 && b < 110;

await mkdir(OUT, { recursive: true });

const trimmed = await sharp(SOURCE)
  .trim({ threshold: 10 })
  .png()
  .toBuffer({ resolveWithObject: true });
await writeFile(`${OUT}/dharmashree-logo.png`, trimmed.data);
console.log(`logo ${String(trimmed.info.width)}×${String(trimmed.info.height)}`);

/* Bounding box of the dark glyph inside the trimmed logo. */
const raw = await sharp(trimmed.data).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = raw.info;
let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * channels;
    if (
      isDark(
        raw.data[i] ?? 255,
        raw.data[i + 1] ?? 255,
        raw.data[i + 2] ?? 255,
        raw.data[i + 3] ?? 0,
      )
    ) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}
const glyph = await sharp(trimmed.data)
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .png()
  .toBuffer({ resolveWithObject: true });
console.log(`glyph ${String(glyph.info.width)}×${String(glyph.info.height)}`);

/* A square icon: the glyph on its own, contained with breathing room. */
async function icon(size: number, path: string): Promise<void> {
  const inner = Math.round(size * 0.72);
  const mark = await sharp(glyph.data)
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
