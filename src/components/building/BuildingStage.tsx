import { useMemo, type CSSProperties } from 'react';
import { HotspotCard } from '@/components/hotspots/HotspotCard';
import { HotspotOverlay, type Hotspot, type HotspotSource } from '@/components/hotspots/HotspotOverlay';
import { actionableTargets, centreOf } from '@/components/hotspots/hotspot-targets';
import { PanScroller } from '@/components/media/PanScroller';
import { RenderPicture } from '@/components/media/RenderPicture';
import type { ApartmentDetails, ApartmentStatus, Building, RenderImage, SoldUnit } from '@/data/types';
import { formatApartmentCode, formatFloor, formatRoomCategory, STATUS_LABELS } from '@/lib/format';
import { cn } from '@/lib/cn';
import { StatusMark } from '@/components/ui/StatusMark';

interface BuildingStageProps {
  readonly building: Building;
  readonly render: RenderImage;
  readonly hotspots: readonly Hotspot[];
  readonly apartmentsById: ReadonlyMap<string, ApartmentDetails>;
  readonly activeId: string | null;
  readonly activeSource: HotspotSource | null;
  readonly onActiveChange: (id: string | null, source: HotspotSource) => void;
}

function Legend({ hasReserved }: { readonly hasReserved: boolean }) {
  const statuses: ApartmentStatus[] = hasReserved ? ['available', 'reserved', 'sold'] : ['available', 'sold'];
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-small text-inverse-muted" aria-label="Legjenda e ngjyrave">
      {statuses.map((status) => (
        <li key={status} className="flex items-center gap-2.5">
          {/* Swatches sit on the façade grey, so each one looks like its shape on the render. */}
          <StatusMark status={status} onFacade className="size-4" />
          {STATUS_LABELS[status]}
        </li>
      ))}
    </ul>
  );
}

/** The building render with its apartments: for sale in the accent colour, sold units in quiet grey. */
export function BuildingStage({
  building,
  render,
  hotspots,
  apartmentsById,
  activeId,
  activeSource,
  onActiveChange,
}: BuildingStageProps) {
  const targets = useMemo(() => actionableTargets(hotspots, render.width), [hotspots, render.width]);
  const soldById = new Map<string, SoldUnit>(building.soldUnits.map((unit) => [unit.id, unit]));

  const renderTooltip = (hotspot: Hotspot) => {
    const apartment = apartmentsById.get(hotspot.id);
    // Listed apartments that have been sold show the same card as the traced sold units.
    if (apartment && apartment.status !== 'sold') {
      return (
        <HotspotCard title={formatApartmentCode(apartment.id)} href={hotspot.href} linkLabel="Shiko banesën">
          <span className="block">{apartment.unitType.name}</span>
          <span className="block">
            {formatFloor(apartment.floor)} · {formatRoomCategory(apartment.unitType.category)}
          </span>
          <span className="flex items-center gap-2 font-medium text-ink">
            <StatusMark status={apartment.status} />
            {STATUS_LABELS[apartment.status]}
          </span>
        </HotspotCard>
      );
    }
    const floor = apartment?.floor ?? soldById.get(hotspot.id)?.floor;
    return (
      <HotspotCard title={floor === undefined ? '' : formatFloor(floor)}>
        <span className="block">{STATUS_LABELS.sold}</span>
      </HotspotCard>
    );
  };

  // Portrait renders (L9 is cropped to its own façade) are sized by the viewport height from tablets
  // up, so the whole building fits on screen; on phones the stage scrolls sideways instead.
  const stageStyle = { '--stage-ratio': render.width / render.height } as CSSProperties;
  const isPortrait = render.height > render.width;

  return (
    <section aria-labelledby="fasada-titulli" className="bg-ink py-12 text-white lg:py-16">
      <div
        className={cn(
          'page-container',
          // Portrait: the render and a narrow text panel side by side, centred as one group.
          isPortrait && 'lg:flex lg:flex-row-reverse lg:items-start lg:justify-center lg:gap-16',
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-4',
            isPortrait ? 'lg:w-80 lg:shrink-0 lg:pt-2' : 'sm:flex-row sm:items-end sm:justify-between',
          )}
        >
          <div>
            <h2 id="fasada-titulli" className="eyebrow text-inverse-muted">
              Banesat në fasadë
            </h2>
            <div className="mt-4">
              <Legend hasReserved={hotspots.some((hotspot) => hotspot.tone === 'reserved')} />
            </div>
          </div>
          <p className="max-w-[44ch] text-small text-inverse-muted pointer-coarse:hidden">
            Kaloni me kursor mbi një banesë për detajet; klikoni për ta hapur.
          </p>
          <p className="hidden max-w-[44ch] text-small text-inverse-muted pointer-coarse:block">
            Prekni një banesë për detajet, prekeni sërish për ta hapur.
          </p>
        </div>

        <div
          style={stageStyle}
          className={cn(
            'mt-8',
            isPortrait &&
              'md:mx-auto md:max-w-[calc((100svh-var(--header-height)-4rem)*var(--stage-ratio))] lg:mx-0 lg:mt-0 lg:w-full',
          )}
        >
          <PanScroller
            label={`Fasada e ${building.name} me banesat`}
            contentClassName={cn('relative md:min-w-0', isPortrait ? 'min-w-[28rem]' : 'min-w-[52rem]')}
            initialCenter={centreOf(targets)}
            targets={targets}
            isInverse
          >
            <RenderPicture
              image={render}
              alt={`${building.name}, pamje e fasadës`}
              sizes={
                isPortrait
                  ? '(min-width: 48rem) calc((100vh - 9rem) * 0.72), 28rem'
                  : '(min-width: 100rem) 1440px, (min-width: 52rem) 100vw, 832px'
              }
              priority
              className="h-auto w-full select-none"
            />
            <HotspotOverlay
              hotspots={hotspots}
              size={render}
              activeId={activeId}
              activeSource={activeSource}
              onActiveChange={onActiveChange}
              idleStyle="status"
              renderTooltip={renderTooltip}
            />
          </PanScroller>
        </div>
      </div>
    </section>
  );
}
