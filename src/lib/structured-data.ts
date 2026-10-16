import { CONTACT } from '../config/contact.ts';
import { toOpeningHoursSpecification } from './opening-hours.ts';

/**
 * schema.org RealEstateAgent for Pozhegu's sales office, written into index.html at build time.
 * Relative imports only: the build loads this module outside the app bundle.
 */
export function buildRealEstateAgentJsonLd(siteUrl: string): Record<string, unknown> {
  const { office } = CONTACT;
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${siteUrl}/#zyra-e-shitjes`,
    name: CONTACT.company,
    url: CONTACT.website,
    image: `${siteUrl}/og/garden-buildings.jpg`,
    logo: `${siteUrl}/icons/icon-512.png`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: office.street,
      postalCode: office.postalCode,
      addressLocality: office.city,
      addressCountry: office.countryCode,
    },
    openingHoursSpecification: toOpeningHoursSpecification(office.hours),
    sameAs: [CONTACT.social.facebook, CONTACT.social.instagram],
  };
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so no value can close the tag. */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
