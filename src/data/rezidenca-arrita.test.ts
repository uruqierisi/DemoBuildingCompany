import { describe, expect, it } from 'vitest';
import { countByStatus } from '@/lib/inventory';
import { buildingCode } from '@/lib/sold-units';
import { parsePolygonPath } from '@/lib/svg-path';
import { rezidencaArrita } from './rezidenca-arrita';
import type { RenderImage } from './types';

const { buildings } = rezidencaArrita;
const apartments = buildings.flatMap((building) => building.apartments);

describe('Rezidenca Arrita data', () => {
  it('has four buildings with unique ids', () => {
    expect(buildings.map((b) => b.id)).toEqual(['objekti-a1', 'objekti-a2', 'objekti-b1', 'objekti-b2']);
  });

  it('gives every apartment a unique id prefixed with its building code', () => {
    expect(new Set(apartments.map((a) => a.id)).size).toBe(apartments.length);
    for (const building of buildings) {
      for (const apartment of building.apartments) {
        expect(apartment.buildingId).toBe(building.id);
        expect(apartment.id.startsWith(`${buildingCode(building.id)}-`)).toBe(true);
      }
    }
  });

  it('links every apartment to a unit type of its own building, and lists no unused type', () => {
    for (const building of buildings) {
      const typeIds = building.unitTypes.map((t) => t.id);
      expect(new Set(typeIds).size).toBe(typeIds.length);
      const used = new Set(building.apartments.map((a) => a.unitTypeId));
      expect([...used].every((id) => typeIds.includes(id))).toBe(true);
      expect(typeIds.every((id) => used.has(id))).toBe(true);
    }
  });

  it('numbers apartments by floor: "p01" on the ground floor, "<floor><nn>" above', () => {
    for (const apartment of apartments) {
      const unit = apartment.id.split('-')[1] ?? '';
      if (apartment.floor === 0) expect(unit).toMatch(/^p\d{2}$/);
      else expect(unit.slice(0, -2)).toBe(String(apartment.floor));
    }
  });

  it('mixes all three statuses, and keeps something for sale in every building', () => {
    const counts = countByStatus(apartments);
    expect(counts.available).toBeGreaterThan(0);
    expect(counts.reserved).toBeGreaterThan(0);
    expect(counts.sold).toBeGreaterThan(0);
    for (const building of buildings) expect(countByStatus(building.apartments).available).toBeGreaterThan(0);
  });

  it('uses plausible areas per room category', () => {
    for (const unitType of buildings.flatMap((b) => b.unitTypes)) {
      const { category, areaM2 } = unitType;
      if (category.kind === 'studio') expect(areaM2).toBeLessThan(45);
      if (category.kind === 'penthouse') expect(areaM2).toBeGreaterThan(100);
      if (category.kind === 'bedrooms') expect(areaM2).toBeGreaterThan(45 + category.count * 5);
    }
  });

  it('traces every building on the aerial and every A1 apartment on its facade', () => {
    expect(buildings.every((b) => b.svgPath)).toBe(true);
    const a1 = buildings.find((b) => b.id === 'objekti-a1');
    expect(a1?.render).toBeDefined();
    expect(a1?.apartments.every((a) => a.svgPath)).toBe(true);
    expect(rezidencaArrita.overview?.buildingIds).toEqual(buildings.map((b) => b.id));
  });

  it('marks a few A1 apartments for sale or reserved and the rest sold, as on its facade', () => {
    const counts = countByStatus(buildings.find((b) => b.id === 'objekti-a1')?.apartments ?? []);
    expect(counts).toEqual({ available: 6, reserved: 2, sold: 28 });
  });

  it('keeps every traced polygon simple (4–8 points) and inside its render', () => {
    const traced: { image: RenderImage | undefined; path: string }[] = [
      ...buildings.flatMap((b) => (b.svgPath ? [{ image: rezidencaArrita.overview?.image, path: b.svgPath }] : [])),
      ...buildings.flatMap((b) =>
        [...b.apartments, ...b.soldUnits].flatMap((u) => (u.svgPath ? [{ image: b.render, path: u.svgPath }] : [])),
      ),
    ];
    for (const { image, path } of traced) {
      expect(image).toBeDefined();
      const points = parsePolygonPath(path);
      expect(points.length).toBeGreaterThanOrEqual(4);
      expect(points.length).toBeLessThanOrEqual(8);
      expect(
        points.every(({ x, y }) => x >= 0 && y >= 0 && x <= (image?.width ?? 0) && y <= (image?.height ?? 0)),
      ).toBe(true);
    }
  });
});
