import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { DEMO } from '@/config/site';
import { useIsEditingText } from '@/hooks/useIsEditingText';
import { cn } from '@/lib/cn';

const DISMISSED_KEY = 'elevateurbox-demo:badge-dismissed:v1';

/** Dismissal lasts for the browser session, so a returning visitor is told again. */
function readDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false; // Storage blocked: show the badge, which is the safe default.
  }
}

function storeDismissed(): void {
  try {
    window.sessionStorage.setItem(DISMISSED_KEY, '1');
  } catch (error) {
    // Storage blocked: the badge still closes for this page view.
    if (import.meta.env.DEV) console.error('Could not remember the dismissed demo badge:', error);
  }
}

interface DemoBadgeProps {
  /** Takes the badge out of the tab order while something covers it (the open mobile menu). */
  readonly isHidden?: boolean;
  /** Positioning, when the page has its own bottom bar (demo admin). Default: bottom right, above the mobile contact bar. */
  readonly className?: string;
}

/**
 * "Demo nga ElevateUrBox": a small fixed pill in the bottom-right corner of every page, linking to
 * the agency. White on any ground, so it reads over ink sections and paper alike. Dismissible; on
 * phones it steps aside while the keyboard is open, like the contact bar.
 */
export function DemoBadge({ isHidden = false, className }: DemoBadgeProps) {
  const [isDismissed, setIsDismissed] = useState(readDismissed);
  const isEditing = useIsEditingText();
  if (isDismissed) return null;

  const dismiss = () => {
    storeDismissed();
    setIsDismissed(true);
  };

  return (
    <aside
      aria-label="Shënim për demon"
      inert={isHidden}
      className={cn(
        'fixed right-[max(0.75rem,env(safe-area-inset-right))] z-30 flex items-center rounded-full border border-line bg-white text-ink shadow-[0_6px_24px_rgb(22_21_19/0.18)]',
        className ??
          'bottom-[calc(var(--contact-bar-height)+0.75rem)] md:bottom-[max(1.25rem,env(safe-area-inset-bottom))]',
        isEditing && 'max-md:invisible',
      )}
    >
      <a
        href={DEMO.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-10 items-center gap-2.5 rounded-l-full pr-1 pl-3.5 text-caption font-medium pointer-coarse:h-11"
      >
        <span aria-hidden="true" className="size-2 rounded-[1px] bg-accent" />
        {DEMO.badge}
        <Icon
          name="arrow-up-right"
          size={14}
          className="text-ink-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
        <span className="sr-only"> (hapet në dritare të re)</span>
      </a>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Mbyll shënimin për demon"
        className="flex size-10 items-center justify-center rounded-r-full border-l border-line text-ink-muted transition-colors hover:text-ink pointer-coarse:size-11"
      >
        <Icon name="close" size={16} />
      </button>
    </aside>
  );
}
