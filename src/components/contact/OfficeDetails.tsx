import { CONTACT_DETAILS, mapsHref, officeAddressLines, phoneHref } from '@/config/contact';
import { cn } from '@/lib/cn';
import { formatOpeningHours } from '@/lib/opening-hours';

/** The sales office address as a link that opens the map in a new tab. Nothing without contact details. */
export function OfficeAddress({ className }: { readonly className?: string }) {
  if (!CONTACT_DETAILS) return null;
  return (
    <address className={cn('not-italic', className)}>
      <a
        href={mapsHref(CONTACT_DETAILS)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
      >
        {officeAddressLines(CONTACT_DETAILS).map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
        <span className="sr-only"> (hapet në hartë, në dritare të re)</span>
      </a>
    </address>
  );
}

/** Opening hours in the compact Albanian form: "E hënë – e premte: 09:00–17:00". Nothing without contact details. */
export function OpeningHours({
  className,
  mutedClassName,
}: {
  readonly className?: string;
  readonly mutedClassName?: string;
}) {
  if (!CONTACT_DETAILS) return null;
  return (
    <dl className={cn('space-y-1', className)}>
      {formatOpeningHours(CONTACT_DETAILS.office.hours).map((line) => (
        <div key={line.days}>
          <dt className="inline">{line.days}: </dt>
          <dd className={cn('inline whitespace-nowrap tabular-nums', line.time === 'Mbyllur' && mutedClassName)}>
            {line.time}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** "Ose telefononi: +383 …" line for places that lead with the form. Nothing without contact details. */
export function SalesPhoneLine({
  className,
  label = 'Ose telefononi',
}: {
  readonly className?: string;
  readonly label?: string;
}) {
  if (!CONTACT_DETAILS) return null;
  return (
    <p className={className}>
      {label}:{' '}
      <a
        href={phoneHref(CONTACT_DETAILS)}
        className="tap-target whitespace-nowrap tabular-nums underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
      >
        {CONTACT_DETAILS.phoneDisplay}
      </a>
    </p>
  );
}
