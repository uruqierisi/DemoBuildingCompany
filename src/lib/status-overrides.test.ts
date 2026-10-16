import { describe, expect, it } from 'vitest';
import { buildingHotspots } from '@/components/building/building-hotspots';
import { featuredProject } from '@/data/projects';
import type { Project } from '@/data/types';
import { deriveBuildingFacts, findBuilding, resolveApartmentPage, summarizeBuilding } from './inventory';
import { applyStatusOverrides, NO_OVERRIDES, parseStatusOverrides, withStatus } from './status-overrides';

const statValue = (project: Project, id: string) => project.stats.find((stat) => stat.id === id)?.value;
const l9 = (project: Project) => {
  const building = findBuilding(project, 'objekti-l9');
  if (!building) throw new Error('Objekti L9 missing from the data');
  return building;
};

describe('parseStatusOverrides', () => {
  it('keeps valid entries and drops malformed ids and unknown statuses', () => {
    expect(parseStatusOverrides('{"l9-301":"sold","l9-901":"reserved","x":"sold","l9-p01":"gone"}')).toEqual({
      'l9-301': 'sold',
      'l9-901': 'reserved',
    });
  });

  it('treats missing, invalid or non-object storage as no changes', () => {
    for (const raw of [null, '', 'not json', '[]', '"sold"', 'null'])
      expect(parseStatusOverrides(raw)).toBe(NO_OVERRIDES);
  });
});

describe('withStatus', () => {
  it('records a change and removes it again when the status returns to the published one', () => {
    const sold = withStatus(NO_OVERRIDES, 'l9-301', 'sold', 'available');
    expect(sold).toEqual({ 'l9-301': 'sold' });
    expect(withStatus(sold, 'l9-301', 'available', 'available')).toEqual({});
  });
});

describe('an apartment from the list moves to "sold"', () => {
  const project = applyStatusOverrides(featuredProject, { 'l9-301': 'sold' });
  const building = l9(project);

  it('leaves the published data untouched', () => {
    expect(l9(featuredProject).apartments.find((a) => a.id === 'l9-301')?.status).toBe('available');
    expect(applyStatusOverrides(featuredProject, NO_OVERRIDES)).toBe(featuredProject);
  });

  it('is grey on the render and no longer links to a page', () => {
    const hotspot = buildingHotspots(building).find((h) => h.id === 'l9-301');
    expect(hotspot).toMatchObject({ tone: 'muted' });
    expect(hotspot?.href).toBeUndefined();
  });

  it('leaves the list and every count', () => {
    const facts = deriveBuildingFacts(building);
    expect(facts.listed.map((a) => a.id)).not.toContain('l9-301');
    expect(facts.forSale.map((a) => a.id)).toEqual(['l9-p01', 'l9-901']);
    expect(summarizeBuilding(building).forSale).toBe(2);
    expect(statValue(project, 'forSale')).toBe((statValue(featuredProject, 'forSale') ?? 0) - 1);
    expect(statValue(project, 'areaForSale')).toBe(
      Math.round(
        featuredProject.buildings
          .flatMap((b) => deriveBuildingFacts(b).forSale)
          .reduce((sum, a) => sum + a.unitType.areaM2, 0) - 96.26,
      ),
    );
  });

  it('keeps its page, in a "sold" state that suggests the building’s other apartments for sale', () => {
    const state = resolveApartmentPage(building, 'l9-301');
    expect(state.kind).toBe('sold');
    if (state.kind !== 'sold') return;
    expect(state.forSaleCount).toBe(2);
    // Same room category (2 bedrooms) first, then the penthouse.
    expect(state.alternatives.map((a) => a.id)).toEqual(['l9-p01', 'l9-901']);
  });

  it('removes a building from the "buildings with apartments for sale" count when its last one sells', () => {
    const soldOut = applyStatusOverrides(featuredProject, { 'h2-901': 'sold' });
    expect(statValue(soldOut, 'buildingsForSale')).toBe((statValue(featuredProject, 'buildingsForSale') ?? 0) - 1);
    const state = resolveApartmentPage(findBuilding(soldOut, 'objekti-h2') ?? l9(soldOut), 'h2-901');
    expect(state).toMatchObject({ kind: 'sold', forSaleCount: 0, alternatives: [] });
  });
});

describe('an apartment from the list moves to "reserved"', () => {
  const project = applyStatusOverrides(featuredProject, { 'l9-901': 'reserved' });
  const building = l9(project);

  it('stays listed and keeps its page, but no longer counts as for sale', () => {
    const facts = deriveBuildingFacts(building);
    expect(facts.listed.map((a) => a.id)).toContain('l9-901');
    expect(facts.forSale.map((a) => a.id)).not.toContain('l9-901');
    expect(statValue(project, 'forSale')).toBe((statValue(featuredProject, 'forSale') ?? 0) - 1);
    expect(resolveApartmentPage(building, 'l9-901').kind).toBe('listed');
  });

  it('has its own tone on the render and still links to its page', () => {
    expect(buildingHotspots(building).find((h) => h.id === 'l9-901')).toMatchObject({
      tone: 'reserved',
      href: '/objekti/objekti-l9/l9-901',
    });
  });
});

describe('resolveApartmentPage', () => {
  it('returns "missing" for ids that are not listed apartments, including traced sold units', () => {
    expect(resolveApartmentPage(l9(featuredProject), 'l9-s-0301').kind).toBe('missing');
    expect(resolveApartmentPage(l9(featuredProject), 'nope').kind).toBe('missing');
  });

  it('links previous and next among listed apartments', () => {
    expect(resolveApartmentPage(l9(featuredProject), 'l9-301')).toMatchObject({
      kind: 'listed',
      previous: { id: 'l9-p01' },
      next: { id: 'l9-901' },
    });
  });
});
