/**
 * Generates every brand asset of the fictional demo developer "Arrita Ndërtim" from one geometry:
 *   - public/brand/arrita-logo.svg (ink wordmark) and arrita-logo-white.svg (white wordmark)
 *   - public/favicon.svg, favicon.ico, apple-touch-icon.png, icons/icon-192.png, icons/icon-512.png
 *   - public/og/rezidenca-arrita.jpg, the 1200 × 630 share image
 *
 * The lettering is a small monoline alphabet drawn here as stroked centrelines (cap height 100),
 * so no font file is needed and the assets render identically everywhere. Colours are read from
 * the tokens in src/styles/index.css, so the brand follows the design system.
 *
 * Run: node scripts/generate-brand.mjs
 */
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const css = readFileSync('src/styles/index.css', 'utf8');
function token(name) {
  const value = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1];
  if (!value) throw new Error(`--color-${name} not found in src/styles/index.css`);
  return value;
}
const INK = token('ink');
const ACCENT = token('accent');
const WHITE = '#ffffff';
const INVERSE_MUTED = token('inverse-muted');

/** Stroke width of the lettering at cap height 100. */
const STROKE = 12;
const S = STROKE / 2;

/**
 * Monoline capitals: centreline path and advance width. Diagonals and stems overshoot the 0–100
 * band and are clipped to it, which gives flat, architectural terminals.
 */
const GLYPHS = {
  A: { width: 84, d: 'M2.4 110L45.6 -10M81.6 110L38.4 -10M18.2 66H65.8' },
  B: { width: 66, d: `M${S} -10V110M${S} ${S}H32A21 22 0 0 1 32 50H${S}M${S} 50H36A24 22 0 0 1 36 ${100 - S}H${S}` },
  C: { width: 76, d: 'M73.1 21.7A38 44 0 1 0 73.1 78.3' },
  D: { width: 74, d: `M${S} -10V110M${S} ${S}H30A38 44 0 0 1 30 ${100 - S}H${S}` },
  E: { width: 58, d: `M58 ${S}H${S}V${100 - S}H58M${S} 50H52` },
  G: { width: 88, d: 'M73.1 21.7A38 44 0 1 0 82 50H50' },
  I: { width: 12, d: `M${S} -10V110` },
  L: { width: 56, d: `M${S} -10V${100 - S}H56` },
  M: { width: 88, d: `M${S} -10V110M82 -10V110M${S} 0L44 70L82 0` },
  N: { width: 72, d: `M${S} -10V110M66 -10V110M${S} 0L66 100` },
  O: { width: 80, d: 'M40 6A34 44 0 1 0 40 94A34 44 0 1 0 40 6Z' },
  R: { width: 68, d: `M${S} -10V110M${S} ${S}H36A25 25 0 0 1 36 56H${S}M34 56L70.8 110` },
  T: { width: 72, d: `M0 ${S}H72M36 -10V110` },
  U: { width: 72, d: `M${S} -10V60A30 34 0 0 0 66 60V-10` },
  V: { width: 80, d: 'M2.6 -10L43.4 110M77.4 -10L36.6 110' },
  X: { width: 76, d: 'M-0.4 -10L76.4 110M76.4 -10L-0.4 110' },
  Z: { width: 66, d: `M0 ${S}H66M0 ${100 - S}H66M60 0L6 100` },
  ' ': { width: 28, d: '' },
};
/** Marks drawn as solid squares, outside the clipped band. */
const DIACRITICS = {
  Ë: {
    base: 'E',
    squares: [
      [8, -26],
      [38, -26],
    ],
  },
};
const SEPARATOR = '·';
/** Pair kerning: open diagonals and the T's bar leave optical holes at the regular spacing. */
const KERNING = { TA: -22, AT: -22, AV: -18, VA: -18 };

function round(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Lays out a line of capitals. Returns its width in glyph units and the SVG for it, drawn in glyph
 * units from the origin (cap height 100), for the caller to position and scale.
 */
function setLine(text, { tracking, color, clipId }) {
  const strokes = [];
  const squares = [];
  let x = 0;
  const chars = [...text];
  chars.forEach((char, index) => {
    if (index > 0) x += tracking + (KERNING[chars[index - 1] + char] ?? 0);
    if (char === SEPARATOR) {
      squares.push([x, 50 - S]);
      x += STROKE;
      return;
    }
    const accent = DIACRITICS[char];
    const glyph = GLYPHS[accent ? accent.base : char];
    if (!glyph) throw new Error(`No glyph for "${char}"`);
    if (glyph.d) strokes.push(`<path transform="translate(${round(x)} 0)" d="${glyph.d}"/>`);
    for (const [dx, y] of accent?.squares ?? []) squares.push([x + dx, y]);
    x += glyph.width;
  });
  const svg =
    `<g clip-path="url(#${clipId})" fill="none" stroke="${color}" stroke-width="${STROKE}" stroke-linejoin="miter">${strokes.join('')}</g>` +
    squares
      .map(([sx, sy]) => `<rect x="${round(sx)}" y="${sy}" width="${STROKE}" height="${STROKE}" fill="${color}"/>`)
      .join('');
  return { width: x, svg };
}

/** Clip band for a line: full cap height, wide enough for any line. */
function bandClip(id) {
  return `<clipPath id="${id}"><rect x="-50" y="0" width="100000" height="100"/></clipPath>`;
}

/**
 * The mark: an accent square holding a gable "A", the crossbar replaced by a single window.
 * Reads as the initial and as a house section. 100 × 100 units.
 */
function markSvg(clipId) {
  const legs = 'M20.9 92L65.4 -12M79.1 92L34.6 -12';
  return (
    `<rect width="100" height="100" rx="4" fill="${ACCENT}"/>` +
    `<clipPath id="${clipId}"><rect x="0" y="24" width="100" height="56"/></clipPath>` +
    `<g clip-path="url(#${clipId})"><path d="${legs}" fill="none" stroke="${INK}" stroke-width="10"/></g>` +
    `<rect x="45" y="56" width="10" height="10" fill="${INK}"/>`
  );
}

const WORDMARK = { text: 'ARRITA', tracking: 22, scale: 0.44, gap: 32 };

/** Mark + wordmark lockup, 100 units tall. */
function logoSvg(wordColor) {
  const line = setLine(WORDMARK.text, { tracking: WORDMARK.tracking, color: wordColor, clipId: 'band' });
  const wordWidth = line.width * WORDMARK.scale;
  const width = round(100 + WORDMARK.gap + wordWidth);
  const top = round((100 - 100 * WORDMARK.scale) / 2);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 100" width="${width}" height="100">` +
    `<defs>${bandClip('band')}</defs>` +
    markSvg('gable') +
    `<g transform="translate(${100 + WORDMARK.gap} ${top}) scale(${WORDMARK.scale})">${line.svg}</g>` +
    `</svg>\n`
  );
}

function write(file, data) {
  writeFileSync(file, data);
  console.info(`${file.padEnd(32)} ${(statSync(file).size / 1024).toFixed(1)} KB`);
}

mkdirSync('public/brand', { recursive: true });
mkdirSync('public/icons', { recursive: true });
mkdirSync('public/og', { recursive: true });

const logo = logoSvg(INK);
write('public/brand/arrita-logo.svg', logo);
write('public/brand/arrita-logo-white.svg', logoSvg(WHITE));

// Favicons: the mark alone, full bleed.
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${markSvg('gable')}</svg>\n`;
write('public/favicon.svg', iconSvg);
const png = (svg, size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
// Touch icons are square-cropped by the OS; no rounded corner of our own.
const squareIconSvg = iconSvg.replace('rx="4" ', '');
write('public/apple-touch-icon.png', png(squareIconSvg, 180));
write('public/icons/icon-192.png', png(squareIconSvg, 192));
write('public/icons/icon-512.png', png(squareIconSvg, 512));

// favicon.ico with embedded 32px and 16px PNGs (PNG-in-ICO, supported by every current browser).
const images = [32, 16].map((size) => ({ size, data: png(iconSvg, size) }));
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach(({ size, data }, i) => {
  const entry = 6 + i * 16;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(data.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += data.length;
});
write('public/favicon.ico', Buffer.concat([header, ...images.map((image) => image.data)]));

// Share image: ink ground, faint 12-column grid, the lockup in white, and who made the demo.
const OG = { width: 1200, height: 630, margin: 96 };
function ogSvg() {
  const markSize = 168;
  const scale = (markSize / 100) * WORDMARK.scale;
  const word = setLine(WORDMARK.text, { tracking: WORDMARK.tracking, color: WHITE, clipId: 'og-band' });
  const lockupTop = (OG.height - markSize) / 2;
  const label = (text, y, color) => {
    const labelScale = 0.17;
    const line = setLine(text, { tracking: 52, color, clipId: 'og-label' });
    return `<g transform="translate(${OG.margin} ${y}) scale(${labelScale})">${line.svg}</g>`;
  };
  const columns = Array.from({ length: 11 }, (_, i) => {
    const x = round(OG.margin + ((OG.width - 2 * OG.margin) / 12) * (i + 1));
    return `<path d="M${x} 0V${OG.height}" stroke="${WHITE}" stroke-opacity="0.06"/>`;
  }).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OG.width} ${OG.height}" width="${OG.width}" height="${OG.height}">` +
    `<defs>${bandClip('og-band')}${bandClip('og-label')}</defs>` +
    `<rect width="${OG.width}" height="${OG.height}" fill="${INK}"/>${columns}` +
    label('REZIDENCA', OG.margin, INVERSE_MUTED) +
    `<g transform="translate(${OG.margin} ${lockupTop}) scale(${markSize / 100})">${markSvg('og-gable')}</g>` +
    `<g transform="translate(${OG.margin + markSize + WORDMARK.gap * (markSize / 100)} ${lockupTop + ((1 - WORDMARK.scale) * markSize) / 2}) scale(${scale})">${word.svg}</g>` +
    `<path d="M${OG.margin} ${OG.height - OG.margin - 40}H${OG.width - OG.margin}" stroke="${WHITE}" stroke-opacity="0.18"/>` +
    label('DEMO NGA ELEVATEURBOX', OG.height - OG.margin - 17, INVERSE_MUTED) +
    `</svg>`
  );
}
const ogPng = new Resvg(ogSvg()).render().asPng();
await sharp(ogPng).jpeg({ quality: 86, mozjpeg: true, progressive: true }).toFile('public/og/rezidenca-arrita.jpg');
console.info(
  `${'public/og/rezidenca-arrita.jpg'.padEnd(32)} ${(statSync('public/og/rezidenca-arrita.jpg').size / 1024).toFixed(1)} KB`,
);
