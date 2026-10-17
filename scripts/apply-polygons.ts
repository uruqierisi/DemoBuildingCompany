/**
 * Writes polygons exported from the hotspot editor ("Kopjo të gjitha si JSON") into a data file.
 *
 *   node scripts/apply-polygons.ts polygons.json [src/data/rezidenca-arrita.ts]
 *
 * Node 22.18+ runs this TypeScript file directly (type stripping). Review the diff before committing.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { applyPolygonUpdates, type PolygonUpdate } from '../src/lib/polygon-patch.ts';

interface ExportFile {
  readonly polygons: readonly PolygonUpdate[];
}

function isExportFile(value: unknown): value is ExportFile {
  if (typeof value !== 'object' || value === null || !('polygons' in value)) return false;
  const { polygons } = value as { polygons: unknown };
  return (
    Array.isArray(polygons) &&
    polygons.every(
      (p) => typeof p === 'object' && p !== null && typeof p.id === 'string' && typeof p.svgPath === 'string',
    )
  );
}

const [jsonPath, dataPath = 'src/data/rezidenca-arrita.ts'] = process.argv.slice(2);
if (!jsonPath) {
  console.error('Usage: node scripts/apply-polygons.ts <polygons.json> [data-file.ts]');
  process.exit(1);
}

const parsed: unknown = JSON.parse(readFileSync(jsonPath, 'utf8'));
if (!isExportFile(parsed)) {
  console.error(`${jsonPath} is not an editor export: expected { "polygons": [{ "id", "svgPath" }, …] }.`);
  process.exit(1);
}

const result = applyPolygonUpdates(readFileSync(dataPath, 'utf8'), parsed.polygons);
writeFileSync(dataPath, result.output);

console.info(`Updated ${result.applied.length} polygon(s) in ${dataPath}.`);
if (result.notFound.length > 0) console.error(`Not found in the data file: ${result.notFound.join(', ')}`);
if (result.rejected.length > 0) console.error(`Rejected (not a plain polygon path): ${result.rejected.join(', ')}`);
if (result.notFound.length > 0 || result.rejected.length > 0) process.exit(2);
