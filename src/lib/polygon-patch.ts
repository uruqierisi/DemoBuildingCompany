/**
 * Writes traced polygons into a project data file (the literal format of src/data/garden-buildings.ts).
 * Used by scripts/apply-polygons.ts; kept free of app imports so Node can run it directly.
 */

export interface PolygonUpdate {
  /** Building, apartment or sold-unit id, as it appears in the data file: id: '<id>'. */
  readonly id: string;
  readonly svgPath: string;
  /** "sold" lets a sold unit that is not in the file yet be created in its building's `soldUnits`. */
  readonly kind?: string;
  readonly buildingId?: string;
  readonly floor?: number;
}

export interface PatchResult {
  readonly output: string;
  readonly applied: readonly string[];
  readonly notFound: readonly string[];
  readonly rejected: readonly string[];
}

/** Paths from the editor contain only M/L/H/V/Z commands and numbers; anything else is refused. */
const SAFE_PATH = /^[MLHVZmlhvz0-9.,\s-]+$/;
const SVG_PATH_FIELD = /svgPath: '[^']*'/;
const SOLD_UNIT_ID = /^[a-z0-9]+-s-\d{4}$/;
const BUILDING_ID = /^[a-z0-9-]+$/;
const MAX_FLOOR = 200;
/** An `id:` field, not the tail of `buildingId:` or `unitTypeId:`. */
const ANY_ID_FIELD = /(?<![A-Za-z])id: '/g;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Adds `svgPath` right after an `id: '…',` field that has none, matching the object's layout:
 * on its own line (same indentation) for multi-line objects, inline for one-line objects.
 */
function insertAfterIdField(source: string, commaIndex: number, svgPath: string): string {
  const insertAt = source[commaIndex] === ',' ? commaIndex + 1 : commaIndex;
  const lineStart = source.lastIndexOf('\n', commaIndex) + 1;
  const indent = /^\s*/.exec(source.slice(lineStart))?.[0] ?? '';
  const isMultiLine = source[insertAt] === '\n' || source.slice(insertAt, insertAt + 2) === '\r\n';
  const field = isMultiLine ? `\n${indent}svgPath: '${svgPath}',` : ` svgPath: '${svgPath}',`;
  return `${source.slice(0, insertAt)}${field}${source.slice(insertAt)}`;
}

/**
 * Appends a new sold unit to its building's `soldUnits: [...]` array. Returns undefined when the
 * building or its array cannot be found. Entries never contain brackets, so the first `]` closes it.
 */
function insertSoldUnit(source: string, update: Required<Omit<PolygonUpdate, 'kind'>>): string | undefined {
  const { id, svgPath, buildingId, floor } = update;
  const building = new RegExp(`(?<![A-Za-z])id: '${escapeRegExp(buildingId)}'`).exec(source);
  if (!building) return undefined;
  const listStart = source.indexOf('soldUnits: [', building.index);
  if (listStart === -1) return undefined;
  const open = listStart + 'soldUnits: ['.length;
  const close = source.indexOf(']', open);
  if (close === -1) return undefined;

  const lineStart = source.lastIndexOf('\n', listStart) + 1;
  const indent = /^[ \t]*/.exec(source.slice(lineStart))?.[0] ?? '';
  const entry = `{ id: '${id}', buildingId: '${buildingId}', floor: ${floor}, svgPath: '${svgPath}' },`;
  const body = source.slice(open, close);

  if (body.trim() === '') {
    return `${source.slice(0, open)}\n${indent}  ${entry}\n${indent}${source.slice(close)}`;
  }
  if (!body.includes('\n')) {
    // One-line array: prepend inline; Prettier can reflow it.
    return `${source.slice(0, open)}${entry} ${source.slice(open)}`;
  }
  const closeLineStart = source.lastIndexOf('\n', close) + 1;
  return `${source.slice(0, closeLineStart)}${indent}  ${entry}\n${source.slice(closeLineStart)}`;
}

function isValidNewSoldUnit(update: PolygonUpdate): update is PolygonUpdate & { buildingId: string; floor: number } {
  return (
    update.kind === 'sold' &&
    SOLD_UNIT_ID.test(update.id) &&
    typeof update.buildingId === 'string' &&
    BUILDING_ID.test(update.buildingId) &&
    typeof update.floor === 'number' &&
    Number.isInteger(update.floor) &&
    update.floor >= 0 &&
    update.floor <= MAX_FLOOR
  );
}

/**
 * For each update, finds `id: '<id>'` and replaces the first `svgPath: '…'` that follows it before
 * the next `id:` field; if the object has no svgPath yet, inserts one after its id. That covers
 * building objects, multi-line and one-line apartment objects. A sold unit whose id is not in the
 * file yet is created in its building's `soldUnits` array.
 */
export function applyPolygonUpdates(source: string, updates: readonly PolygonUpdate[]): PatchResult {
  let output = source;
  const applied: string[] = [];
  const notFound: string[] = [];
  const rejected: string[] = [];

  for (const update of updates) {
    const { id, svgPath } = update;
    if (!SAFE_PATH.test(svgPath)) {
      rejected.push(id);
      continue;
    }
    const idMatch = new RegExp(`(?<![A-Za-z])id: '${escapeRegExp(id)}'`).exec(output);
    if (!idMatch) {
      if (update.kind === 'sold' && !isValidNewSoldUnit(update)) {
        rejected.push(id);
        continue;
      }
      const inserted = isValidNewSoldUnit(update)
        ? insertSoldUnit(output, { id, svgPath, buildingId: update.buildingId, floor: update.floor })
        : undefined;
      if (inserted === undefined) notFound.push(id);
      else {
        output = inserted;
        applied.push(id);
      }
      continue;
    }
    const afterId = idMatch.index + idMatch[0].length;
    ANY_ID_FIELD.lastIndex = afterId;
    const nextId = ANY_ID_FIELD.exec(output)?.index ?? -1;
    const scope = output.slice(afterId, nextId === -1 ? undefined : nextId);
    const fieldMatch = SVG_PATH_FIELD.exec(scope);
    if (fieldMatch) {
      const start = afterId + fieldMatch.index;
      output = `${output.slice(0, start)}svgPath: '${svgPath}'${output.slice(start + fieldMatch[0].length)}`;
    } else {
      output = insertAfterIdField(output, afterId, svgPath);
    }
    applied.push(id);
  }

  return { output, applied, notFound, rejected };
}
