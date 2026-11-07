#!/usr/bin/env node
// Converts the original car pictures in assets-src/cars/ into square WebP
// files in public/cars/{slug}.webp (centre-cropped, max 1600×1600, quality 82).
//
// Accepted source names for each model (PNG, JPG, JPEG or WebP):
//   {slug}-puzzle.png    e.g. atto-3-puzzle.png   (preferred)
//   {slug}.png           e.g. atto-3.png
//   {display name}.png   e.g. "BYD Atto 3.png"
// plus the aliases below for files that use a shorter name.
//
// Models are read from config/cars.ts so there is one source of truth.
// Usage: npm run images

import { readFileSync, readdirSync, mkdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const SRC_DIR = "assets-src/cars";
const OUT_DIR = "public/cars";
const MAX_SIZE = 1600;
const QUALITY = 82;
const EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
/** Extra accepted names (normalised) per slug. */
const ALIASES = { "shark-6": ["shark"] };

const carsSource = readFileSync("config/cars.ts", "utf8");
const models = [...carsSource.matchAll(/car\("([^"]+)",\s*"([^"]+)"\)/g)].map(([, slug, name]) => ({ slug, name }));
if (models.length === 0) {
  console.error("Could not read any models from config/cars.ts");
  process.exit(1);
}

/** "BYD Atto 3-puzzle.PNG" → "atto-3" */
const normalise = (file) =>
  basename(file, extname(file))
    .toLowerCase()
    .replace(/-puzzle$/, "")
    .replace(/^byd[\s_-]*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const sources = readdirSync(SRC_DIR).filter((f) => EXTENSIONS.includes(extname(f).toLowerCase()));
mkdirSync(OUT_DIR, { recursive: true });

const missing = [];
for (const { slug, name } of models) {
  const accepted = new Set([slug, normalise(name), ...(ALIASES[slug] ?? [])]);
  // Prefer the documented "{slug}-puzzle" name when several files match.
  const matches = sources
    .filter((f) => accepted.has(normalise(f)))
    .sort((a, b) => Number(b.includes("-puzzle")) - Number(a.includes("-puzzle")));
  if (matches.length === 0) {
    missing.push(`${name} (${slug})`);
    continue;
  }
  const input = join(SRC_DIR, matches[0]);
  const output = join(OUT_DIR, `${slug}.webp`);
  const meta = await sharp(input).metadata();
  const side = Math.min(meta.width ?? MAX_SIZE, meta.height ?? MAX_SIZE, MAX_SIZE);
  await sharp(input)
    .resize(side, side, { fit: "cover", position: "centre", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(output);
  const kb = Math.round(statSync(output).size / 1024);
  console.log(`✓ ${matches[0]} → ${output} (${side}×${side}, ${kb} KB)`);
}

if (missing.length > 0) {
  console.warn(`\nMissing images for ${missing.length} model(s):\n  - ${missing.join("\n  - ")}`);
  console.warn("These models will show the numbered placeholder until an image is added.");
} else {
  console.log(`\nAll ${models.length} models converted.`);
}
