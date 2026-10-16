import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import type { Building } from '@/data/types';
import { cn } from '@/lib/cn';
import { formatAreaRange, formatFloorShort, formatInteger, formatRoomCategory } from '@/lib/format';
import type { BuildingFacts } from '@/lib/inventory';

interface BuildingHeaderProps {
  readonly projectName: string;
  readonly building: Building;
  readonly facts: BuildingFacts;
  /**
   * No interactive render: the header carries the page with a large typographic statement of what is
   * for sale, so the page reads as finished rather than missing an image.
   */
  readonly isTextLed: boolean;
}

export function BuildingHeader({ projectName, building, facts, isTextLed }: BuildingHeaderProps) {
  const figures = [
    { label: 'Banesa në shitje', value: formatInteger(facts.forSale.length) },
    { label: 'Sipërfaqet', value: facts.areaRange ? formatAreaRange(facts.areaRange.min, facts.areaRange.max) : '–' },
    { label: 'Struktura', value: facts.categories.map(formatRoomCategory).join(', ') || '–' },
    { label: 'Katet', value: facts.floors.map(formatFloorShort).join(', ') || '–' },
  ];

  return (
    <header
      className={cn('page-container', isTextLed ? 'pt-16 pb-section-sm lg:pt-24' : 'pt-10 pb-12 lg:pt-16 lg:pb-16')}
    >
      <nav aria-label="Shtegu">
        <Link
          to={{ pathname: '/', hash: '#objektet' }}
          className="group inline-flex min-h-6 items-center gap-3 text-small text-ink-muted transition-colors hover:text-ink pointer-coarse:min-h-11"
        >
          <Icon name="arrow-left" size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
          {projectName} · Të gjitha objektet
        </Link>
      </nav>

      <div className="mt-10 page-grid items-end gap-y-10 lg:mt-14">
        <div className="col-span-full lg:col-span-6">
          <p className="eyebrow text-ink-muted">{projectName}</p>
          <h1 className="mt-5 text-title">{building.name}</h1>
        </div>
        {isTextLed ? (
          <p className="col-span-full lg:col-span-5 lg:col-start-8">
            <span className="block text-display tabular-nums">{formatInteger(facts.forSale.length)}</span>
            <span className="mt-3 block text-lead text-ink-muted">
              {facts.forSale.length === 1 ? 'banesë në shitje' : 'banesa në shitje'}
            </span>
          </p>
        ) : null}
      </div>

      <dl className="mt-12 grid grid-cols-2 border-t border-line lg:mt-16 lg:grid-cols-4">
        {figures.map((figure, index) => (
          <div
            key={figure.label}
            className={cn(
              'flex flex-col-reverse justify-end gap-2 border-b border-line py-5 lg:border-b-0 lg:py-6',
              index % 2 === 1 && 'border-l pl-5 lg:pl-8',
              index % 2 === 0 && index > 0 && 'lg:border-l lg:pl-8',
            )}
          >
            <dt className="text-small text-ink-muted">{figure.label}</dt>
            <dd className="text-subheading tabular-nums">{figure.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
