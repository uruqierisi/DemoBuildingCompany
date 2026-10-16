import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { uncoveredViewport } from '@/lib/fixed-edges';

interface HotspotTooltipProps {
  /** SVG containing the shapes; the anchor is its element with data-hotspot="<anchorId>". */
  readonly container: RefObject<SVGSVGElement | null>;
  readonly anchorId: string;
  readonly children: ReactNode;
  readonly onPointerEnter: () => void;
  readonly onPointerLeave: () => void;
}

/** Distance between the shape and the card, and minimum distance to the viewport edge. */
const OFFSET_PX = 12;
const EDGE_PX = 12;

interface Position {
  readonly top: number;
  readonly left: number;
}

/**
 * Card anchored to a shape, rendered in a portal with fixed positioning so a horizontally scrolling
 * stage never clips it. Sits above the shape (below if there is no room), centred on it, and is
 * clamped inside the viewport, clear of the fixed header and the mobile contact bar. Follows the shape while the page or the stage scrolls.
 */
export function HotspotTooltip({ container, anchorId, children, onPointerEnter, onPointerLeave }: HotspotTooltipProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);

  useLayoutEffect(() => {
    let frame = 0;
    const place = () => {
      const card = cardRef.current;
      const anchor = container.current?.querySelector(`[data-hotspot="${CSS.escape(anchorId)}"]`);
      if (!card || !anchor) return;
      const target = anchor.getBoundingClientRect();
      const { width, height } = card.getBoundingClientRect();
      const band = uncoveredViewport();
      const fitsAbove = target.top - height - OFFSET_PX >= band.top + EDGE_PX;
      const top = fitsAbove
        ? target.top - height - OFFSET_PX
        : Math.min(target.bottom + OFFSET_PX, band.bottom - height - EDGE_PX);
      const centre = target.left + target.width / 2 - width / 2;
      const left = Math.min(Math.max(centre, EDGE_PX), document.documentElement.clientWidth - width - EDGE_PX);
      setPosition({ top: Math.max(top, band.top + EDGE_PX), left });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    window.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
    };
  }, [container, anchorId]);

  return createPortal(
    <div
      ref={cardRef}
      data-hotspot-tooltip=""
      aria-hidden="true"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className="fixed z-30 w-max max-w-[calc(100vw-1.5rem)]"
      style={position ? { top: position.top, left: position.left } : { top: 0, left: 0, visibility: 'hidden' }}
    >
      <div className="animate-rise-in">{children}</div>
    </div>,
    document.body,
  );
}
