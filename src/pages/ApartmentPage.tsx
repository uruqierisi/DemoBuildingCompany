import { useMemo } from 'react';
import { useParams } from 'react-router';
import { ApartmentHeader } from '@/components/apartment/ApartmentHeader';
import { ApartmentLocator } from '@/components/apartment/ApartmentLocator';
import { ApartmentPager } from '@/components/apartment/ApartmentPager';
import { ApartmentPlan } from '@/components/apartment/ApartmentPlan';
import { SoldApartment } from '@/components/apartment/SoldApartment';
import { usePageContactSubject } from '@/components/contact/contact-dialog-context';
import { LeadForm } from '@/components/contact/LeadForm';
import { SalesPhoneLine } from '@/components/contact/OfficeDetails';
import type { ApartmentDetails, Building, Project } from '@/data/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProject } from '@/hooks/useProject';
import { formatApartmentCode, formatFloor, formatRoomCategory, STATUS_LABELS } from '@/lib/format';
import { findBuilding, resolveApartmentPage } from '@/lib/inventory';
import { apartmentSubject } from '@/lib/lead-message';
import { NotFoundPage } from './NotFoundPage';

/**
 * /objekti/:buildingId/:apartmentId — the loader has already rejected ids that are not listed
 * apartments. For sale and reserved: the full page. Sold: a "sold" state with alternatives.
 */
export function ApartmentPage() {
  const { buildingId = '', apartmentId = '' } = useParams();
  const project = useProject();
  const building = findBuilding(project, buildingId);
  const state = useMemo(
    () => (building ? resolveApartmentPage(building, apartmentId) : ({ kind: 'missing' } as const)),
    [building, apartmentId],
  );
  if (!building || state.kind === 'missing') return <NotFoundPage />;

  // Keyed so the form and the plan viewer start fresh on every apartment.
  return state.kind === 'sold' ? (
    <SoldApartmentView
      key={state.apartment.id}
      project={project}
      building={building}
      apartment={state.apartment}
      alternatives={state.alternatives}
      forSaleCount={state.forSaleCount}
    />
  ) : (
    <ApartmentView
      key={state.apartment.id}
      project={project}
      building={building}
      apartment={state.apartment}
      previous={state.previous}
      next={state.next}
    />
  );
}

interface ViewProps {
  readonly project: Project;
  readonly building: Building;
  readonly apartment: ApartmentDetails;
}

function SoldApartmentView({
  project,
  building,
  apartment,
  alternatives,
  forSaleCount,
}: ViewProps & { readonly alternatives: readonly ApartmentDetails[]; readonly forSaleCount: number }) {
  const code = formatApartmentCode(apartment.id);
  usePageMeta({
    title: `Banesa ${code} (e shitur) · ${building.name}`,
    description: `Banesa ${code} në ${building.name}, ${project.name}, është shitur. Shikoni banesat e tjera në shitje.`,
  });
  return (
    <article>
      <ApartmentHeader projectName={project.name} building={building} apartment={apartment} />
      <SoldApartment
        projectName={project.name}
        building={building}
        apartment={apartment}
        alternatives={alternatives}
        forSaleCount={forSaleCount}
      />
    </article>
  );
}

function ApartmentView({
  project,
  building,
  apartment,
  previous,
  next,
}: ViewProps & { readonly previous: ApartmentDetails | undefined; readonly next: ApartmentDetails | undefined }) {
  const code = formatApartmentCode(apartment.id);
  const { unitType } = apartment;
  const isReserved = apartment.status === 'reserved';
  const subject = useMemo(
    () => apartmentSubject(project.name, building.name, apartment),
    [project.name, building.name, apartment],
  );
  usePageContactSubject(subject);

  usePageMeta({
    title: `Banesa ${code} · ${building.name}`,
    description: `Banesa ${code} në ${building.name}, ${project.name}: ${unitType.name}, ${formatRoomCategory(unitType.category).toLowerCase()}, ${formatFloor(apartment.floor).toLowerCase()}. ${STATUS_LABELS[apartment.status]}.`,
  });

  return (
    <article>
      <ApartmentHeader projectName={project.name} building={building} apartment={apartment} />

      <div className="page-container page-grid gap-y-16 pb-section-sm">
        <div className="col-span-full space-y-12 lg:col-span-7">
          <ApartmentPlan apartment={apartment} subject={subject} />
          {building.render && apartment.svgPath ? (
            <section aria-labelledby="vendndodhja-titulli">
              <h2 id="vendndodhja-titulli" className="mb-5 eyebrow text-ink-muted">
                Vendndodhja në objekt
              </h2>
              <ApartmentLocator
                render={building.render}
                svgPath={apartment.svgPath}
                label={`Banesa ${code} e theksuar në fasadën e ${building.name}. Pamje ilustruese.`}
              />
            </section>
          ) : null}
        </div>

        <section
          aria-labelledby="kerkesa-titulli"
          className="col-span-full self-start lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:col-span-5 lg:col-start-8"
        >
          <div className="rounded-xs bg-white p-6 sm:p-8">
            <h2 id="kerkesa-titulli" className="text-subheading lg:text-[1.875rem] lg:leading-tight">
              Kërko informata për këtë banesë
            </h2>
            <div className="mt-3 mb-8 space-y-1 text-ink-muted">
              <p>
                {isReserved
                  ? 'Kjo banesë është e rezervuar. Lini të dhënat nëse doni t’ju njoftojmë kur të lirohet.'
                  : 'Lini emrin dhe telefonin; zyra e shitjes ju kontakton.'}
              </p>
              <SalesPhoneLine className="text-small" />
            </div>
            <LeadForm subject={subject} />
          </div>
        </section>
      </div>

      <ApartmentPager buildingId={building.id} buildingName={building.name} previous={previous} next={next} />
    </article>
  );
}
