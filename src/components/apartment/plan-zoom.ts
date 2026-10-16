/** Zoom of the plan viewer, relative to the plan fitted on screen. */
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
/** Levels the + / − buttons and keys step through; a pinch can stop anywhere between them. */
export const ZOOM_STEPS = [1, 1.5, 2, 3] as const;
/** A zoom this close to a step counts as that step, so a pinch to 1.499 still steps on to 2. */
const STEP_EPSILON = 0.01;

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

/** The next step above (direction 1) or below (direction -1) the current zoom. */
export function stepZoom(zoom: number, direction: 1 | -1): number {
  if (direction === 1) return ZOOM_STEPS.find((step) => step > zoom + STEP_EPSILON) ?? MAX_ZOOM;
  return [...ZOOM_STEPS].reverse().find((step) => step < zoom - STEP_EPSILON) ?? MIN_ZOOM;
}

/**
 * The smallest step at or above the zoom. Image sizes are picked for it rather than for the exact
 * zoom, so a pinch doesn't request a new image variant on every frame.
 */
export function stepAtOrAbove(zoom: number): number {
  return ZOOM_STEPS.find((step) => step >= zoom - STEP_EPSILON) ?? MAX_ZOOM;
}
