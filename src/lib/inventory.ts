import type {
  Apartment,
  ApartmentDetails,
  ApartmentStatus,
  Building,
  Floor,
  Project,
  RoomCategory,
  Stat,
  UnitType,
} from '@/data/types';

export const APARTMENT_STATUSES: readonly ApartmentStatus[] = ['available', 'reserved', 'sold'];

export function findBuilding(project: Project, buildingId: string): Building | undefined {
  return project.buildings.find((building) => building.id === buildingId);
}

export function findUnitType(building: Building, unitTypeId: string): UnitType | undefined {
  return building.unitTypes.find((unitType) => unitType.id === unitTypeId);
}

/**
 * Joins every apartment with its unit type. Apartments that reference a missing unit type are
 * a data error; they are reported in development and left out rather than crashing the page.
 */
export function getApartmentDetails(building: Building): ApartmentDetails[] {
  const unitTypes = new Map(building.unitTypes.map((unitType) => [unitType.id, unitType]));
  return building.apartments.flatMap((apartment) => {
    const unitType = unitTypes.get(apartment.unitTypeId);
    if (!unitType) {
      if (import.meta.env.DEV) {
        console.error(`Apartment "${apartment.id}" references unknown unit type "${apartment.unitTypeId}".`);
      }
      return [];
    }
    return [{ ...apartment, unitType }];
  });
}

export function findApartmentDetails(building: Building, apartmentId: string): ApartmentDetails | undefined {
  return getApartmentDetails(building).find((apartment) => apartment.id === apartmentId);
}

/** Distinct floors present in the data, ground floor (0) first. */
export function deriveFloors(apartments: readonly Apartment[]): Floor[] {
  return [...new Set(apartments.map((apartment) => apartment.floor))].sort((a, b) => a - b);
}

/** Stable key for a room category, used in URLs and as a React key: "garsoniere", "2", "penthouse". */
export function roomCategoryKey(category: RoomCategory): string {
  if (category.kind === 'bedrooms') return String(category.count);
  return category.kind === 'studio' ? 'garsoniere' : 'penthouse';
}

/** Sort order: studio, then by bedrooms, then penthouse. */
export function roomCategoryRank(category: RoomCategory): number {
  if (category.kind === 'studio') return 0;
  return category.kind === 'bedrooms' ? category.count : Number.POSITIVE_INFINITY;
}

/** Distinct room categories present in the data, in display order. */
export function deriveRoomCategories(apartments: readonly ApartmentDetails[]): RoomCategory[] {
  const byKey = new Map(apartments.map(({ unitType }) => [roomCategoryKey(unitType.category), unitType.category]));
  return [...byKey.values()].sort((a, b) => roomCategoryRank(a) - roomCategoryRank(b));
}

export function countByStatus(apartments: readonly Apartment[]): Record<ApartmentStatus, number> {
  return apartments.reduce<Record<ApartmentStatus, number>>(
    (counts, apartment) => ({ ...counts, [apartment.status]: counts[apartment.status] + 1 }),
    { available: 0, reserved: 0, sold: 0 },
  );
}

export interface BuildingSummary {
  readonly building: Building;
  /** Apartments currently for sale. */
  readonly forSale: number;
  /** Highest floor with a listed apartment (0 = ground floor only); undefined without apartments. */
  readonly topFloor: Floor | undefined;
  readonly hasPenthouse: boolean;
}

export function summarizeBuilding(building: Building): BuildingSummary {
  const floors = deriveFloors(building.apartments);
  return {
    building,
    forSale: countByStatus(building.apartments).available,
    topFloor: floors.at(-1),
    hasPenthouse: building.unitTypes.some((unitType) => unitType.category.kind === 'penthouse'),
  };
}

export interface BuildingFacts {
  /** Apartments for sale, lowest floor first. */
  readonly forSale: ApartmentDetails[];
  /** Apartments shown in the list: for sale and reserved (sold ones leave the list), lowest floor first. */
  readonly listed: ApartmentDetails[];
  readonly areaRange: { readonly min: number; readonly max: number } | undefined;
  readonly categories: RoomCategory[];
  readonly floors: Floor[];
}

const byFloorThenId = (a: ApartmentDetails, b: ApartmentDetails) => a.floor - b.floor || a.id.localeCompare(b.id);

/** Key figures of a building. Counts, areas and categories describe only what is for sale. */
export function deriveBuildingFacts(building: Building): BuildingFacts {
  const listed = getApartmentDetails(building)
    .filter((apartment) => apartment.status !== 'sold')
    .sort(byFloorThenId);
  const forSale = listed.filter((apartment) => apartment.status === 'available');
  const areas = forSale.map((apartment) => apartment.unitType.areaM2);
  return {
    forSale,
    listed,
    areaRange: areas.length > 0 ? { min: Math.min(...areas), max: Math.max(...areas) } : undefined,
    categories: deriveRoomCategories(forSale),
    floors: deriveFloors(forSale),
  };
}

/** Number of apartments to suggest when the one a visitor opened has been sold. */
export const SOLD_ALTERNATIVES_LIMIT = 6;

export type ApartmentPageState =
  | { readonly kind: 'missing' }
  | {
      readonly kind: 'listed';
      readonly apartment: ApartmentDetails;
      readonly previous: ApartmentDetails | undefined;
      readonly next: ApartmentDetails | undefined;
    }
  | {
      readonly kind: 'sold';
      readonly apartment: ApartmentDetails;
      /** Apartments still for sale in the same building: same room category first, then by floor. */
      readonly alternatives: ApartmentDetails[];
      readonly forSaleCount: number;
    };

/** What the apartment page shows for an id: the apartment (for sale or reserved), a "sold" state, or 404. */
export function resolveApartmentPage(building: Building, apartmentId: string): ApartmentPageState {
  const apartment = getApartmentDetails(building).find((candidate) => candidate.id === apartmentId);
  if (!apartment) return { kind: 'missing' };
  const { listed, forSale } = deriveBuildingFacts(building);
  if (apartment.status === 'sold') {
    const category = roomCategoryKey(apartment.unitType.category);
    const sameCategoryFirst = (a: ApartmentDetails, b: ApartmentDetails) =>
      Number(roomCategoryKey(b.unitType.category) === category) -
      Number(roomCategoryKey(a.unitType.category) === category);
    const alternatives = [...forSale]
      .sort((a, b) => sameCategoryFirst(a, b) || byFloorThenId(a, b))
      .slice(0, SOLD_ALTERNATIVES_LIMIT);
    return { kind: 'sold', apartment, alternatives, forSaleCount: forSale.length };
  }
  const index = listed.findIndex((candidate) => candidate.id === apartmentId);
  return { kind: 'listed', apartment, previous: listed[index - 1], next: listed[index + 1] };
}

/** Smallest and largest unit area across the given buildings, or undefined when empty. */
export function deriveAreaRange(buildings: readonly Building[]): { min: number; max: number } | undefined {
  const areas = buildings.flatMap((building) =>
    getApartmentDetails(building).map((apartment) => apartment.unitType.areaM2),
  );
  if (areas.length === 0) return undefined;
  return { min: Math.min(...areas), max: Math.max(...areas) };
}

/**
 * Headline counters computed from the inventory, so they always match the data. The data lists only
 * units for sale, so no figure claims to be a building's total number of apartments.
 */
export function deriveInventoryStats(buildings: readonly Building[]): Stat[] {
  const forSale = buildings.flatMap(getApartmentDetails).filter((apartment) => apartment.status === 'available');
  const areaForSale = forSale.reduce((sum, apartment) => sum + apartment.unitType.areaM2, 0);
  const buildingsForSale = buildings.filter((building) => building.apartments.some((a) => a.status === 'available'));
  return [
    { id: 'buildingsForSale', value: buildingsForSale.length, label: 'Objekte me banesa në shitje' },
    { id: 'forSale', value: forSale.length, label: 'Banesa në shitje' },
    { id: 'areaForSale', value: Math.round(areaForSale), unit: 'm²', label: 'Sipërfaqe në shitje' },
  ];
}
