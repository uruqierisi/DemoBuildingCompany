import type { PointerEvent } from 'react';
import { Link } from 'react-router';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { formatForSaleCount } from '@/lib/format';
import type { BuildingSummary } from '@/lib/inventory';
import { routes } from '@/lib/routes';

interface BuildingIndexProps {
  readonly summaries: readonly BuildingSummary[];
  readonly activeId: string | null;
  readonly onActiveChange: (buildingId: string | null) => void;
}

/**
 * Text list of every building — the keyboard and screen-reader path to the building pages.
 * Hovering or focusing a row highlights the matching polygon on the render.
 */
export function BuildingIndex({ summaries, activeId, onActiveChange }: BuildingIndexProps) {
  const handleHover = (event: PointerEvent, buildingId: string | null) => {
    if (event.pointerType === 'mouse') onActiveChange(buildingId);
  };

  return (
    <ul className="grid border-t border-line-inverse md:grid-cols-2 md:gap-x-(--spacing-grid-gap)">
      {summaries.map(({ building, forSale }) => {
        const isActive = building.id === activeId;
        return (
          <li key={building.id} className="border-b border-line-inverse">
            <Link
              to={routes.building(building.id)}
              onPointerEnter={(event) => handleHover(event, building.id)}
              onPointerLeave={(event) => handleHover(event, null)}
              onFocus={() => onActiveChange(building.id)}
              onBlur={() => onActiveChange(null)}
              className="group flex items-center gap-4 py-5 sm:gap-6"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'size-1.5 shrink-0 bg-accent transition-opacity duration-300',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
              <span
                className={cn(
                  'min-w-0 flex-1 text-subheading transition-colors',
                  isActive ? 'text-accent' : 'text-white',
                )}
              >
                {building.name}
              </span>
              <span className="text-small text-inverse-muted tabular-nums">{formatForSaleCount(forSale)}</span>
              <Icon
                name="arrow-right"
                className={cn(
                  'shrink-0 transition-transform duration-300 group-hover:translate-x-1',
                  isActive && 'translate-x-1',
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
