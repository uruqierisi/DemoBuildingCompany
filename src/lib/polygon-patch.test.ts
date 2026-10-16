import { describe, expect, it } from 'vitest';
import { applyPolygonUpdates } from './polygon-patch';

const SOURCE = `const buildings = [
  {
    id: 'objekti-h2',
    name: 'Objekti H2',
    svgPath: 'M0 0L1 1L2 0Z',
    apartments: [
      { id: 'h2-101', unitTypeId: 'tipi-48-60', buildingId: 'objekti-h2', floor: 1, status: 'sold', svgPath: '' },
      { id: 'h2-102', unitTypeId: 'tipi-48-60', buildingId: 'objekti-h2', floor: 1, status: 'sold', svgPath: 'M9 9Z' },
    ],
  },
];`;

describe('applyPolygonUpdates', () => {
  it('replaces the svgPath of a building without touching its apartments', () => {
    const result = applyPolygonUpdates(SOURCE, [{ id: 'objekti-h2', svgPath: 'M10 10L20 10L20 20Z' }]);
    expect(result.applied).toEqual(['objekti-h2']);
    expect(result.output).toContain("name: 'Objekti H2',\n    svgPath: 'M10 10L20 10L20 20Z',");
    expect(result.output).toContain(
      "id: 'h2-102', unitTypeId: 'tipi-48-60', buildingId: 'objekti-h2', floor: 1, status: 'sold', svgPath: 'M9 9Z'",
    );
  });

  it('fills an empty apartment svgPath on its own line only', () => {
    const result = applyPolygonUpdates(SOURCE, [{ id: 'h2-101', svgPath: 'M1 1L2 2L3 1Z' }]);
    expect(result.output).toContain("floor: 1, status: 'sold', svgPath: 'M1 1L2 2L3 1Z' },\n      { id: 'h2-102'");
    expect(result.output).toContain("svgPath: 'M9 9Z'");
  });

  it('reports unknown ids and refuses unsafe paths', () => {
    const result = applyPolygonUpdates(SOURCE, [
      { id: 'objekti-zz', svgPath: 'M1 1Z' },
      { id: 'h2-101', svgPath: "M1 1Z', status: 'available" },
    ]);
    expect(result.notFound).toEqual(['objekti-zz']);
    expect(result.rejected).toEqual(['h2-101']);
    expect(result.output).toBe(SOURCE);
  });

  it('never matches the tail of buildingId or unitTypeId', () => {
    const source = "{ buildingId: 'x-1', svgPath: 'M0 0Z' }\n{ id: 'x-1', svgPath: '' }";
    const result = applyPolygonUpdates(source, [{ id: 'x-1', svgPath: 'M5 5Z' }]);
    expect(result.output).toBe("{ buildingId: 'x-1', svgPath: 'M0 0Z' }\n{ id: 'x-1', svgPath: 'M5 5Z' }");
  });

  it('does not mistake an id prefix for another id', () => {
    const result = applyPolygonUpdates(SOURCE, [{ id: 'h2-10', svgPath: 'M1 1Z' }]);
    expect(result.notFound).toEqual(['h2-10']);
  });
});

describe('applyPolygonUpdates without an existing svgPath field', () => {
  it('inserts the field on its own line in a multi-line object', () => {
    const source =
      "  {\n    id: 'objekti-h4',\n    name: 'Objekti H4',\n    apartments: [\n      {\n        id: 'h4-101',\n        floor: 1,\n      },\n    ],\n  },";
    const result = applyPolygonUpdates(source, [{ id: 'objekti-h4', svgPath: 'M1 1L2 2L3 1Z' }]);
    expect(result.applied).toEqual(['objekti-h4']);
    expect(result.output).toContain("    id: 'objekti-h4',\n    svgPath: 'M1 1L2 2L3 1Z',\n    name: 'Objekti H4',");
  });

  it('inserts the field inline in a one-line object and leaves neighbours alone', () => {
    const source = "{ id: 'h4-101', floor: 1 },\n{ id: 'h4-102', floor: 1 },";
    const result = applyPolygonUpdates(source, [{ id: 'h4-101', svgPath: 'M5 5Z' }]);
    expect(result.output).toBe("{ id: 'h4-101', svgPath: 'M5 5Z', floor: 1 },\n{ id: 'h4-102', floor: 1 },");
  });
});

describe('applyPolygonUpdates for sold units', () => {
  const BUILDINGS = [
    '  {',
    "    id: 'objekti-l8',",
    '    apartments: [],',
    '    soldUnits: [],',
    '  },',
    '  {',
    "    id: 'objekti-l9',",
    '    apartments: [',
    "      { id: 'l9-301', unitTypeId: 'tipi-96-26', buildingId: 'objekti-l9', floor: 3, status: 'available' },",
    '    ],',
    '    soldUnits: [],',
    '  },',
  ].join('\n');
  const sold = (id: string, floor: number, svgPath = 'M1 1L2 2L3 1Z') =>
    ({ kind: 'sold', id, buildingId: 'objekti-l9', floor, svgPath }) as const;

  it("creates a new sold unit in its own building's empty soldUnits array", () => {
    const result = applyPolygonUpdates(BUILDINGS, [sold('l9-s-0301', 3)]);
    expect(result.applied).toEqual(['l9-s-0301']);
    expect(result.output).toContain(
      "    soldUnits: [\n      { id: 'l9-s-0301', buildingId: 'objekti-l9', floor: 3, svgPath: 'M1 1L2 2L3 1Z' },\n    ],",
    );
    // L8's array is untouched.
    expect(result.output).toContain("    id: 'objekti-l8',\n    apartments: [],\n    soldUnits: [],");
  });

  it('appends further sold units, and updates an existing one in place when re-traced', () => {
    const first = applyPolygonUpdates(BUILDINGS, [sold('l9-s-0301', 3), sold('l9-s-0302', 3)]).output;
    expect(first).toContain(
      "      { id: 'l9-s-0301', buildingId: 'objekti-l9', floor: 3, svgPath: 'M1 1L2 2L3 1Z' },\n      { id: 'l9-s-0302',",
    );
    const retraced = applyPolygonUpdates(first, [sold('l9-s-0301', 3, 'M9 9L8 8L7 9Z')]);
    expect(retraced.applied).toEqual(['l9-s-0301']);
    expect(retraced.output).toContain(
      "{ id: 'l9-s-0301', buildingId: 'objekti-l9', floor: 3, svgPath: 'M9 9L8 8L7 9Z' }",
    );
    expect(retraced.output.match(/l9-s-0301/g)).toHaveLength(1);
  });

  it('prepends inline to a one-line array', () => {
    const inline = "id: 'objekti-l9', soldUnits: [{ id: 'l9-s-0001', buildingId: 'objekti-l9', floor: 0 }],";
    const result = applyPolygonUpdates(inline, [sold('l9-s-0101', 1)]);
    expect(result.output).toContain(
      "soldUnits: [{ id: 'l9-s-0101', buildingId: 'objekti-l9', floor: 1, svgPath: 'M1 1L2 2L3 1Z' }, { id: 'l9-s-0001'",
    );
  });

  it('rejects malformed new sold units and reports unknown buildings', () => {
    const result = applyPolygonUpdates(BUILDINGS, [
      sold('l9-s-3', 3),
      { ...sold('l9-s-0401', 4), floor: 2.5 },
      { ...sold('zz-s-0101', 1), buildingId: 'objekti-zz' },
    ]);
    expect(result.rejected).toEqual(['l9-s-3', 'l9-s-0401']);
    expect(result.notFound).toEqual(['zz-s-0101']);
    expect(result.output).toBe(BUILDINGS);
  });
});
