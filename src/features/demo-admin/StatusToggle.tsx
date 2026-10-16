import type { ApartmentStatus } from '@/data/types';
import { cn } from '@/lib/cn';
import { STATUS_LABELS } from '@/lib/format';
import { APARTMENT_STATUSES } from '@/lib/inventory';

const SELECTED: Readonly<Record<ApartmentStatus, string>> = {
  available: 'peer-checked:border-accent peer-checked:bg-accent',
  // Hatched with a heavy outline, as on the render: reserved must not rely on hue alone.
  reserved: 'peer-checked:border-2 peer-checked:border-status-reserved-ink peer-checked:bg-hatch-reserved-soft',
  sold: 'peer-checked:border-status-sold peer-checked:bg-status-sold',
};

interface StatusToggleProps {
  /** Unique per apartment; groups the three radios. */
  readonly name: string;
  readonly legend: string;
  readonly value: ApartmentStatus;
  readonly onChange: (status: ApartmentStatus) => void;
}

/** Three-way status control: a native radio group styled as a segmented button, 44px tall for thumbs. */
export function StatusToggle({ name, legend, value, onChange }: StatusToggleProps) {
  return (
    <fieldset className="grid grid-cols-3 gap-1.5">
      <legend className="sr-only">{legend}</legend>
      {APARTMENT_STATUSES.map((status) => (
        <label key={status} className="relative">
          <input
            type="radio"
            name={name}
            value={status}
            checked={value === status}
            onChange={() => onChange(status)}
            className="peer sr-only"
          />
          <span
            className={cn(
              'flex min-h-11 cursor-pointer items-center justify-center rounded-xs border border-line-strong bg-white px-2 text-center text-small font-medium text-ink transition-colors select-none',
              'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink',
              SELECTED[status],
            )}
          >
            {STATUS_LABELS[status]}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
