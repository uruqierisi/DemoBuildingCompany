import { useState } from 'react';
import { buttonClasses } from '@/components/ui/button-styles';
import type { Floor } from '@/data/types';
import { formatApartmentCode, formatFloor } from '@/lib/format';
import { nextSoldUnitId } from '@/lib/sold-units';
import type { TargetKind, TracedPolygon } from './editor-state';
import { FIELD, Panel, TargetPicker } from './EditorPanels';
import { SOLD_GROUP, type TraceImage, type TraceTarget } from './trace-images';

/** Picker value for "create a new sold unit". */
export const NEW_SOLD = '__new-sold__';

export interface Assignment {
  readonly kind: TargetKind;
  readonly id: string;
  /** Sold units only. */
  readonly buildingId?: string;
  readonly floor?: Floor;
}

interface AssignPanelProps {
  readonly image: TraceImage;
  /** Polygons assigned this session on this image. */
  readonly traced: readonly TracedPolygon[];
  readonly isClosed: boolean;
  readonly onAssign: (assignment: Assignment) => void;
}

/**
 * Chooses what the closed polygon belongs to: a building (overview), a listed apartment, an existing
 * sold unit, or a new sold unit on a chosen floor, whose id is generated (e.g. "L9-S-0301").
 * Render with `key={image.key}` so the selection resets when the image changes.
 */
export function AssignPanel({ image, traced, isClosed, onAssign }: AssignPanelProps) {
  const [requestedId, setRequestedId] = useState('');
  const [soldFloor, setSoldFloor] = useState<Floor>(image.soldFloors?.[0] ?? 0);

  // Sold units created this session are not in the data yet, but can be re-traced like any other target.
  const sessionSold: TraceTarget[] = traced
    .filter((p) => p.kind === 'sold' && p.floor !== undefined && !image.targets.some((t) => t.id === p.id))
    .map((p) => ({
      kind: 'sold',
      id: p.id,
      label: `${formatApartmentCode(p.id)} · ${formatFloor(p.floor ?? 0)}`,
      group: SOLD_GROUP,
      floor: p.floor,
    }));
  const targets = [...image.targets, ...sessionSold];
  const tracedIds = new Set(traced.map((p) => p.id));
  const canCreateSold = image.buildingId !== undefined;
  const isNewSold = requestedId === NEW_SOLD && canCreateSold;

  // Default: the requested target, else the first listed item without a polygon yet.
  const target = isNewSold
    ? undefined
    : (targets.find((t) => t.id === requestedId) ??
      targets.find((t) => t.kind !== 'sold' && !tracedIds.has(t.id)) ??
      targets[0]);
  const soldIds = new Set(targets.filter((t) => t.kind === 'sold').map((t) => t.id));
  const newSoldId = isNewSold && image.buildingId ? nextSoldUnitId(image.buildingId, soldFloor, soldIds) : undefined;

  const save = () => {
    if (newSoldId && image.buildingId) {
      // Stay in "new sold unit" mode: the next one on this floor gets the next sequence number.
      onAssign({ kind: 'sold', id: newSoldId, buildingId: image.buildingId, floor: soldFloor });
      return;
    }
    if (!target) return;
    onAssign({
      kind: target.kind,
      id: target.id,
      ...(target.kind === 'sold' ? { buildingId: image.buildingId, floor: target.floor } : {}),
    });
    // Move on to the next listed item without a polygon, so a building can be traced in one pass.
    const done = new Set([...tracedIds, target.id]);
    const next = targets.slice(targets.indexOf(target) + 1).find((t) => t.kind !== 'sold' && !done.has(t.id));
    if (next) setRequestedId(next.id);
  };

  const saveLabel = newSoldId
    ? `Ruaj si njësi e shitur ${formatApartmentCode(newSoldId)}`
    : `Ruaj poligonin${target ? ` për ${target.label}` : ''}`;

  return (
    <Panel title="Cakto">
      <TargetPicker
        targets={targets}
        value={isNewSold ? NEW_SOLD : (target?.id ?? '')}
        tracedIds={tracedIds}
        newSoldValue={canCreateSold ? NEW_SOLD : undefined}
        onChange={setRequestedId}
      />
      {isNewSold ? (
        <>
          <label className="block text-small" htmlFor="editor-sold-floor">
            Kati i njësisë së shitur
          </label>
          <select
            id="editor-sold-floor"
            className={FIELD}
            value={soldFloor}
            onChange={(event) => setSoldFloor(Number(event.target.value))}
          >
            {(image.soldFloors ?? []).map((floor) => (
              <option key={floor} value={floor}>
                {formatFloor(floor)}
              </option>
            ))}
          </select>
          <p className="text-caption text-ink-muted">
            Njësitë e shitura kanë vetëm kat dhe id; nuk shfaqen në listë dhe nuk kanë faqe.
          </p>
        </>
      ) : null}
      <button
        type="button"
        className={buttonClasses('dark', 'sm', 'w-full')}
        onClick={save}
        disabled={!isClosed || (!target && !newSoldId)}
      >
        {saveLabel}
      </button>
      {!isClosed ? <p className="text-caption text-ink-muted">Mbyllni poligonin për ta caktuar.</p> : null}
    </Panel>
  );
}
