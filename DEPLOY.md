# Deploying the demo

The demo is a static site on **Vercel** at https://demo.elevateurbox.com: Vercel runs
`npm run build` and serves `dist/`. Everything Vercel needs is in `vercel.json` and the
environment variables below. It stays a demo: `VITE_DEMO_MODE` is always on and every page is
noindex.

## Import the project

1. Push the repository to GitHub (or GitLab / Bitbucket).
2. In Vercel: **Add New… → Project**, pick the repository, **Import**.
3. On the configure screen, check what Vercel read from `vercel.json`:

   | Setting          | Value                                                          |
   | ---------------- | -------------------------------------------------------------- |
   | Framework Preset | Vite                                                           |
   | Root Directory   | `./` (the repository root)                                     |
   | Build Command    | `npm run build` (type-check, then `vite build`)                |
   | Output Directory | `dist`                                                         |
   | Install Command  | default (`npm install`, uses `package-lock.json`)              |
   | Node.js version  | Vercel's default (24.x) is fine; Vite 8 needs 20.19+ or 22.12+ |

4. Open **Environment Variables** on the same screen and add the variables below, then **Deploy**.

The build needs nothing outside the repository: the brand assets (`public/brand/`, icons,
`public/og/`) and, once there are renders, their optimised variants (`public/renders/*/optimized/`)
and manifest (`src/data/generated/`) are committed. The untouched render originals are **not**
needed: they only feed `npm run assets:images`, a local step.

## Environment variables

Set them in Project → Settings → Environment Variables, for Production and Preview. They are read at
build time: after changing one, redeploy (Deployments → ⋯ → Redeploy).

| Variable               | Value for the demo              | Purpose                                                                                                                                                                  |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SITE_URL`             | `https://demo.elevateurbox.com` | Base URL for the canonical link and the Open Graph / Twitter tags. Unset, the build uses `https://` + `VERCEL_PROJECT_PRODUCTION_URL` (the project's production domain). |
| `VITE_DEMO_MODE`       | `true`                          | noindex meta tag, disallow-all `robots.txt` and the `/demo-admin` panel. Unset also counts as on.                                                                        |
| `VITE_WHATSAPP_NUMBER` | leave unset                     | Off by default. If set (e.g. `+383 44 123 456`), the lead form offers a WhatsApp hand-off to that number and WhatsApp links appear. Not committed.                       |

## What the demo flag does

With `VITE_DEMO_MODE` on (anything but `false`, including unset):

- `index.html` gets `<meta name="robots" content="noindex, nofollow">`
- `dist/robots.txt` disallows everything (it replaces `public/robots.txt`)
- the unlinked `/demo-admin` status panel is built, and status changes stored in the browser apply

`vercel.json` also sends `X-Robots-Tag: noindex, nofollow` on every path. It cannot read environment
variables, so that rule is fixed; as a guard, a Vercel build with `VITE_DEMO_MODE=false` stops with an
error while the rule is present (`build/site-meta-plugin.ts`).

## What vercel.json does

- **SPA fallback:** every path except `/assets/*` and `/renders/*` rewrites to `/index.html`, so
  deep links such as `/objekti/objekti-a1/a1-501` load on refresh. Real files are always served
  first. A missing hashed asset (e.g. a chunk from an older deploy) returns a 404 rather than the
  app shell, so it is never cached for a year as HTML.
- **Caching:** `/assets/*` is `public, max-age=31536000, immutable`; `/renders/*` 30 days
  (`max-age=2592000`); `/` and `/index.html` `no-cache`. Other app routes get Vercel's default for
  HTML (`max-age=0, must-revalidate`), the same effect.
- **noindex:** `X-Robots-Tag: noindex, nofollow` on every path.
- **Compression:** Vercel serves brotli/gzip automatically.

## What is not deployed

- `public/renders/*/original/`: removed from `dist/` by `build/public-assets-plugin.ts` (and
  git-ignored).
- `review/`, `.env*` files (except `.env.example`), `node_modules/`: git-ignored.
- The polygon editor (`/editor`): only registered when `import.meta.env.DEV` is true, so its code is
  not in the production bundle and `/editor` shows the not-found page.

## Custom domain: demo.elevateurbox.com

1. Project → Settings → **Domains** → **Add Domain**, enter `demo.elevateurbox.com`.
2. At the DNS provider for `elevateurbox.com`, add the record Vercel shows. For this subdomain it is:

   | Type  | Name / host | Value / target                                        | TTL            |
   | ----- | ----------- | ----------------------------------------------------- | -------------- |
   | CNAME | `demo`      | the target Vercel shows (e.g. `cname.vercel-dns.com`) | 3600 (or Auto) |

3. Vercel issues the certificate once DNS resolves; the domain list shows "Valid Configuration".
4. Redeploy once (or make sure `SITE_URL` is set), so canonical and Open Graph URLs use the custom
   domain.
