import { describe, expect, it } from 'vitest';
import { createInitialState, editorReducer, toExportJson, type EditorState } from './editor-state';
import { distance, toImagePoint, toSvgPath } from './polygon';

const SIZE = { width: 2400, height: 1350 };
const IMAGE = '/renders/demo/overview.webp';

function withPoints(...coords: Array<[number, number]>): EditorState {
  return coords.reduce(
    (state, [x, y]) => editorReducer(state, { type: 'addPoint', point: { x, y } }),
    createInitialState(),
  );
}

describe('toSvgPath', () => {
  it('writes the canonical M/L/Z format', () => {
    expect(
      toSvgPath([
        { x: 10, y: 20 },
        { x: 30, y: 20 },
        { x: 30, y: 40 },
      ]),
    ).toBe('M10 20L30 20L30 40Z');
  });

  it('leaves open paths unclosed and handles no points', () => {
    expect(toSvgPath([{ x: 1, y: 2 }], false)).toBe('M1 2');
    expect(toSvgPath([])).toBe('');
  });
});

describe('toImagePoint', () => {
  const rect = { left: 100, top: 50, width: 1200, height: 675 };

  it('maps screen coordinates to rounded image pixels', () => {
    expect(toImagePoint({ x: 700, y: 387.5 }, rect, SIZE)).toEqual({ x: 1200, y: 675 });
    expect(toImagePoint({ x: 100.3, y: 50.2 }, rect, SIZE)).toEqual({ x: 1, y: 0 });
  });

  it('clamps points outside the image', () => {
    expect(toImagePoint({ x: 0, y: 2000 }, rect, SIZE)).toEqual({ x: 0, y: 1350 });
  });
});

describe('distance', () => {
  it('measures straight-line distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});

describe('editorReducer', () => {
  it('adds and undoes points', () => {
    const state = withPoints([1, 1], [2, 2]);
    expect(state.points).toHaveLength(2);
    expect(editorReducer(state, { type: 'undoPoint' }).points).toEqual([{ x: 1, y: 1 }]);
  });

  it('only closes a polygon with at least three points', () => {
    expect(editorReducer(withPoints([1, 1], [2, 2]), { type: 'close' }).isClosed).toBe(false);
    expect(editorReducer(withPoints([1, 1], [2, 2], [3, 1]), { type: 'close' }).isClosed).toBe(true);
  });

  it('ignores new points once closed, and undo reopens before removing points', () => {
    const closed = editorReducer(withPoints([1, 1], [2, 2], [3, 1]), { type: 'close' });
    expect(editorReducer(closed, { type: 'addPoint', point: { x: 9, y: 9 } }).points).toHaveLength(3);
    const reopened = editorReducer(closed, { type: 'undoPoint' });
    expect(reopened.isClosed).toBe(false);
    expect(reopened.points).toHaveLength(3);
  });

  it('clears the draft', () => {
    expect(editorReducer(withPoints([1, 1]), { type: 'clear' }).points).toEqual([]);
  });

  it('assigns a closed polygon, resets the draft, and replaces an earlier trace of the same target', () => {
    const assign = { type: 'assign', kind: 'building', id: 'objekti-a1', image: IMAGE, imageSize: SIZE } as const;
    const traceAndAssign = (start: EditorState, coords: Array<[number, number]>) => {
      const drawn = coords.reduce(
        (state, [x, y]) => editorReducer(state, { type: 'addPoint', point: { x, y } }),
        start,
      );
      return editorReducer(editorReducer(drawn, { type: 'close' }), assign);
    };

    const first = traceAndAssign(createInitialState(), [
      [1, 1],
      [2, 2],
      [3, 1],
    ]);
    expect(first.points).toEqual([]);
    expect(first.isClosed).toBe(false);
    expect(first.traced).toEqual([
      { kind: 'building', id: 'objekti-a1', image: IMAGE, imageSize: SIZE, svgPath: 'M1 1L2 2L3 1Z' },
    ]);

    const retraced = traceAndAssign(first, [
      [5, 5],
      [6, 6],
      [7, 5],
    ]);
    expect(retraced.traced).toHaveLength(1);
    expect(retraced.traced[0]?.svgPath).toBe('M5 5L6 6L7 5Z');
  });

  it('does not assign an open polygon', () => {
    const state = withPoints([1, 1], [2, 2], [3, 1]);
    const next = editorReducer(state, {
      type: 'assign',
      kind: 'apartment',
      id: 'a1-101',
      image: IMAGE,
      imageSize: SIZE,
    });
    expect(next).toBe(state);
  });

  it('removes one traced polygon and resets the whole session', () => {
    const traced = [
      { kind: 'building', id: 'a', image: IMAGE, imageSize: SIZE, svgPath: 'M0 0L1 1L2 0Z' },
      { kind: 'building', id: 'b', image: IMAGE, imageSize: SIZE, svgPath: 'M0 0L1 1L2 0Z' },
    ] as const;
    const state = createInitialState(traced);
    expect(editorReducer(state, { type: 'remove', image: IMAGE, id: 'a' }).traced.map((p) => p.id)).toEqual(['b']);
    expect(editorReducer(state, { type: 'resetSession' }).traced).toEqual([]);
  });

  it('restores a removed polygon (undo)', () => {
    const polygon = {
      kind: 'apartment',
      id: 'a1-101',
      image: IMAGE,
      imageSize: SIZE,
      svgPath: 'M0 0L1 1L2 0Z',
    } as const;
    const removed = editorReducer(createInitialState([polygon]), { type: 'remove', image: IMAGE, id: 'a1-101' });
    expect(editorReducer(removed, { type: 'restore', polygon }).traced).toEqual([polygon]);
  });
});

describe('sold units', () => {
  it('records building and floor so a new sold unit can be created in the data', () => {
    const closed = editorReducer(withPoints([1, 1], [2, 2], [3, 1]), { type: 'close' });
    const state = editorReducer(closed, {
      type: 'assign',
      kind: 'sold',
      id: 'b1-s-0301',
      buildingId: 'objekti-b1',
      floor: 3,
      image: 'rezidenca-arrita:objekti-b1',
      imageSize: { width: 2568, height: 2160 },
    });
    expect(state.traced[0]).toMatchObject({ kind: 'sold', id: 'b1-s-0301', buildingId: 'objekti-b1', floor: 3 });
  });

  it('does not attach building or floor to apartments', () => {
    const closed = editorReducer(withPoints([1, 1], [2, 2], [3, 1]), { type: 'close' });
    const state = editorReducer(closed, {
      type: 'assign',
      kind: 'apartment',
      id: 'b1-301',
      image: 'rezidenca-arrita:objekti-b1',
      imageSize: { width: 2568, height: 2160 },
    });
    expect(state.traced[0]).not.toHaveProperty('floor');
    expect(state.traced[0]).not.toHaveProperty('buildingId');
  });
});

describe('toExportJson', () => {
  it('wraps polygons with the project id', () => {
    const polygon = { kind: 'building', id: 'a', image: IMAGE, imageSize: SIZE, svgPath: 'M0 0L1 1L2 0Z' } as const;
    expect(JSON.parse(toExportJson('rezidenca-arrita', [polygon]))).toEqual({
      project: 'rezidenca-arrita',
      polygons: [polygon],
    });
  });
});
