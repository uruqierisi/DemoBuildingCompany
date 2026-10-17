import type { WeeklyHours } from '@/lib/opening-hours';
import { parsePhone } from '@/lib/phone';

/** Sales office as shown in the footer and the contact section. */
export interface SalesOffice {
  readonly name: string;
  readonly street: string;
  readonly postalCode: string;
  readonly city: string;
  readonly country: string;
  readonly hours: WeeklyHours;
}

export interface ContactDetails {
  /** E.164 format, used for tel: links. */
  readonly phone: string;
  readonly phoneDisplay: string;
  readonly email: string;
  readonly office: SalesOffice;
}

export interface ContactDetailsInput {
  /** Any format parsePhone accepts, e.g. "+383 4X XXX XXX". */
  readonly phone: string;
  readonly email: string;
  readonly office: SalesOffice;
}

/** Validates real contact details once, at startup: an invalid phone number fails loudly. */
export function createContactDetails({ phone, email, office }: ContactDetailsInput): ContactDetails {
  const parsed = parsePhone(phone);
  if (!parsed.ok) throw new Error(`Invalid sales phone in config/contact.ts: "${phone}" (${parsed.error}).`);
  return { phone: parsed.e164, phoneDisplay: parsed.display, email, office };
}

/**
 * Sales contact details: the one place to set them.
 *
 * The portfolio demo is fictional and has none, on purpose: no phone number, e-mail, address or
 * opening hours appear anywhere, every contact entry point opens the lead form, and the site says it
 * is a demo by ElevateUrBox. A real deployment sets them with createContactDetails({ … }).
 */
export const CONTACT_DETAILS: ContactDetails | null = null;

export function phoneHref(details: ContactDetails): string {
  return `tel:${details.phone}`;
}

export function emailHref(details: ContactDetails, subject?: string): string {
  return subject ? `mailto:${details.email}?subject=${encodeURIComponent(subject)}` : `mailto:${details.email}`;
}

/** Address as shown: street, then city and postal code. */
export function officeAddressLines({ office }: ContactDetails): readonly string[] {
  return [office.street, `${office.city} ${office.postalCode}`];
}

/** Map search for the office address; opens the maps app on phones. */
export function mapsHref(details: ContactDetails): string {
  const query = [...officeAddressLines(details), details.office.country].join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
