/**
 * Generates the favicon set from the official logo (public/brand/pozhegu-logo.svg).
 * Uses the logo's orange mark path exactly as published, centred on an ink square: at 16px the
 * wordmark is illegible, and a solid ground keeps the mark readable on light and dark tab bars.
 *
 * Run: node scripts/generate-icons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const INK = '#161513';
const MARK_FILL = '#f49022';
/** Share of the icon edge left as padding on each side of the mark. */
const PADDING = 0.14;

const logo = readFileSync('public/brand/pozhegu-logo.svg', 'utf8');
const markPath = [...logo.matchAll(/<path[^>]*>/g)].map((m) => m[0]).find((p) => p.includes(MARK_FILL));
if (!markPath) throw new Error(`Could not find the ${MARK_FILL} mark in the logo SVG.`);
const d = markPath.match(/ d="([^"]+)"/)?.[1];

// Mark bounds in logo units (measured from the path).
const mark = { x: 0, y: 0, width: 80.1, height: 48.7 };
const side = mark.width / (1 - 2 * PADDING);
const viewBox = [mark.x + mark.width / 2 - side / 2, mark.y + mark.height / 2 - side / 2, side, side]
  .map((n) => +n.toFixed(3))
  .join(' ');

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><rect x="${viewBox.split(' ')[0]}" y="${viewBox.split(' ')[1]}" width="${side.toFixed(3)}" height="${side.toFixed(3)}" fill="${INK}"/><path d="${d}" fill="${MARK_FILL}"/></svg>\n`;
writeFileSync('public/favicon.svg', iconSvg);

const png = (size) => new Resvg(iconSvg, { fitTo: { mode: 'width', value: size } }).render().asPng();
writeFileSync('public/apple-touch-icon.png', png(180));
writeFileSync('public/icons/icon-192.png', png(192));
writeFileSync('public/icons/icon-512.png', png(512));

// favicon.ico with embedded 32px and 16px PNGs (PNG-in-ICO, supported by every current browser).
const images = [32, 16].map((size) => ({ size, data: png(size) }));
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
writeFileSync('public/favicon.ico', Buffer.concat([header, ...images.map((image) => image.data)]));

console.info('Icons written: favicon.svg, favicon.ico, apple-touch-icon.png, icons/icon-192.png, icons/icon-512.png');
