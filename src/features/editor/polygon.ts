import type { Point } from '@/lib/svg-path';

/** Serialises vertices as an SVG path in the editor's canonical format: "M x yL x y…Z". */
export function toSvgPath(points: readonly Point[], isClosed = true): string {
  if (points.length === 0) return '';
  const body = points.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join('');
  return isClosed ? `${body}Z` : body;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Converts a pointer position to integer image-pixel coordinates, clamped to the image. */
export function toImagePoint(
  client: Point,
  rect: { readonly left: number; readonly top: number; readonly width: number; readonly height: number },
  imageSize: { readonly width: number; readonly height: number },
): Point {
  const x = ((client.x - rect.left) / rect.width) * imageSize.width;
  const y = ((client.y - rect.top) / rect.height) * imageSize.height;
  return {
    x: Math.round(Math.min(Math.max(x, 0), imageSize.width)),
    y: Math.round(Math.min(Math.max(y, 0), imageSize.height)),
  };
}
