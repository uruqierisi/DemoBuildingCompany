/**
 * Regenerates every derived image from the untouched originals, as described in
 * scripts/renders.config.json:
 *   - renders: responsive AVIF / WebP / JPEG variants (no upscaling)
 *   - plans:   floor plans cropped out of Pozhegu's brochure sheets, then the same variants
 *   - og:      the 1200 × 630 share image
 * and writes a manifest with each image's real pixel size to src/data/generated/<project>-renders.json.
 * A render's original pixel size is the coordinate space for hotspot polygons, so it is recorded exactly.
 *
 * Originals live in public/renders/<project>/original/ and are git-ignored. On a fresh clone run with
 * --fetch to download missing originals from the source URLs in the config (sequential, polite).
 *
 * Run: node scripts/optimize-renders.mjs [--fetch]
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
const FETCH_DELAY_MS = 1000;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
const shouldFetch = process.argv.includes('--fetch');

/** Ensures every original named in `sources` exists locally, downloading missing ones with --fetch. */
async function ensureOriginals() {
  const missing = Object.keys(config.sources).filter((file) => !existsSync(path.join(originalsDir, file)));
  if (missing.length === 0) return;
  if (!shouldFetch) {
    throw new Error(`Missing ${missing.length} original(s), e.g. ${missing[0]}. Re-run with --fetch to download them.`);
  }
  for (const file of missing) {
    await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS));
    const url = config.sources[file];
    // Ask for the original format; the server otherwise converts JPEGs to WebP.
    const response = await fetch(encodeURI(url), { headers: { 'User-Agent': USER_AGENT, Accept: 'image/jpeg,image/png;q=0.9,*/*;q=0.1' } });
    if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
    const target = path.join(originalsDir, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, Buffer.from(await response.arrayBuffer()));
    console.info(`fetched ${file}`);
  }
}

let totalBytes = 0;

/** Writes AVIF/WebP/JPEG at each configured width up to the source width; returns the variant list. */
async function writeVariants(name, source, sourceWidth) {
  const widths = [...new Set([...config.widths.filter((w) => w < sourceWidth), Math.min(sourceWidth, Math.max(...config.widths))])];
  const variants = [];
  for (const width of widths) {
    const resized = source.clone().resize({ width, withoutEnlargement: true });
    const files = { avif: `${name}-${width}.avif`, webp: `${name}-${width}.webp`, jpeg: `${name}-${width}.jpg` };
    await resized.clone().avif({ quality: QUALITY.avif, effort: 5 }).toFile(path.join(outputDir, files.avif));
    await resized.clone().webp({ quality: QUALITY.webp }).toFile(path.join(outputDir, files.webp));
    await resized.clone().jpeg({ quality: QUALITY.jpeg, mozjpeg: true, progressive: true }).toFile(path.join(outputDir, files.jpeg));
    for (const file of Object.values(files)) totalBytes += statSync(path.join(outputDir, file)).size;
    variants.push({ width, avif: `${publicBase}/${files.avif}`, webp: `${publicBase}/${files.webp}`, jpeg: `${publicBase}/${files.jpeg}` });
  }
  return { widths, variants };
}

await ensureOriginals();
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

if (config.og) {
  const { original, output, width, height } = config.og;
  await sharp(path.join(originalsDir, original))
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toFile(output);
  console.info(`og                         ${width}×${height} → ${output} (${(statSync(output).size / 1024).toFixed(0)} KB)`);
}

writeFileSync(`src/data/generated/${config.project}-renders.json`, `${JSON.stringify(manifest, null, 2)}\n`);
console.info(`\nWrote ${Object.keys(manifest).length} images, ${(totalBytes / 1024 / 1024).toFixed(1)} MB of variants.`);
