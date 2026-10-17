import type { Floor } from '@/data/types';

/** "objekti-b1" → "b1". */
export function buildingCode(buildingId: string): string {
  return buildingId.replace(/^objekti-/, '');
}

const pad2 = (value: number) => String(value).padStart(2, '0');

/** Sold unit id: building code, "s", two-digit floor, two-digit sequence on that floor ("b1-s-0301"). */
export function soldUnitId(buildingId: string, floor: Floor, sequence: number): string {
  return `${buildingCode(buildingId)}-s-${pad2(floor)}${pad2(sequence)}`;
}

/** Next free sold unit id on a floor, given every id already taken (in the data or traced this session). */
export function nextSoldUnitId(buildingId: string, floor: Floor, takenIds: ReadonlySet<string>): string {
  let sequence = 1;
  while (takenIds.has(soldUnitId(buildingId, floor, sequence))) sequence += 1;
  return soldUnitId(buildingId, floor, sequence);
}

/** Floors offered for new sold units: ground floor up to a few floors above the highest known unit. */
export function soldUnitFloorOptions(knownFloors: readonly Floor[], headroom = 3): Floor[] {
  const top = Math.max(0, ...knownFloors) + headroom;
  return Array.from({ length: top + 1 }, (_, floor) => floor);
}
