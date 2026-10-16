import type { PanTarget } from '@/components/media/PanScroller';
import { getPathBounds } from '@/lib/svg-path';
import type { Hotspot } from './HotspotOverlay';

/**
 * Horizontal extents (0–1 of the render width) of the actionable shapes (tone "accent": buildings on
 * the overview, apartments for sale on a building): what a narrow screen should open on and point to.
 */
export function actionableTargets(hotspots: readonly Hotspot[], renderWidth: number): PanTarget[] {
  return hotspots
    .filter((hotspot) => hotspot.tone === 'accent')
    .flatMap((hotspot) => getPathBounds(hotspot.svgPath) ?? [])
    .map((bounds) => ({ start: bounds.minX / renderWidth, end: bounds.maxX / renderWidth }));
}

/** Midpoint between the first and the last target; the middle of the render when there are none. */
export function centreOf(targets: readonly PanTarget[]): number {
  if (targets.length === 0) return 0.5;
  return (Math.min(...targets.map((t) => t.start)) + Math.max(...targets.map((t) => t.end))) / 2;
}
