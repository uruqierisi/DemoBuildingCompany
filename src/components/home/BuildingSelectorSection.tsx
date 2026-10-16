import { useCallback, useMemo, useState } from 'react';
import { HotspotCard } from '@/components/hotspots/HotspotCard';
import { HotspotOverlay, type Hotspot, type HotspotSource } from '@/components/hotspots/HotspotOverlay';
import { actionableTargets, centreOf } from '@/components/hotspots/hotspot-targets';
import { Section, SectionEyebrow } from '@/components/layout/Section';
import { PanScroller } from '@/components/media/PanScroller';
import { RenderPicture } from '@/components/media/RenderPicture';
import { Reveal } from '@/components/motion/Reveal';
import type { Project } from '@/data/types';
import { formatForSaleCount } from '@/lib/format';
import { summarizeBuilding } from '@/lib/inventory';
import { routes } from '@/lib/routes';
import { BuildingIndex } from './BuildingIndex';

interface BuildingSelectorSectionProps {
  readonly project: Project;
}

/**
 * "Zgjidh ndërtesën": the overview render with clickable building polygons, plus a text index.
 * Coverage can be partial: buildings without a polygon (or a project without an overview render)
 * are reached through the index, which always lists every building.
 */
export function BuildingSelectorSection({ project }: BuildingSelectorSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<HotspotSource | null>(null);
  const setActive = useCallback((id: string | null, source: HotspotSource) => {
    setActiveId(id);
    setActiveSource(id ? source : null);
  }, []);

  const summaries = useMemo(() => project.buildings.map(summarizeBuilding), [project.buildings]);
  const hotspots = useMemo<Hotspot[]>(
    () =>
      project.buildings.flatMap((building) =>
        building.svgPath
          ? [
              {
                id: building.id,
                svgPath: building.svgPath,
                tone: 'accent' as const,
                href: routes.building(building.id),
              },
            ]
          : [],
      ),
    [project.buildings],
  );
  const overview = project.overview?.image;
  const isInteractive = overview !== undefined && hotspots.length > 0;
  // On phones the overview opens on the selectable buildings, with an edge fade and hint towards the rest.
  const targets = useMemo(() => (overview ? actionableTargets(hotspots, overview.width) : []), [hotspots, overview]);

  return (
    <Section id="objektet" labelledBy="objektet-titulli" tone="ink">
      <div className="page-grid items-end gap-y-8">
        <Reveal className="col-span-full lg:col-span-7">
          <SectionEyebrow index="02" label="Objektet" isInverse />
          <h2 id="objektet-titulli" className="mt-8 text-heading">
            Zgjidh ndërtesën
          </h2>
        </Reveal>
        <Reveal delay={120} className="col-span-full md:col-span-6 lg:col-span-4 lg:col-start-9">
          {isInteractive ? (
            <>
              <p className="max-w-[40ch] text-inverse-muted pointer-coarse:hidden">
                Kaloni me kursor mbi një objekt për ta dalluar. Klikoni për të parë banesat në shitje.
              </p>
              <p className="hidden max-w-[40ch] text-inverse-muted pointer-coarse:block">
                Prekni një objekt për ta zgjedhur, pastaj prekeni sërish për të parë banesat në shitje.
              </p>
            </>
          ) : (
            <p className="max-w-[40ch] text-inverse-muted">
              Zgjidhni objektin nga lista për të parë banesat në shitje.
            </p>
          )}
        </Reveal>
      </div>

      {overview ? (
        <Reveal className="mt-12 lg:mt-16">
          <PanScroller
            label={`Pamja e ${project.name} me objektet e zgjedhshme`}
            contentClassName={isInteractive ? 'relative min-w-[48rem] md:min-w-0' : 'relative'}
            {...(isInteractive ? { initialCenter: centreOf(targets), targets } : {})}
            isInverse
          >
            <RenderPicture
              image={overview}
              alt={`Pamje e përgjithshme e ${project.name}`}
              sizes={
                isInteractive
                  ? '(min-width: 100rem) 1440px, (min-width: 48rem) 100vw, 768px'
                  : '(min-width: 100rem) 1440px, 100vw'
              }
              className="h-auto w-full select-none"
            />
            {isInteractive ? (
              <HotspotOverlay
                hotspots={hotspots}
                size={overview}
                activeId={activeId}
                activeSource={activeSource}
                onActiveChange={setActive}
                idleStyle="hidden"
                renderTooltip={(hotspot) => {
                  const summary = summaries.find((s) => s.building.id === hotspot.id);
                  return (
                    <HotspotCard title={summary?.building.name} href={hotspot.href} linkLabel="Shiko objektin">
                      {summary ? formatForSaleCount(summary.forSale) : null}
                    </HotspotCard>
                  );
                }}
              />
            ) : null}
          </PanScroller>
        </Reveal>
      ) : null}

      <Reveal className="mt-12 lg:mt-16">
        <h3 className="sr-only">Lista e objekteve</h3>
        <BuildingIndex summaries={summaries} activeId={activeId} onActiveChange={(id) => setActive(id, 'list')} />
      </Reveal>
    </Section>
  );
}
