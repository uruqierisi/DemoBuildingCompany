import { useEffect, useReducer, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { buttonClasses } from '@/components/ui/button-styles';
import { featuredProject, projects } from '@/data/projects';
import { usePageMeta } from '@/hooks/usePageMeta';
import { cn } from '@/lib/cn';
import { AssignPanel, type Assignment } from './AssignPanel';
import { CopyFeedback, FIELD, ImageStatus, Panel, ViewOptions } from './EditorPanels';
import { createInitialState, editorReducer, MIN_POLYGON_POINTS, type TracedPolygon } from './editor-state';
import { toSvgPath } from './polygon';
import { loadSession, saveSession } from './session-storage';
import { SessionPanel } from './SessionPanel';
import { TraceCanvas, type Zoom } from './TraceCanvas';
import { getTraceImages, type TraceImage } from './trace-images';
import { useCopyToClipboard } from './useCopyToClipboard';

const TRACE_IMAGES = getTraceImages(projects);
const IMAGE_PARAM = 'imazhi';

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest('input, select, textarea, button, a') !== null;
}

/**
 * Dev-only hotspot editor (/editor): trace polygons on a render in its own pixel space, assign them
 * to buildings or apartments, and export them as JSON for scripts/apply-polygons.ts.
 */
export function EditorPage() {
  usePageMeta({ title: 'Editori i poligoneve' });
  const [searchParams, setSearchParams] = useSearchParams();
  const image: TraceImage | undefined =
    TRACE_IMAGES.find((candidate) => candidate.key === searchParams.get(IMAGE_PARAM)) ?? TRACE_IMAGES[0];

  const [state, dispatch] = useReducer(editorReducer, undefined, () => createInitialState(loadSession()));
  const [zoom, setZoom] = useState<Zoom>('fit');
  const [showCurrentData, setShowCurrentData] = useState(true);
  const [copyStatus, copy] = useCopyToClipboard();

  useEffect(() => saveSession(state.traced), [state.traced]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        dispatch({ type: 'undoPoint' });
      } else if (event.key === 'Enter') {
        dispatch({ type: 'close' });
      } else if (event.key === 'Escape') {
        dispatch({ type: 'clear' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!image)
    return (
      <p className="p-6">Asnjë render në të dhëna ende: shtoni renderat dhe ekzekutoni scripts/optimize-renders.mjs.</p>
    );

  const tracedHere = state.traced.filter((polygon) => polygon.image === image.key);
  const draftPath = toSvgPath(state.points, state.isClosed);

  const selectImage = (key: string) => {
    setSearchParams({ [IMAGE_PARAM]: key }, { replace: true });
    dispatch({ type: 'clear' });
  };

  const assign = (assignment: Assignment) => {
    dispatch({
      type: 'assign',
      ...assignment,
      image: image.key,
      imageSize: { width: image.image.width, height: image.image.height },
    });
  };

  return (
    <div className="min-h-svh bg-paper text-ink">
      <header className="flex h-14 items-center justify-between gap-4 border-b border-line bg-white px-5">
        <h1 className="text-small font-medium">
          Editori i poligoneve <span className="ml-2 eyebrow text-accent-ink">Vetëm në zhvillim</span>
        </h1>
        <Link to="/" className="text-small underline-offset-4 hover:underline">
          Kthehu te faqja
        </Link>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_23rem]">
        <main className="min-w-0 p-4 lg:p-6">
          <TraceCanvas
            image={image}
            points={state.points}
            isClosed={state.isClosed}
            traced={tracedHere}
            showCurrentData={showCurrentData}
            zoom={zoom}
            onAddPoint={(point) => dispatch({ type: 'addPoint', point })}
            onClose={() => dispatch({ type: 'close' })}
          />
          <p className="mt-3 text-caption text-ink-muted">
            Klikoni për të shtuar pika; klikoni pikën e parë për ta mbyllur. Shkurtore: Ctrl+Z zhbën pikën, Enter mbyll
            poligonin, Esc e pastron.
          </p>
        </main>

        <aside className="border-t border-line bg-white px-5 pb-10 lg:max-h-svh lg:overflow-y-auto lg:border-t-0 lg:border-l">
          <Panel title="Imazhi">
            <label className="block text-small" htmlFor="editor-image">
              Rendi për vizatim
            </label>
            <select id="editor-image" className={FIELD} value={image.key} onChange={(e) => selectImage(e.target.value)}>
              {TRACE_IMAGES.map((candidate) => (
                <option key={candidate.key} value={candidate.key}>
                  {candidate.label}
                </option>
              ))}
            </select>
            <ImageStatus image={image} />
            <ViewOptions
              zoom={zoom}
              onZoomChange={setZoom}
              showCurrentData={showCurrentData}
              onShowCurrentDataChange={setShowCurrentData}
            />
          </Panel>

          <Panel title="Poligoni">
            <p className="text-small tabular-nums" aria-live="polite">
              {state.points.length} pika{state.isClosed ? ' · i mbyllur' : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonClasses('outline', 'sm')}
                onClick={() => dispatch({ type: 'undoPoint' })}
                disabled={state.points.length === 0 && !state.isClosed}
              >
                Zhbëj pikën
              </button>
              <button
                type="button"
                className={buttonClasses('outline', 'sm')}
                onClick={() => dispatch({ type: 'close' })}
                disabled={state.isClosed || state.points.length < MIN_POLYGON_POINTS}
              >
                Mbyll poligonin
              </button>
              <button
                type="button"
                className={buttonClasses('outline', 'sm')}
                onClick={() => dispatch({ type: 'clear' })}
                disabled={state.points.length === 0}
              >
                Pastro
              </button>
            </div>
            <label className="block text-small" htmlFor="editor-path">
              Path SVG (pikselët e renderit)
            </label>
            <textarea
              id="editor-path"
              readOnly
              rows={3}
              value={draftPath}
              className={cn(FIELD, 'h-auto py-2 font-mono text-caption')}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                className={buttonClasses('outline', 'sm')}
                onClick={() => copy('draft', draftPath)}
                disabled={!state.isClosed}
              >
                Kopjo path-in
              </button>
              <CopyFeedback status={copyStatus} itemKey="draft" />
            </div>
          </Panel>

          <AssignPanel key={image.key} image={image} traced={tracedHere} isClosed={state.isClosed} onAssign={assign} />

          <SessionPanel
            projectId={featuredProject.id}
            traced={state.traced}
            copyStatus={copyStatus}
            onCopy={copy}
            onRemove={(polygon: TracedPolygon) => dispatch({ type: 'remove', image: polygon.image, id: polygon.id })}
            onRestore={(polygon: TracedPolygon) => dispatch({ type: 'restore', polygon })}
            onReset={() => dispatch({ type: 'resetSession' })}
          />
        </aside>
      </div>
    </div>
  );
}
