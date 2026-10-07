#!/usr/bin/env node
// Image derivative pipeline — ported from Maa Sheetla's scripts/build-images.mjs.
// Usage: npm run images
//
// Reads:  assets/originals/<group>/*.{png,jpg,jpeg,webp,tif,tiff}
// Writes: public/img/<group>/<name>-<width>.{avif,webp,jpg}
//         src/content/image-manifest.json (dimensions + blur placeholders)
//
// Groups mirror the source (catalogue/hero/firms/…); ours will be logistics
// groups (fleet/hubs/warehouse/…). Widths per the build brief: 480–2400.
// Quality settings are verbatim from the source script.

import sharp from "sharp";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import type { ImageManifest } from "../src/content/types";

const SRC = "assets/originals";
const OUT = "public/img";
const MANIFEST_PATH = "src/content/image-manifest.json";

const WIDTHS = [480, 768, 1200, 1600, 2400] as const;

const FORMATS = [
  ["avif", { quality: 55, effort: 4 }],
  ["webp", { quality: 78 }],
  ["jpg", { quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4" }],
] as const;

const SOURCE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"]);

function isSourceFile(fileName: string): boolean {
  return SOURCE_EXTENSIONS.has(parse(fileName).ext.toLowerCase());
}

async function readDirSafe(path: string): Promise<string[]> {
  try {
    return await readdir(path);
  } catch {
    return [];
  }
}

async function readGroups(path: string): Promise<string[]> {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch {
    return [];
  }
}

const manifest: ImageManifest = {};
const groups = await readGroups(SRC);

if (groups.length === 0) {
  console.log(`No groups found in ${SRC}/ — nothing to build.`);
  console.log("Add originals as assets/originals/<group>/<name>.png, then re-run.");
  await mkdir(OUT, { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  process.exit(0);
}

for (const group of groups) {
  const groupDir = join(SRC, group);
  const files = (await readDirSafe(groupDir)).filter((file) => isSourceFile(file));
  if (files.length === 0) {
    console.log(`skip ${group}/ (no source images)`);
    continue;
  }

  await mkdir(join(OUT, group), { recursive: true });

  for (const file of files) {
    const { name } = parse(file);
    const input = join(groupDir, file);
    const meta = await sharp(input).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;

    for (const w of WIDTHS) {
      for (const [fmt, opts] of FORMATS) {
        const ext = fmt === "jpg" ? "jpeg" : fmt;
        await sharp(input)
          .resize({ width: w, withoutEnlargement: true })
          .toFormat(ext, opts)
          .toFile(join(OUT, group, `${name}-${w}.${fmt}`));
      }
    }

    // LQIP: 20px wide blurred WebP as a data URI (verbatim from source).
    const lqip = await sharp(input)
      .resize({ width: 20 })
      .blur(1.2)
      .webp({ quality: 20 })
      .toBuffer();

    manifest[`${group}/${name}`] = {
      group,
      file: name,
      width,
      height,
      blurDataURL: `data:image/webp;base64,${lqip.toString("base64")}`,
      widths: [...WIDTHS],
    };
    console.log(`built ${group}/${name} (${width}x${height})`);
  }
}

await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Manifest written: ${MANIFEST_PATH} (${Object.keys(manifest).length} images)`);
