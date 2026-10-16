import { useRef, type PointerEvent } from 'react';

/** Pointer travel that turns a press into a drag, so a small wobble still counts as a click. */
const DRAG_THRESHOLD_PX = 4;

/** A point of the plan (x, y as 0–1 of its size) and where in the scroller (px) it should sit. */
export interface Anchor {
  readonly x: number;
  readonly y: number;
  readonly atX: number;
  readonly atY: number;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

interface Drag {
  readonly start: Point;
  readonly left: number;
  readonly top: number;
  readonly moved: boolean;
}

interface Pinch {
  readonly distance: number;
  readonly zoom: number;
  /** Point of the plan under the fingers when the pinch began; it follows the fingers. */
  readonly x: number;
  readonly y: number;
}

interface PlanGestureOptions {
  readonly zoom: number;
  /** The plan point under a point of the scroller (px from its top-left corner). */
  readonly anchorAt: (atX: number, atY: number) => Anchor;
  /** Zooms (clamped) and scrolls so the anchor lands where it says. */
  readonly zoomTo: (zoom: number, anchor: Anchor) => void;
}

const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

function midpointIn(element: Element, a: Point, b: Point): Point {
  const rect = element.getBoundingClientRect();
  return { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top };
}

/**
 * Pointer handling for the plan viewer: drag (mouse, touch, pen) pans the scroller, two fingers pinch
 * to zoom around their midpoint and pan along with it. The scroller has touch-action: none, so the
 * browser neither scrolls it natively nor zooms the page (which could push the close button off-screen).
 */
export function usePlanGestures({ zoom, anchorAt, zoomTo }: PlanGestureOptions) {
  const pointersRef = useRef(new Map<number, Point>());
  const dragRef = useRef<Drag | null>(null);
  const pinchRef = useRef<Pinch | null>(null);

  const startDrag = (scroller: HTMLElement, start: Point) => {
    dragRef.current = { start, left: scroller.scrollLeft, top: scroller.scrollTop, moved: false };
  };

  const startPinch = (scroller: HTMLElement) => {
    const [a, b] = [...pointersRef.current.values()];
    if (!a || !b) return;
    const mid = midpointIn(scroller, a, b);
    const anchor = anchorAt(mid.x, mid.y);
    pinchRef.current = { distance: Math.max(distance(a, b), 1), zoom, x: anchor.x, y: anchor.y };
    dragRef.current = null;
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const point = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, point);
    if (pointersRef.current.size === 1) startDrag(event.currentTarget, point);
    else if (pointersRef.current.size === 2) startPinch(event.currentTarget);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const scroller = event.currentTarget;

    const pinch = pinchRef.current;
    const [a, b] = [...pointersRef.current.values()];
    if (pinch && a && b) {
      const mid = midpointIn(scroller, a, b);
      zoomTo((pinch.zoom * distance(a, b)) / pinch.distance, { x: pinch.x, y: pinch.y, atX: mid.x, atY: mid.y });
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.start.x;
    const dy = event.clientY - drag.start.y;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    if (!drag.moved) {
      scroller.setPointerCapture(event.pointerId);
      dragRef.current = { ...drag, moved: true };
    }
    scroller.scrollLeft = drag.left - dx;
    scroller.scrollTop = drag.top - dy;
  };

  // Lifting one finger of a pinch hands over to a drag with the other, so the plan doesn't jump.
  const onPointerEnd = (event: PointerEvent<HTMLElement>) => {
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;
    const [remaining] = [...pointersRef.current.values()];
    if (remaining) startDrag(event.currentTarget, remaining);
    else dragRef.current = null;
  };

  return { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd };
}
