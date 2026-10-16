export const SITE = {
  company: 'Pozhegu Brothers',
  /** Appended to every page title. */
  titleSuffix: 'Pozhegu Brothers',
  logo: {
    /** Official logo, unchanged (SVGO-optimised copy of public/brand/original/logo.svg). */
    default: { src: '/brand/pozhegu-logo.svg', width: 274, height: 83 },
    /** Copy with only the wordmark fill changed to white, for use over photographs. */
    onImage: { src: '/brand/pozhegu-logo-white.svg', width: 274, height: 83 },
  },
} as const;

export interface NavItem {
  readonly label: string;
  /** Section id on the home page. */
  readonly sectionId: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Projekti', sectionId: 'projekti' },
  { label: 'Objektet', sectionId: 'objektet' },
  { label: 'Kontakti', sectionId: 'kontakti' },
];
