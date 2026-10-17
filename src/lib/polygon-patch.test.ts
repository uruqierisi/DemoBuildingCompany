import { describe, expect, it } from 'vitest';
import { applyPolygonUpdates } from './polygon-patch';

const SOURCE = `const buildings = [
  {
    id: 'objekti-a1',
    name: 'Objekti A1',
    svgPath: 'M0 0L1 1L2 0Z',
    apartments: [
      { id: 'a1-101', unitTypeId: 'tipi-48-60', buildingId: 'objekti-a1', floor: 1, status: 'sold', svgPath: '' },
      { id: 'a1-102', unitTypeId: 'tipi-48-60', buildingId: 'objekti-a1', floor: 1, status: 'sold', svgPath: 'M9 9Z' },
    ],
  },
];`;

describe('applyPolygonUpdates', () => {
  it('replaces the svgPath of a building without touching its apartments', () => {
    const result = applyPolygonUpdates(SOURCE, [{ id: 'objekti-a1', svgPath: 'M10 10L20 10L20 20Z' }]);
    expect(result.applied).toEqual(['objekti-a1']);
    expect(result.output).toContain("name: 'Objekti A1',\n    svgPath: 'M10 10L20 10L20 20Z',");
    expect(result.output).toContain(
      "id: 'a1-102', unitTypeId: 'tipi-48-60', buildingId: 'objekti-a1', floor: 1, status: 'sold', svgPath: 'M9 9Z'",
    );
  });

  it('fills an empty apartment svgPath on its own line only', () => {
    const result = applyPolygonUpdates(SOURCE, [{ id: 'a1-101', svgPath: 'M1 1L2 2L3 1Z' }]);
    expect(result.output).toContain("floor: 1, status: 'sold', svgPath: 'M1 1L2 2L3 1Z' },\n      { id: 'a1-102'");
    expect(result.output).toContain("svgPath: 'M9 9Z'");
  });

  it('reports unknown ids and refuses unsafe paths', () => {
    const result = applyPolygonUpdates(SOURCE, [
      { id: 'objekti-zz', svgPath: 'M1 1Z' },
      { id: 'a1-101', svgPath: "M1 1Z', status: 'available" },
    ]);
    expect(result.notFound).toEqual(['objekti-zz']);
    expect(result.rejected).toEqual(['a1-101']);
    expect(result.output).toBe(SOURCE);
  });

  it('never matches the tail of buildingId or unitTypeId', () => {
    const source = "{ buildingId: 'x-1', svgPath: 'M0 0Z' }\n{ id: 'x-1', svgPath: '' }";
    const result = applyPolygonUpdates(source, [{ id: 'x-1', svgPath: 'M5 5Z' }]);
    expect(result.output).toBe("{ buildingId: 'x-1', svgPath: 'M0 0Z' }\n{ id: 'x-1', svgPath: 'M5 5Z' }");
  });

  it('does not mistake an id prefix for another id', () => {
    const result = applyPolygonUpdates(SOURCE, [{ id: 'a1-10', svgPath: 'M1 1Z' }]);
    expect(result.notFound).toEqual(['a1-10']);
  });
});

describe('applyPolygonUpdates without an existing svgPath field', () => {
  it('inserts the field on its own line in a multi-line object', () => {
    const source =
      "  {\n    id: 'objekti-a2',\n    name: 'Objekti A2',\n    apartments: [\n      {\n        id: 'a2-101',\n        floor: 1,\n      },\n    ],\n  },";
    const result = applyPolygonUpdates(source, [{ id: 'objekti-a2', svgPath: 'M1 1L2 2L3 1Z' }]);
    expect(result.applied).toEqual(['objekti-a2']);
    expect(result.output).toContain("    id: 'objekti-a2',\n    svgPath: 'M1 1L2 2L3 1Z',\n    name: 'Objekti A2',");
  });

  it('inserts the field inline in a one-line object and leaves neighbours alone', () => {
    const source = "{ id: 'a2-101', floor: 1 },\n{ id: 'a2-102', floor: 1 },";
    const result = applyPolygonUpdates(source, [{ id: 'a2-101', svgPath: 'M5 5Z' }]);
    expect(result.output).toBe("{ id: 'a2-101', svgPath: 'M5 5Z', floor: 1 },\n{ id: 'a2-102', floor: 1 },");
  });
});

describe('applyPolygonUpdates for sold units', () => {
  const BUILDINGS = [
    '  {',
    "    id: 'objekti-b2',",
    '    apartments: [],',
    '    soldUnits: [],',
    '  },',
    '  {',
    "    id: 'objekti-b1',",
    '    apartments: [',
    "      { id: 'b1-301', unitTypeId: 'tipi-96-26', buildingId: 'objekti-b1', floor: 3, status: 'available' },",
    '    ],',
    '    soldUnits: [],',
    '  },',
  ].join('\n');
  const sold = (id: string, floor: number, svgPath = 'M1 1L2 2L3 1Z') =>
    ({ kind: 'sold', id, buildingId: 'objekti-b1', floor, svgPath }) as const;

  it("creates a new sold unit in its own building's empty soldUnits array", () => {
    const result = applyPolygonUpdates(BUILDINGS, [sold('b1-s-0301', 3)]);
    expect(result.applied).toEqual(['b1-s-0301']);
    expect(result.output).toContain(
      "    soldUnits: [\n      { id: 'b1-s-0301', buildingId: 'objekti-b1', floor: 3, svgPath: 'M1 1L2 2L3 1Z' },\n    ],",
    );
    // L8's array is untouched.
    expect(result.output).toContain("    id: 'objekti-b2',\n    apartments: [],\n    soldUnits: [],");
  });

  it('appends further sold units, and updates an existing one in place when re-traced', () => {
    const first = applyPolygonUpdates(BUILDINGS, [sold('b1-s-0301', 3), sold('b1-s-0302', 3)]).output;
    expect(first).toContain(
      "      { id: 'b1-s-0301', buildingId: 'objekti-b1', floor: 3, svgPath: 'M1 1L2 2L3 1Z' },\n      { id: 'b1-s-0302',",
    );
    const retraced = applyPolygonUpdates(first, [sold('b1-s-0301', 3, 'M9 9L8 8L7 9Z')]);
    expect(retraced.applied).toEqual(['b1-s-0301']);
    expect(retraced.output).toContain(
      "{ id: 'b1-s-0301', buildingId: 'objekti-b1', floor: 3, svgPath: 'M9 9L8 8L7 9Z' }",
    );
    expect(retraced.output.match(/b1-s-0301/g)).toHaveLength(1);
  });

  it('prepends inline to a one-line array', () => {
    const inline = "id: 'objekti-b1', soldUnits: [{ id: 'b1-s-0001', buildingId: 'objekti-b1', floor: 0 }],";
    const result = applyPolygonUpdates(inline, [sold('b1-s-0101', 1)]);
    expect(result.output).toContain(
      "soldUnits: [{ id: 'b1-s-0101', buildingId: 'objekti-b1', floor: 1, svgPath: 'M1 1L2 2L3 1Z' }, { id: 'b1-s-0001'",
    );
  });

  it('rejects malformed new sold units and reports unknown buildings', () => {
    const result = applyPolygonUpdates(BUILDINGS, [
      sold('b1-s-3', 3),
      { ...sold('b1-s-0401', 4), floor: 2.5 },
      { ...sold('zz-s-0101', 1), buildingId: 'objekti-zz' },
    ]);
    expect(result.rejected).toEqual(['b1-s-3', 'b1-s-0401']);
    expect(result.notFound).toEqual(['zz-s-0101']);
    expect(result.output).toBe(BUILDINGS);
  });
});
