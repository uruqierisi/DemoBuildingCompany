import { useEffect, useId, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import type { ImageSize } from '@/data/types';
import { cn } from '@/lib/cn';
import { HotspotTooltip } from './HotspotTooltip';

export interface Hotspot {
  readonly id: string;
  readonly svgPath: string;
  /** accent: something the visitor can act on (a building, an apartment for sale); reserved; muted: sold. */
  readonly tone: 'accent' | 'reserved' | 'muted';
  /** Where a click (mouse) or second tap (touch) goes; absent for units without a page. */
  readonly href?: string;
}

export type HotspotSource = 'overlay' | 'list';

interface HotspotOverlayProps {
  readonly hotspots: readonly Hotspot[];
  /** Pixel size of the render; the SVG uses the same coordinate space. */
  readonly size: ImageSize;
  readonly activeId: string | null;
  /** Who activated the current hotspot; the tooltip only follows activations on the render itself. */
  readonly activeSource: HotspotSource | null;
  readonly onActiveChange: (id: string | null, source: HotspotSource) => void;
  /** hidden: shapes appear only when active (overview). status: idle shapes show their tone (building render). */
  readonly idleStyle: 'hidden' | 'status';
  readonly renderTooltip: (hotspot: Hotspot) => ReactNode;
}

/** Idle shapes on building renders, by tone. */
const IDLE_TONE: Readonly<Record<Hotspot['tone'], string>> = {
  accent: 'fill-accent/45 stroke-accent',
  // Filled with the hatch pattern (see HATCH_*); the outline makes the shape read without colour.
  reserved: 'stroke-status-reserved-ink',
  // A grey tint that reads on light façades; a pale grey fill vanishes against them.
  muted: 'fill-ink/40 stroke-white/35',
};

/** Active shape: natural colours, a light tint and a crisp outline. */
const ACTIVE_TONE: Readonly<Record<Hotspot['tone'], string>> = {
  accent: 'fill-accent/12 stroke-accent',
  reserved: 'fill-status-reserved-ink/10 stroke-status-reserved-ink',
  muted: 'fill-white/10 stroke-white',
};

/** Reserved hatching, in render pixels: about 5–7 CSS px apart at the sizes renders are shown. */
const HATCH_PERIOD = 16;
const HATCH_STRIPE = 6;

/** Delay before a hover ends, so the pointer can travel from a shape onto its tooltip. */
const HOVER_GRACE_MS = 140;
/** Strength of the dim over everything except the active shape. */
const DIM_OPACITY = 0.42;

function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

/**
 * Interactive polygons over a render. The active shape keeps the render's natural colours (at most a
 * light tint and a crisp outline) while an SVG mask dims everything else. Mouse: hover activates,
 * click opens. Touch/pen: first tap activates and shows the tooltip, second tap opens.
 * The layer is hidden from assistive tech; each page provides an equivalent list.
 */
export function HotspotOverlay({
  hotspots,
  size,
  activeId,
  activeSource,
  onActiveChange,
  idleStyle,
  renderTooltip,
}: HotspotOverlayProps) {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const pointerTypeRef = useRef('mouse');
  const leaveTimerRef = useRef<number | undefined>(undefined);
  const maskId = `hotspot-mask-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const hatchId = `${maskId}-hatch`;

  // Keep masking the last active shape while the dim fades out, so it never flashes dark.
  const [maskedId, setMaskedId] = useState(activeId);
  if (activeId !== null && activeId !== maskedId) setMaskedId(activeId);
  const masked = hotspots.find((h) => h.id === maskedId);
  const active = hotspots.find((h) => h.id === activeId);

  const cancelLeave = () => window.clearTimeout(leaveTimerRef.current);
  useEffect(() => cancelLeave, []);

  // A tap anywhere outside the render and its tooltip clears the selection (touch).
  useEffect(() => {
    if (!activeId || activeSource !== 'overlay') return undefined;
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      if (svgRef.current?.contains(target) || (target as Element).closest?.('[data-hotspot-tooltip]')) return;
      onActiveChange(null, 'overlay');
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [activeId, activeSource, onActiveChange]);

  const handleClick = (event: MouseEvent<Element>, hotspot: Hotspot) => {
    if (hotspot.href && isModifiedClick(event)) return; // New tab / window keeps native link behaviour.
    event.preventDefault();
    const isTouch = pointerTypeRef.current !== 'mouse';
    if (isTouch && activeId !== hotspot.id) {
      onActiveChange(hotspot.id, 'overlay');
      return;
    }
    if (hotspot.href) navigate(hotspot.href);
    else onActiveChange(hotspot.id, 'overlay');
  };

  const handleEnter = (event: PointerEvent, id: string) => {
    if (event.pointerType !== 'mouse') return;
    cancelLeave();
    onActiveChange(id, 'overlay');
  };
  const handleLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    cancelLeave();
    leaveTimerRef.current = window.setTimeout(() => onActiveChange(null, 'overlay'), HOVER_GRACE_MS);
  };

  return (
    <>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size.width} ${size.height}`}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        onPointerDown={(event) => {
          pointerTypeRef.current = event.pointerType;
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) onActiveChange(null, 'overlay');
        }}
      >
        <defs>
          <pattern
            id={hatchId}
            patternUnits="userSpaceOnUse"
            width={HATCH_PERIOD}
            height={HATCH_PERIOD}
            patternTransform="rotate(45)"
          >
            {/* Light gaps keep the stripes readable when the render is dimmed around another unit. */}
            <rect width={HATCH_PERIOD} height={HATCH_PERIOD} className="fill-white/50" />
            <rect width={HATCH_STRIPE} height={HATCH_PERIOD} className="fill-status-reserved-ink" />
          </pattern>
          <mask id={maskId}>
            <rect width={size.width} height={size.height} fill="white" />
            {masked ? <path d={masked.svgPath} fill="black" /> : null}
          </mask>
        </defs>
        <rect
          width={size.width}
          height={size.height}
          mask={`url(#${maskId})`}
          className="pointer-events-none fill-ink transition-opacity duration-500 ease-standard motion-reduce:transition-none"
          style={{ opacity: activeId ? DIM_OPACITY : 0 }}
        />

        {hotspots.map((hotspot) => {
          const isActive = hotspot.id === activeId;
          const isHatched = idleStyle === 'status' && hotspot.tone === 'reserved';
          const shapes = (
            <>
              {/* Idle look: status colours on building renders; nothing on the overview (a faint hint on touch). */}
              <path
                d={hotspot.svgPath}
                vectorEffect="non-scaling-stroke"
                strokeWidth={isHatched ? 2 : 1}
                style={isHatched ? { fill: `url(#${hatchId})` } : undefined}
                className={cn(
                  'transition-opacity duration-300 motion-reduce:transition-none',
                  idleStyle === 'status'
                    ? IDLE_TONE[hotspot.tone]
                    : 'fill-transparent stroke-transparent pointer-coarse:stroke-white/50',
                  isActive ? 'opacity-0' : 'opacity-100',
                )}
              />
              {/* Active look: natural colours, a light tint and a crisp outline. */}
              <path
                data-hotspot={hotspot.id}
                d={hotspot.svgPath}
                vectorEffect="non-scaling-stroke"
                strokeWidth={2}
                className={cn(
                  'transition-opacity duration-300 motion-reduce:transition-none',
                  ACTIVE_TONE[hotspot.tone],
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
            </>
          );
          const handlers = {
            onClick: (event: MouseEvent<Element>) => handleClick(event, hotspot),
            onPointerEnter: (event: PointerEvent) => handleEnter(event, hotspot.id),
            onPointerLeave: handleLeave,
          };
          // Units with a page are links; sold units are plain shapes (an <a> without href is not a link).
          return hotspot.href ? (
            <a
              key={hotspot.id}
              href={hotspot.href}
              tabIndex={-1}
              // Not in the tab order (the page's list is the keyboard path), so no focus ring on tap.
              className="cursor-pointer outline-none"
              {...handlers}
            >
              {shapes}
            </a>
          ) : (
            // The SVG is aria-hidden and the page lists these units in text; the shape only shows a tooltip.
            <g key={hotspot.id} className="cursor-default" {...handlers}>
              {shapes}
            </g>
          );
        })}
      </svg>

      {active && activeSource === 'overlay' ? (
        <HotspotTooltip
          container={svgRef}
          anchorId={active.id}
          onPointerEnter={cancelLeave}
          onPointerLeave={() => onActiveChange(null, 'overlay')}
        >
          {renderTooltip(active)}
        </HotspotTooltip>
      ) : null}
    </>
  );
}
