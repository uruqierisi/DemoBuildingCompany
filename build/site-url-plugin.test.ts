import { afterEach, describe, expect, it, vi } from 'vitest';
import { configuredSiteUrl, resolveSiteUrl } from './site-url-plugin.ts';

type SiteUrlEnv = Partial<Record<'SITE_URL' | 'VERCEL_PROJECT_PRODUCTION_URL', string>>;

function stubEnv(env: SiteUrlEnv): void {
  vi.stubEnv('SITE_URL', env.SITE_URL ?? '');
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', env.VERCEL_PROJECT_PRODUCTION_URL ?? '');
}

describe('configuredSiteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers SITE_URL and drops a trailing slash', () => {
    stubEnv({ SITE_URL: 'https://demo.elevateurbox.com/', VERCEL_PROJECT_PRODUCTION_URL: 'demo-x.vercel.app' });
    expect(configuredSiteUrl()).toBe('https://demo.elevateurbox.com');
  });

  it("falls back to Vercel's production domain, which comes without a scheme", () => {
    stubEnv({ VERCEL_PROJECT_PRODUCTION_URL: 'demo-x.vercel.app' });
    expect(configuredSiteUrl()).toBe('https://demo-x.vercel.app');
  });

  it('is empty without either; the build then uses the local preview URL', () => {
    stubEnv({});
    expect(configuredSiteUrl()).toBe('');
    expect(resolveSiteUrl()).toBe('http://localhost:5180');
  });
});
