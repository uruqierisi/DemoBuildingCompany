import { useRef, useState } from 'react';
import { ContactButton } from '@/components/contact/ContactButton';
import { RenderPicture } from '@/components/media/RenderPicture';
import { Icon } from '@/components/ui/Icon';
import type { ApartmentDetails, FloorPlan } from '@/data/types';
import { formatApartmentCode, formatRoomCategory } from '@/lib/format';
import type { LeadSubject } from '@/lib/lead-message';
import { PlanViewer } from './PlanViewer';

interface ApartmentPlanProps {
  readonly apartment: ApartmentDetails;
  readonly subject: LeadSubject;
}

/** The floor plan drawing (zoomable), or a request block when the unit type has none. */
export function ApartmentPlan({ apartment, subject }: ApartmentPlanProps) {
  const { plan } = apartment.unitType;
  return plan ? (
    <PlanFigure apartment={apartment} plan={plan} />
  ) : (
    <PlanRequest apartment={apartment} subject={subject} />
  );
}

/** Plan height is capped at 70% of the viewport (svh in CSS: the height with the browser bars shown),
 *  so portrait plans render narrower than the column. */
const PLAN_MAX_HEIGHT_VH = 70;

function planSizes(aspectRatio: number): string {
  const heightCapped = `${Math.round(PLAN_MAX_HEIGHT_VH * aspectRatio)}vh`;
  return `(min-width: 90rem) min(700px, ${heightCapped}), (min-width: 64rem) min(52vw, ${heightCapped}), min(92vw, ${heightCapped})`;
}

function PlanFigure({ apartment, plan }: { readonly apartment: ApartmentDetails; readonly plan: FloorPlan }) {
  const [isOpen, setIsOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const code = formatApartmentCode(apartment.id);
  const alt = `Planimetria e banesës ${code} (${apartment.unitType.name}, ${formatRoomCategory(apartment.unitType.category)}): ${plan.description}, me përmasat e dhomave në centimetra.`;
  const title = `Planimetria e banesës ${code}`;

  const handleClose = () => {
    setIsOpen(false);
    openerRef.current?.focus();
  };

  return (
    <figure>
      <div className="relative overflow-hidden rounded-xs bg-plan p-4 sm:p-8">
        <RenderPicture
          image={plan.image}
          alt={alt}
          sizes={planSizes(plan.image.width / plan.image.height)}
          priority
          className="mx-auto block h-auto max-h-[70svh] w-auto max-w-full"
        />
        <button
          ref={openerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          className="group absolute inset-0 flex cursor-zoom-in items-end justify-end p-3 focus-visible:outline-offset-[-3px]"
        >
          <span className="flex items-center gap-2 rounded-xs bg-ink px-3 py-2 text-caption text-white transition-transform duration-300 group-hover:-translate-y-0.5">
            <Icon name="plus" size={16} />
            Zmadho planimetrinë
          </span>
        </button>
      </div>
      <figcaption className="mt-3 text-small text-ink-muted">
        {apartment.unitType.name}. Planimetri ilustruese; përmasat janë në centimetra.
      </figcaption>
      {isOpen ? <PlanViewer image={plan.image} alt={alt} title={title} onClose={handleClose} /> : null}
    </figure>
  );
}

function PlanRequest({ apartment, subject }: ApartmentPlanProps) {
  const code = formatApartmentCode(apartment.id);
  return (
    <section
      aria-labelledby="plani-titulli"
      className="relative overflow-hidden rounded-xs border border-line bg-paper-deep px-6 py-12 sm:px-10 lg:py-16"
    >
      {/* Faint drafting grid: sets the block apart as "drawing to come" without faking a layout. */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full text-ink/[0.06]">
        <defs>
          <pattern id="plan-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#plan-grid)" />
      </svg>
      <div className="relative max-w-[40ch]">
        <p className="eyebrow text-ink-muted">{apartment.unitType.name}</p>
        <h2 id="plani-titulli" className="mt-5 text-heading">
          Plani i banesës
        </h2>
        <p className="mt-5 text-lead text-ink-muted">
          Planimetrinë e banesës {code}, me përmasat e dhomave, jua dërgon zyra e shitjes me kërkesë.
        </p>
        <ContactButton
          variant="dark"
          className="mt-8"
          request={{
            title: 'Kërko planin e banesës',
            subject,
            message: `Ju lutem më dërgoni planimetrinë e banesës ${code}.`,
          }}
        >
          Kërko planin
        </ContactButton>
      </div>
    </section>
  );
}
