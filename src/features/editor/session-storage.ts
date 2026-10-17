import type { TracedPolygon } from './editor-state';

/** Versioned key so a future format change never reads stale data. */
const STORAGE_KEY = 'elevateurbox-demo:editor-session:v1';

function isTracedPolygon(value: unknown): value is TracedPolygon {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    (p.kind === 'building' || p.kind === 'apartment' || p.kind === 'sold') &&
    typeof p.id === 'string' &&
    typeof p.image === 'string' &&
    typeof p.svgPath === 'string' &&
    typeof p.imageSize === 'object' &&
    p.imageSize !== null
  );
}

/**
 * Polygons traced in this browser tab survive a reload (sessionStorage). Storage can be
 * unavailable (private mode, blocked site data); tracing still works, it just isn't kept.
 */
export function loadSession(): TracedPolygon[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isTracedPolygon) : [];
  } catch {
    return [];
  }
}

export function saveSession(traced: readonly TracedPolygon[]): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(traced));
  } catch {
    // Storage unavailable: the session simply isn't persisted across reloads.
  }
}
