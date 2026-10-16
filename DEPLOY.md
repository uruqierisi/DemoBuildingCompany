# Deploying the demo

The demo is a static site: the host runs `npm run build` and serves `dist/`. It is set up for two
hosts, and both configurations are kept working:

- **Vercel** (current host): `vercel.json`, see [Vercel](#vercel) below.
- **Netlify**: `netlify.toml`; the sections up to "Custom domain" describe it.

Everything below except the environment variable marked "Netlify UI" is already in `netlify.toml`.

## Build settings

| Setting | Value |
| --- | --- |
| Build command | `npm run build` (type-check, then `vite build`) |
| Publish directory | `dist` |
| Node version | 22 (`NODE_VERSION` in `netlify.toml`; Vite 8 needs 20.19+ or 22.12+) |

The build needs nothing outside the repository: the optimised renders (`public/renders/*/optimized/`),
the render manifest (`src/data/generated/`) and the share image (`public/og/`) are committed. The
untouched originals are **not** needed: they only feed `npm run assets:images`, a local step to run
again only if renders are replaced.

## Environment variables

| Variable | Example | Where | Purpose |
| --- | --- | --- | --- |
| `SITE_URL` | `https://pozhegu.elevateurbox.com` | `netlify.toml` | Base URL for the canonical link, Open Graph tags and JSON-LD. Without it the build falls back to Netlify's `URL`. |
| `VITE_DEMO_MODE` | `true` | `netlify.toml` | Keeps the demo out of search engines (see below). The real launch sets `false`. |
| `VITE_WHATSAPP_NUMBER` | `+383 44 123 456` | **Netlify UI** → Site configuration → Environment variables | WhatsApp hand-off after the lead form, the WhatsApp button in the sticky mobile bar and the WhatsApp links. Your number for the demo; not committed. Empty: all WhatsApp actions are hidden. |

Variables are read at build time: after changing one, trigger a new deploy.

## What the demo flag does

With `VITE_DEMO_MODE` on (anything but `false`, including unset):

- `index.html` gets `<meta name="robots" content="noindex, nofollow">`
- `dist/_headers` adds `X-Robots-Tag: noindex, nofollow` to every path
- `dist/robots.txt` disallows everything (it replaces `public/robots.txt`)
- the unlinked `/demo-admin` status panel is built, and status changes stored in the browser apply

With `VITE_DEMO_MODE=false`, none of these are written or built and `public/robots.txt` (allow all) ships. The
JSON-LD for the sales office is written into `index.html` in both modes.

## Routing, caching, compression

- **SPA fallback:** `/*` rewrites to `/index.html` (status 200), so deep links such as
  `/objekti/objekti-l9/l9-301` load on refresh. Real files are served first.
- **Caching:** `/assets/*` (content-hashed JS, CSS, fonts) is `max-age=31536000, immutable`;
  `/renders/*` is 30 days (file names are not hashed); `/` and `/index.html` are `no-cache`.
- **Compression:** Netlify serves brotli/gzip automatically. Nothing in this setup prevents it:
  no pre-compressed files, no `Content-Encoding` or `no-transform` headers.

## What is not deployed

- `public/renders/*/original/` and `public/brand/original/`: removed from `dist/` by
  `build/public-assets-plugin.ts` (the render originals are also git-ignored).
- `review/`, `.env*` files (except `.env.example`), `node_modules/`: git-ignored.
- The polygon editor (`/editor`): only registered when `import.meta.env.DEV` is true, so its code is
  not in the production bundle and `/editor` shows the not-found page.

## Custom domain: pozhegu.elevateurbox.com

1. In Netlify: Domain management → Add a domain → `pozhegu.elevateurbox.com`.
2. At the DNS provider for `elevateurbox.com`, add:

   | Type | Name / host | Value / target | TTL |
   | --- | --- | --- | --- |
   | CNAME | `pozhegu` | `<your-site-name>.netlify.app` | 3600 (or Auto) |

   `<your-site-name>` is the name Netlify gave the site (Site configuration → Site details).
   If `elevateurbox.com` uses Netlify DNS instead, Netlify adds this record itself.
3. Once DNS resolves, Netlify issues the Let's Encrypt certificate automatically; then turn on
   "Force HTTPS" if it is not already on.

## Vercel

`vercel.json` holds the build settings, the SPA fallback and the headers. Vercel ignores
`netlify.toml` and the `_headers` file the build writes for Netlify (it is served as a plain file there).

### Import the project

1. Push the repository to GitHub (or GitLab / Bitbucket).
2. In Vercel: **Add New… → Project**, pick the repository, **Import**.
3. On the configure screen, check what Vercel read from `vercel.json`:

   | Setting | Value |
   | --- | --- |
   | Framework Preset | Vite |
   | Root Directory | `./` (the repository root) |
   | Build Command | `npm run build` (type-check, then `vite build`) |
   | Output Directory | `dist` |
   | Install Command | default (`npm install`, uses `package-lock.json`) |
   | Node.js version | Vercel's default (24.x) is fine; Vite 8 needs 20.19+ or 22.12+ (Project → Settings → Build and Deployment) |

4. Open **Environment Variables** on the same screen and add the variables below, then **Deploy**.

### Environment variables

Set them in Project → Settings → Environment Variables, for Production and Preview. They are read at
build time: after changing one, redeploy (Deployments → ⋯ → Redeploy).

| Variable | Value for the demo | Purpose |
| --- | --- | --- |
| `VITE_WHATSAPP_NUMBER` | your number, e.g. `+383 44 123 456` | WhatsApp hand-off after the lead form, the WhatsApp button in the sticky mobile bar and the WhatsApp links. Empty: all WhatsApp actions are hidden. |
| `VITE_DEMO_MODE` | `true` | noindex meta tag, disallow-all `robots.txt` and the `/demo-admin` panel. Unset counts as on. |
| `SITE_URL` | optional | Base URL for the canonical link, Open Graph tags and JSON-LD. Unset, the build uses `https://` + `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel sets to the project's production domain: the `.vercel.app` address, or the custom domain once one is attached. Set it only to force a different URL. |

Preview deployments get the production URL as canonical, which is what search engines and share
previews should use.

### What vercel.json does

- **SPA fallback:** every path except `/assets/*` and `/renders/*` rewrites to `/index.html`, so
  deep links such as `/objekti/objekti-l9/l9-301` load on refresh. Real files are always served
  first. A missing hashed asset (e.g. a chunk from an older deploy) returns a 404 rather than the
  app shell, so it is never cached for a year as HTML.
- **Caching:** `/assets/*` is `public, max-age=31536000, immutable`; `/renders/*` 30 days
  (`max-age=2592000`); `/` and `/index.html` `no-cache`. Other app routes get Vercel's default for
  HTML (`max-age=0, must-revalidate`), the same effect.
- **noindex:** `X-Robots-Tag: noindex, nofollow` on every path.
- **Compression:** Vercel serves brotli/gzip automatically.

`vercel.json` cannot read environment variables, so unlike Netlify's generated `_headers` the
X-Robots-Tag rule does not switch off with `VITE_DEMO_MODE`. The build guards against forgetting it:
a Vercel build with `VITE_DEMO_MODE=false` stops with an error while `vercel.json` still sends
`noindex` (`build/site-meta-plugin.ts`). For the launch, delete the last entry of `headers` (the
`"source": "/(.*)"` block with `X-Robots-Tag`) and set `VITE_DEMO_MODE=false` in the same deploy.

### Custom domain later

1. Project → Settings → **Domains** → **Add Domain**, enter e.g. `pozhegu.elevateurbox.com`.
2. At the DNS provider for `elevateurbox.com`, add the record Vercel shows. For a subdomain it is:

   | Type | Name / host | Value / target | TTL |
   | --- | --- | --- | --- |
   | CNAME | `pozhegu` | the target Vercel shows (e.g. `cname.vercel-dns.com`) | 3600 (or Auto) |

   An apex domain (e.g. `pozhegubrothers.com`) uses an `A` record to the IP Vercel shows instead.
   If the old Netlify CNAME for the same name exists, replace it.
3. Vercel issues the certificate once DNS resolves; the domain list shows "Valid Configuration".
4. Redeploy once, so canonical and Open Graph URLs switch from the `.vercel.app` address to the
   custom domain (or set `SITE_URL` to it).

## Before the real launch

- Set `VITE_DEMO_MODE=false` and `SITE_URL` to the launch domain. On Vercel, also remove the
  `X-Robots-Tag` rule from `vercel.json` (the build refuses to run until you do).
- Point WhatsApp at Pozhegu's sales WhatsApp: `WHATSAPP_NUMBER` in `src/config/contact.ts`, or
  `VITE_WHATSAPP_NUMBER` on the host.
- Connect the lead form to a real endpoint (it currently only shows its success state).
