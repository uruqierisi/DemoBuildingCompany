import { cn } from '@/lib/cn';

/**
 * Container for a row of figures. Four figures: 2 × 2 on phones and tablets, 4 across from 1024px.
 * Three figures: stacked on phones, 3 across from 640px.
 */
export function statGridClasses(count: 3 | 4): string {
  return cn('grid border-t border-line', count === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3');
}

/** Hairline dividers between figures in a statGridClasses row, for the cell at `index`. */
export function statCellClasses(index: number, count: 3 | 4): string {
  if (count === 3) return cn('border-b border-line sm:border-b-0', index > 0 && 'sm:border-l sm:pl-8');
  return cn(
    'border-b border-line lg:border-b-0',
    index % 2 === 1 && 'border-l pl-5 md:pl-8',
    index % 2 === 0 && index > 0 && 'lg:border-l lg:pl-8',
  );
}
