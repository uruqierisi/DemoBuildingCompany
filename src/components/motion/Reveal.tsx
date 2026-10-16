import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

interface RevealProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** Stagger offset in ms for items revealed together. */
  readonly delay?: number;
}

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isRevealed = useInView(ref, { once: true, rootMargin: '0px 0px -10% 0px' });
  const style = delay > 0 ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined;

  return (
    <div ref={ref} data-reveal="" data-revealed={isRevealed ? '' : undefined} style={style} className={className}>
      {children}
    </div>
  );
}
