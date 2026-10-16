import type { ApartmentStatus } from '@/data/types';
import { cn } from '@/lib/cn';

/**
 * Small square showing a status the way the render does: solid orange (for sale), ochre hatching
 * with an outline (reserved), grey (sold). Pattern plus outline keep "reserved" distinguishable
 * without colour. `onFacade` puts it on the façade grey, so legend swatches match the render.
 */
const MARK: Readonly<Record<ApartmentStatus, string>> = {
  available: 'border-accent bg-accent',
  reserved: 'border-status-reserved-ink bg-hatch-reserved',
  sold: 'border-status-sold bg-status-sold',
};

const MARK_ON_FACADE: Readonly<Record<ApartmentStatus, string>> = {
  // Same mixes as the shapes on the render: 45% orange, 40% ink over the façade grey.
  available: 'border-accent bg-[color-mix(in_srgb,var(--color-accent)_45%,var(--color-facade))]',
  reserved: 'border-status-reserved-ink bg-facade bg-hatch-reserved',
  sold: 'border-white/70 bg-[color-mix(in_srgb,var(--color-ink)_40%,var(--color-facade))]',
};

interface StatusMarkProps {
  readonly status: ApartmentStatus;
  readonly onFacade?: boolean;
  readonly className?: string;
}

export function StatusMark({ status, onFacade = false, className }: StatusMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-3.5 shrink-0 rounded-[2px] border-[1.5px]',
        (onFacade ? MARK_ON_FACADE : MARK)[status],
        className,
      )}
    />
  );
}
