import { describe, expect, it } from 'vitest';
import { buildWhatsappMessage, describeSubject, type LeadSubject } from './lead-message';

const apartment: LeadSubject = {
  projectName: 'Rezidenca Arrita',
  buildingName: 'Objekti B1',
  apartment: {
    id: 'b1-301',
    unitTypeName: 'Tipi 78,40 m²',
    category: { kind: 'bedrooms', count: 2 },
    areaM2: 78.4,
    floor: 3,
  },
};

describe('describeSubject', () => {
  it('lists apartment, building, area and floor, leaving out a type name that only repeats the area', () => {
    expect(describeSubject(apartment).map((row) => row.label)).toEqual(['Banesa', 'Objekti', 'Sipërfaqja', 'Kati']);
    expect(describeSubject(apartment)[0]?.value).toBe('B1-301');
  });

  it('shows the type row when the unit type has its own name', () => {
    const named: LeadSubject = {
      ...apartment,
      apartment: { ...apartment.apartment!, unitTypeName: 'Dupleks A' },
    };
    expect(describeSubject(named).find((row) => row.label === 'Tipi')?.value).toBe('Dupleks A');
  });

  it('describes a building-only subject with a single row', () => {
    expect(describeSubject({ projectName: 'Rezidenca Arrita', buildingName: 'Objekti A1' })).toEqual([
      { label: 'Objekti', value: 'Objekti A1' },
    ]);
  });
});

describe('buildWhatsappMessage', () => {
  it('names the buyer and every apartment detail', () => {
    const text = buildWhatsappMessage({ subject: apartment, name: '  Arta Krasniqi ', message: 'A ka parking?' });
    expect(text).toContain('Përshëndetje, jam Arta Krasniqi.');
    expect(text).toContain('Më intereson banesa B1-301 në Rezidenca Arrita.');
    expect(text).not.toContain('• Banesa');
    expect(text).toContain('• Objekti: Objekti B1');
    expect(text).toContain('• Tipi: Tipi 78,40 m²');
    expect(text).toContain('• Sipërfaqja: 78,40 m²');
    expect(text).toContain('• Kati: Kati 3');
    expect(text).toContain('A ka parking?');
  });

  it('falls back to the building or project and skips an empty note', () => {
    const building = buildWhatsappMessage({
      subject: { projectName: 'Rezidenca Arrita', buildingName: 'Objekti A1' },
      name: 'Arta',
      message: '   ',
    });
    expect(building).toContain('Më intereson një banesë në Objekti A1, Rezidenca Arrita.');
    expect(building).not.toContain('•');
    expect(buildWhatsappMessage({ subject: { projectName: 'Rezidenca Arrita' }, name: 'Arta' })).toContain(
      'Më intereson një banesë në Rezidenca Arrita.',
    );
  });
});
