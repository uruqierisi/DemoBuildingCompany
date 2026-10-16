import { describe, expect, it } from 'vitest';
import { gardenBuildings } from '@/data/garden-buildings';
import type { Apartment, Building, UnitType } from '@/data/types';
import {
  countByStatus,
  deriveAreaRange,
  deriveBuildingFacts,
  deriveFloors,
  deriveInventoryStats,
  deriveRoomCategories,
  roomCategoryKey,
  findApartmentDetails,
  findBuilding,
  getApartmentDetails,
  summarizeBuilding,
} from './inventory';

const unitTypes: UnitType[] = [
  { id: 'a', name: 'Tipi A', category: { kind: 'bedrooms', count: 1 }, areaM2: 50 },
  { id: 'b', name: 'Penthouse B', category: { kind: 'penthouse' }, areaM2: 100 },
  { id: 'c', name: 'Garsonierë C', category: { kind: 'studio' }, areaM2: 40 },
];

function apartment(id: string, overrides: Partial<Apartment> = {}): Apartment {
  return { id, unitTypeId: 'a', buildingId: 'x', floor: 1, status: 'available', ...overrides };
}

const building: Building = {
  id: 'objekti-x',
  name: 'Objekti X',
  unitTypes,
  soldUnits: [],
  apartments: [
    apartment('x-201', { floor: 2, status: 'sold' }),
    apartment('x-901', { floor: 9, unitTypeId: 'b' }),
    apartment('x-p01', { floor: 0, unitTypeId: 'c' }),
    apartment('x-101', { floor: 1, status: 'reserved' }),
    apartment('x-102', { floor: 1, unitTypeId: 'b' }),
  ],
};

describe('deriveFloors', () => {
  it('returns unique floors ascending, ground floor first', () => {
    expect(deriveFloors(building.apartments)).toEqual([0, 1, 2, 9]);
  });

  it('returns an empty list for a building without apartments', () => {
    expect(deriveFloors([])).toEqual([]);
  });
});

describe('deriveRoomCategories', () => {
  it('returns unique categories: studio, then bedrooms ascending, then penthouse', () => {
    expect(deriveRoomCategories(getApartmentDetails(building)).map(roomCategoryKey)).toEqual([
      'garsoniere',
      '1',
      'penthouse',
    ]);
  });
});

describe('countByStatus', () => {
  it('counts every status, including ones with zero apartments', () => {
    expect(countByStatus(building.apartments)).toEqual({ available: 3, reserved: 1, sold: 1 });
    expect(countByStatus([])).toEqual({ available: 0, reserved: 0, sold: 0 });
  });
});

describe('getApartmentDetails', () => {
  it('joins each apartment with its unit type', () => {
    const details = getApartmentDetails(building);
    expect(details).toHaveLength(5);
    expect(details.find((a) => a.id === 'x-901')?.unitType.category.kind).toBe('penthouse');
  });

  it('leaves out apartments whose unit type is missing', () => {
    const broken: Building = { ...building, apartments: [apartment('x-1', { unitTypeId: 'missing' })] };
    const originalError = console.error;
    console.error = () => undefined;
    try {
      expect(getApartmentDetails(broken)).toEqual([]);
    } finally {
      console.error = originalError;
    }
  });
});

describe('lookups', () => {
  it('finds buildings and apartments by id', () => {
    expect(findBuilding(gardenBuildings, 'objekti-h4')?.name).toBe('Objekti H4');
    expect(findBuilding(gardenBuildings, 'objekti-zz')).toBeUndefined();
    expect(findApartmentDetails(building, 'x-102')?.unitType.id).toBe('b');
    expect(findApartmentDetails(building, 'nope')).toBeUndefined();
  });
});

describe('summarizeBuilding', () => {
  it('counts apartments, availability and floors', () => {
    expect(summarizeBuilding(building)).toMatchObject({ forSale: 3, topFloor: 9, hasPenthouse: true });
  });

  it('handles a building without apartments', () => {
    expect(summarizeBuilding({ ...building, apartments: [], unitTypes: unitTypes.slice(0, 1) })).toMatchObject({
      forSale: 0,
      topFloor: undefined,
      hasPenthouse: false,
    });
  });
});

describe('deriveAreaRange', () => {
  it('returns min and max unit area, or undefined without apartments', () => {
    expect(deriveAreaRange([building])).toEqual({ min: 40, max: 100 });
    expect(deriveAreaRange([{ ...building, apartments: [] }])).toBeUndefined();
  });
});

describe('deriveInventoryStats', () => {
  it('derives for-sale counts and area, never a total apartment count', () => {
    const stats = Object.fromEntries(deriveInventoryStats([building]).map((s) => [s.id, s.value]));
    // Fixture: x-901 (100 m²), x-p01 (40 m²) and x-102 (100 m²) are available.
    expect(stats).toEqual({ buildingsForSale: 1, forSale: 3, areaForSale: 240 });
  });
});

describe('Garden Buildings real inventory', () => {
  const byId = Object.fromEntries(gardenBuildings.buildings.map((b) => [b.id, b]));

  it('has one apartment per published unit type and floor (127 in total)', () => {
    const counts = Object.fromEntries(
      gardenBuildings.buildings.map((b) => [b.id, [b.unitTypes.length, b.apartments.length]]),
    );
    expect(counts).toEqual({
      'objekti-h2': [1, 1],
      'objekti-h3': [1, 1],
      'objekti-h4': [26, 59],
      'objekti-l4': [7, 8],
      'objekti-l7': [12, 31],
      'objekti-l8': [12, 24],
      'objekti-l9': [3, 3],
    });
  });

  it('gives every L9 unit type its floor plan', () => {
    expect(byId['objekti-l9']?.unitTypes.every((t) => t.plan !== undefined)).toBe(true);
  });

  it('marks every published apartment as for sale, since Pozhegu lists only units still for sale', () => {
    const all = gardenBuildings.buildings.flatMap((b) => b.apartments);
    expect(all.every((a) => a.status === 'available')).toBe(true);
  });

  it('keeps sold units consistent: own building, unique ids in the sold-unit format', () => {
    const sold = gardenBuildings.buildings.flatMap((b) => b.soldUnits.map((u) => ({ ...u, owner: b.id })));
    expect(sold.every((u) => u.buildingId === u.owner && /^[a-z0-9]+-s-\d{4}$/.test(u.id))).toBe(true);
    expect(new Set(sold.map((u) => u.id)).size).toBe(sold.length);
  });

  it('includes ground-floor apartments and the studio category', () => {
    const all = gardenBuildings.buildings.flatMap(getApartmentDetails);
    expect(all.some((a) => a.floor === 0)).toBe(true);
    expect(all.some((a) => a.unitType.category.kind === 'studio')).toBe(true);
  });
});

describe('Garden Buildings data integrity', () => {
  const allApartments = gardenBuildings.buildings.flatMap((b) => b.apartments);

  it('contains the seven buildings of the project', () => {
    expect(gardenBuildings.buildings.map((b) => b.id)).toEqual([
      'objekti-h2',
      'objekti-h3',
      'objekti-h4',
      'objekti-l4',
      'objekti-l7',
      'objekti-l8',
      'objekti-l9',
    ]);
  });

  it('uses project-unique apartment ids', () => {
    const ids = allApartments.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('links every apartment to its own building and an existing unit type', () => {
    for (const b of gardenBuildings.buildings) {
      const typeIds = new Set(b.unitTypes.map((t) => t.id));
      for (const a of b.apartments) {
        expect(a.buildingId).toBe(b.id);
        expect(typeIds.has(a.unitTypeId)).toBe(true);
      }
    }
  });
});

describe('deriveBuildingFacts', () => {
  it('summarises the apartments for sale of L9', () => {
    const l9 = gardenBuildings.buildings.find((b) => b.id === 'objekti-l9');
    if (!l9) throw new Error('fixture needs L9');
    const facts = deriveBuildingFacts(l9);
    expect(facts.forSale.map((a) => a.id)).toEqual(['l9-p01', 'l9-301', 'l9-901']);
    expect(facts.areaRange).toEqual({ min: 89.01, max: 139.44 });
    expect(facts.categories.map(roomCategoryKey)).toEqual(['2', 'penthouse']);
    expect(facts.floors).toEqual([0, 3, 9]);
  });
});
