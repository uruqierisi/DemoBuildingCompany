import type { ImageVariant, RenderImage } from './types';

/** Shape written by scripts/optimize-renders.mjs. */
type RenderManifest = Readonly<Record<string, unknown>>;

function isVariant(value: unknown): value is ImageVariant {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.width === 'number' &&
    typeof v.avif === 'string' &&
    typeof v.webp === 'string' &&
    typeof v.jpeg === 'string'
  );
}

function toRenderImage(name: string, entry: unknown): RenderImage {
  const e = (typeof entry === 'object' && entry !== null ? entry : {}) as Record<string, unknown>;
  const variants = Array.isArray(e.variants) ? e.variants.filter(isVariant) : [];
  if (
    typeof e.width !== 'number' ||
    typeof e.height !== 'number' ||
    typeof e.original !== 'string' ||
    variants.length === 0
  ) {
    throw new Error(`Render "${name}" in the manifest is malformed; re-run node scripts/optimize-renders.mjs.`);
  }
  return {
    original: e.original,
    width: e.width,
    height: e.height,
    variants: variants.toSorted((a, b) => a.width - b.width),
  };
}

/**
 * Returns a lookup for renders in a generated manifest. An unknown name throws, so a typo in the
 * data file fails immediately instead of silently rendering nothing.
 */
export function createRenderLookup(manifest: RenderManifest): (name: string) => RenderImage {
  return (name) => {
    if (!(name in manifest)) {
      throw new Error(
        `Render "${name}" is not in the manifest. Add it to scripts/renders.config.json and re-run the script.`,
      );
    }
    return toRenderImage(name, manifest[name]);
  };
}
