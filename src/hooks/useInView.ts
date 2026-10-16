import { useEffect, useState, type RefObject } from 'react';

interface InViewOptions {
  /** Stop observing after the element first enters the viewport. */
  readonly once?: boolean;
  readonly rootMargin?: string;
  readonly threshold?: number;
  /** Value before the first observation (and where IntersectionObserver is unavailable). */
  readonly initialInView?: boolean;
}

/** Tracks whether an element intersects the viewport, using a single IntersectionObserver. */
export function useInView(
  ref: RefObject<Element | null>,
  { once = false, rootMargin = '0px', threshold = 0, initialInView = false }: InViewOptions = {},
): boolean {
  // Without IntersectionObserver, treat content as visible so nothing stays hidden.
  const [inView, setInView] = useState(() => (typeof IntersectionObserver === 'undefined' ? true : initialInView));

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (once && entry.isIntersecting) observer.disconnect();
      },
      { rootMargin, threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, once, rootMargin, threshold]);

  return inView;
}
