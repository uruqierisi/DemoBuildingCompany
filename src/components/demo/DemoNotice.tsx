import { Icon } from '@/components/ui/Icon';
import { DEMO } from '@/config/site';
import { cn } from '@/lib/cn';

interface DemoNoticeProps {
  /** On an ink ground (footer). */
  readonly isInverse?: boolean;
  readonly className?: string;
}

/**
 * Where a real site would show phone, e-mail and address: says plainly that this is a fictional demo,
 * and links to the agency that built it.
 */
export function DemoNotice({ isInverse = false, className }: DemoNoticeProps) {
  return (
    <div className={cn('text-small', className)}>
      <p className={isInverse ? 'text-white' : 'text-ink'}>{DEMO.notice}</p>
      <p className={cn('mt-1', isInverse ? 'text-inverse-muted' : 'text-ink-muted')}>{DEMO.disclaimer}</p>
      <a
        href={DEMO.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'group mt-3 inline-flex min-h-6 items-center gap-2 font-medium underline underline-offset-4 transition-colors pointer-coarse:min-h-11',
          isInverse ? 'decoration-white/40 hover:text-accent' : 'decoration-line-strong hover:decoration-ink',
        )}
      >
        elevateurbox.com
        <Icon
          name="arrow-up-right"
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
        <span className="sr-only"> (hapet në dritare të re)</span>
      </a>
    </div>
  );
}
