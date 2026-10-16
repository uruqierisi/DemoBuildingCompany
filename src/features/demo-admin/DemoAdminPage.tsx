import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { featuredProject } from '@/data/projects';
import type { ApartmentStatus } from '@/data/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProject } from '@/hooks/useProject';
import { cn } from '@/lib/cn';
import { formatApartmentCode, formatFloor, formatInteger, STATUS_LABELS } from '@/lib/format';
import { APARTMENT_STATUSES, getApartmentDetails } from '@/lib/inventory';
import { routes } from '@/lib/routes';
import { resetApartmentStatuses, setApartmentStatus, useStatusOverrides } from '@/lib/status-store';
import { ResetBar } from './ResetBar';
import { StatusToggle } from './StatusToggle';

const ALL = 'all';

/** Published status of every listed apartment: what "reset" returns to and what marks a row as changed. */
const PUBLISHED_STATUS: ReadonlyMap<string, ApartmentStatus> = new Map(
  featuredProject.buildings.flatMap((building) => building.apartments.map((a) => [a.id, a.status] as const)),
);

/**
 * /demo-admin (demo builds only, not linked anywhere): a preview of the future admin panel.
 * Status changes are stored in this browser and apply to the whole site at once.
 */
export function DemoAdminPage() {
  usePageMeta({ title: 'Demo: statusi i banesave' });
  const project = useProject();
  const overrides = useStatusOverrides();
  const [buildingFilter, setBuildingFilter] = useState(ALL);

  const buildings = useMemo(
    () => project.buildings.map((building) => ({ building, apartments: getApartmentDetails(building) })),
    [project.buildings],
  );
  const totals = useMemo(() => {
    const all = buildings.flatMap((entry) => entry.apartments);
    return APARTMENT_STATUSES.map((status) => ({
      status,
      count: all.filter((apartment) => apartment.status === status).length,
    }));
  }, [buildings]);
  const shown = buildingFilter === ALL ? buildings : buildings.filter((entry) => entry.building.id === buildingFilter);
  const changeCount = Object.keys(overrides).length;

  return (
    <div className="min-h-svh bg-paper pb-28 text-ink">
      <header className="bg-ink text-white">
        <div className="mx-auto max-w-3xl px-4 pt-6 pb-8">
          <p className="inline-flex items-center gap-2 rounded-xs bg-accent px-2.5 py-1 text-caption font-medium tracking-wide text-ink uppercase">
            Demo
          </p>
          <h1 className="mt-4 text-heading">Statusi i banesave</h1>
          <p className="mt-3 max-w-[48ch] text-inverse-muted">
            Pamje paraprake e panelit të administrimit që do të ketë zyra e shitjes. Ndryshimet ruhen vetëm në këtë
            shfletues dhe shfaqen menjëherë në të gjithë faqen.
          </p>
          <Link
            to={routes.home}
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-small font-medium underline underline-offset-4"
          >
            Shiko faqen
            <Icon name="arrow-right" size={18} />
          </Link>
          <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-line-inverse pt-5">
            {totals.map(({ status, count }) => (
              <div key={status}>
                <dt className="text-caption text-inverse-muted">{STATUS_LABELS[status]}</dt>
                <dd className="mt-1 text-subheading tabular-nums">{formatInteger(count)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <nav
        aria-label="Filtro sipas objektit"
        className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur"
      >
        <ul className="mx-auto flex max-w-3xl [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-3">
          {[
            { id: ALL, label: 'Të gjitha' },
            ...buildings.map(({ building }) => ({ id: building.id, label: building.name.replace('Objekti ', '') })),
          ].map((chip) => (
            <li key={chip.id} className="shrink-0">
              <button
                type="button"
                aria-pressed={buildingFilter === chip.id}
                onClick={() => setBuildingFilter(chip.id)}
                className={cn(
                  'min-h-11 rounded-xs border px-4 text-small font-medium transition-colors',
                  buildingFilter === chip.id ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white text-ink',
                )}
              >
                {chip.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="mx-auto max-w-3xl px-4">
        {shown.map(({ building, apartments }) => (
          <section key={building.id} aria-labelledby={`admin-${building.id}`} className="pt-8">
            <h2 id={`admin-${building.id}`} className="flex items-baseline justify-between gap-4">
              <span className="text-subheading">{building.name}</span>
              <span className="text-small text-ink-muted tabular-nums">
                {formatInteger(apartments.filter((a) => a.status === 'available').length)} në shitje
              </span>
            </h2>
            <ul className="mt-4 space-y-3">
              {apartments.map((apartment) => {
                const published = PUBLISHED_STATUS.get(apartment.id) ?? apartment.status;
                const isChanged = apartment.status !== published;
                const code = formatApartmentCode(apartment.id);
                return (
                  <li
                    key={apartment.id}
                    className={cn(
                      'rounded-xs border bg-white p-4',
                      isChanged ? 'border-ink shadow-[inset_4px_0_0_var(--color-accent)]' : 'border-line',
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={routes.apartment(building.id, apartment.id)}
                          className="inline-flex min-h-11 items-center text-body font-medium tabular-nums underline decoration-line-strong underline-offset-4"
                        >
                          {code}
                        </Link>
                        <p className="text-small text-ink-muted tabular-nums">
                          {apartment.unitType.name} · {formatFloor(apartment.floor)}
                        </p>
                      </div>
                      {isChanged ? (
                        <span className="shrink-0 text-caption text-ink-muted">
                          ndryshuar (ishte {STATUS_LABELS[published].toLowerCase()})
                        </span>
                      ) : null}
                    </div>
                    <StatusToggle
                      name={`status-${apartment.id}`}
                      legend={`Statusi i banesës ${code}`}
                      value={apartment.status}
                      onChange={(status) => setApartmentStatus(apartment.id, status, published)}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>

      <ResetBar changeCount={changeCount} onReset={resetApartmentStatuses} />
    </div>
  );
}
