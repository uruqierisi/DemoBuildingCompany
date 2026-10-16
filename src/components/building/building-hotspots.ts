import type { Hotspot } from '@/components/hotspots/HotspotOverlay';
import type { Building } from '@/data/types';
import { getApartmentDetails } from '@/lib/inventory';
import { routes } from '@/lib/routes';

const TONE_BY_STATUS = { available: 'accent', reserved: 'reserved', sold: 'muted' } as const;

/**
 * Shapes on a building render. Apartments take their tone from their status: for sale (accent) and
 * reserved link to their page; a listed apartment that has been sold looks and behaves exactly like
 * the sold units traced from the render (grey, no link).
 */
export function buildingHotspots(building: Building): Hotspot[] {
  const apartments = getApartmentDetails(building).flatMap((apartment) => {
    if (!apartment.svgPath) return [];
    const tone = TONE_BY_STATUS[apartment.status];
    return [
      {
        id: apartment.id,
        svgPath: apartment.svgPath,
        tone,
        ...(tone === 'muted' ? {} : { href: routes.apartment(building.id, apartment.id) }),
      },
    ];
  });
  const soldUnits = building.soldUnits.flatMap((unit) =>
    unit.svgPath ? [{ id: unit.id, svgPath: unit.svgPath, tone: 'muted' as const }] : [],
  );
  return [...apartments, ...soldUnits];
}
