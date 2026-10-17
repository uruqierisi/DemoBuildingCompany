/**
 * Regenerates every derived image from the untouched originals, as described in
 * scripts/renders.config.json:
 *   - renders: responsive AVIF / WebP / JPEG variants (no upscaling)
 *   - plans:   floor plans cropped out of larger drawing sheets, then the same variants
 * and writes a manifest with each image's real pixel size to src/data/generated/<project>-renders.json.
 * A render's original pixel size is the coordinate space for hotspot polygons, so it is recorded exactly.
 *
 * Originals live in public/renders/<project>/original/ and are git-ignored; the variants and the
 * manifest are committed, so a build never needs the originals.
 *
 * Run: npm run assets:images
 */
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const config = JSON.parse(readFileSync('scripts/renders.config.json', 'utf8'));
const projectDir = path.join('public', 'renders', config.project);
const originalsDir = path.join(projectDir, 'original');
const outputDir = path.join(projectDir, 'optimized');
const publicBase = `/renders/${config.project}/optimized`;
const QUALITY = { avif: 55, webp: 78, jpeg: 80 };

/** Fails early, naming the first missing original, instead of halfway through the variants. */
function assertOriginalsExist() {
  const files = [
    ...Object.values(config.renders).map((entry) => (typeof entry === 'string' ? entry : entry.original)),
    ...Object.values(config.plans ?? {}).map((entry) => entry.original),
  ];
  const missing = files.filter((file) => !existsSync(path.join(originalsDir, file)));
  if (missing.length > 0) {
    throw new Error(`Missing ${missing.length} original(s) in ${originalsDir}, e.g. ${missing[0]}.`);
  }
}

let totalBytes = 0;

/** Writes AVIF/WebP/JPEG at each configured width up to the source width; returns the variant list. */
async function writeVariants(name, source, sourceWidth) {
  const widths = [
    ...new Set([...config.widths.filter((w) => w < sourceWidth), Math.min(sourceWidth, Math.max(...config.widths))]),
  ];
  const variants = [];
  for (const width of widths) {
    const resized = source.clone().resize({ width, withoutEnlargement: true });
    const files = { avif: `${name}-${width}.avif`, webp: `${name}-${width}.webp`, jpeg: `${name}-${width}.jpg` };
    await resized.clone().avif({ quality: QUALITY.avif, effort: 5 }).toFile(path.join(outputDir, files.avif));
    await resized.clone().webp({ quality: QUALITY.webp }).toFile(path.join(outputDir, files.webp));
    await resized
      .clone()
      .jpeg({ quality: QUALITY.jpeg, mozjpeg: true, progressive: true })
      .toFile(path.join(outputDir, files.jpeg));
    for (const file of Object.values(files)) totalBytes += statSync(path.join(outputDir, file)).size;
    variants.push({
      width,
      avif: `${publicBase}/${files.avif}`,
      webp: `${publicBase}/${files.webp}`,
      jpeg: `${publicBase}/${files.jpeg}`,
    });
  }
  return { widths, variants };
}

assertOriginalsExist();
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
mkdirSync('src/data/generated', { recursive: true });
const manifest = {};

// A render is either an original's file name, or { original, crop } to publish part of an original
// (e.g. one building out of a wider render). With a crop, hotspot coordinates are in crop pixels.
for (const [name, entry] of Object.entries(config.renders)) {
  const { original: originalFile, crop } = typeof entry === 'string' ? { original: entry } : entry;
  const input = path.join(originalsDir, originalFile);
  const source = crop ? sharp(await sharp(input).rotate().extract(crop).toBuffer()) : sharp(input).rotate();
  const { width, height } = crop ?? (await sharp(input).metadata());
  const { widths, variants } = await writeVariants(name, source, width);
  manifest[name] = { original: originalFile, width, height, variants };
  console.info(`${name.padEnd(26)} ${crop ? 'crop ' : ''}${width}×${height} → ${widths.join(', ')}`);
}

for (const [name, { original, crop }] of Object.entries(config.plans ?? {})) {
  const input = path.join(originalsDir, original);
  const cropped = sharp(input).rotate().extract(crop);
  const { widths, variants } = await writeVariants(name, sharp(await cropped.toBuffer()), crop.width);
  manifest[name] = { original, width: crop.width, height: crop.height, variants };
  console.info(`${name.padEnd(26)} crop ${crop.width}×${crop.height} → ${widths.join(', ')}`);
}

writeFileSync(`src/data/generated/${config.project}-renders.json`, `${JSON.stringify(manifest, null, 2)}\n`);
console.info(
  `\nWrote ${Object.keys(manifest).length} images, ${(totalBytes / 1024 / 1024).toFixed(1)} MB of variants.`,
);
