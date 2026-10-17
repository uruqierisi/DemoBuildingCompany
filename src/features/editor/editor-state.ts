import type { Floor, ImageSize } from '@/data/types';
import type { Point } from '@/lib/svg-path';
import { toSvgPath } from './polygon';

/** What a polygon is assigned to: a building (overview), a listed apartment or a sold unit (building render). */
export type TargetKind = 'building' | 'apartment' | 'sold';

/** A polygon traced in this session and assigned to a building or apartment. */
export interface TracedPolygon {
  readonly kind: TargetKind;
  /** Building id (e.g. "objekti-a2") or apartment id (e.g. "a2-301"). */
  readonly id: string;
  /** Key of the image the polygon was traced on (e.g. "rezidenca-arrita:overview"); its pixel space is the path's coordinate space. */
  readonly image: string;
  readonly imageSize: ImageSize;
  readonly svgPath: string;
  /** Sold units only: needed to create the unit in the data file if it does not exist yet. */
  readonly buildingId?: string;
  readonly floor?: Floor;
}

export interface EditorState {
  /** Vertices of the polygon being traced. */
  readonly points: readonly Point[];
  readonly isClosed: boolean;
  /** Every polygon assigned in this session, across all images. */
  readonly traced: readonly TracedPolygon[];
}

export type EditorAction =
  | { readonly type: 'addPoint'; readonly point: Point }
  | { readonly type: 'undoPoint' }
  | { readonly type: 'close' }
  | { readonly type: 'clear' }
  | {
      readonly type: 'assign';
      readonly kind: TargetKind;
      readonly id: string;
      readonly image: string;
      readonly imageSize: ImageSize;
      /** Sold units only. */
      readonly buildingId?: string;
      readonly floor?: Floor;
    }
  | { readonly type: 'remove'; readonly image: string; readonly id: string }
  | { readonly type: 'restore'; readonly polygon: TracedPolygon }
  | { readonly type: 'resetSession' };

export const MIN_POLYGON_POINTS = 3;

export function createInitialState(traced: readonly TracedPolygon[] = []): EditorState {
  return { points: [], isClosed: false, traced };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'addPoint':
      return state.isClosed ? state : { ...state, points: [...state.points, action.point] };
    case 'undoPoint':
      // Undo first reopens a closed polygon, then removes the last vertex.
      if (state.isClosed) return { ...state, isClosed: false };
      return { ...state, points: state.points.slice(0, -1) };
    case 'close':
      return state.points.length >= MIN_POLYGON_POINTS ? { ...state, isClosed: true } : state;
    case 'clear':
      return { ...state, points: [], isClosed: false };
    case 'assign': {
      if (!state.isClosed) return state;
      const polygon: TracedPolygon = {
        kind: action.kind,
        id: action.id,
        image: action.image,
        imageSize: action.imageSize,
        svgPath: toSvgPath(state.points),
        ...(action.kind === 'sold' ? { buildingId: action.buildingId, floor: action.floor } : {}),
      };
      // One polygon per target and image: re-tracing replaces the previous one.
      const others = state.traced.filter((p) => !(p.image === action.image && p.id === action.id));
      return { points: [], isClosed: false, traced: [...others, polygon] };
    }
    case 'remove':
      return { ...state, traced: state.traced.filter((p) => !(p.image === action.image && p.id === action.id)) };
    case 'restore': {
      const { image, id } = action.polygon;
      const others = state.traced.filter((p) => !(p.image === image && p.id === id));
      return { ...state, traced: [...others, action.polygon] };
    }
    case 'resetSession':
      return createInitialState();
    default:
      return state;
  }
}

/** The "copy all as JSON" payload; `scripts/apply-polygons.ts` reads this format. */
export function toExportJson(projectId: string, traced: readonly TracedPolygon[]): string {
  return JSON.stringify({ project: projectId, polygons: traced }, null, 2);
}
