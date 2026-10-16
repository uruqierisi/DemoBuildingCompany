import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type SectionTone = 'paper' | 'white' | 'ink';

const TONES: Record<SectionTone, string> = {
  paper: 'bg-paper text-ink',
  white: 'bg-white text-ink',
  ink: 'bg-ink text-white',
};

interface SectionProps {
  /** Anchor id; also makes the section focusable so in-page links can move focus to it. */
  readonly id?: string;
  /** Id of the section's heading. */
  readonly labelledBy: string;
  readonly tone?: SectionTone;
  readonly className?: string;
  readonly children: ReactNode;
}

/** Page section on the shared container, with the standard vertical rhythm. */
export function Section({ id, labelledBy, tone = 'paper', className, children }: SectionProps) {
  return (
    <section
      id={id}
      tabIndex={id ? -1 : undefined}
      aria-labelledby={labelledBy}
      className={cn('py-section focus:outline-none', TONES[tone], className)}
    >
      <div className="page-container">{children}</div>
    </section>
  );
}

interface SectionEyebrowProps {
  /** Two-digit section index, e.g. "01". */
  readonly index: string;
  readonly label: string;
  readonly isInverse?: boolean;
}

/** "01 ── Projekti": section index, a short rule and the section name. */
export function SectionEyebrow({ index, label, isInverse = false }: SectionEyebrowProps) {
  return (
    <p className={cn('flex items-center gap-4 eyebrow', isInverse ? 'text-inverse-muted' : 'text-ink-muted')}>
      <span className="tabular-nums">{index}</span>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
      <span>{label}</span>
    </p>
  );
}
