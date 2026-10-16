import { Link } from 'react-router';
import { ContactButton } from '@/components/contact/ContactButton';
import { Icon } from '@/components/ui/Icon';
import type { ApartmentDetails, Building } from '@/data/types';
import { formatApartmentCode, formatArea, formatFloor, formatForSaleCount, formatRoomCategory } from '@/lib/format';
import { routes } from '@/lib/routes';

interface SoldApartmentProps {
  readonly projectName: string;
  readonly building: Building;
  readonly apartment: ApartmentDetails;
  /** Apartments still for sale in the building, most similar first. */
  readonly alternatives: readonly ApartmentDetails[];
  readonly forSaleCount: number;
}

/**
 * Shown instead of a 404 when a listed apartment has been sold: says so plainly and points to what
 * is still for sale in the same building, so a shared or bookmarked link still leads somewhere.
 */
export function SoldApartment({ projectName, building, apartment, alternatives, forSaleCount }: SoldApartmentProps) {
  const code = formatApartmentCode(apartment.id);
  return (
    <section aria-labelledby="shitur-titulli" className="page-container pb-section-sm">
      <div className="rounded-xs border border-line bg-paper-deep px-6 py-10 sm:px-10 lg:py-14">
        <h2 id="shitur-titulli" className="text-heading">
          Kjo banesë është shitur.
        </h2>
        <p className="mt-5 max-w-[52ch] text-lead text-ink-muted">
          {forSaleCount > 0
            ? `Banesa ${code} nuk është më në shitje. Në ${building.name} ka ende ${formatForSaleCount(forSaleCount)}.`
            : `Banesa ${code} nuk është më në shitje, dhe në ${building.name} nuk ka banesa të tjera në shitje.`}
        </p>
        {forSaleCount > 0 ? null : (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={{ pathname: routes.home, hash: '#objektet' }}
              className="inline-flex h-12 items-center gap-3 rounded-xs bg-ink px-5 text-small font-medium text-white transition-colors hover:bg-ink-soft"
            >
              Shiko objektet e tjera
              <Icon name="arrow-right" />
            </Link>
            <ContactButton variant="outline" request={{ subject: { projectName, buildingName: building.name } }} />
          </div>
        )}
      </div>

      {alternatives.length > 0 ? (
        <nav aria-labelledby="alternativat-titulli" className="mt-12">
          <h2 id="alternativat-titulli" className="eyebrow text-ink-muted">
            Banesa të tjera në shitje në {building.name}
          </h2>
          <ul className="mt-6 grid border-t border-line md:grid-cols-2 md:gap-x-(--spacing-grid-gap)">
            {alternatives.map((alternative) => (
              <li key={alternative.id} className="border-b border-line">
                <Link
                  to={routes.apartment(building.id, alternative.id)}
                  className="group flex items-center gap-4 py-5 transition-colors hover:bg-paper-deep"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-subheading tabular-nums">{formatApartmentCode(alternative.id)}</span>
                    <span className="mt-1 block text-small text-ink-muted tabular-nums">
                      {formatRoomCategory(alternative.unitType.category)} · {formatFloor(alternative.floor)} ·{' '}
                      {formatArea(alternative.unitType.areaM2)}
                    </span>
                  </span>
                  <Icon
                    name="arrow-right"
                    className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </li>
            ))}
          </ul>
          {forSaleCount > alternatives.length ? (
            <Link
              to={routes.building(building.id)}
              className="group mt-8 inline-flex min-h-6 items-center gap-3 text-small font-medium underline underline-offset-4 pointer-coarse:min-h-11"
            >
              Të gjitha banesat në shitje në {building.name} ({forSaleCount})
              <Icon
                name="arrow-right"
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
