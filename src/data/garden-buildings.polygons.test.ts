import { describe, expect, it } from 'vitest';
import { parsePolygonPath, type Point } from '@/lib/svg-path';
import { gardenBuildings } from './garden-buildings';

const l9 = gardenBuildings.buildings.find((b) => b.id === 'objekti-l9');

function contains(point: Point, polygon: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (!a || !b) continue;
    if (a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x)
      inside = !inside;
  }
  return inside;
}

describe('traced polygons', () => {
  it('trace every building visible on the overview', () => {
    const visible = new Set(gardenBuildings.overview?.buildingIds);
    const traced = gardenBuildings.buildings.filter((b) => b.svgPath).map((b) => b.id);
    expect(traced.sort()).toEqual([...visible].sort());
  });

  it('trace every L9 apartment for sale, and give every sold unit a polygon', () => {
    expect(l9?.apartments.every((a) => a.svgPath)).toBe(true);
    expect(l9?.soldUnits.length).toBeGreaterThan(0);
    expect(l9?.soldUnits.every((u) => u.svgPath)).toBe(true);
  });

  it('keep every polygon simple (4–8 points) and inside its render', () => {
    const renders = [
      { image: gardenBuildings.overview?.image, paths: gardenBuildings.buildings.map((b) => b.svgPath) },
      { image: l9?.render, paths: [...(l9?.apartments ?? []), ...(l9?.soldUnits ?? [])].map((u) => u.svgPath) },
    ];
    for (const { image, paths } of renders) {
      for (const path of paths.filter((p): p is string => Boolean(p))) {
        const points = parsePolygonPath(path);
        expect(points.length).toBeGreaterThanOrEqual(4);
        expect(points.length).toBeLessThanOrEqual(8);
        expect(
          points.every(({ x, y }) => x >= 0 && y >= 0 && x <= (image?.width ?? 0) && y <= (image?.height ?? 0)),
        ).toBe(true);
      }
    }
  });

  it('never overlap on the L9 render (sampled every 8 px)', () => {
    const polygons = [...(l9?.apartments ?? []), ...(l9?.soldUnits ?? [])].map((u) => ({
      id: u.id,
      points: parsePolygonPath(u.svgPath ?? ''),
    }));
    const overlaps = new Set<string>();
    for (let y = 0; y < (l9?.render?.height ?? 0); y += 8) {
      for (let x = 0; x < (l9?.render?.width ?? 0); x += 8) {
        const hits = polygons.filter((p) => contains({ x, y }, p.points));
        if (hits.length > 1) overlaps.add(hits.map((h) => h.id).join(' × '));
      }
    }
    expect([...overlaps]).toEqual([]);
  });

  it('number sold units consecutively per floor', () => {
    const byFloor = new Map<number, string[]>();
    for (const unit of l9?.soldUnits ?? []) byFloor.set(unit.floor, [...(byFloor.get(unit.floor) ?? []), unit.id]);
    for (const [floor, ids] of byFloor) {
      const expected = ids.map((_, i) => `l9-s-${String(floor).padStart(2, '0')}${String(i + 1).padStart(2, '0')}`);
      expect(ids.toSorted()).toEqual(expected);
    }
  });
});
