import { useState } from 'react';
import { buttonClasses } from '@/components/ui/button-styles';
import { cn } from '@/lib/cn';
import { toExportJson, type TracedPolygon } from './editor-state';
import { CopyFeedback, FIELD, Panel, TracedList } from './EditorPanels';
import type { CopyStatus } from './useCopyToClipboard';

interface SessionPanelProps {
  readonly projectId: string;
  readonly traced: readonly TracedPolygon[];
  readonly copyStatus: CopyStatus;
  readonly onCopy: (key: string, text: string) => void;
  readonly onRemove: (polygon: TracedPolygon) => void;
  readonly onRestore: (polygon: TracedPolygon) => void;
  readonly onReset: () => void;
}

/** Every polygon assigned this session, with per-item copy/remove (undoable) and JSON export. */
export function SessionPanel({
  projectId,
  traced,
  copyStatus,
  onCopy,
  onRemove,
  onRestore,
  onReset,
}: SessionPanelProps) {
  const [lastRemoved, setLastRemoved] = useState<TracedPolygon | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const json = toExportJson(projectId, traced);

  const remove = (polygon: TracedPolygon) => {
    onRemove(polygon);
    setLastRemoved(polygon);
  };

  return (
    <Panel title={`Seanca · ${traced.length} ${traced.length === 1 ? 'poligon' : 'poligone'}`}>
      <TracedList traced={traced} copyStatus={copyStatus} onCopy={onCopy} onRemove={remove} />

      {lastRemoved ? (
        <p className="flex items-center justify-between gap-3 text-small" role="status">
          U hoq {lastRemoved.id}.
          <button
            type="button"
            className="font-medium underline underline-offset-4"
            onClick={() => {
              onRestore(lastRemoved);
              setLastRemoved(null);
            }}
          >
            Rikthe
          </button>
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          className={buttonClasses('primary', 'sm')}
          onClick={() => onCopy('json', json)}
          disabled={traced.length === 0}
        >
          Kopjo të gjitha si JSON
        </button>
        <CopyFeedback status={copyStatus} itemKey="json" />
      </div>

      <details className="text-small">
        <summary className="cursor-pointer text-ink-muted">Shfaq JSON dhe si zbatohet</summary>
        <p className="mt-3 text-caption text-ink-muted">
          Ruajeni si <code>polygons.json</code> në rrënjën e projektit dhe ekzekutoni{' '}
          <code>node scripts/apply-polygons.ts polygons.json</code>. Skripti vendos path-et te skedari i të dhënave.
        </p>
        <textarea
          readOnly
          rows={8}
          value={json}
          aria-label="JSON i poligoneve"
          className={cn(FIELD, 'mt-3 h-auto py-2 font-mono text-caption')}
        />
      </details>

      {traced.length > 0 ? (
        isConfirmingReset ? (
          <div className="flex flex-wrap items-center gap-2 text-small">
            <span>Të fshihen të gjitha {traced.length} poligonet e seancës?</span>
            <button
              type="button"
              className={buttonClasses('dark', 'sm')}
              onClick={() => {
                onReset();
                setIsConfirmingReset(false);
                setLastRemoved(null);
              }}
            >
              Po, pastro seancën
            </button>
            <button
              type="button"
              className={buttonClasses('outline', 'sm')}
              onClick={() => setIsConfirmingReset(false)}
            >
              Anulo
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="text-small text-ink-muted underline underline-offset-4"
            onClick={() => setIsConfirmingReset(true)}
          >
            Pastro seancën
          </button>
        )
      ) : null}
    </Panel>
  );
}
