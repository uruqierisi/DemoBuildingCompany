import { describe, expect, it } from 'vitest';
import { buildWhatsappMessage, describeSubject, type LeadSubject } from './lead-message';

const apartment: LeadSubject = {
  projectName: 'Garden Buildings',
  buildingName: 'Objekti L9',
  apartment: {
    id: 'l9-301',
    unitTypeName: 'Tipi 96,26 m²',
    category: { kind: 'bedrooms', count: 2 },
    areaM2: 96.26,
    floor: 3,
  },
};

describe('describeSubject', () => {
  it('lists apartment, building, area and floor, leaving out a type name that only repeats the area', () => {
    expect(describeSubject(apartment).map((row) => row.label)).toEqual(['Banesa', 'Objekti', 'Sipërfaqja', 'Kati']);
    expect(describeSubject(apartment)[0]?.value).toBe('L9-301');
  });

  it('shows the type row when the unit type has its own name', () => {
    const named: LeadSubject = {
      ...apartment,
      apartment: { ...apartment.apartment!, unitTypeName: 'Dupleks A' },
    };
    expect(describeSubject(named).find((row) => row.label === 'Tipi')?.value).toBe('Dupleks A');
  });

  it('describes a building-only subject with a single row', () => {
    expect(describeSubject({ projectName: 'Garden Buildings', buildingName: 'Objekti H2' })).toEqual([
      { label: 'Objekti', value: 'Objekti H2' },
    ]);
  });
});

describe('buildWhatsappMessage', () => {
  it('names the buyer and every apartment detail', () => {
    const text = buildWhatsappMessage({ subject: apartment, name: '  Arta Krasniqi ', message: 'A ka parking?' });
    expect(text).toContain('Përshëndetje, jam Arta Krasniqi.');
    expect(text).toContain('Më intereson banesa L9-301 në Garden Buildings.');
    expect(text).not.toContain('• Banesa');
    expect(text).toContain('• Objekti: Objekti L9');
    expect(text).toContain('• Tipi: Tipi 96,26 m²');
    expect(text).toContain('• Sipërfaqja: 96,26 m²');
    expect(text).toContain('• Kati: Kati 3');
    expect(text).toContain('A ka parking?');
  });

  it('falls back to the building or project and skips an empty note', () => {
    const building = buildWhatsappMessage({
      subject: { projectName: 'Garden Buildings', buildingName: 'Objekti H2' },
      name: 'Arta',
      message: '   ',
    });
    expect(building).toContain('Më intereson një banesë në Objekti H2, Garden Buildings.');
    expect(building).not.toContain('•');
    expect(buildWhatsappMessage({ subject: { projectName: 'Garden Buildings' }, name: 'Arta' })).toContain(
      'Më intereson një banesë në Garden Buildings.',
    );
  });
});
