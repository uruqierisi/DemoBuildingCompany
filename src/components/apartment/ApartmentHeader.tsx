import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { StatusMark } from '@/components/ui/StatusMark';
import type { ApartmentDetails, Building } from '@/data/types';
import { cn } from '@/lib/cn';
import {
  distinctUnitTypeName,
  formatApartmentCode,
  formatArea,
  formatFloor,
  formatRoomCategory,
  STATUS_LABELS,
} from '@/lib/format';
import { routes } from '@/lib/routes';

interface ApartmentHeaderProps {
  readonly projectName: string;
  readonly building: Building;
  readonly apartment: ApartmentDetails;
}

/** Back link, apartment code, status and key facts; shared by every apartment state. */
export function ApartmentHeader({ projectName, building, apartment }: ApartmentHeaderProps) {
  const { unitType } = apartment;
  const isSold = apartment.status === 'sold';
  const typeName = distinctUnitTypeName(unitType);
  const facts = [
    // Only when the type has its own name; "Tipi 96,26 m²" would repeat the area below.
    ...(typeName ? [{ label: 'Tipi', value: typeName }] : []),
    { label: 'Sipërfaqja', value: formatArea(unitType.areaM2) },
    { label: 'Struktura', value: formatRoomCategory(unitType.category) },
    { label: 'Kati', value: formatFloor(apartment.floor) },
    { label: 'Objekti', value: building.name },
  ];

  return (
    <header className="page-container pt-10 pb-12 lg:pt-16 lg:pb-16">
      <nav aria-label="Shtegu">
        <Link
          to={routes.building(building.id)}
          className="group inline-flex min-h-6 items-center gap-3 text-small text-ink-muted transition-colors hover:text-ink pointer-coarse:min-h-11"
        >
          <Icon name="arrow-left" size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
          Kthehu te {building.name}
        </Link>
      </nav>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 lg:mt-14">
        <div>
          <p className="eyebrow text-ink-muted">
            {projectName} · {building.name}
          </p>
          <h1 className={cn('mt-5 text-title tabular-nums', isSold && 'text-ink-muted')}>
            Banesa {formatApartmentCode(apartment.id)}
          </h1>
        </div>
        <p className="flex items-center gap-2.5 rounded-xs border border-line-strong px-3 py-2 text-small font-medium">
          <StatusMark status={apartment.status} className="size-3" />
          <span className="sr-only">Statusi: </span>
          {STATUS_LABELS[apartment.status]}
        </p>
      </div>

      <dl
        className={cn(
          'mt-12 grid grid-cols-2 border-t border-line lg:mt-16',
          facts.length === 5 ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-4',
          isSold && 'text-ink-muted',
        )}
      >
        {facts.map((fact, index) => (
          <div
            key={fact.label}
            className={cn(
              'flex flex-col-reverse justify-end gap-2 border-b border-line py-5 pr-5 lg:border-b-0 lg:py-6',
              // An odd number of facts: the first takes a full row on phones so the grid ends evenly.
              facts.length % 2 === 1 && index === 0 && 'col-span-2 sm:col-span-1',
            )}
          >
            <dt className="text-small text-ink-muted">{fact.label}</dt>
            <dd className="text-subheading tabular-nums">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
