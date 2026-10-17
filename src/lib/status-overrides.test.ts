import { describe, expect, it } from 'vitest';
import { buildingHotspots } from '@/components/building/building-hotspots';
import { featuredProject } from '@/data/projects';
import type { Building, Project } from '@/data/types';
import { deriveBuildingFacts, findBuilding, resolveApartmentPage, summarizeBuilding } from './inventory';
import { applyStatusOverrides, NO_OVERRIDES, parseStatusOverrides, withStatus } from './status-overrides';

// Objekti B1 in the demo data: for sale b1-p02 (1 bedroom, 54,30 m²) and b1-501 (penthouse);
// reserved b1-p01 and b1-301; every other apartment sold.
const statValue = (project: Project, id: string) => project.stats.find((stat) => stat.id === id)?.value;
const b1 = (project: Project) => {
  const building = findBuilding(project, 'objekti-b1');
  if (!building) throw new Error('Objekti B1 missing from the data');
  return building;
};
/** The demo data has no renders yet: give every apartment a shape so the render's hotspots can be checked. */
const traced = (building: Building): Building => ({
  ...building,
  apartments: building.apartments.map((apartment) => ({ ...apartment, svgPath: 'M0 0L10 0L10 10L0 10Z' })),
});

describe('parseStatusOverrides', () => {
  it('keeps valid entries and drops malformed ids and unknown statuses', () => {
    expect(parseStatusOverrides('{"b1-p02":"sold","b1-501":"reserved","x":"sold","b1-p01":"gone"}')).toEqual({
      'b1-p02': 'sold',
      'b1-501': 'reserved',
    });
  });

  it('treats missing, invalid or non-object storage as no changes', () => {
    for (const raw of [null, '', 'not json', '[]', '"sold"', 'null'])
      expect(parseStatusOverrides(raw)).toBe(NO_OVERRIDES);
  });
});

describe('withStatus', () => {
  it('records a change and removes it again when the status returns to the one in the data', () => {
    const sold = withStatus(NO_OVERRIDES, 'b1-p02', 'sold', 'available');
    expect(sold).toEqual({ 'b1-p02': 'sold' });
    expect(withStatus(sold, 'b1-p02', 'available', 'available')).toEqual({});
  });
});

describe('an apartment from the list moves to "sold"', () => {
  const project = applyStatusOverrides(featuredProject, { 'b1-p02': 'sold' });
  const building = b1(project);

  it('leaves the data untouched', () => {
    expect(b1(featuredProject).apartments.find((a) => a.id === 'b1-p02')?.status).toBe('available');
    expect(applyStatusOverrides(featuredProject, NO_OVERRIDES)).toBe(featuredProject);
  });

  it('is grey on the render and no longer links to a page', () => {
    const hotspot = buildingHotspots(traced(building)).find((h) => h.id === 'b1-p02');
    expect(hotspot).toMatchObject({ tone: 'muted' });
    expect(hotspot?.href).toBeUndefined();
  });

  it('leaves the list and every count', () => {
    const facts = deriveBuildingFacts(building);
    expect(facts.listed.map((a) => a.id)).not.toContain('b1-p02');
    expect(facts.forSale.map((a) => a.id)).toEqual(['b1-501']);
    expect(summarizeBuilding(building).forSale).toBe(1);
    expect(statValue(project, 'forSale')).toBe((statValue(featuredProject, 'forSale') ?? 0) - 1);
    expect(statValue(project, 'areaForSale')).toBe(
      Math.round(
        featuredProject.buildings
          .flatMap((b) => deriveBuildingFacts(b).forSale)
          .reduce((sum, a) => sum + a.unitType.areaM2, 0) - 54.3,
      ),
    );
  });

  it('keeps its page, in a "sold" state that suggests the building’s other apartments for sale', () => {
    const state = resolveApartmentPage(building, 'b1-p02');
    expect(state.kind).toBe('sold');
    if (state.kind !== 'sold') return;
    expect(state.forSaleCount).toBe(1);
    expect(state.alternatives.map((a) => a.id)).toEqual(['b1-501']);
  });

  it('removes a building from the "buildings with apartments for sale" count when its last one sells', () => {
    const soldOut = applyStatusOverrides(featuredProject, { 'b1-p02': 'sold', 'b1-501': 'sold' });
    expect(statValue(soldOut, 'buildingsForSale')).toBe((statValue(featuredProject, 'buildingsForSale') ?? 0) - 1);
    const state = resolveApartmentPage(b1(soldOut), 'b1-501');
    expect(state).toMatchObject({ kind: 'sold', forSaleCount: 0, alternatives: [] });
  });
});

describe('an apartment from the list moves to "reserved"', () => {
  const project = applyStatusOverrides(featuredProject, { 'b1-501': 'reserved' });
  const building = b1(project);

  it('stays listed and keeps its page, but no longer counts as for sale', () => {
    const facts = deriveBuildingFacts(building);
    expect(facts.listed.map((a) => a.id)).toContain('b1-501');
    expect(facts.forSale.map((a) => a.id)).not.toContain('b1-501');
    expect(statValue(project, 'forSale')).toBe((statValue(featuredProject, 'forSale') ?? 0) - 1);
    expect(resolveApartmentPage(building, 'b1-501').kind).toBe('listed');
  });

  it('has its own tone on the render and still links to its page', () => {
    expect(buildingHotspots(traced(building)).find((h) => h.id === 'b1-501')).toMatchObject({
      tone: 'reserved',
      href: '/objekti/objekti-b1/b1-501',
    });
  });
});

describe('resolveApartmentPage', () => {
  it('returns "missing" for ids that are not apartments, including traced sold units', () => {
    expect(resolveApartmentPage(b1(featuredProject), 'b1-s-0301').kind).toBe('missing');
    expect(resolveApartmentPage(b1(featuredProject), 'nope').kind).toBe('missing');
  });

  it('shows apartments that are sold in the data in the "sold" state', () => {
    expect(resolveApartmentPage(b1(featuredProject), 'b1-101')).toMatchObject({ kind: 'sold', forSaleCount: 2 });
  });

  it('links previous and next among listed apartments, skipping sold ones', () => {
    expect(resolveApartmentPage(b1(featuredProject), 'b1-301')).toMatchObject({
      kind: 'listed',
      previous: { id: 'b1-p02' },
      next: { id: 'b1-501' },
    });
  });
});
