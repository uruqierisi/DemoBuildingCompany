# Pozhegu Brothers — Garden Buildings (demo)

Pitch demo by ElevateUrBox. Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router 8. No backend: all data lives in `src/data/`.

```bash
npm install
npm run dev        # http://localhost:5180
npm run build      # typecheck + production build (set SITE_URL for working share previews, see below)
npm run lint
npm test
```

## Art direction

Editorial and architectural: calm, confident, and led by the renders. DM Sans is used throughout, with large jumps in scale: display type up to 144px with tight −4% tracking at weight 500, body text at 17/1.65, and 12px uppercase labels as the only ornament. Layouts sit on a 12-column grid (8 on tablet, 4 on phone) with a gutter that grows from 20 to 80px. Text blocks are deliberately offset against full-bleed imagery instead of centred in cards. Spacing follows an 8px rhythm with generous section spacing (88–176px). Separation comes from hairlines, never shadows. Corners are near-square (2px). Motion is slow and quiet: one ease-out curve for reveals (fade plus a small rise), 220ms for UI state changes, transform and opacity only, and nothing at all under `prefers-reduced-motion`. Orange (#F49022, the logo's own orange) is a signal, not a surface: CTAs, hotspot strokes and highlights, always with ink-coloured text on it (white on orange fails WCAG AA).

## Share previews (WhatsApp, Facebook, X)

`index.html` has static Open Graph and Twitter tags. Their URLs must be absolute, so the build fills in `%SITE_URL%` from the `SITE_URL` environment variable. On Netlify it falls back to `URL`, on Vercel to `VERCEL_PROJECT_PRODUCTION_URL`. The demo sets `SITE_URL=https://pozhegu.elevateurbox.com` in `netlify.toml`; on Vercel it can stay unset; see [DEPLOY.md](DEPLOY.md) for deployment, the demo (noindex) flag and DNS. Without any of them, the build still succeeds: it uses `http://localhost:5180` and prints a warning, and link previews won't work until `SITE_URL` is set. The share image is `public/og/garden-buildings.jpg` (1200 × 630). Favicons are generated from the logo with `node scripts/generate-icons.mjs` (see ASSETS.md).

## Tracing hotspots (dev only)

1. Put the renders in `public/renders/garden-buildings/` (sizes below), then run `npm run dev` and open `/editor`. The route and its code don't exist in production builds.
2. Pick the overview or a building render. The panel warns if the file is missing, or if its real pixel size differs from the size in the data file (`overviewSize` / `renderSize`).
3. Click to add points and click the first point to close (or press Enter). Ctrl+Z undoes a point; Esc clears.
4. Choose what the polygon belongs to, then save. The picker moves on to the next untraced item, and work is kept in the tab's session storage across reloads. The options are:
   - **On the overview:** a building. Only the buildings visible on it (`overview.buildingIds`) are offered.
   - **On a building render:** a listed apartment (for sale), an existing sold unit, or **+ Njësi e re e shitur…**. Pick a floor, and the editor creates the next free id on it (e.g. `L9-S-0301`). It stays in that mode, so the next sold unit on the same floor gets `L9-S-0302`.

   Sold units have only an id and a floor. They never appear in the apartment list and have no page.
5. **Kopjo të gjitha si JSON**, save the result as `polygons.json`, then run `node scripts/apply-polygons.ts polygons.json`. The script writes every path into `src/data/garden-buildings.ts` and creates new sold units in their building's `soldUnits`. Re-running is safe: existing entries are updated in place. Review the diff before committing.

## Contacts and WhatsApp

Every contact detail lives in `src/config/contact.ts`; nothing else hard-codes a number.

- **Sales contacts** (confirmed 2026-09-28 from Pozhegu's Google Business listing and brochures): `SALES_PHONE`, `CONTACT.email` and `CONTACT.office` (address and per-day opening hours, shown in the compact form "E hënë – e premte: 09:00–17:00" by `src/lib/opening-hours.ts`). `CONTACT_DETAILS_CONFIRMED = false` hides phone, e-mail and hours everywhere again; every entry point then opens the contact form. The address links to a Google Maps search.
- **Structured data:** the build writes a schema.org `RealEstateAgent` (name, address, phone, e-mail, opening hours) into `index.html` from the same file (`src/lib/structured-data.ts`, `build/site-meta-plugin.ts`). `contact.ts` therefore uses relative imports only.
- **WhatsApp hand-off:** after a lead is sent, the success state offers "Dërgo edhe në WhatsApp", which opens wa.me with a pre-written message (apartment, building, type, m², floor, buyer's name). The number comes from `WHATSAPP_NUMBER` in that file, or from `VITE_WHATSAPP_NUMBER` in `.env.local` / the host's environment (see `.env.example`, resolved in `src/lib/whatsapp.ts`), which keeps a personal demo number out of the source. The same number drives the WhatsApp button in the sticky mobile bar and the WhatsApp links. When both are empty, every WhatsApp action is hidden.
- **Phone validation** (`src/lib/phone.ts`): Kosovo numbers are checked strictly (`04X XXX XXX`, `+383 …`, `00383 …`, mobile 043–049, fixed 028/029/038/039); other international numbers are accepted with a length check, for buyers abroad.

## Apartment statuses and the demo admin

Each listed apartment is `available` (Në shitje), `reserved` (E rezervuar) or `sold` (E shitur):

- **Sold:** grey on the render with a floor-only tooltip, out of the list and every count (building page, overview, project stats). Its page stays and shows "Kjo banesë është shitur" with the building's other apartments for sale.
- **Reserved:** stays in the list with a badge and keeps its page, and is not counted as "në shitje". It is drawn as a diagonal ochre hatch with an outline (render, legend, list, tooltip, admin; `StatusMark`, `bg-hatch-reserved`), so it never relies on hue alone: ≥ 4.8:1 stripe contrast on the façade, ≥ 3.3:1 when the render is dimmed.

`/demo-admin` exists only in demo builds (`VITE_DEMO_MODE`, see DEPLOY.md), is not linked anywhere and is noindex like the rest of the demo. It toggles statuses; changes are kept in this browser's localStorage (`src/lib/status-store.ts`) and applied site-wide through `useProject()`. They reach other tabs of the same browser at once, but not other devices, since there is no backend. "Rikthe të dhënat fillestare" clears them. Builds with the flag off never read the stored changes.

## Routes

| Path | Page |
| --- | --- |
| `/` | Project home with the overview render |
| `/objekti/:buildingId` | Building: façade with apartments for sale and sold units, filterable list (`?dhoma=&kati=`) |
| `/objekti/:buildingId/:apartmentId` | Apartment for sale: facts, zoomable plan or "Kërko planin", location on the façade, lead form, previous/next |

The building and apartment pages are lazy-loaded chunks; `/editor` exists only in development. Unknown buildings, unknown apartments and sold units return the not-found page from the route loaders. The host must rewrite unknown paths to `index.html` (SPA fallback) and should serve `/assets/*` with long-lived immutable caching and brotli/gzip; `netlify.toml` and `vercel.json` do both.

## Structure

```
build/public-assets-plugin.ts  Lists files in /public/renders and /public/brand (virtual:public-assets)
build/site-url-plugin.ts        Fills %SITE_URL% in index.html for share previews
build/site-meta-plugin.ts       JSON-LD for the sales office; demo mode (noindex meta, X-Robots-Tag, robots.txt)
scripts/                        generate-icons.mjs (favicons from the logo), apply-polygons.ts (editor export → data)
src/app/                        Router, root layout, route handles, loaders (unknown building → 404)
src/config/                     Site, contact (confirmed sales details, WhatsApp) and company config (official figures)
src/data/                       Domain types, project data, project registry
src/lib/                        Pure helpers: inventory selectors, Albanian formatting (unit-tested)
src/hooks/                      useInView, useMediaQuery, usePageMeta
src/components/layout/          Header, mobile menu, footer, sticky contact bar, section links
src/components/media/           RenderPicture (AVIF/WebP/JPEG srcsets), PanScroller (sideways pan on narrow screens)
src/components/hotspots/        Shared polygon layer: SVG-mask dimming, hover/tap, viewport-clamped tooltip
src/components/building/        Building page: header, façade stage with legend, filterable apartment list
src/components/contact/         Contact dialog (native <dialog>), lead form with WhatsApp hand-off, contact buttons
src/components/apartment/       Apartment page: floor plan + zoom viewer, plan request block, façade locator, pager
src/components/ui/              Buttons, icon set
src/pages/                      Route components (see Routes)
src/features/editor/            Dev-only hotspot editor (/editor)
src/styles/index.css            Brand tokens (@theme): colours, type scale, spacing, radii, motion
```

Adding another project means adding a data file shaped like `src/data/garden-buildings.ts` and registering it in `src/data/projects.ts`.

## Assets

Brand SVGs from pozhegubrothers.com, and exactly what was changed in them, are documented in [ASSETS.md](ASSETS.md).

### Renders, floor plans and the share image

Everything below is regenerated by `npm run assets:images` from the untouched originals in `public/renders/<project>/original/`, as described in `scripts/renders.config.json`:

- `renders`: working name → original. AVIF/WebP/JPEG variants (640–3840 px, no upscaling) go to `public/renders/<project>/optimized/`.
- `plans`: floor plans cropped out of Pozhegu's brochure sheets (crop box in original pixels), with the same variants.
- `og`: the 1200 × 630 share image.
- A manifest with every image's real pixel size goes to `src/data/generated/`. The data file references images by name (`render('<name>')`); an unknown name fails immediately.

The originals are git-ignored. On a fresh clone, `npm run assets:images:fetch` re-downloads them from the source URLs in the config, then regenerates everything.

Renders are optional per building (`render`). The overview (`overview.image`) lists the buildings visible on it (`overview.buildingIds`), and only those can be traced on it. Polygons (`svgPath`) are optional everywhere. Anything without a render or polygon stays fully reachable through the building list. Polygon coordinates are in the original's pixels (for example 3840 × 2160).

### Other files

| File | Notes |
| --- | --- |
| `public/brand/pozhegu-logo.svg` | Official logo (optimised copy); see ASSETS.md |
| `public/brand/pozhegu-logo-white.svg` | White-wordmark copy, used over the hero render only |
| `public/og/garden-buildings.jpg` | Share image, 1200 × 630 |
