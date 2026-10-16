import { describe, expect, it } from 'vitest';
import type { ApartmentDetails } from '@/data/types';
import { applyFilters, hasActiveFilters, parseFilters, withFilters } from './apartment-filters';

const apartment = (
  id: string,
  floor: number,
  category: ApartmentDetails['unitType']['category'],
): ApartmentDetails => ({
  id,
  floor,
  unitTypeId: id,
  buildingId: 'objekti-x',
  status: 'available',
  unitType: { id, name: id, category, areaM2: 50 },
});

const apartments = [
  apartment('a', 0, { kind: 'bedrooms', count: 2 }),
  apartment('b', 3, { kind: 'bedrooms', count: 2 }),
  apartment('c', 9, { kind: 'penthouse' }),
  apartment('d', 3, { kind: 'studio' }),
];
const options = { rooms: ['garsoniere', '2', 'penthouse'], floors: [0, 3, 9] };

describe('parseFilters', () => {
  it('reads valid values from the URL', () => {
    expect(parseFilters(new URLSearchParams('dhoma=2&kati=3'), options)).toEqual({ room: '2', floor: 3 });
    expect(parseFilters(new URLSearchParams('kati=0'), options)).toEqual({ room: null, floor: 0 });
  });

  it('ignores values that are not in the data or malformed', () => {
    expect(parseFilters(new URLSearchParams('dhoma=5&kati=12'), options)).toEqual({ room: null, floor: null });
    expect(parseFilters(new URLSearchParams('kati=3a&dhoma='), options)).toEqual({ room: null, floor: null });
  });
});

describe('withFilters', () => {
  it('sets and clears filter params without touching others or mutating the input', () => {
    const input = new URLSearchParams('utm=x&dhoma=2');
    const next = withFilters(input, { room: null, floor: 9 });
    expect(next.toString()).toBe('utm=x&kati=9');
    expect(input.toString()).toBe('utm=x&dhoma=2');
  });
});

describe('applyFilters', () => {
  it('filters by room category and floor', () => {
    expect(applyFilters(apartments, { room: '2', floor: null }).map((a) => a.id)).toEqual(['a', 'b']);
    expect(applyFilters(apartments, { room: null, floor: 3 }).map((a) => a.id)).toEqual(['b', 'd']);
    expect(applyFilters(apartments, { room: 'penthouse', floor: 3 })).toEqual([]);
    expect(applyFilters(apartments, { room: null, floor: null })).toHaveLength(4);
  });

  it('reports whether any filter is active', () => {
    expect(hasActiveFilters({ room: null, floor: null })).toBe(false);
    expect(hasActiveFilters({ room: 'garsoniere', floor: null })).toBe(true);
  });
});
