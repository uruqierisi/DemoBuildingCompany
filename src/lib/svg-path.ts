export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Bounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

const COMMAND_PATTERN = /([MLHVZmlhvz])([^MLHVZmlhvz]*)/g;
const NUMBER_PATTERN = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

/**
 * Extracts the vertices of a polygon path as produced by the hotspot editor
 * ("M x y L x y … Z"). Supports absolute and relative M, L, H, V and Z; curves are not expected.
 */
export function parsePolygonPath(d: string): Point[] {
  const points: Point[] = [];
  let current: Point = { x: 0, y: 0 };

  for (const [, command = '', args = ''] of d.matchAll(COMMAND_PATTERN)) {
    const values = (args.match(NUMBER_PATTERN) ?? []).map(Number);
    const isRelative = command === command.toLowerCase();
    const base = isRelative ? current : { x: 0, y: 0 };

    switch (command.toUpperCase()) {
      case 'M':
      case 'L':
        for (let i = 0; i + 1 < values.length; i += 2) {
          const origin = isRelative ? current : base;
          current = { x: origin.x + (values[i] ?? 0), y: origin.y + (values[i + 1] ?? 0) };
          points.push(current);
        }
        break;
      case 'H':
        for (const value of values) {
          current = { x: (isRelative ? current.x : 0) + value, y: current.y };
          points.push(current);
        }
        break;
      case 'V':
        for (const value of values) {
          current = { x: current.x, y: (isRelative ? current.y : 0) + value };
          points.push(current);
        }
        break;
      default:
        break;
    }
  }
  return points;
}

/** Axis-aligned bounding box of a polygon path, or undefined for an empty or untraced path. */
export function getPathBounds(d: string): Bounds | undefined {
  const points = parsePolygonPath(d);
  if (points.length === 0) return undefined;
  return points.reduce<Bounds>(
    (bounds, { x, y }) => ({
      minX: Math.min(bounds.minX, x),
      minY: Math.min(bounds.minY, y),
      maxX: Math.max(bounds.maxX, x),
      maxY: Math.max(bounds.maxY, y),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
}
