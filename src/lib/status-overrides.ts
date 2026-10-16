import type { ApartmentStatus, Project } from '@/data/types';
import { APARTMENT_STATUSES, deriveInventoryStats } from './inventory';

/** Apartment id → status that replaces the one in the data (the demo admin's changes). */
export type StatusOverrides = Readonly<Record<string, ApartmentStatus>>;

export const NO_OVERRIDES: StatusOverrides = Object.freeze({});

const APARTMENT_ID = /^[a-z0-9]+-[a-z0-9]+$/;

function isStatus(value: unknown): value is ApartmentStatus {
  return typeof value === 'string' && (APARTMENT_STATUSES as readonly string[]).includes(value);
}

/**
 * Reads stored overrides defensively: anything that is not a plain { id: status } object, and any
 * entry with a malformed id or an unknown status, is dropped rather than trusted.
 */
export function parseStatusOverrides(raw: string | null): StatusOverrides {
  if (!raw) return NO_OVERRIDES;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NO_OVERRIDES;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return NO_OVERRIDES;
  const entries = Object.entries(parsed).filter(([id, status]) => APARTMENT_ID.test(id) && isStatus(status));
  return entries.length > 0 ? Object.freeze(Object.fromEntries(entries)) : NO_OVERRIDES;
}

/** The overrides after setting one apartment's status; returning to the data's own status removes the entry. */
export function withStatus(
  overrides: StatusOverrides,
  apartmentId: string,
  status: ApartmentStatus,
  baseStatus: ApartmentStatus,
): StatusOverrides {
  const rest = Object.fromEntries(Object.entries(overrides).filter(([id]) => id !== apartmentId));
  return Object.freeze(status === baseStatus ? rest : { ...rest, [apartmentId]: status });
}

/**
 * A new project with the overrides applied and the headline stats recomputed. Ids that match no
 * apartment are ignored. Without overrides the project is returned as is (same identity).
 */
export function applyStatusOverrides(project: Project, overrides: StatusOverrides): Project {
  if (Object.keys(overrides).length === 0) return project;
  const buildings = project.buildings.map((building) => ({
    ...building,
    apartments: building.apartments.map((apartment) => {
      const status = overrides[apartment.id];
      return status && status !== apartment.status ? { ...apartment, status } : apartment;
    }),
  }));
  return { ...project, buildings, stats: deriveInventoryStats(buildings) };
}
