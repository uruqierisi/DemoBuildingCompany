import type { ApartmentDetails, Floor } from '@/data/types';
import { roomCategoryKey } from './inventory';

/** URL query parameter names (Albanian, since they are visible in shared links). */
export const FILTER_PARAMS = { room: 'dhoma', floor: 'kati' } as const;

export interface ApartmentFilters {
  /** Room category key ("garsoniere", "2", "penthouse") or null for all. */
  readonly room: string | null;
  readonly floor: Floor | null;
}

export interface FilterOptions {
  readonly rooms: readonly string[];
  readonly floors: readonly Floor[];
}

/** Reads filters from the URL, ignoring values that are not among the options in the data. */
export function parseFilters(params: URLSearchParams, options: FilterOptions): ApartmentFilters {
  const room = params.get(FILTER_PARAMS.room);
  const floorParam = params.get(FILTER_PARAMS.floor);
  const floor = floorParam !== null && /^\d+$/.test(floorParam) ? Number(floorParam) : null;
  return {
    room: room !== null && options.rooms.includes(room) ? room : null,
    floor: floor !== null && options.floors.includes(floor) ? floor : null,
  };
}

/** Returns new search params with the filters applied; other parameters are kept. */
export function withFilters(params: URLSearchParams, filters: ApartmentFilters): URLSearchParams {
  const next = new URLSearchParams(params);
  if (filters.room === null) next.delete(FILTER_PARAMS.room);
  else next.set(FILTER_PARAMS.room, filters.room);
  if (filters.floor === null) next.delete(FILTER_PARAMS.floor);
  else next.set(FILTER_PARAMS.floor, String(filters.floor));
  return next;
}

export function applyFilters(
  apartments: readonly ApartmentDetails[],
  { room, floor }: ApartmentFilters,
): ApartmentDetails[] {
  return apartments.filter(
    (apartment) =>
      (room === null || roomCategoryKey(apartment.unitType.category) === room) &&
      (floor === null || apartment.floor === floor),
  );
}

export function hasActiveFilters({ room, floor }: ApartmentFilters): boolean {
  return room !== null || floor !== null;
}
