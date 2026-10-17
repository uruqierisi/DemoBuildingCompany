import { describe, expect, it } from 'vitest';
import { buildingCode, nextSoldUnitId, soldUnitFloorOptions, soldUnitId } from './sold-units';

describe('sold unit ids', () => {
  it('derive from building, floor and sequence', () => {
    expect(buildingCode('objekti-b1')).toBe('b1');
    expect(soldUnitId('objekti-b1', 3, 1)).toBe('b1-s-0301');
    expect(soldUnitId('objekti-a2', 0, 12)).toBe('a2-s-0012');
    expect(soldUnitId('objekti-a2', 11, 2)).toBe('a2-s-1102');
  });

  it('pick the next free sequence on the floor', () => {
    const taken = new Set(['b1-s-0301', 'b1-s-0302', 'b1-s-0401']);
    expect(nextSoldUnitId('objekti-b1', 3, taken)).toBe('b1-s-0303');
    expect(nextSoldUnitId('objekti-b1', 4, taken)).toBe('b1-s-0402');
    expect(nextSoldUnitId('objekti-b1', 5, taken)).toBe('b1-s-0501');
  });

  it('offer floors from the ground floor to a few above the highest known unit', () => {
    expect(soldUnitFloorOptions([0, 3, 9])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(soldUnitFloorOptions([])).toEqual([0, 1, 2, 3]);
  });
});
