import { describe, expect, it } from 'vitest';
import { rezidencaArrita } from '@/data/rezidenca-arrita';
import type { Apartment, Building, UnitType } from '@/data/types';
import {
  countByStatus,
  deriveAreaRange,
  deriveBuildingFacts,
  deriveFloors,
  deriveInventoryStats,
  deriveProjectTotals,
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
    expect(findBuilding(rezidencaArrita, 'objekti-b2')?.name).toBe('Objekti B2');
    expect(findBuilding(rezidencaArrita, 'objekti-zz')).toBeUndefined();
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
  it('derives the for-sale counts and area', () => {
    const stats = Object.fromEntries(deriveInventoryStats([building]).map((s) => [s.id, s.value]));
    // Fixture: x-901 (100 m²), x-p01 (40 m²) and x-102 (100 m²) are available.
    expect(stats).toEqual({ buildingsForSale: 1, forSale: 3, areaForSale: 240 });
  });
});

describe('deriveProjectTotals', () => {
  it('counts buildings, every apartment and its area, and the sold ones', () => {
    const totals = Object.fromEntries(deriveProjectTotals([building]).map((s) => [s.id, s.value]));
    // Fixture: 5 apartments, 50 + 100 + 40 + 50 + 100 m², one sold.
    expect(totals).toEqual({ buildings: 1, apartments: 5, area: 340, sold: 1 });
  });
});

describe('Rezidenca Arrita inventory', () => {
  it('has 104 apartments across four buildings', () => {
    const counts = Object.fromEntries(
      rezidencaArrita.buildings.map((b) => [b.id, [b.unitTypes.length, b.apartments.length]]),
    );
    expect(counts).toEqual({
      'objekti-a1': [8, 36],
      'objekti-a2': [8, 36],
      'objekti-b1': [6, 16],
      'objekti-b2': [7, 16],
    });
  });

  it('includes ground-floor apartments, studios and penthouses', () => {
    const all = rezidencaArrita.buildings.flatMap(getApartmentDetails);
    expect(all.some((a) => a.floor === 0)).toBe(true);
    expect(all.some((a) => a.unitType.category.kind === 'studio')).toBe(true);
    expect(all.some((a) => a.unitType.category.kind === 'penthouse')).toBe(true);
  });
});

describe('deriveBuildingFacts', () => {
  it('summarises the apartments for sale of B1, listing reserved ones but not sold ones', () => {
    const b1 = rezidencaArrita.buildings.find((b) => b.id === 'objekti-b1');
    if (!b1) throw new Error('fixture needs B1');
    const facts = deriveBuildingFacts(b1);
    expect(facts.forSale.map((a) => a.id)).toEqual(['b1-p02', 'b1-501']);
    expect(facts.listed.map((a) => a.id)).toEqual(['b1-p01', 'b1-p02', 'b1-301', 'b1-501']);
    expect(facts.areaRange).toEqual({ min: 54.3, max: 118.7 });
    expect(facts.categories.map(roomCategoryKey)).toEqual(['1', 'penthouse']);
    expect(facts.floors).toEqual([0, 5]);
  });
});
