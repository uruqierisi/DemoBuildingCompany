import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadEnv, type Plugin } from 'vite';
import { buildRealEstateAgentJsonLd, serializeJsonLd } from '../src/lib/structured-data.ts';
import { resolveSiteUrl } from './site-url-plugin.ts';

/**
 * Demo mode (VITE_DEMO_MODE) keeps the site out of search engines with three layers:
 *   - <meta name="robots" content="noindex, nofollow"> in index.html
 *   - an X-Robots-Tag header on every path (Netlify: dist/_headers, written here; Vercel: a fixed
 *     rule in vercel.json, see assertNoVercelNoindex)
 *   - a robots.txt that disallows everything
 * It is ON unless VITE_DEMO_MODE is exactly "false", so a missing variable can never expose the
 * demo to indexing. The real launch sets VITE_DEMO_MODE=false.
 */
export function isDemoMode(value: string | undefined): boolean {
  return value?.trim().toLowerCase() !== 'false';
}

interface HeaderRule {
  readonly headers?: ReadonlyArray<{ readonly key?: unknown; readonly value?: unknown }>;
}

/** True when a vercel.json source sends X-Robots-Tag: noindex on some path. */
export function sendsNoindexHeader(vercelJson: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(vercelJson);
  } catch {
    return false; // Vercel rejects an unreadable vercel.json itself.
  }
  const rules = typeof parsed === 'object' && parsed !== null ? (parsed as { headers?: unknown }).headers : null;
  if (!Array.isArray(rules)) return false;
  return (rules as HeaderRule[]).some((rule) =>
    (Array.isArray(rule?.headers) ? rule.headers : []).some(
      (header) =>
        typeof header?.key === 'string' &&
        header.key.toLowerCase() === 'x-robots-tag' &&
        /noindex/i.test(String(header.value)),
    ),
  );
}

/**
 * vercel.json cannot read environment variables, so on Vercel the demo's X-Robots-Tag header is a
 * fixed rule there rather than generated like Netlify's _headers. A launch build on Vercel
 * (VITE_DEMO_MODE=false) stops while that rule is still present, instead of shipping the real site
 * with noindex.
 */
function assertNoVercelNoindex(root: string): void {
  const file = path.resolve(root, 'vercel.json');
  if (!existsSync(file) || !sendsNoindexHeader(readFileSync(file, 'utf8'))) return;
  throw new Error(
    'VITE_DEMO_MODE=false, but vercel.json still sends "X-Robots-Tag: noindex, nofollow" on every path. ' +
      'Remove that header rule from vercel.json for the launch (see DEPLOY.md, "Before the real launch").',
  );
}

const DEMO_ROBOTS_TXT = 'User-agent: *\nDisallow: /\n';
const DEMO_HEADERS = '/*\n  X-Robots-Tag: noindex, nofollow\n';

/**
 * Build-time page metadata: the demo-mode robots rules above, and the sales office as schema.org
 * JSON-LD (from src/config/contact.ts) written straight into index.html, so crawlers read it
 * without running JavaScript.
 */
export function siteMeta(): Plugin {
  let isDemo = true;
  let outDir = '';
  let isBuild = false;

  return {
    name: 'pozhegu:site-meta',
    config(userConfig, { mode }) {
      const env = loadEnv(mode, userConfig.envDir || userConfig.root || process.cwd(), 'VITE_');
      isDemo = isDemoMode(env.VITE_DEMO_MODE);
      // The app reads the same decision as a constant, so demo-only code (the /demo-admin route,
      // stored status changes) is dropped from builds with the flag off.
      return { define: { __DEMO_MODE__: JSON.stringify(isDemo) } };
    },
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      isBuild = config.command === 'build';
      // process.env.VERCEL is "1" on Vercel builds only.
      if (isBuild && !isDemo && process.env.VERCEL) assertNoVercelNoindex(config.root);
      if (isBuild) {
        config.logger.info(
          isDemo
            ? 'Demo mode ON (VITE_DEMO_MODE): noindex meta, X-Robots-Tag header, disallow-all robots.txt, /demo-admin.'
            : 'Demo mode OFF: the site can be indexed; /demo-admin is not built.',
        );
      }
    },
    transformIndexHtml() {
      const jsonLd = serializeJsonLd(buildRealEstateAgentJsonLd(resolveSiteUrl()));
      return [
        ...(isDemo
          ? [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' as const }]
          : []),
        { tag: 'script', attrs: { type: 'application/ld+json' }, children: jsonLd, injectTo: 'head' as const },
      ];
    },
    closeBundle() {
      if (!isBuild || !isDemo) return;
      // Written after Vite copies /public, so they replace public/robots.txt (which allows indexing).
      writeFileSync(path.join(outDir, 'robots.txt'), DEMO_ROBOTS_TXT);
      writeFileSync(path.join(outDir, '_headers'), DEMO_HEADERS);
    },
  };
}
