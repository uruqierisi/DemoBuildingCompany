import { describe, expect, it } from 'vitest';
import { buildingCode, nextSoldUnitId, soldUnitFloorOptions, soldUnitId } from './sold-units';

describe('sold unit ids', () => {
  it('derive from building, floor and sequence', () => {
    expect(buildingCode('objekti-l9')).toBe('l9');
    expect(soldUnitId('objekti-l9', 3, 1)).toBe('l9-s-0301');
    expect(soldUnitId('objekti-h4', 0, 12)).toBe('h4-s-0012');
    expect(soldUnitId('objekti-h4', 11, 2)).toBe('h4-s-1102');
  });

  it('pick the next free sequence on the floor', () => {
    const taken = new Set(['l9-s-0301', 'l9-s-0302', 'l9-s-0401']);
    expect(nextSoldUnitId('objekti-l9', 3, taken)).toBe('l9-s-0303');
    expect(nextSoldUnitId('objekti-l9', 4, taken)).toBe('l9-s-0402');
    expect(nextSoldUnitId('objekti-l9', 5, taken)).toBe('l9-s-0501');
  });

  it('offer floors from the ground floor to a few above the highest known unit', () => {
    expect(soldUnitFloorOptions([0, 3, 9])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(soldUnitFloorOptions([])).toEqual([0, 1, 2, 3]);
  });
});
