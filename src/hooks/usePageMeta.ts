import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { SITE } from '@/config/site';

interface PageMeta {
  /** Page-specific title; the company name is appended. Omit for the home page. */
  readonly title?: string;
  readonly description?: string;
}

/**
 * Sets the document title and meta description for the current page.
 * Updates the existing tags from index.html (title, description, canonical, og:url) instead of adding duplicates.
 */
export function usePageMeta({ title, description }: PageMeta): void {
  const { pathname } = useLocation();

  // Each route is its own canonical page; index.html only knows the site root (%SITE_URL%/).
  useEffect(() => {
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) return;
    const url = new URL(pathname, canonical.href).href;
    canonical.href = url;
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  }, [pathname]);

  useEffect(() => {
    document.title = title ? `${title} — ${SITE.titleSuffix}` : `Garden Buildings — ${SITE.titleSuffix}`;
  }, [title]);

  useEffect(() => {
    if (!description) return;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [description]);
}
