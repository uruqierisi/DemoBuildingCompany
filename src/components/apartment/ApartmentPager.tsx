import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import type { ApartmentDetails } from '@/data/types';
import { cn } from '@/lib/cn';
import { formatApartmentCode, formatArea, formatFloor } from '@/lib/format';
import { routes } from '@/lib/routes';

interface ApartmentPagerProps {
  readonly buildingId: string;
  readonly buildingName: string;
  readonly previous: ApartmentDetails | undefined;
  readonly next: ApartmentDetails | undefined;
}

/** Previous / next apartment for sale in the same building, in list order (floor, then id). */
export function ApartmentPager({ buildingId, buildingName, previous, next }: ApartmentPagerProps) {
  if (!previous && !next) return null;
  return (
    <nav aria-label={`Banesat e tjera në shitje në ${buildingName}`} className="page-container pb-section-sm">
      <ul className="grid border-y border-line sm:grid-cols-2">
        <li className="border-b border-line sm:border-r sm:border-b-0">
          {previous ? <PagerLink buildingId={buildingId} apartment={previous} direction="previous" /> : null}
        </li>
        <li>{next ? <PagerLink buildingId={buildingId} apartment={next} direction="next" /> : null}</li>
      </ul>
    </nav>
  );
}

interface PagerLinkProps {
  readonly buildingId: string;
  readonly apartment: ApartmentDetails;
  readonly direction: 'previous' | 'next';
}

function PagerLink({ buildingId, apartment, direction }: PagerLinkProps) {
  const isNext = direction === 'next';
  return (
    <Link
      to={routes.apartment(buildingId, apartment.id)}
      rel={isNext ? 'next' : 'prev'}
      className={cn(
        'group flex items-center gap-5 py-6 transition-colors hover:bg-paper-deep sm:py-8',
        isNext ? 'justify-end text-right sm:pl-8' : 'sm:pr-8',
      )}
    >
      {isNext ? null : (
        <Icon name="arrow-left" className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
      )}
      <span className="min-w-0">
        <span className="block text-small text-ink-muted">{isNext ? 'Banesa tjetër' : 'Banesa e mëparshme'}</span>
        <span className="mt-1 block text-subheading tabular-nums">{formatApartmentCode(apartment.id)}</span>
        <span className="mt-1 block text-small text-ink-muted tabular-nums">
          {formatFloor(apartment.floor)} · {formatArea(apartment.unitType.areaM2)}
        </span>
      </span>
      {isNext ? (
        <Icon name="arrow-right" className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
      ) : null}
    </Link>
  );
}
