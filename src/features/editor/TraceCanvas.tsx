import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { RenderPicture } from '@/components/media/RenderPicture';
import type { Point } from '@/lib/svg-path';
import type { TracedPolygon } from './editor-state';
import { MIN_POLYGON_POINTS } from './editor-state';
import { distance, toImagePoint } from './polygon';
import type { TraceImage } from './trace-images';

/** Clicking within this many screen pixels of the first vertex closes the polygon. */
const SNAP_RADIUS_PX = 12;
const VERTEX_RADIUS_PX = 4;

export type Zoom = 'fit' | number;

interface TraceCanvasProps {
  readonly image: TraceImage;
  readonly points: readonly Point[];
  readonly isClosed: boolean;
  /** Polygons assigned in this session for this image. */
  readonly traced: readonly TracedPolygon[];
  readonly showCurrentData: boolean;
  readonly zoom: Zoom;
  readonly onAddPoint: (point: Point) => void;
  readonly onClose: () => void;
}

const toPointsAttr = (points: readonly Point[]) => points.map(({ x, y }) => `${x},${y}`).join(' ');

/** The render with an SVG in the render's own pixel space; clicks become vertices in that space. */
export function TraceCanvas({
  image,
  points,
  isClosed,
  traced,
  showCurrentData,
  zoom,
  onAddPoint,
  onClose,
}: TraceCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  // Image pixels per screen pixel, so handles and snap distance stay constant on screen at any zoom.
  const [unitsPerPx, setUnitsPerPx] = useState(1);
  const { width, height } = image.image;
  const size = { width, height };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const observer = new ResizeObserver(() => {
      const rendered = svg.getBoundingClientRect().width;
      if (rendered > 0) setUnitsPerPx(width / rendered);
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, [width]);

  const pointFromEvent = (event: MouseEvent | PointerEvent): Point | null => {
    const svg = svgRef.current;
    return svg ? toImagePoint({ x: event.clientX, y: event.clientY }, svg.getBoundingClientRect(), size) : null;
  };

  const first = points[0];
  const canSnap = !isClosed && first !== undefined && points.length >= MIN_POLYGON_POINTS;
  const isNearFirst =
    canSnap && first !== undefined && cursor !== null && distance(cursor, first) <= SNAP_RADIUS_PX * unitsPerPx;
  const last = points.at(-1);

  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    if (isClosed) return;
    const point = pointFromEvent(event);
    if (!point) return;
    if (canSnap && first && distance(point, first) <= SNAP_RADIUS_PX * unitsPerPx) onClose();
    else onAddPoint(point);
  };

  return (
    <div className="max-h-[calc(100svh-9rem)] overflow-auto bg-ink">
      <div className="relative" style={{ width: zoom === 'fit' ? '100%' : `${width * zoom}px` }}>
        <RenderPicture
          image={image.image}
          alt={`Render për vizatim: ${image.label}`}
          sizes={zoom === 'fit' ? '(min-width: 64rem) 75vw, 100vw' : `${Math.round(width * zoom)}px`}
          priority
          className="h-auto w-full select-none"
        />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
          onClick={handleClick}
          onPointerMove={(event) => setCursor(pointFromEvent(event))}
          onPointerLeave={() => setCursor(null)}
          role="img"
          aria-label="Zona e vizatimit. Klikoni për të shtuar pika."
        >
          {showCurrentData
            ? image.targets.map((target) =>
                target.currentPath ? (
                  <path
                    key={target.id}
                    d={target.currentPath}
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray="6 4"
                    className="fill-white/5 stroke-white/60"
                  >
                    <title>{`${target.label} (në të dhëna)`}</title>
                  </path>
                ) : null,
              )
            : null}

          {traced.map((polygon) => (
            <path
              key={polygon.id}
              d={polygon.svgPath}
              vectorEffect="non-scaling-stroke"
              strokeWidth={2}
              className="fill-accent/25 stroke-accent"
            >
              <title>{`${polygon.id} (kjo seancë)`}</title>
            </path>
          ))}

          {isClosed ? (
            <polygon
              points={toPointsAttr(points)}
              vectorEffect="non-scaling-stroke"
              strokeWidth={2}
              className="fill-white/25 stroke-white"
            />
          ) : (
            <polyline
              points={toPointsAttr(points)}
              vectorEffect="non-scaling-stroke"
              strokeWidth={2}
              className="fill-none stroke-white"
            />
          )}

          {!isClosed && last && cursor ? (
            <line
              x1={last.x}
              y1={last.y}
              x2={isNearFirst && first ? first.x : cursor.x}
              y2={isNearFirst && first ? first.y : cursor.y}
              vectorEffect="non-scaling-stroke"
              strokeDasharray="4 4"
              className="stroke-white/80"
            />
          ) : null}

          {points.map((point, index) => (
            <circle
              key={`${point.x}-${point.y}-${index}`}
              cx={point.x}
              cy={point.y}
              r={(index === 0 ? VERTEX_RADIUS_PX * 1.75 : VERTEX_RADIUS_PX) * unitsPerPx}
              className={index === 0 && isNearFirst ? 'fill-accent stroke-white' : 'fill-white stroke-ink'}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
