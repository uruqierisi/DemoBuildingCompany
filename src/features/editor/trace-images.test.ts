import { describe, expect, it } from 'vitest';
import { rezidencaArrita } from '@/data/rezidenca-arrita';
import type { Project, RenderImage } from '@/data/types';
import { getTraceImages, groupTargets, SOLD_GROUP } from './trace-images';

/** The demo data has no renders yet; the fixture gives the overview and every building one. */
const RENDER: RenderImage = {
  original: 'fixture.jpg',
  width: 1600,
  height: 1000,
  variants: [{ width: 640, avif: '/fixture-640.avif', webp: '/fixture-640.webp', jpeg: '/fixture-640.jpg' }],
};

const project: Project = {
  ...rezidencaArrita,
  overview: { image: RENDER, buildingIds: ['objekti-a1', 'objekti-b1'] },
  buildings: rezidencaArrita.buildings.map((building) => ({ ...building, render: RENDER })),
};

describe('getTraceImages', () => {
  const images = getTraceImages([project]);

  it('lists the overview plus one render per building', () => {
    expect(images).toHaveLength(1 + project.buildings.length);
    expect(images[0]?.key).toBe('rezidenca-arrita:overview');
    expect(images[0]?.image).toBe(RENDER);
    expect(images[1]?.key).toBe('rezidenca-arrita:objekti-a1');
  });

  it('offers only the buildings visible on the overview, and each building’s apartments on its render', () => {
    expect(images[0]?.targets.map((t) => t.id)).toEqual(['objekti-a1', 'objekti-b1']);
    const a1 = images[1];
    expect(a1?.targets).toHaveLength(project.buildings[0]?.apartments.length ?? 0);
    expect(a1?.targets.every((t) => t.kind === 'apartment' && t.id.startsWith('a1-'))).toBe(true);
  });

  it('skips buildings without a render and projects without an overview', () => {
    const [first, ...rest] = project.buildings;
    if (!first) throw new Error('fixture needs buildings');
    const partial = { ...project, overview: undefined, buildings: [{ ...first, render: undefined }, ...rest] };
    const keys = getTraceImages([partial]).map((image) => image.key);
    expect(keys).not.toContain('rezidenca-arrita:overview');
    expect(keys).not.toContain(`rezidenca-arrita:${first.id}`);
    expect(keys).toHaveLength(rest.length);
  });

  it('lists the overview and A1’s facade for the demo data as it ships', () => {
    expect(getTraceImages([rezidencaArrita]).map((image) => image.key)).toEqual([
      'rezidenca-arrita:overview',
      'rezidenca-arrita:objekti-a1',
    ]);
  });

  it('orders apartments by floor, ground floor first', () => {
    const a2 = images.find((image) => image.key === 'rezidenca-arrita:objekti-a2');
    const groups = groupTargets(a2?.targets ?? []).map(([group]) => group);
    expect(groups[0]).toBe('Përdhesë');
    expect(groups.at(-1)).toBe('Kati 9');
  });

  it('lets building renders create sold units on floors from Përdhesë to a few above the highest unit', () => {
    const b2 = images.find((image) => image.key === 'rezidenca-arrita:objekti-b2');
    expect(b2?.buildingId).toBe('objekti-b2');
    // B2's highest apartment is on floor 5; three floors of headroom.
    expect(b2?.soldFloors).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(images[0]?.buildingId).toBeUndefined();
  });

  it('lists existing sold units in their own group', () => {
    const b1 = project.buildings.find((b) => b.id === 'objekti-b1');
    if (!b1) throw new Error('fixture needs B1');
    const withSold = {
      ...project,
      buildings: [{ ...b1, soldUnits: [{ id: 'b1-s-0401', buildingId: 'objekti-b1', floor: 4 }] }],
    };
    const [, b1Image] = getTraceImages([withSold]);
    const soldGroup = groupTargets(b1Image?.targets ?? []).find(([group]) => group === SOLD_GROUP);
    expect(soldGroup?.[1].map((t) => [t.kind, t.id, t.floor])).toEqual([['sold', 'b1-s-0401', 4]]);
  });
});
