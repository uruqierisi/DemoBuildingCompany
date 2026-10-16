import { CONTACT, CONTACT_DETAILS_CONFIRMED, mapsHref, officeAddressLines, phoneHref } from '@/config/contact';
import { cn } from '@/lib/cn';
import { formatOpeningHours } from '@/lib/opening-hours';

const HOURS = formatOpeningHours(CONTACT.office.hours);

/** The sales office address as a link that opens Google Maps in a new tab. */
export function OfficeAddress({ className }: { readonly className?: string }) {
  return (
    <address className={cn('not-italic', className)}>
      <a
        href={mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
      >
        {officeAddressLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
        <span className="sr-only"> (hapet në Google Maps, në dritare të re)</span>
      </a>
    </address>
  );
}

/** Opening hours in the compact Albanian form: "E hënë – e premte: 09:00–17:00". Hidden until confirmed. */
export function OpeningHours({
  className,
  mutedClassName,
}: {
  readonly className?: string;
  readonly mutedClassName?: string;
}) {
  if (!CONTACT_DETAILS_CONFIRMED) return null;
  return (
    <dl className={cn('space-y-1', className)}>
      {HOURS.map((line) => (
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

/** "Ose telefononi: +383 …" line for places that lead with the form. Renders nothing until confirmed. */
export function SalesPhoneLine({
  className,
  label = 'Ose telefononi',
}: {
  readonly className?: string;
  readonly label?: string;
}) {
  if (!CONTACT_DETAILS_CONFIRMED) return null;
  return (
    <p className={className}>
      {label}:{' '}
      <a
        href={phoneHref}
        className="tap-target whitespace-nowrap tabular-nums underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
      >
        {CONTACT.phoneDisplay}
      </a>
    </p>
  );
}
