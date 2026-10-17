import { describe, expect, it } from 'vitest';
import { createRenderLookup } from './render-manifest';

const variant = (width: number) => ({
  width,
  avif: `/a-${width}.avif`,
  webp: `/a-${width}.webp`,
  jpeg: `/a-${width}.jpg`,
});

describe('createRenderLookup', () => {
  const render = createRenderLookup({
    hero: { original: 'aerial.jpg', width: 3840, height: 2160, variants: [variant(1600), variant(640)] },
    broken: { original: 'x.jpg', width: 100, variants: [] },
  });

  it('returns the real size and variants sorted by width', () => {
    const hero = render('hero');
    expect(hero).toMatchObject({ original: 'aerial.jpg', width: 3840, height: 2160 });
    expect(hero.variants.map((v) => v.width)).toEqual([640, 1600]);
  });

  it('fails loudly for unknown or malformed entries', () => {
    expect(() => render('overveiw')).toThrow(/not in the manifest/);
    expect(() => render('broken')).toThrow(/malformed/);
  });
});
