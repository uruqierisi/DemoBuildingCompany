import { useId, type PointerEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { HotspotSource } from '@/components/hotspots/HotspotOverlay';
import { Icon } from '@/components/ui/Icon';
import type { ApartmentDetails } from '@/data/types';
import {
  applyFilters,
  hasActiveFilters,
  parseFilters,
  withFilters,
  type ApartmentFilters,
} from '@/lib/apartment-filters';
import { cn } from '@/lib/cn';
import {
  formatApartmentCode,
  formatArea,
  formatFloor,
  formatInteger,
  formatRoomCategory,
  STATUS_LABELS,
} from '@/lib/format';
import { deriveFloors, deriveRoomCategories, roomCategoryKey } from '@/lib/inventory';
import { routes } from '@/lib/routes';
import { StatusMark } from '@/components/ui/StatusMark';

interface ApartmentListProps {
  readonly buildingId: string;
  /** Apartments for sale and reserved ones; sold apartments and sold units never appear here. */
  readonly apartments: readonly ApartmentDetails[];
  readonly activeId: string | null;
  readonly onActiveChange: (id: string | null, source: HotspotSource) => void;
}

const SELECT =
  'mt-2 block h-12 w-full rounded-xs border border-line-strong bg-white px-3 text-body text-ink focus-visible:outline-offset-1';

/** Filterable list of the apartments for sale. Filter state lives in the URL (?dhoma=…&kati=…). */
export function ApartmentList({ buildingId, apartments, activeId, onActiveChange }: ApartmentListProps) {
  const id = useId();
  const [searchParams, setSearchParams] = useSearchParams();
  const categories = deriveRoomCategories(apartments);
  const floors = deriveFloors(apartments);
  const filters = parseFilters(searchParams, { rooms: categories.map(roomCategoryKey), floors });
  const visible = applyFilters(apartments, filters);
  const isFiltered = hasActiveFilters(filters);

  const update = (next: ApartmentFilters) =>
    setSearchParams(withFilters(searchParams, next), { replace: true, preventScrollReset: true });

  const handleHover = (event: PointerEvent, apartmentId: string | null) => {
    if (event.pointerType === 'mouse') onActiveChange(apartmentId, 'list');
  };

  const reservedCount = apartments.filter((apartment) => apartment.status === 'reserved').length;
  const forSaleCount = apartments.length - reservedCount;
  const reservedNote =
    reservedCount > 0
      ? ` · ${formatInteger(reservedCount)} ${reservedCount === 1 ? 'e rezervuar' : 'të rezervuara'}`
      : '';
  const count = isFiltered
    ? `${formatInteger(visible.length)} nga ${formatInteger(apartments.length)} banesa`
    : `${formatInteger(forSaleCount)} ${forSaleCount === 1 ? 'banesë' : 'banesa'} në shitje${reservedNote}`;

  return (
    <section aria-labelledby={`${id}-title`} className="page-container py-section-sm">
      <div className="page-grid items-end gap-y-8">
        <div className="col-span-full lg:col-span-5">
          <h2 id={`${id}-title`} className="text-heading">
            Banesat në shitje
          </h2>
          <p className="mt-4 text-ink-muted tabular-nums" aria-live="polite">
            {count}
          </p>
        </div>

        {apartments.length > 1 ? (
          <form
            className="col-span-full grid grid-cols-2 gap-4 lg:col-span-6 lg:col-start-7 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
            onSubmit={(event) => event.preventDefault()}
            aria-label="Filtro banesat"
          >
            <div>
              <label htmlFor={`${id}-room`} className="text-small font-medium">
                Struktura
              </label>
              <select
                id={`${id}-room`}
                className={SELECT}
                value={filters.room ?? ''}
                onChange={(event) => update({ ...filters, room: event.target.value || null })}
              >
                <option value="">Të gjitha</option>
                {categories.map((category) => (
                  <option key={roomCategoryKey(category)} value={roomCategoryKey(category)}>
                    {formatRoomCategory(category)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-floor`} className="text-small font-medium">
                Kati
              </label>
              <select
                id={`${id}-floor`}
                className={SELECT}
                value={filters.floor ?? ''}
                onChange={(event) =>
                  update({ ...filters, floor: event.target.value === '' ? null : Number(event.target.value) })
                }
              >
                <option value="">Të gjitha</option>
                {floors.map((floor) => (
                  <option key={floor} value={floor}>
                    {formatFloor(floor)}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => update({ room: null, floor: null })}
              disabled={!isFiltered}
              className="col-span-2 h-12 text-small underline underline-offset-4 transition-opacity disabled:opacity-40 lg:col-span-1 lg:px-2"
            >
              Pastro filtrat
            </button>
          </form>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className="mt-12 border-t border-line pt-10">
          <p className="text-lead">Asnjë banesë në shitje nuk përputhet me këta filtra.</p>
          <button
            type="button"
            onClick={() => update({ room: null, floor: null })}
            className="mt-6 text-small font-medium underline underline-offset-4"
          >
            Shfaq të gjitha banesat
          </button>
        </div>
      ) : (
        <div className="mt-12">
          <div
            aria-hidden="true"
            className="hidden grid-cols-[7rem_minmax(0,1fr)_8rem_9rem_8rem_2rem] gap-6 border-b border-line pb-3 text-caption text-ink-muted lg:grid"
          >
            <span>Banesa</span>
            <span>Tipi</span>
            <span>Kati</span>
            <span>Struktura</span>
            <span className="text-right">Sipërfaqja</span>
            <span />
          </div>
          <ul className={cn('border-t border-line lg:border-t-0')}>
            {visible.map((apartment) => {
              const isActive = apartment.id === activeId;
              return (
                <li key={apartment.id} className="border-b border-line">
                  <Link
                    to={routes.apartment(buildingId, apartment.id)}
                    onPointerEnter={(event) => handleHover(event, apartment.id)}
                    onPointerLeave={(event) => handleHover(event, null)}
                    onFocus={() => onActiveChange(apartment.id, 'list')}
                    onBlur={() => onActiveChange(null, 'list')}
                    className={cn(
                      'group relative grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 py-5 transition-colors lg:grid-cols-[7rem_minmax(0,1fr)_8rem_9rem_8rem_2rem] lg:items-center lg:py-6',
                      isActive ? 'bg-paper-deep' : 'hover:bg-paper-deep',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute inset-y-0 -left-4 w-1 bg-accent transition-opacity lg:-left-6',
                        isActive ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-subheading tabular-nums">{formatApartmentCode(apartment.id)}</span>
                      {apartment.status === 'reserved' ? (
                        <span className="inline-flex items-center gap-1.5 text-caption text-ink-muted">
                          <StatusMark status="reserved" className="size-3" />
                          {STATUS_LABELS.reserved}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-right text-body tabular-nums lg:order-5">
                      {formatArea(apartment.unitType.areaM2)}
                    </span>
                    <span className="text-ink-muted lg:order-2 lg:text-ink">
                      {apartment.unitType.name}
                      {apartment.unitType.plan ? (
                        <span className="ml-3 inline-block rounded-xs border border-line-strong px-1.5 py-0.5 align-middle text-caption text-ink-muted">
                          Planimetri
                        </span>
                      ) : null}
                    </span>
                    <span className="text-right text-small text-ink-muted lg:order-3 lg:text-left lg:text-body lg:text-ink">
                      {formatFloor(apartment.floor)}
                      <span className="lg:hidden"> · {formatRoomCategory(apartment.unitType.category)}</span>
                    </span>
                    <span className="hidden lg:order-4 lg:block">
                      {formatRoomCategory(apartment.unitType.category)}
                    </span>
                    <Icon
                      name="arrow-right"
                      className="hidden transition-transform duration-300 group-hover:translate-x-1 lg:order-6 lg:block"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
