import type { ApartmentStatus, Floor, RoomCategory } from '@/data/types';

const NBSP = ' ';

/**
 * Albanian number format: decimal comma, non-breaking space as thousands separator, and no
 * grouping below 10 000 (CLDR minimum grouping digits = 2). Implemented by hand because several
 * browsers ship without Albanian locale data, and Intl then silently falls back to "58.87".
 */
function formatNumber(value: number, fractionDigits: number): string {
  const [integerPart = '0', fractionPart] = Math.abs(value).toFixed(fractionDigits).split('.');
  const grouped = integerPart.length >= 5 ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) : integerPart;
  const sign = value < 0 ? '−' : '';
  return fractionPart ? `${sign}${grouped},${fractionPart}` : `${sign}${grouped}`;
}

export function formatInteger(value: number): string {
  return formatNumber(Math.round(value), 0);
}

/** "58,87 m²" — two decimals, Albanian separators, non-breaking space before the unit. */
export function formatArea(areaM2: number): string {
  return `${formatNumber(areaM2, 2)}${NBSP}m²`;
}

/** Whole-number area for ranges and summaries: "147 m²". */
export function formatAreaRounded(areaM2: number): string {
  return `${formatInteger(Math.round(areaM2))}${NBSP}m²`;
}

/** Floor label: "Përdhesë" for the ground floor, otherwise "Kati 3". */
export function formatFloor(floor: Floor): string {
  return floor === 0 ? 'Përdhesë' : `Kati${NBSP}${formatInteger(floor)}`;
}

/** Compact floor for lists: "Përdhesë" or the number alone ("3"). */
export function formatFloorShort(floor: Floor): string {
  return floor === 0 ? 'Përdhesë' : formatInteger(floor);
}

/** Area range: "89,01–139,44 m²", or a single area when both ends are equal. */
export function formatAreaRange(min: number, max: number): string {
  return min === max ? formatArea(min) : `${formatNumber(min, 2)}–${formatArea(max)}`;
}

/** Pozhegu's room terminology: "Garsonierë", "2 dhomëshe", "Penthouse". */
export function formatRoomCategory(category: RoomCategory): string {
  switch (category.kind) {
    case 'studio':
      return 'Garsonierë';
    case 'penthouse':
      return 'Penthouse';
    case 'bedrooms':
      return `${formatInteger(category.count)}${NBSP}dhomëshe`;
  }
}

/** Unit type display name from its category and area: "Tipi 96,26 m²", "Penthouse 139,44 m²". */
export function formatUnitTypeName(category: RoomCategory, areaM2: number): string {
  const prefix = category.kind === 'penthouse' ? 'Penthouse' : category.kind === 'studio' ? 'Garsonierë' : 'Tipi';
  return `${prefix} ${formatArea(areaM2)}`;
}

/**
 * A unit type's own name, when it says more than its area and room category. The generated names
 * ("Tipi 96,26 m²", "Penthouse 139,44 m²") do not, so pages show area and category instead.
 */
export function distinctUnitTypeName(unitType: {
  readonly name: string;
  readonly category: RoomCategory;
  readonly areaM2: number;
}): string | null {
  return unitType.name === formatUnitTypeName(unitType.category, unitType.areaM2) ? null : unitType.name;
}

/** For-sale phrase for a building: "Asnjë banesë në shitje", "1 banesë në shitje", "22 banesa në shitje". */
export function formatForSaleCount(count: number): string {
  if (count === 0) return 'Asnjë banesë në shitje';
  return count === 1 ? `1${NBSP}banesë në shitje` : `${formatInteger(count)}${NBSP}banesa në shitje`;
}

export const STATUS_LABELS: Readonly<Record<ApartmentStatus, string>> = {
  available: 'Në shitje',
  reserved: 'E rezervuar',
  sold: 'E shitur',
};

/** Display code for an apartment id: "h2-301" → "H2-301". */
export function formatApartmentCode(apartmentId: string): string {
  return apartmentId.toUpperCase();
}
