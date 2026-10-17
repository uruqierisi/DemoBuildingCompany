import { describe, expect, it } from 'vitest';
import {
  formatApartmentCode,
  formatForSaleCount,
  formatArea,
  formatAreaRange,
  formatFloorShort,
  formatAreaRounded,
  formatFloor,
  formatInteger,
  formatRoomCategory,
  formatUnitTypeName,
  distinctUnitTypeName,
  STATUS_LABELS,
} from './format';

const NBSP = ' ';

describe('format', () => {
  it('formats areas with Albanian decimals and a non-breaking space before m²', () => {
    expect(formatArea(56.85)).toBe(`56,85${NBSP}m²`);
    expect(formatArea(146.8)).toBe(`146,80${NBSP}m²`);
    expect(formatAreaRounded(146.8)).toBe(`147${NBSP}m²`);
  });

  it('groups large integers the Albanian way', () => {
    expect(formatInteger(12000)).toBe(`12${NBSP}000`);
    expect(formatInteger(1234567)).toBe(`1${NBSP}234${NBSP}567`);
    expect(formatInteger(1250)).toBe('1250');
    expect(formatInteger(-15000)).toBe(`−15${NBSP}000`);
  });

  it('formats area ranges and compact floors', () => {
    expect(formatAreaRange(54.3, 142.6)).toBe(`54,30–142,60${NBSP}m²`);
    expect(formatAreaRange(78.4, 78.4)).toBe(`78,40${NBSP}m²`);
    expect(formatFloorShort(0)).toBe('Përdhesë');
    expect(formatFloorShort(9)).toBe('9');
  });

  it('labels the ground floor and numbered floors', () => {
    expect(formatFloor(0)).toBe('Përdhesë');
    expect(formatFloor(3)).toBe(`Kati${NBSP}3`);
    expect(formatFloor(11)).toBe(`Kati${NBSP}11`);
  });

  it("names room categories in the market's terminology, with the correct spelling of Garsonierë", () => {
    expect(formatRoomCategory({ kind: 'studio' })).toBe('Garsonierë');
    expect(formatRoomCategory({ kind: 'bedrooms', count: 2 })).toBe(`2${NBSP}dhomëshe`);
    expect(formatRoomCategory({ kind: 'penthouse' })).toBe('Penthouse');
  });

  it('names unit types from category and area', () => {
    expect(formatUnitTypeName({ kind: 'bedrooms', count: 2 }, 78.4)).toBe(`Tipi 78,40${NBSP}m²`);
    expect(formatUnitTypeName({ kind: 'penthouse' }, 142.6)).toBe(`Penthouse 142,60${NBSP}m²`);
  });

  it('treats generated type names as not distinct, and keeps real ones', () => {
    const bedrooms = { kind: 'bedrooms', count: 2 } as const;
    expect(distinctUnitTypeName({ name: `Tipi 78,40${NBSP}m²`, category: bedrooms, areaM2: 78.4 })).toBeNull();
    expect(
      distinctUnitTypeName({ name: `Penthouse 142,60${NBSP}m²`, category: { kind: 'penthouse' }, areaM2: 142.6 }),
    ).toBeNull();
    expect(distinctUnitTypeName({ name: 'Dupleks A', category: bedrooms, areaM2: 78.4 })).toBe('Dupleks A');
    expect(formatUnitTypeName({ kind: 'studio' }, 39.24)).toBe(`Garsonierë 39,24${NBSP}m²`);
  });

  it('has an Albanian label for every status', () => {
    expect(STATUS_LABELS).toEqual({ available: 'Në shitje', reserved: 'E rezervuar', sold: 'E shitur' });
  });

  it('upper-cases apartment codes', () => {
    expect(formatApartmentCode('a1-301')).toBe('A1-301');
  });

  it('phrases for-sale counts, including none and one', () => {
    expect(formatForSaleCount(0)).toBe('Asnjë banesë në shitje');
    expect(formatForSaleCount(1)).toBe(`1${NBSP}banesë në shitje`);
    expect(formatForSaleCount(22)).toBe(`22${NBSP}banesa në shitje`);
  });
});
