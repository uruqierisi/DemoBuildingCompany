import type { Plugin } from 'vite';

const PLACEHOLDER = /%SITE_URL%/g;
/** Used when no URL is configured; share previews will not work from it. */
const FALLBACK_URL = 'http://localhost:5180';

function withoutTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * The site's absolute origin, without a trailing slash. Resolution order:
 *   1. SITE_URL environment variable (e.g. https://pozhegu.elevateurbox.com, set in netlify.toml)
 *   2. URL, set automatically on Netlify builds (the site's primary URL)
 *   3. VERCEL_PROJECT_PRODUCTION_URL, set automatically on Vercel builds
 * Empty when none is set.
 */
export function configuredSiteUrl(): string {
  const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '';
  return withoutTrailingSlash(process.env.SITE_URL || process.env.URL || fromVercel);
}

/** configuredSiteUrl(), or http://localhost:5180 when none is set. */
export function resolveSiteUrl(): string {
  return configuredSiteUrl() || FALLBACK_URL;
}

/**
 * Replaces %SITE_URL% in index.html with the site's absolute origin, which canonical links and
 * Open Graph / Twitter previews require. Falls back to http://localhost:5180 with a warning: the
 * build succeeds, but link previews won't work.
 */
export function siteUrl(): Plugin {
  let resolved = FALLBACK_URL;

  return {
    name: 'pozhegu:site-url',
    configResolved(config) {
      const configured = configuredSiteUrl();
      resolved = configured || FALLBACK_URL;

      if (!configured && config.command === 'build') {
        config.logger.warn(
          `\n⚠ SITE_URL is not set: using ${FALLBACK_URL} as the base URL.\n` +
            '  WhatsApp/Facebook link previews will not work until it is set, e.g.\n' +
            '  SITE_URL=https://example.com npm run build\n',
        );
      }
    },
    transformIndexHtml(html) {
      return html.replace(PLACEHOLDER, resolved);
    },
  };
}
