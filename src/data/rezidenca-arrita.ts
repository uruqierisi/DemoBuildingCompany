/**
 * Rezidenca Arrita — FICTIONAL DEMO DATA.
 *
 * Everything in this file is invented for ElevateUrBox's portfolio demo: the developer, the project,
 * the buildings, every unit type, area, floor and sales status. It describes no real building and no
 * real company. Areas are plausible for the Kosovo market; statuses were drawn once from a seeded
 * random mix (lower floors and smaller units sell first) and then fixed here.
 *
 * Two towers (A1, A2: ground floor + 9) and two lower blocks (B1, B2: ground floor + 5), as shown on
 * the aerial render. Units stack: the same position on every typical floor has the same type; the
 * set-back top floor holds penthouses. A1's units follow its facade render: on each typical floor,
 * left to right, bays 01–04 (wide, narrow, narrow, wide); on the ground floor p01 left and p02 right
 * of the entrance; on floor 9 the penthouses 901 (left) and 902 (right).
 * No floor plans exist, so every apartment page offers to request the plan.
 *
 * Renders (generated images, see ASSETS.md) come from scripts/optimize-renders.mjs; their real pixel
 * sizes come from the generated manifest. Polygons are traced in those pixels and applied with
 * scripts/apply-polygons.ts.
 */
import { formatUnitTypeName } from '@/lib/format';
import { deriveInventoryStats } from '@/lib/inventory';
import renderManifest from './generated/demo-renders.json';
import { createRenderLookup } from './render-manifest';
import type { Building, Project, RoomCategory, UnitType } from './types';

const render = createRenderLookup(renderManifest);

const STUDIO: RoomCategory = { kind: 'studio' };
const PENTHOUSE: RoomCategory = { kind: 'penthouse' };
const bedrooms = (count: number): RoomCategory => ({ kind: 'bedrooms', count });

interface UnitTypeInput {
  readonly category: RoomCategory;
  readonly areaM2: number;
}

/**
 * Builds a unit type; id and display name derive from category and area, so they cannot disagree:
 * 2 bedrooms, 78.4 → "tipi-78-40", "Tipi 78,40 m²".
 */
function unitType({ category, areaM2 }: UnitTypeInput): UnitType {
  const prefix = category.kind === 'penthouse' ? 'penthouse' : category.kind === 'studio' ? 'garsoniere' : 'tipi';
  return {
    id: `${prefix}-${areaM2.toFixed(2).replace('.', '-')}`,
    name: formatUnitTypeName(category, areaM2),
    category,
    areaM2,
  };
}

const buildings: readonly Building[] = [
  {
    id: 'objekti-a1',
    svgPath: 'M506 204L1392 198L1492 300L1488 1012L1426 1024L1156 920L452 1064L452 316Z',
    name: 'Objekti A1',
    render: render('objekti-a1'),
    unitTypes: [
      unitType({ category: STUDIO, areaM2: 38.6 }),
      unitType({ category: bedrooms(1), areaM2: 56.85 }),
      unitType({ category: bedrooms(2), areaM2: 78.4 }),
      unitType({ category: bedrooms(2), areaM2: 81.15 }),
      unitType({ category: bedrooms(3), areaM2: 104.3 }),
      unitType({ category: bedrooms(3), areaM2: 108.9 }),
      unitType({ category: PENTHOUSE, areaM2: 128.35 }),
      unitType({ category: PENTHOUSE, areaM2: 142.6 }),
    ],
    apartments: [
      {
        id: 'a1-p01',
        svgPath: 'M320 2390L814 2390L814 2612L320 2612Z',
        unitTypeId: 'tipi-81-15',
        buildingId: 'objekti-a1',
        floor: 0,
        status: 'sold',
      },
      {
        id: 'a1-p02',
        svgPath: 'M1450 2390L1946 2390L1946 2612L1450 2612Z',
        unitTypeId: 'tipi-108-90',
        buildingId: 'objekti-a1',
        floor: 0,
        status: 'sold',
      },
      {
        id: 'a1-101',
        svgPath: 'M320 2174L814 2174L814 2384L320 2384Z',
        unitTypeId: 'tipi-104-30',
        buildingId: 'objekti-a1',
        floor: 1,
        status: 'sold',
      },
      {
        id: 'a1-102',
        svgPath: 'M826 2174L1122 2174L1122 2384L826 2384Z',
        unitTypeId: 'tipi-56-85',
        buildingId: 'objekti-a1',
        floor: 1,
        status: 'sold',
      },
      {
        id: 'a1-103',
        svgPath: 'M1134 2174L1438 2174L1438 2384L1134 2384Z',
        unitTypeId: 'garsoniere-38-60',
        buildingId: 'objekti-a1',
        floor: 1,
        status: 'sold',
      },
      {
        id: 'a1-104',
        svgPath: 'M1450 2174L1946 2174L1946 2384L1450 2384Z',
        unitTypeId: 'tipi-78-40',
        buildingId: 'objekti-a1',
        floor: 1,
        status: 'sold',
      },
      {
        id: 'a1-201',
        svgPath: 'M320 1958L814 1958L814 2168L320 2168Z',
        unitTypeId: 'tipi-104-30',
        buildingId: 'objekti-a1',
        floor: 2,
        status: 'sold',
      },
      {
        id: 'a1-202',
        svgPath: 'M826 1958L1122 1958L1122 2168L826 2168Z',
        unitTypeId: 'tipi-56-85',
        buildingId: 'objekti-a1',
        floor: 2,
        status: 'sold',
      },
      {
        id: 'a1-203',
        svgPath: 'M1134 1958L1438 1958L1438 2168L1134 2168Z',
        unitTypeId: 'garsoniere-38-60',
        buildingId: 'objekti-a1',
        floor: 2,
        status: 'sold',
      },
      {
        id: 'a1-204',
        svgPath: 'M1450 1958L1946 1958L1946 2168L1450 2168Z',
        unitTypeId: 'tipi-78-40',
        buildingId: 'objekti-a1',
        floor: 2,
        status: 'sold',
      },
      {
        id: 'a1-301',
        svgPath: 'M320 1740L814 1740L814 1952L320 1952Z',
        unitTypeId: 'tipi-104-30',
        buildingId: 'objekti-a1',
        floor: 3,
        status: 'sold',
      },
      {
        id: 'a1-302',
        svgPath: 'M826 1740L1122 1740L1122 1952L826 1952Z',
        unitTypeId: 'tipi-56-85',
        buildingId: 'objekti-a1',
        floor: 3,
        status: 'sold',
      },
      {
        id: 'a1-303',
        svgPath: 'M1134 1740L1438 1740L1438 1952L1134 1952Z',
        unitTypeId: 'garsoniere-38-60',
        buildingId: 'objekti-a1',
        floor: 3,
        status: 'sold',
      },
      {
        id: 'a1-304',
        svgPath: 'M1450 1740L1946 1740L1946 1952L1450 1952Z',
        unitTypeId: 'tipi-78-40',
        buildingId: 'objekti-a1',
        floor: 3,
        status: 'sold',
      },
      {
        id: 'a1-401',
        svgPath: 'M320 1526L814 1526L814 1734L320 1734Z',
        unitTypeId: 'tipi-104-30',
        buildingId: 'objekti-a1',
        floor: 4,
        status: 'sold',
      },
      {
        id: 'a1-402',
        svgPath: 'M826 1526L1122 1526L1122 1734L826 1734Z',
        unitTypeId: 'tipi-56-85',
        buildingId: 'objekti-a1',
        floor: 4,
        status: 'sold',
      },
      {
        id: 'a1-403',
        svgPath: 'M1134 1526L1438 1526L1438 1734L1134 1734Z',
        unitTypeId: 'garsoniere-38-60',
        buildingId: 'objekti-a1',
        floor: 4,
        status: 'available',
      },
      {
        id: 'a1-404',
        svgPath: 'M1450 1526L1946 1526L1946 1734L1450 1734Z',
        unitTypeId: 'tipi-78-40',
        buildingId: 'objekti-a1',
        floor: 4,
        status: 'sold',
      },
      {
        id: 'a1-501',
        svgPath: 'M320 1310L814 1310L814 1520L320 1520Z',
        unitTypeId: 'tipi-104-30',
        buildingId: 'objekti-a1',
        floor: 5,
        status: 'sold',
      },
      {
        id: 'a1-502',
        svgPath: 'M826 1310L1122 1310L1122 1520L826 1520Z',
        unitTypeId: 'tipi-56-85',
        buildingId: 'objekti-a1',
        floor: 5,
        status: 'reserved',
      },
      {
        id: 'a1-503',
        svgPath: 'M1134 1310L1438 1310L1438 1520L1134 1520Z',
        unitTypeId: 'garsoniere-38-60',
        buildingId: 'objekti-a1',
        floor: 5,
        status: 'sold',
      },
      {
        id: 'a1-504',
        svgPath: 'M1450 1310L1946 1310L1946 1520L1450 1520Z',
        unitTypeId: 'tipi-78-40',
        buildingId: 'objekti-a1',
        floor: 5,
        status: 'sold',
      },
      {
        id: 'a1-601',
        svgPath: 'M320 1094L814 1094L814 1304L320 1304Z',
        unitTypeId: 'tipi-104-30',
        buildingId: 'objekti-a1',
        floor: 6,
        status: 'sold',
      },
      {
        id: 'a1-602',
        svgPath: 'M826 1094L1122 1094L1122 1304L826 1304Z',
        unitTypeId: 'tipi-56-85',
        buildingId: 'objekti-a1',
        floor: 6,
        status: 'available',
      },
      {
        id: 'a1-603',
        svgPath: 'M1134 1094L1438 1094L1438 1304L1134 1304Z',
        unitTypeId: 'garsoniere-38-60',
        buildingId: 'objekti-a1',
        floor: 6,
        status: 'sold',
      },
      {
        id: 'a1-604',
        svgPath: 'M1450 1094L1946 1094L1946 1304L1450 1304Z',
        unitTypeId: 'tipi-78-40',
        buildingId: 'objekti-a1',
        floor: 6,
        status: 'sold',
      },
      {
        id: 'a1-701',
        svgPath: 'M320 878L814 878L814 1088L320 1088Z',
        unitTypeId: 'tipi-104-30',
        buildingId: 'objekti-a1',
        floor: 7,
        status: 'sold',
      },
      {
        id: 'a1-702',
        svgPath: 'M826 878L1122 878L1122 1088L826 1088Z',
        unitTypeId: 'tipi-56-85',
        buildingId: 'objekti-a1',
        floor: 7,
        status: 'sold',
      },
      {
        id: 'a1-703',
        svgPath: 'M1134 878L1438 878L1438 1088L1134 1088Z',
        unitTypeId: 'garsoniere-38-60',
        buildingId: 'objekti-a1',
        floor: 7,
        status: 'sold',
      },
      {
        id: 'a1-704',
        svgPath: 'M1450 878L1946 878L1946 1088L1450 1088Z',
        unitTypeId: 'tipi-78-40',
        buildingId: 'objekti-a1',
        floor: 7,
        status: 'available',
      },
      {
        id: 'a1-801',
        svgPath: 'M320 666L814 666L814 872L320 872Z',
        unitTypeId: 'tipi-104-30',
        buildingId: 'objekti-a1',
        floor: 8,
        status: 'available',
      },
      {
        id: 'a1-802',
        svgPath: 'M826 666L1122 666L1122 872L826 872Z',
        unitTypeId: 'tipi-56-85',
        buildingId: 'objekti-a1',
        floor: 8,
        status: 'sold',
      },
      {
        id: 'a1-803',
        svgPath: 'M1134 666L1438 666L1438 872L1134 872Z',
        unitTypeId: 'garsoniere-38-60',
        buildingId: 'objekti-a1',
        floor: 8,
        status: 'available',
      },
      {
        id: 'a1-804',
        svgPath: 'M1450 666L1946 666L1946 872L1450 872Z',
        unitTypeId: 'tipi-78-40',
        buildingId: 'objekti-a1',
        floor: 8,
        status: 'sold',
      },
      {
        id: 'a1-901',
        svgPath: 'M380 394L1126 394L1126 624L342 624L342 564Z',
        unitTypeId: 'penthouse-142-60',
        buildingId: 'objekti-a1',
        floor: 9,
        status: 'available',
      },
      {
        id: 'a1-902',
        svgPath: 'M1138 394L1894 394L1924 564L1924 624L1138 624Z',
        unitTypeId: 'penthouse-128-35',
        buildingId: 'objekti-a1',
        floor: 9,
        status: 'reserved',
      },
    ],
    soldUnits: [],
  },
  {
    id: 'objekti-a2',
    svgPath: 'M1850 190L2610 198L2716 300L2676 846L2602 830L2064 978L1800 978L1800 280Z',
    name: 'Objekti A2',
    unitTypes: [
      unitType({ category: bedrooms(1), areaM2: 58.2 }),
      unitType({ category: bedrooms(1), areaM2: 61.4 }),
      unitType({ category: bedrooms(2), areaM2: 76.45 }),
      unitType({ category: bedrooms(2), areaM2: 79.3 }),
      unitType({ category: bedrooms(2), areaM2: 84.1 }),
      unitType({ category: bedrooms(3), areaM2: 99.75 }),
      unitType({ category: PENTHOUSE, areaM2: 121.95 }),
      unitType({ category: PENTHOUSE, areaM2: 136.8 }),
    ],
    apartments: [
      { id: 'a2-p01', unitTypeId: 'tipi-61-40', buildingId: 'objekti-a2', floor: 0, status: 'sold' },
      { id: 'a2-p02', unitTypeId: 'tipi-79-30', buildingId: 'objekti-a2', floor: 0, status: 'available' },
      { id: 'a2-101', unitTypeId: 'tipi-76-45', buildingId: 'objekti-a2', floor: 1, status: 'sold' },
      { id: 'a2-102', unitTypeId: 'tipi-58-20', buildingId: 'objekti-a2', floor: 1, status: 'sold' },
      { id: 'a2-103', unitTypeId: 'tipi-99-75', buildingId: 'objekti-a2', floor: 1, status: 'sold' },
      { id: 'a2-104', unitTypeId: 'tipi-84-10', buildingId: 'objekti-a2', floor: 1, status: 'available' },
      { id: 'a2-201', unitTypeId: 'tipi-76-45', buildingId: 'objekti-a2', floor: 2, status: 'available' },
      { id: 'a2-202', unitTypeId: 'tipi-58-20', buildingId: 'objekti-a2', floor: 2, status: 'reserved' },
      { id: 'a2-203', unitTypeId: 'tipi-99-75', buildingId: 'objekti-a2', floor: 2, status: 'reserved' },
      { id: 'a2-204', unitTypeId: 'tipi-84-10', buildingId: 'objekti-a2', floor: 2, status: 'sold' },
      { id: 'a2-301', unitTypeId: 'tipi-76-45', buildingId: 'objekti-a2', floor: 3, status: 'sold' },
      { id: 'a2-302', unitTypeId: 'tipi-58-20', buildingId: 'objekti-a2', floor: 3, status: 'reserved' },
      { id: 'a2-303', unitTypeId: 'tipi-99-75', buildingId: 'objekti-a2', floor: 3, status: 'available' },
      { id: 'a2-304', unitTypeId: 'tipi-84-10', buildingId: 'objekti-a2', floor: 3, status: 'sold' },
      { id: 'a2-401', unitTypeId: 'tipi-76-45', buildingId: 'objekti-a2', floor: 4, status: 'available' },
      { id: 'a2-402', unitTypeId: 'tipi-58-20', buildingId: 'objekti-a2', floor: 4, status: 'available' },
      { id: 'a2-403', unitTypeId: 'tipi-99-75', buildingId: 'objekti-a2', floor: 4, status: 'sold' },
      { id: 'a2-404', unitTypeId: 'tipi-84-10', buildingId: 'objekti-a2', floor: 4, status: 'sold' },
      { id: 'a2-501', unitTypeId: 'tipi-76-45', buildingId: 'objekti-a2', floor: 5, status: 'sold' },
      { id: 'a2-502', unitTypeId: 'tipi-58-20', buildingId: 'objekti-a2', floor: 5, status: 'available' },
      { id: 'a2-503', unitTypeId: 'tipi-99-75', buildingId: 'objekti-a2', floor: 5, status: 'sold' },
      { id: 'a2-504', unitTypeId: 'tipi-84-10', buildingId: 'objekti-a2', floor: 5, status: 'available' },
      { id: 'a2-601', unitTypeId: 'tipi-76-45', buildingId: 'objekti-a2', floor: 6, status: 'available' },
      { id: 'a2-602', unitTypeId: 'tipi-58-20', buildingId: 'objekti-a2', floor: 6, status: 'sold' },
      { id: 'a2-603', unitTypeId: 'tipi-99-75', buildingId: 'objekti-a2', floor: 6, status: 'available' },
      { id: 'a2-604', unitTypeId: 'tipi-84-10', buildingId: 'objekti-a2', floor: 6, status: 'sold' },
      { id: 'a2-701', unitTypeId: 'tipi-76-45', buildingId: 'objekti-a2', floor: 7, status: 'available' },
      { id: 'a2-702', unitTypeId: 'tipi-58-20', buildingId: 'objekti-a2', floor: 7, status: 'available' },
      { id: 'a2-703', unitTypeId: 'tipi-99-75', buildingId: 'objekti-a2', floor: 7, status: 'sold' },
      { id: 'a2-704', unitTypeId: 'tipi-84-10', buildingId: 'objekti-a2', floor: 7, status: 'sold' },
      { id: 'a2-801', unitTypeId: 'tipi-76-45', buildingId: 'objekti-a2', floor: 8, status: 'available' },
      { id: 'a2-802', unitTypeId: 'tipi-58-20', buildingId: 'objekti-a2', floor: 8, status: 'reserved' },
      { id: 'a2-803', unitTypeId: 'tipi-99-75', buildingId: 'objekti-a2', floor: 8, status: 'available' },
      { id: 'a2-804', unitTypeId: 'tipi-84-10', buildingId: 'objekti-a2', floor: 8, status: 'sold' },
      { id: 'a2-901', unitTypeId: 'penthouse-136-80', buildingId: 'objekti-a2', floor: 9, status: 'available' },
      { id: 'a2-902', unitTypeId: 'penthouse-121-95', buildingId: 'objekti-a2', floor: 9, status: 'reserved' },
    ],
    soldUnits: [],
  },
  {
    id: 'objekti-b1',
    svgPath: 'M410 1074L1156 920L1426 1024L1524 1114L1480 1556L840 1814L394 1736L380 1200Z',
    name: 'Objekti B1',
    unitTypes: [
      unitType({ category: STUDIO, areaM2: 41.2 }),
      unitType({ category: bedrooms(1), areaM2: 54.3 }),
      unitType({ category: bedrooms(2), areaM2: 72.65 }),
      unitType({ category: bedrooms(2), areaM2: 74.8 }),
      unitType({ category: bedrooms(3), areaM2: 96.4 }),
      unitType({ category: PENTHOUSE, areaM2: 118.7 }),
    ],
    apartments: [
      { id: 'b1-p01', unitTypeId: 'tipi-74-80', buildingId: 'objekti-b1', floor: 0, status: 'reserved' },
      { id: 'b1-p02', unitTypeId: 'tipi-54-30', buildingId: 'objekti-b1', floor: 0, status: 'available' },
      { id: 'b1-101', unitTypeId: 'tipi-96-40', buildingId: 'objekti-b1', floor: 1, status: 'sold' },
      { id: 'b1-102', unitTypeId: 'tipi-72-65', buildingId: 'objekti-b1', floor: 1, status: 'sold' },
      { id: 'b1-103', unitTypeId: 'garsoniere-41-20', buildingId: 'objekti-b1', floor: 1, status: 'sold' },
      { id: 'b1-201', unitTypeId: 'tipi-96-40', buildingId: 'objekti-b1', floor: 2, status: 'sold' },
      { id: 'b1-202', unitTypeId: 'tipi-72-65', buildingId: 'objekti-b1', floor: 2, status: 'sold' },
      { id: 'b1-203', unitTypeId: 'garsoniere-41-20', buildingId: 'objekti-b1', floor: 2, status: 'sold' },
      { id: 'b1-301', unitTypeId: 'tipi-96-40', buildingId: 'objekti-b1', floor: 3, status: 'reserved' },
      { id: 'b1-302', unitTypeId: 'tipi-72-65', buildingId: 'objekti-b1', floor: 3, status: 'sold' },
      { id: 'b1-303', unitTypeId: 'garsoniere-41-20', buildingId: 'objekti-b1', floor: 3, status: 'sold' },
      { id: 'b1-401', unitTypeId: 'tipi-96-40', buildingId: 'objekti-b1', floor: 4, status: 'sold' },
      { id: 'b1-402', unitTypeId: 'tipi-72-65', buildingId: 'objekti-b1', floor: 4, status: 'sold' },
      { id: 'b1-403', unitTypeId: 'garsoniere-41-20', buildingId: 'objekti-b1', floor: 4, status: 'sold' },
      { id: 'b1-501', unitTypeId: 'penthouse-118-70', buildingId: 'objekti-b1', floor: 5, status: 'available' },
      { id: 'b1-502', unitTypeId: 'tipi-72-65', buildingId: 'objekti-b1', floor: 5, status: 'sold' },
    ],
    soldUnits: [],
  },
  {
    id: 'objekti-b2',
    svgPath: 'M2064 978L2602 830L2946 902L3026 926L3000 1400L2454 1704L2034 1584L2000 1060Z',
    name: 'Objekti B2',
    unitTypes: [
      unitType({ category: STUDIO, areaM2: 39.85 }),
      unitType({ category: bedrooms(1), areaM2: 52.75 }),
      unitType({ category: bedrooms(2), areaM2: 82.3 }),
      unitType({ category: bedrooms(3), areaM2: 98.2 }),
      unitType({ category: bedrooms(3), areaM2: 101.6 }),
      unitType({ category: PENTHOUSE, areaM2: 109.9 }),
      unitType({ category: PENTHOUSE, areaM2: 131.4 }),
    ],
    apartments: [
      { id: 'b2-p01', unitTypeId: 'tipi-98-20', buildingId: 'objekti-b2', floor: 0, status: 'sold' },
      { id: 'b2-p02', unitTypeId: 'garsoniere-39-85', buildingId: 'objekti-b2', floor: 0, status: 'sold' },
      { id: 'b2-101', unitTypeId: 'tipi-82-30', buildingId: 'objekti-b2', floor: 1, status: 'available' },
      { id: 'b2-102', unitTypeId: 'tipi-52-75', buildingId: 'objekti-b2', floor: 1, status: 'reserved' },
      { id: 'b2-103', unitTypeId: 'tipi-101-60', buildingId: 'objekti-b2', floor: 1, status: 'sold' },
      { id: 'b2-201', unitTypeId: 'tipi-82-30', buildingId: 'objekti-b2', floor: 2, status: 'sold' },
      { id: 'b2-202', unitTypeId: 'tipi-52-75', buildingId: 'objekti-b2', floor: 2, status: 'sold' },
      { id: 'b2-203', unitTypeId: 'tipi-101-60', buildingId: 'objekti-b2', floor: 2, status: 'available' },
      { id: 'b2-301', unitTypeId: 'tipi-82-30', buildingId: 'objekti-b2', floor: 3, status: 'available' },
      { id: 'b2-302', unitTypeId: 'tipi-52-75', buildingId: 'objekti-b2', floor: 3, status: 'available' },
      { id: 'b2-303', unitTypeId: 'tipi-101-60', buildingId: 'objekti-b2', floor: 3, status: 'sold' },
      { id: 'b2-401', unitTypeId: 'tipi-82-30', buildingId: 'objekti-b2', floor: 4, status: 'sold' },
      { id: 'b2-402', unitTypeId: 'tipi-52-75', buildingId: 'objekti-b2', floor: 4, status: 'reserved' },
      { id: 'b2-403', unitTypeId: 'tipi-101-60', buildingId: 'objekti-b2', floor: 4, status: 'sold' },
      { id: 'b2-501', unitTypeId: 'penthouse-131-40', buildingId: 'objekti-b2', floor: 5, status: 'available' },
      { id: 'b2-502', unitTypeId: 'penthouse-109-90', buildingId: 'objekti-b2', floor: 5, status: 'available' },
    ],
    soldUnits: [],
  },
];

export const rezidencaArrita: Project = {
  id: 'rezidenca-arrita',
  name: 'Rezidenca Arrita',
  tagline: 'Projekt banimi fiktiv, ndërtuar si demo nga ElevateUrBox.',
  description:
    'Katër objekte banimi rreth një oborri të përbashkët, me banesa nga garsoniera deri te penthouse. Zgjidhni objektin dhe shikoni banesat në shitje.',
  intro: {
    heading: 'Katër objekte, një oborr i përbashkët.',
    paragraphs: [
      'Rezidenca Arrita ka dy kulla me përdhesë dhe nëntë kate (A1, A2) dhe dy blloqe më të ulëta me përdhesë dhe pesë kate (B1, B2), të vendosura rreth një oborri pa vetura.',
      'Banesat shkojnë nga garsoniera rreth 40 m² deri te penthouse mbi 140 m² në katin e fundit. Në çdo kat tipik tipet e banesave përsëriten, kështu që plani i një kati vlen për të gjithë objektin.',
    ],
  },
  heroImage: render('overview'),
  gallery: [],
  // All four buildings stand on the aerial render: the towers behind, the low blocks in front.
  overview: {
    image: render('overview'),
    buildingIds: ['objekti-a1', 'objekti-a2', 'objekti-b1', 'objekti-b2'],
  },
  // Project-level counts are derived from the inventory so they never drift from the data.
  stats: deriveInventoryStats(buildings),
  buildings,
};
