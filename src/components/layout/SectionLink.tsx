import type { MouseEvent, ReactNode, Ref } from 'react';
import { Link, useLocation } from 'react-router';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface SectionLinkProps {
  /** Id of a section on the home page. */
  readonly sectionId: string;
  readonly children: ReactNode;
  readonly className?: string;
  /** Called on every activation, before scrolling (e.g. to close the mobile menu). */
  readonly onNavigate?: () => void;
  readonly ref?: Ref<HTMLAnchorElement>;
}

function isPlainLeftClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * Link to a home-page section. On the home page it scrolls smoothly (instantly with reduced motion)
 * and moves focus to the section; from other pages it navigates to "/#section" as a normal link.
 */
export function SectionLink({ sectionId, children, className, onNavigate, ref }: SectionLinkProps) {
  const { pathname } = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();
    if (pathname !== '/' || !isPlainLeftClick(event)) return;
    const target = document.getElementById(sectionId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
  };

  return (
    <Link ref={ref} to={{ pathname: '/', hash: `#${sectionId}` }} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
