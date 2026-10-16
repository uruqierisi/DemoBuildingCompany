import { describe, expect, it } from 'vitest';
import { gardenBuildings } from '@/data/garden-buildings';
import { getTraceImages, groupTargets, SOLD_GROUP } from './trace-images';

describe('getTraceImages', () => {
  const images = getTraceImages([gardenBuildings]);

  it('lists the overview plus one render per building', () => {
    expect(images).toHaveLength(1 + gardenBuildings.buildings.length);
    expect(images[0]?.key).toBe('garden-buildings:overview');
    expect(images[0]?.image).toBe(gardenBuildings.overview?.image);
    expect(images[1]?.key).toBe('garden-buildings:objekti-h2');
  });

  it('offers only the buildings visible on the overview, and each building’s apartments on its render', () => {
    expect(images[0]?.targets.map((t) => t.id)).toEqual(['objekti-l4', 'objekti-l7', 'objekti-l8', 'objekti-l9']);
    const h2 = images[1];
    expect(h2?.targets).toHaveLength(gardenBuildings.buildings[0]?.apartments.length ?? 0);
    expect(h2?.targets.every((t) => t.kind === 'apartment' && t.id.startsWith('h2-'))).toBe(true);
  });

  it('skips buildings without a render and projects without an overview', () => {
    const [first, ...rest] = gardenBuildings.buildings;
    if (!first) throw new Error('fixture needs buildings');
    const partial = {
      ...gardenBuildings,
      overview: undefined,
      buildings: [{ ...first, render: undefined }, ...rest],
    };
    const keys = getTraceImages([partial]).map((image) => image.key);
    expect(keys).not.toContain('garden-buildings:overview');
    expect(keys).not.toContain(`garden-buildings:${first.id}`);
    expect(keys).toHaveLength(rest.length);
  });

  it('orders apartments by floor, ground floor first', () => {
    const h4 = images.find((image) => image.key === 'garden-buildings:objekti-h4');
    const groups = groupTargets(h4?.targets ?? []).map(([group]) => group);
    expect(groups[0]).toBe('Përdhesë');
    expect(groups.at(-1)).toBe('Kati 11');
  });
  it('lets building renders create sold units on floors from Përdhesë to a few above the highest unit', () => {
    const l9 = images.find((image) => image.key === 'garden-buildings:objekti-l9');
    expect(l9?.buildingId).toBe('objekti-l9');
    // L9's highest listed apartment is on floor 9; three floors of headroom.
    expect(l9?.soldFloors).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(images[0]?.buildingId).toBeUndefined();
  });

  it('lists existing sold units in their own group', () => {
    const [l9] = gardenBuildings.buildings.filter((b) => b.id === 'objekti-l9');
    if (!l9) throw new Error('fixture needs L9');
    const withSold = {
      ...gardenBuildings,
      buildings: [{ ...l9, soldUnits: [{ id: 'l9-s-0401', buildingId: 'objekti-l9', floor: 4 }] }],
    };
    const [, l9Image] = getTraceImages([withSold]);
    const soldGroup = groupTargets(l9Image?.targets ?? []).find(([group]) => group === SOLD_GROUP);
    expect(soldGroup?.[1].map((t) => [t.kind, t.id, t.floor])).toEqual([['sold', 'l9-s-0401', 4]]);
  });
});
