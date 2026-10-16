import type { Stat } from '@/data/types';

/**
 * Company-wide figures as published by Pozhegu Brothers. These are official numbers, not derived
 * from the demo inventory; update them here when the company publishes new ones.
 */
export const COMPANY_STATS: readonly Stat[] = [
  { id: 'apartments', value: 1970, label: 'Apartmente' },
  { id: 'commercial', value: 200, label: 'Lokale' },
  { id: 'houses', value: 57, label: 'Shtëpi' },
  { id: 'years', value: 18, label: 'Vite' },
];
