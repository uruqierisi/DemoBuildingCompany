import { describe, expect, it } from 'vitest';
import { getPathBounds, parsePolygonPath } from './svg-path';

describe('parsePolygonPath', () => {
  it('reads absolute M/L polygons in the editor format', () => {
    expect(parsePolygonPath('M10 20L30 20L30 40Z')).toEqual([
      { x: 10, y: 20 },
      { x: 30, y: 20 },
      { x: 30, y: 40 },
    ]);
  });

  it('reads comma-separated, decimal and implicit lineto coordinates', () => {
    expect(parsePolygonPath('M1.5,2.5 3,4 5,6z')).toEqual([
      { x: 1.5, y: 2.5 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
    ]);
  });

  it('resolves relative and H/V commands', () => {
    expect(parsePolygonPath('M10 10l5 0h5v5V30H10Z')).toEqual([
      { x: 10, y: 10 },
      { x: 15, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 15 },
      { x: 20, y: 30 },
      { x: 10, y: 30 },
    ]);
  });

  it('returns no points for an empty (untraced) path', () => {
    expect(parsePolygonPath('')).toEqual([]);
  });
});

describe('getPathBounds', () => {
  it('returns the bounding box of the polygon', () => {
    expect(getPathBounds('M180 512L335 540L430 512L430 1032L335 1060L180 1032Z')).toEqual({
      minX: 180,
      minY: 512,
      maxX: 430,
      maxY: 1060,
    });
  });

  it('returns undefined for an empty path', () => {
    expect(getPathBounds('')).toBeUndefined();
  });
});
