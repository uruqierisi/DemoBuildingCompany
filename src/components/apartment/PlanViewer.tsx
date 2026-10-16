import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { RenderPicture } from '@/components/media/RenderPicture';
import { Icon } from '@/components/ui/Icon';
import type { RenderImage } from '@/data/types';
import { clampZoom, MAX_ZOOM, MIN_ZOOM, stepAtOrAbove, stepZoom } from './plan-zoom';
import { usePlanGestures, type Anchor } from './usePlanGestures';

/** Space around the plan inside the viewer (the wrapper's p-4 on each side). */
const FRAME_PADDING_PX = 32;
/** Zoom changes smaller than this are ignored (a pinch held still). */
const ZOOM_TOLERANCE = 0.001;

interface PlanViewerProps {
  readonly image: RenderImage;
  readonly alt: string;
  readonly title: string;
  readonly onClose: () => void;
}

/** Scrolls so the anchored plan point sits at its scroller position. The scroller is `relative`, so
 *  offsetLeft/offsetTop of the content are measured from it. */
function applyAnchor(scroller: HTMLElement, anchor: Anchor): void {
  const content = scroller.firstElementChild as HTMLElement | null;
  if (!content) return;
  scroller.scrollLeft = content.offsetLeft + anchor.x * content.offsetWidth - anchor.atX;
  scroller.scrollTop = content.offsetTop + anchor.y * content.offsetHeight - anchor.atY;
}

/**
 * Full-screen floor plan viewer in a modal <dialog>. Zoom with two fingers, the buttons, + / − / 0
 * keys or a double click (which zooms towards the clicked point); pan by dragging, swiping or the
 * arrow keys. Mounted only while open, so the large image variants load on demand.
 */
export function PlanViewer({ image, alt, title, onClose }: PlanViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<Anchor | null>(null);
  const [zoom, setZoom] = useState<number>(MIN_ZOOM);
  // Pinch events can arrive faster than renders; the ref always holds the zoom last asked for.
  const zoomRef = useRef<number>(MIN_ZOOM);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    dialog.showModal();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;
    const observer = new ResizeObserver(() => setBox({ width: scroller.clientWidth, height: scroller.clientHeight }));
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  const fit = box
    ? Math.min((box.width - FRAME_PADDING_PX) / image.width, (box.height - FRAME_PADDING_PX) / image.height)
    : 0;
  const width = Math.round(image.width * fit * zoom);
  const height = Math.round(image.height * fit * zoom);

  // Keep the anchored point in place once the new size is laid out.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const anchor = anchorRef.current;
    anchorRef.current = null;
    if (scroller && anchor) applyAnchor(scroller, anchor);
  }, [zoom]);

  const anchorAt = (atX: number, atY: number): Anchor => {
    const scroller = scrollerRef.current;
    const content = scroller?.firstElementChild as HTMLElement | null | undefined;
    if (!scroller || !content) return { x: 0.5, y: 0.5, atX, atY };
    return {
      x: (scroller.scrollLeft + atX - content.offsetLeft) / content.offsetWidth,
      y: (scroller.scrollTop + atY - content.offsetTop) / content.offsetHeight,
      atX,
      atY,
    };
  };

  const zoomTo = (next: number, anchor: Anchor) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const clamped = clampZoom(next);
    if (Math.abs(clamped - zoomRef.current) < ZOOM_TOLERANCE) {
      // At a limit a pinch can still move the plan with the fingers.
      applyAnchor(scroller, anchor);
      return;
    }
    anchorRef.current = anchor;
    zoomRef.current = clamped;
    setZoom(clamped);
  };

  /** Zooms around the centre of the view, or around a given point of it. */
  const zoomAtPoint = (next: number, atX?: number, atY?: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    zoomTo(next, anchorAt(atX ?? scroller.clientWidth / 2, atY ?? scroller.clientHeight / 2));
  };

  const gestures = usePlanGestures({ zoom, anchorAt, zoomTo });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === '+' || event.key === '=') zoomAtPoint(stepZoom(zoom, 1));
    else if (event.key === '-') zoomAtPoint(stepZoom(zoom, -1));
    else if (event.key === '0') zoomAtPoint(MIN_ZOOM);
    else return;
    event.preventDefault();
  };

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const next = zoom >= MAX_ZOOM - ZOOM_TOLERANCE ? MIN_ZOOM : stepZoom(zoom, 1);
    zoomAtPoint(next, event.clientX - rect.left, event.clientY - rect.top);
  };

  const canZoomIn = zoom < MAX_ZOOM - ZOOM_TOLERANCE;
  const canZoomOut = zoom > MIN_ZOOM + ZOOM_TOLERANCE;
  const CONTROL =
    'flex size-11 items-center justify-center rounded-xs text-ink transition-colors hover:bg-white/70 disabled:opacity-35 disabled:hover:bg-transparent';
  // Clear of the notch and the rounded corners in landscape, and of the home indicator.
  const SAFE_X = 'pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]';

  return (
    // Escape (native `cancel`) closes the dialog; `close` then unmounts the viewer.
    // touch-none: a pinch anywhere in the viewer zooms the plan, never the page behind it.
    <dialog
      ref={dialogRef}
      aria-label={title}
      onClose={onClose}
      className="m-0 h-dvh max-h-none w-dvw max-w-none touch-none bg-plan p-0 text-ink backdrop:bg-ink/60"
    >
      <div className="flex h-full flex-col">
        <div
          className={`flex items-center justify-between gap-4 border-b border-line bg-plan pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 ${SAFE_X}`}
        >
          <p className="min-w-0 truncate text-small font-medium">{title}</p>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className={CONTROL}
              onClick={() => zoomAtPoint(stepZoom(zoom, -1))}
              disabled={!canZoomOut}
              aria-label="Zvogëlo"
            >
              <Icon name="minus" />
            </button>
            <span className="w-14 text-center text-small tabular-nums" aria-live="polite">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className={CONTROL}
              onClick={() => zoomAtPoint(stepZoom(zoom, 1))}
              disabled={!canZoomIn}
              aria-label="Zmadho"
            >
              <Icon name="plus" />
            </button>
            <button
              type="button"
              className={`${CONTROL} ml-2 bg-ink text-white hover:bg-ink-soft`}
              onClick={() => dialogRef.current?.close()}
              aria-label="Mbyll planimetrinë"
            >
              <Icon name="close" />
            </button>
          </div>
        </div>

        {/* A focusable scroll region (WCAG 2.1.1): arrow keys pan, + / − zoom; a double click zooms to the pointer. */}
        {/* eslint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */}
        <div
          ref={scrollerRef}
          role="region"
          tabIndex={0}
          aria-label="Planimetria, e zmadhueshme"
          onKeyDown={handleKeyDown}
          onDoubleClick={handleDoubleClick}
          {...gestures}
          className={`relative flex min-h-0 flex-1 touch-none overflow-auto overscroll-contain select-none focus-visible:outline-offset-[-3px] ${zoom > MIN_ZOOM ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
        >
          <div
            className="m-auto shrink-0 p-4"
            style={box ? { width: width + FRAME_PADDING_PX, height: height + FRAME_PADDING_PX } : undefined}
          >
            {box ? (
              <RenderPicture
                image={image}
                alt={alt}
                sizes={`${Math.round(image.width * fit * stepAtOrAbove(zoom))}px`}
                priority
                className="pointer-events-none h-full w-full select-none"
              />
            ) : null}
          </div>
        </div>
        {/* eslint-enable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */}
        <p
          className={`border-t border-line pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-caption text-ink-muted ${SAFE_X}`}
        >
          <span className="pointer-coarse:hidden">
            Klikoni dy herë ose përdorni + / − për ta zmadhuar; tërhiqeni për ta lëvizur.
          </span>
          <span className="hidden pointer-coarse:inline">
            Zmadhojeni me dy gishta ose me + / −; rrëshqitni për ta lëvizur.
          </span>
        </p>
      </div>
    </dialog>
  );
}
