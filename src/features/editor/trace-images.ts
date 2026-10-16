import type { Floor, Project, RenderImage } from '@/data/types';
import { formatApartmentCode, formatFloor } from '@/lib/format';
import { soldUnitFloorOptions } from '@/lib/sold-units';
import type { TargetKind } from './editor-state';

export interface TraceTarget {
  readonly kind: TargetKind;
  readonly id: string;
  readonly label: string;
  /** Option group in the picker: "Objektet", a floor label or "Njësi të shitura". */
  readonly group: string;
  /** Sold units only. */
  readonly floor?: Floor;
  /** Path currently in the data file, if already traced. */
  readonly currentPath?: string;
}

export interface TraceImage {
  /** Stable key for the URL: "<project>:overview" or "<project>:<building-id>". */
  readonly key: string;
  readonly label: string;
  readonly projectId: string;
  /** The render; its width × height is the coordinate space the polygons are stored in. */
  readonly image: RenderImage;
  readonly targets: readonly TraceTarget[];
  /** Building renders only: the building new sold units belong to, and the floors offered for them. */
  readonly buildingId?: string;
  readonly soldFloors?: readonly Floor[];
}

export const SOLD_GROUP = 'Njësi të shitura';

/** Every traceable image in the data: each project's overview render and each building render that exists. */
export function getTraceImages(projects: readonly Project[]): TraceImage[] {
  return projects.flatMap((project) => {
    const visible = new Set(project.overview?.buildingIds ?? []);
    const overview: TraceImage[] = project.overview
      ? [
          {
            key: `${project.id}:overview`,
            label: `${project.name} · pamja e përgjithshme`,
            projectId: project.id,
            image: project.overview.image,
            // Only buildings visible on the overview can be traced on it.
            targets: project.buildings
              .filter((building) => visible.has(building.id))
              .map((building) => ({
                kind: 'building' as const,
                id: building.id,
                label: building.name,
                group: 'Objektet',
                currentPath: building.svgPath,
              })),
          },
        ]
      : [];
    const buildings = project.buildings.flatMap((building): TraceImage[] =>
      building.render
        ? [
            {
              key: `${project.id}:${building.id}`,
              label: `${project.name} · ${building.name}`,
              projectId: project.id,
              image: building.render,
              buildingId: building.id,
              soldFloors: soldUnitFloorOptions([
                ...building.apartments.map((apartment) => apartment.floor),
                ...building.soldUnits.map((unit) => unit.floor),
              ]),
              targets: [
                ...building.apartments
                  .toSorted((a, b) => a.floor - b.floor || a.id.localeCompare(b.id))
                  .map((apartment) => ({
                    kind: 'apartment' as const,
                    id: apartment.id,
                    label: formatApartmentCode(apartment.id),
                    group: formatFloor(apartment.floor),
                    currentPath: apartment.svgPath,
                  })),
                ...building.soldUnits
                  .toSorted((a, b) => a.id.localeCompare(b.id))
                  .map((unit) => ({
                    kind: 'sold' as const,
                    id: unit.id,
                    label: `${formatApartmentCode(unit.id)} · ${formatFloor(unit.floor)}`,
                    group: SOLD_GROUP,
                    floor: unit.floor,
                    currentPath: unit.svgPath,
                  })),
              ],
            },
          ]
        : [],
    );
    return [...overview, ...buildings];
  });
}

/** Groups targets for <optgroup>s, keeping their order. */
export function groupTargets(targets: readonly TraceTarget[]): Array<[string, TraceTarget[]]> {
  const groups = new Map<string, TraceTarget[]>();
  for (const target of targets) groups.set(target.group, [...(groups.get(target.group) ?? []), target]);
  return [...groups.entries()];
}
