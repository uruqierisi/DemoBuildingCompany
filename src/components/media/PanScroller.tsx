import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/** Horizontal distance the user must pan before the generic hint hides. */
const PAN_THRESHOLD_PX = 12;
/** Space left before the first target when the targets are wider than the screen. */
const START_MARGIN_PX = 16;
/** A target this many pixels past the edge counts as off-screen (absorbs sub-pixel rounding). */
const EDGE_TOLERANCE_PX = 2;

/** Horizontal extent of something worth scrolling to, as fractions (0–1) of the content width. */
export interface PanTarget {
  readonly start: number;
  readonly end: number;
}

interface PanScrollerProps {
  readonly children: ReactNode;
  /** Accessible name for the scroll region. */
  readonly label: string;
  /** Minimum content width, e.g. "min-w-[46rem] md:min-w-0": below it the stage scrolls instead of shrinking. */
  readonly contentClassName: string;
  /** Horizontal point (0–1 of the content width) to centre on first render. */
  readonly initialCenter?: number;
  /**
   * Shapes the visitor should find (e.g. apartments for sale). When given, an edge fade and the hint
   * point to whichever side still hides one of them; without it, a generic hint shows until the first pan.
   */
  readonly targets?: readonly PanTarget[];
  readonly isInverse?: boolean;
}

type HiddenSides = { readonly left: boolean; readonly right: boolean };
const NONE: HiddenSides = { left: false, right: false };

function hiddenSides(scroller: HTMLElement, targets: readonly PanTarget[]): HiddenSides {
  const width = scroller.scrollWidth;
  const viewStart = scroller.scrollLeft - EDGE_TOLERANCE_PX;
  const viewEnd = scroller.scrollLeft + scroller.clientWidth + EDGE_TOLERANCE_PX;
  return {
    left: targets.some((target) => target.start * width < viewStart),
    right: targets.some((target) => target.end * width > viewEnd),
  };
}

/**
 * Keeps wide imagery (renders with hotspots) at a legible size on narrow screens: the content
 * scrolls horizontally, starts centred, and hints at what lies off-screen.
 */
export function PanScroller({
  children,
  label,
  contentClassName,
  initialCenter = 0.5,
  targets,
  isInverse = false,
}: PanScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [hasPanned, setHasPanned] = useState(false);
  const [hidden, setHidden] = useState<HiddenSides>(NONE);
  const centredLeftRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setIsScrollable(scroller.scrollWidth > scroller.clientWidth + 1);
    const next = targets ? hiddenSides(scroller, targets) : NONE;
    setHidden((current) => (current.left === next.left && current.right === next.right ? current : next));
  }, [targets]);

  // Position before the first paint so the stage never visibly jumps: centred on the targets when
  // they fit on screen, otherwise starting at the first one, so the rest lie on one side.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const width = scroller.scrollWidth;
    const firstStart = targets?.length ? Math.min(...targets.map((target) => target.start)) * width : null;
    const lastEnd = targets?.length ? Math.max(...targets.map((target) => target.end)) * width : null;
    scroller.scrollLeft =
      firstStart !== null && lastEnd !== null && lastEnd - firstStart > scroller.clientWidth
        ? firstStart - START_MARGIN_PX
        : initialCenter * width - scroller.clientWidth / 2;
    centredLeftRef.current = scroller.scrollLeft;
  }, [initialCenter, targets]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => {
      observer.disconnect();
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [measure]);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    // The centring above also fires a scroll event; only a real pan away from it counts.
    if (!hasPanned && Math.abs(scroller.scrollLeft - centredLeftRef.current) > PAN_THRESHOLD_PX) setHasPanned(true);
    if (targets && frameRef.current === undefined) {
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = undefined;
        measure();
      });
    }
  };

  const hintSide = targets
    ? hidden.left && hidden.right
      ? 'both'
      : hidden.left
        ? 'left'
        : hidden.right
          ? 'right'
          : null
    : hasPanned
      ? null
      : 'both';
  const showHint = isScrollable && hintSide !== null;
  // Keep the chip where it was while it fades out, instead of jumping to the centre.
  const [chipSide, setChipSide] = useState(hintSide);
  if (hintSide !== null && hintSide !== chipSide) setChipSide(hintSide);
  const fade = isInverse ? 'from-ink/80' : 'from-paper';

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        role={isScrollable ? 'region' : undefined}
        aria-label={isScrollable ? label : undefined}
        tabIndex={isScrollable ? 0 : undefined}
        onScroll={targets || !hasPanned ? handleScroll : undefined}
        className="[scrollbar-width:none] overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden"
      >
        <div className={contentClassName}>{children}</div>
      </div>

      {targets ? (
        <>
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 w-14 bg-linear-to-r to-transparent transition-opacity duration-300',
              fade,
              isScrollable && hidden.left ? 'opacity-100' : 'opacity-0',
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-y-0 right-0 w-14 bg-linear-to-l to-transparent transition-opacity duration-300',
              fade,
              isScrollable && hidden.right ? 'opacity-100' : 'opacity-0',
            )}
          />
        </>
      ) : null}

      <p
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute flex items-center gap-2 rounded-xs px-3 py-2 text-caption whitespace-nowrap transition-opacity duration-500',
          isInverse ? 'bg-white/90 text-ink' : 'bg-ink/85 text-white',
          // Side hints sit mid-height on their edge, visible wherever a tall render is scrolled to.
          chipSide === 'left'
            ? 'top-1/2 left-3 -translate-y-1/2'
            : chipSide === 'right'
              ? 'top-1/2 right-3 -translate-y-1/2'
              : 'bottom-4 left-1/2 -translate-x-1/2',
          showHint ? 'opacity-100' : 'opacity-0',
        )}
      >
        {chipSide === 'right' ? null : <Icon name="arrow-left" size={16} />}
        Rrëshqitni anash
        {chipSide === 'left' ? null : <Icon name="arrow-right" size={16} />}
      </p>
    </div>
  );
}
