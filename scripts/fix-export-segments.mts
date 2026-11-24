/* Post-build fix for `output: "export"` built on Windows (runs as `postbuild`).

   Next writes each route's segment-prefetch files with
   `convertSegmentPathToStaticExportFilename`, which flattens the segment path
   by replacing "/" with "." — but on Windows the collected paths use "\", so
   `network\__PAGE__` survives and `path.join` turns it into a directory:

     wrote     out/network/__next.network/__PAGE__.txt
     requested    /network/__next.network.__PAGE__.txt   → 404 on every prefetch

   This walks `out/`, moves every file under a `__next.*` directory to the
   flat dotted name the client router requests, and removes the emptied
   directories. On Linux/macOS builds there is nothing to move, so it is a
   no-op; running it twice is also a no-op. */

import { existsSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "out");

function filesUnder(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...filesUnder(full));
    else files.push(full);
  }
  return files;
}

function segmentDirs(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    if (entry === "_next") continue;
    if (entry.startsWith("__next.")) found.push(full);
    else found.push(...segmentDirs(full));
  }
  return found;
}

function main(): void {
  if (!existsSync(outDir)) {
    console.log("fix-export-segments: no out/ directory, nothing to do");
    return;
  }
  let moved = 0;
  for (const segDir of segmentDirs(outDir)) {
    const routeDir = dirname(segDir);
    for (const file of filesUnder(segDir)) {
      const flat = relative(routeDir, file).split(sep).join(".");
      renameSync(file, join(routeDir, flat));
      moved += 1;
    }
    rmSync(segDir, { recursive: true, force: true });
  }
  console.log(`fix-export-segments: flattened ${String(moved)} segment prefetch files`);
}

main();
