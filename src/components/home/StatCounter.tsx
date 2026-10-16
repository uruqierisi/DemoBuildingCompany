import { useEffect, useRef, useState } from 'react';
import type { Stat } from '@/data/types';
import { useInView } from '@/hooks/useInView';
import { REDUCED_MOTION_QUERY } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';
import { formatInteger } from '@/lib/format';

const COUNT_DURATION_MS = 1800;

/** Decelerating curve: fast start, long gentle landing on the final number. */
function easeOutQuart(t: number): number {
  return 1 - (1 - t) ** 4;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

interface StatCounterProps {
  readonly stat: Stat;
  readonly className?: string;
}

/**
 * A figure that counts up once when it scrolls into view. The real number is always in the DOM
 * (read by assistive tech and crawlers, and it reserves the final width); the counting digits are
 * a visual overlay updated outside React, so animating costs no re-renders.
 */
export function StatCounter({ stat, className }: StatCounterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, threshold: 0.6 });
  const [isDone, setIsDone] = useState(prefersReducedMotion);

  useEffect(() => {
    if (!isInView || isDone) return undefined;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_DURATION_MS);
      if (overlayRef.current) overlayRef.current.textContent = formatInteger(stat.value * easeOutQuart(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setIsDone(true);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, isDone, stat.value]);

  return (
    <div ref={containerRef} className={cn('flex flex-col-reverse justify-end gap-4', className)}>
      <dt className="text-small text-ink-muted">{stat.label}</dt>
      <dd className="relative text-stat tabular-nums">
        <span className={isDone ? undefined : 'opacity-0'}>{formatInteger(stat.value)}</span>
        {isDone ? null : (
          <span ref={overlayRef} aria-hidden="true" className="absolute inset-y-0 left-0">
            {formatInteger(0)}
          </span>
        )}
        {stat.unit ? <span className="ml-2 text-subheading text-ink-muted">{stat.unit}</span> : null}
      </dd>
    </div>
  );
}
