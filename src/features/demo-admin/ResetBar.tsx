import { useEffect, useState } from 'react';
import { buttonClasses } from '@/components/ui/button-styles';
import { formatInteger } from '@/lib/format';

/** How long the "confirm reset" state waits before falling back, so a stray tap never wipes changes. */
const CONFIRM_TIMEOUT_MS = 5000;

interface ResetBarProps {
  readonly changeCount: number;
  readonly onReset: () => void;
}

/** Sticky bottom bar: reset in two taps (no browser dialog, which would interrupt the presentation). */
export function ResetBar({ changeCount, onReset }: ResetBarProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isConfirming) return undefined;
    const timer = window.setTimeout(() => setIsConfirming(false), CONFIRM_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [isConfirming]);

  const hasChanges = changeCount > 0;
  const changes = `${formatInteger(changeCount)} ${changeCount === 1 ? 'ndryshim' : 'ndryshime'}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <p className="min-w-0 flex-1 text-small text-ink-muted" aria-live="polite">
          {hasChanges ? changes : 'Të dhënat fillestare'}
        </p>
        {isConfirming ? (
          <>
            <button type="button" className={buttonClasses('outline', 'md')} onClick={() => setIsConfirming(false)}>
              Anulo
            </button>
            <button
              type="button"
              className={buttonClasses('dark', 'md')}
              onClick={() => {
                onReset();
                setIsConfirming(false);
              }}
            >
              Po, rikthe
            </button>
          </>
        ) : (
          <button
            type="button"
            className={buttonClasses('dark', 'md')}
            disabled={!hasChanges}
            onClick={() => setIsConfirming(true)}
          >
            Rikthe të dhënat fillestare
          </button>
        )}
      </div>
    </div>
  );
}
