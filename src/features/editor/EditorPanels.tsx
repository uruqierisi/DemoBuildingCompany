import type { ReactNode } from 'react';
import { buttonClasses } from '@/components/ui/button-styles';
import { cn } from '@/lib/cn';
import { formatInteger } from '@/lib/format';
import type { TracedPolygon } from './editor-state';
import type { Zoom } from './TraceCanvas';
import { groupTargets, type TraceImage, type TraceTarget } from './trace-images';
import type { CopyStatus } from './useCopyToClipboard';

export const FIELD =
  'h-10 w-full rounded-xs border border-line-strong bg-white px-3 text-small text-ink focus-visible:outline-offset-1';

export function Panel({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section className="border-t border-line py-5">
      <h2 className="eyebrow text-ink-muted">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export function CopyFeedback({ status, itemKey }: { readonly status: CopyStatus; readonly itemKey: string }) {
  const message = status?.key === itemKey ? (status.ok ? 'U kopjua.' : 'Kopjimi dështoi; kopjojeni nga fusha.') : '';
  return (
    <span role="status" className="text-caption text-ink-muted">
      {message}
    </span>
  );
}

/** The render's real pixel size (read from the original by the optimisation script) and its source file. */
export function ImageStatus({ image }: { readonly image: TraceImage }) {
  const { width, height, original } = image.image;
  return (
    <p className="text-caption text-ink-muted">
      Koordinatat në pikselët e origjinalit: {formatInteger(width)} × {formatInteger(height)} px (
      <code>{original}</code>).
    </p>
  );
}

interface ViewOptionsProps {
  readonly zoom: Zoom;
  readonly onZoomChange: (zoom: Zoom) => void;
  readonly showCurrentData: boolean;
  readonly onShowCurrentDataChange: (show: boolean) => void;
}

const ZOOM_OPTIONS: ReadonlyArray<{ readonly value: Zoom; readonly label: string }> = [
  { value: 'fit', label: 'Përshtat në ekran' },
  { value: 0.5, label: '50%' },
  { value: 1, label: '100% (piksel për piksel)' },
  { value: 1.5, label: '150%' },
];

export function ViewOptions({ zoom, onZoomChange, showCurrentData, onShowCurrentDataChange }: ViewOptionsProps) {
  return (
    <>
      <label className="block text-small" htmlFor="editor-zoom">
        Zmadhimi
      </label>
      <select
        id="editor-zoom"
        className={FIELD}
        value={String(zoom)}
        onChange={(event) => onZoomChange(event.target.value === 'fit' ? 'fit' : Number(event.target.value))}
      >
        {ZOOM_OPTIONS.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-3 text-small">
        <input
          type="checkbox"
          className="size-4 accent-ink"
          checked={showCurrentData}
          onChange={(event) => onShowCurrentDataChange(event.target.checked)}
        />
        Shfaq poligonet aktuale nga të dhënat
      </label>
    </>
  );
}

interface TargetPickerProps {
  readonly targets: readonly TraceTarget[];
  readonly value: string;
  readonly tracedIds: ReadonlySet<string>;
  /** When set, adds a "new sold unit" option with this value. */
  readonly newSoldValue?: string;
  readonly onChange: (id: string) => void;
}

export function TargetPicker({ targets, value, tracedIds, newSoldValue, onChange }: TargetPickerProps) {
  return (
    <>
      <label className="block text-small" htmlFor="editor-target">
        Cakto te
      </label>
      <select id="editor-target" className={FIELD} value={value} onChange={(event) => onChange(event.target.value)}>
        {groupTargets(targets).map(([group, items]) => (
          <optgroup key={group} label={group}>
            {items.map((target) => (
              <option key={target.id} value={target.id}>
                {tracedIds.has(target.id) ? `✓ ${target.label}` : target.label}
              </option>
            ))}
          </optgroup>
        ))}
        {newSoldValue ? (
          <optgroup label="Njësi e shitur">
            <option value={newSoldValue}>+ Njësi e re e shitur…</option>
          </optgroup>
        ) : null}
      </select>
    </>
  );
}

interface TracedListProps {
  readonly traced: readonly TracedPolygon[];
  readonly copyStatus: CopyStatus;
  readonly onCopy: (key: string, text: string) => void;
  readonly onRemove: (polygon: TracedPolygon) => void;
}

export function TracedList({ traced, copyStatus, onCopy, onRemove }: TracedListProps) {
  if (traced.length === 0) {
    return <p className="text-small text-ink-muted">Asnjë poligon i caktuar ende në këtë seancë.</p>;
  }
  return (
    <ul className="max-h-72 divide-y divide-line overflow-y-auto border-y border-line">
      {traced.map((polygon) => {
        const key = `${polygon.image}|${polygon.id}`;
        return (
          <li key={key} className="flex items-center gap-2 py-2 text-small">
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{polygon.id}</span>
              <span className="block truncate font-mono text-caption text-ink-muted" title={polygon.svgPath}>
                {polygon.svgPath}
              </span>
              <CopyFeedback status={copyStatus} itemKey={key} />
            </span>
            <button
              type="button"
              className={cn(buttonClasses('outline', 'sm'), 'h-8 px-3')}
              onClick={() => onCopy(key, polygon.svgPath)}
              aria-label={`Kopjo path-in për ${polygon.id}`}
            >
              Kopjo
            </button>
            <button
              type="button"
              className={cn(buttonClasses('outline', 'sm'), 'h-8 px-3')}
              onClick={() => onRemove(polygon)}
              aria-label={`Hiq poligonin për ${polygon.id}`}
            >
              Hiq
            </button>
          </li>
        );
      })}
    </ul>
  );
}
