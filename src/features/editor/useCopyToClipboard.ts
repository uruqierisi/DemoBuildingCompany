import { useCallback, useEffect, useRef, useState } from 'react';

/** How long the "copied" confirmation stays visible. */
const FEEDBACK_MS = 1800;

export type CopyStatus = { readonly key: string; readonly ok: boolean } | null;

/** Copies text and reports which item was copied (or failed), for inline feedback. */
export function useCopyToClipboard(): [CopyStatus, (key: string, text: string) => Promise<void>] {
  const [status, setStatus] = useState<CopyStatus>(null);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const copy = useCallback(async (key: string, text: string) => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      ok = false;
    }
    setStatus({ key, ok });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setStatus(null), FEEDBACK_MS);
  }, []);

  return [status, copy];
}
