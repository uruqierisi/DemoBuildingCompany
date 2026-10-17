import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApartmentList } from '@/components/building/ApartmentList';
import { BuildingHeader } from '@/components/building/BuildingHeader';
import { buildingHotspots } from '@/components/building/building-hotspots';
import { BuildingStage } from '@/components/building/BuildingStage';
import { ContactButton } from '@/components/contact/ContactButton';
import { usePageContactSubject } from '@/components/contact/contact-dialog-context';
import { SalesPhoneLine } from '@/components/contact/OfficeDetails';
import type { HotspotSource } from '@/components/hotspots/HotspotOverlay';
import { Icon } from '@/components/ui/Icon';
import type { Building, Project } from '@/data/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProject } from '@/hooks/useProject';
import { formatForSaleCount } from '@/lib/format';
import { deriveBuildingFacts, findBuilding, getApartmentDetails, summarizeBuilding } from '@/lib/inventory';
import { routes } from '@/lib/routes';
import { NotFoundPage } from './NotFoundPage';

/** /objekti/:buildingId — the loader has already rejected unknown ids with a 404. */
export function BuildingPage() {
  const { buildingId = '' } = useParams();
  const project = useProject();
  const building = findBuilding(project, buildingId);
  if (!building) return <NotFoundPage />;
  // Keyed so hover state and scroll position never leak from one building to the next.
  return <BuildingView key={building.id} project={project} building={building} />;
}

interface BuildingViewProps {
  readonly project: Project;
  readonly building: Building;
}

function BuildingView({ project, building }: BuildingViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<HotspotSource | null>(null);
  const setActive = useCallback((id: string | null, source: HotspotSource) => {
    setActiveId(id);
    setActiveSource(id ? source : null);
  }, []);

  const facts = useMemo(() => deriveBuildingFacts(building), [building]);
  // Every listed apartment, whatever its status: the tooltip of a sold one still needs its floor.
  const apartmentsById = useMemo(() => new Map(getApartmentDetails(building).map((a) => [a.id, a])), [building]);
  const hotspots = useMemo(() => buildingHotspots(building), [building]);

  const subject = useMemo(
    () => ({ projectName: project.name, buildingName: building.name }),
    [project.name, building.name],
  );
  usePageContactSubject(subject);

  const render = building.render;
  const hasStage = render !== undefined && hotspots.length > 0;

  usePageMeta({
    title: `${building.name} · ${project.name}`,
    description: `${formatForSaleCount(facts.forSale.length)} në ${building.name}, ${project.name}.`,
  });

  return (
    <>
      <BuildingHeader projectName={project.name} building={building} facts={facts} isTextLed={!hasStage} />
      {hasStage ? (
        <BuildingStage
          building={building}
          render={render}
          hotspots={hotspots}
          apartmentsById={apartmentsById}
          activeId={activeId}
          activeSource={activeSource}
          onActiveChange={setActive}
        />
      ) : null}
      <ApartmentList
        buildingId={building.id}
        apartments={facts.listed}
        activeId={activeId}
        onActiveChange={setActive}
      />
      <ContactBand projectName={project.name} building={building} />
      <OtherBuildings project={project} currentId={building.id} />
    </>
  );
}

function ContactBand({ projectName, building }: { readonly projectName: string; readonly building: Building }) {
  return (
    <section aria-labelledby="kontakt-objekti" className="bg-paper-deep">
      <div className="page-container page-grid items-end gap-y-8 py-section-sm">
        <div className="col-span-full lg:col-span-7">
          <h2 id="kontakt-objekti" className="text-heading">
            Keni pyetje për {building.name}?
          </h2>
          <p className="mt-5 max-w-[52ch] text-lead text-ink-muted">
            Lini të dhënat tuaja dhe zyra e shitjes ju kontakton për banesat në shitje në këtë objekt.
          </p>
        </div>
        <div className="col-span-full lg:col-span-4 lg:col-start-9 lg:justify-self-end">
          <ContactButton
            variant="dark"
            request={{ title: `Pyetje për ${building.name}`, subject: { projectName, buildingName: building.name } }}
          />
          <SalesPhoneLine className="mt-4 text-small text-ink-muted" />
        </div>
      </div>
    </section>
  );
}

function OtherBuildings({ project, currentId }: { readonly project: Project; readonly currentId: string }) {
  const others = project.buildings.filter((building) => building.id !== currentId).map(summarizeBuilding);
  if (others.length === 0) return null;

  return (
    <nav aria-labelledby="objektet-tjera" className="page-container py-section-sm">
      <h2 id="objektet-tjera" className="eyebrow text-ink-muted">
        Objektet e tjera
      </h2>
      <ul className="mt-8 grid border-t border-line md:grid-cols-2 md:gap-x-(--spacing-grid-gap) xl:grid-cols-3">
        {others.map(({ building, forSale }) => (
          <li key={building.id} className="border-b border-line">
            <Link to={routes.building(building.id)} className="group flex items-center gap-4 py-5">
              <span className="min-w-0 flex-1 text-subheading transition-colors group-hover:text-accent-ink">
                {building.name}
              </span>
              <span className="text-small text-ink-muted tabular-nums">{formatForSaleCount(forSale)}</span>
              <Icon
                name="arrow-right"
                className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
