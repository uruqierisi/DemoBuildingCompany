import type { WeeklyHours } from '../lib/opening-hours.ts';
import { parsePhone } from '../lib/phone.ts';

/**
 * Sales contact details: the one file to edit when they change.
 *
 * Plain data and pure helpers with relative imports only: the build also reads this file to write
 * the JSON-LD into index.html (build/site-meta-plugin.ts). The WhatsApp number that depends on
 * .env lives in src/lib/whatsapp.ts.
 */

/**
 * True once Pozhegu's real contacts are set below. While false, no phone number, e-mail or opening
 * hours are shown anywhere: every contact entry point opens the contact form instead.
 */
export const CONTACT_DETAILS_CONFIRMED = true;

/** Sales phone in any format parsePhone accepts. Confirmed from Pozhegu's Google Business listing. */
const SALES_PHONE = '+383 45 543 222';

/**
 * WhatsApp number for the lead form's "Dërgo edhe në WhatsApp" hand-off and the WhatsApp links,
 * e.g. '+383 44 123 456'. Leave empty to use VITE_WHATSAPP_NUMBER (.env.local or the host's
 * environment), which keeps a personal demo number out of the source; when both are empty, every
 * WhatsApp action is hidden.
 */
export const WHATSAPP_NUMBER = '';

function requirePhone(value: string): { e164: string; display: string } {
  const parsed = parsePhone(value);
  if (!parsed.ok) throw new Error(`Invalid SALES_PHONE in config/contact.ts: "${value}" (${parsed.error}).`);
  return parsed;
}

const salesPhone = requirePhone(SALES_PHONE);

const OFFICE_WEEKDAY = { opens: '09:00', closes: '17:00' } as const;

export const CONTACT = {
  company: 'Pozhegu Brothers',
  /** The company's own site, used as the business URL in structured data. */
  website: 'https://pozhegubrothers.com/',
  /** E.164 format, used for tel: links. */
  phone: salesPhone.e164,
  phoneDisplay: salesPhone.display,
  email: 'sales@pozhegubrothers.com',
  office: {
    name: 'Zyra e shitjes',
    street: 'Skender Çeku, Blloku C11/A3',
    postalCode: '10000',
    city: 'Prishtinë',
    /** ISO 3166 code Google and schema.org use for Kosovo. */
    countryCode: 'XK',
    country: 'Kosovë',
    hours: {
      monday: OFFICE_WEEKDAY,
      tuesday: OFFICE_WEEKDAY,
      wednesday: OFFICE_WEEKDAY,
      thursday: OFFICE_WEEKDAY,
      friday: OFFICE_WEEKDAY,
      saturday: { opens: '09:00', closes: '15:00' },
      sunday: null,
    } satisfies WeeklyHours,
  },
  /** Official profiles, as linked from the pozhegubrothers.com footer. */
  social: {
    facebook: 'https://www.facebook.com/pozhegubrothers/',
    instagram: 'https://www.instagram.com/pozhegubrothers/',
  },
} as const;

/** Address as shown: street, then "Prishtinë 10000". */
export const officeAddressLines = [
  CONTACT.office.street,
  `${CONTACT.office.city} ${CONTACT.office.postalCode}`,
] as const;

export const phoneHref = `tel:${CONTACT.phone}`;

export function emailHref(subject?: string): string {
  return subject ? `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}` : `mailto:${CONTACT.email}`;
}

/** Google Maps search for the office address; opens the app on phones. */
export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  [...officeAddressLines, CONTACT.office.country].join(', '),
)}`;
