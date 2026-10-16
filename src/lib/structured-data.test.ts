import { describe, expect, it } from 'vitest';
import { buildRealEstateAgentJsonLd, serializeJsonLd } from './structured-data';

describe('buildRealEstateAgentJsonLd', () => {
  const data = buildRealEstateAgentJsonLd('https://pozhegu.elevateurbox.com');

  it('describes the sales office with contact details from the config', () => {
    expect(data).toMatchObject({
      '@type': 'RealEstateAgent',
      name: 'Pozhegu Brothers',
      telephone: '+38345543222',
      email: 'sales@pozhegubrothers.com',
      address: {
        streetAddress: 'Skender Çeku, Blloku C11/A3',
        postalCode: '10000',
        addressLocality: 'Prishtinë',
        addressCountry: 'XK',
      },
    });
  });

  it('builds absolute image URLs from the site URL and lists opening hours', () => {
    expect(data.image).toBe('https://pozhegu.elevateurbox.com/og/garden-buildings.jpg');
    expect(data.openingHoursSpecification).toHaveLength(2);
  });
});

describe('serializeJsonLd', () => {
  it('escapes "<" so a value cannot close the script tag', () => {
    expect(serializeJsonLd({ name: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
});
