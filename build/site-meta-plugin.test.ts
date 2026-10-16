import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isDemoMode, sendsNoindexHeader } from './site-meta-plugin.ts';

describe('isDemoMode', () => {
  it('is on unless the flag is explicitly "false"', () => {
    expect(isDemoMode(undefined)).toBe(true);
    expect(isDemoMode('')).toBe(true);
    expect(isDemoMode('true')).toBe(true);
    expect(isDemoMode(' FALSE ')).toBe(false);
    expect(isDemoMode('false')).toBe(false);
  });
});

describe('sendsNoindexHeader', () => {
  const config = (headers: unknown) => JSON.stringify({ headers });

  it('finds the demo rule in the project vercel.json', () => {
    expect(sendsNoindexHeader(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))).toBe(true);
  });

  it('matches the header name in any case', () => {
    expect(
      sendsNoindexHeader(config([{ source: '/(.*)', headers: [{ key: 'x-robots-tag', value: 'noindex' }] }])),
    ).toBe(true);
  });

  it('ignores other headers and an X-Robots-Tag that allows indexing', () => {
    expect(
      sendsNoindexHeader(
        config([
          { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
          { source: '/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'all' }] },
        ]),
      ),
    ).toBe(false);
  });

  it('is false for a config without header rules or one that is not valid JSON', () => {
    expect(sendsNoindexHeader('{"framework":"vite"}')).toBe(false);
    expect(sendsNoindexHeader('{ not json')).toBe(false);
    expect(sendsNoindexHeader(config('nope'))).toBe(false);
  });
});
