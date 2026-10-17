# Rezidenca Arrita (portfolio demo by ElevateUrBox)

A fully **fictional** residential project, built by ElevateUrBox as a portfolio piece: the developer
(Arrita Ndërtim), the project, the four buildings, every apartment, area and sales status, and the
brand are invented. Live at https://demo.elevateurbox.com (noindex).

Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router 8. No backend: all data lives in `src/data/`.

```bash
npm install
npm run dev        # http://localhost:5180
npm run build      # typecheck + production build (set SITE_URL for working share previews, see below)
npm run lint
npm test
```

## Art direction

Editorial and architectural: calm, confident, led by type and, once there are renders, by the renders. DM Sans is used throughout, with large jumps in scale: display type up to 144px with tight −4% tracking at weight 500, body text at 17/1.65, and 12px uppercase labels as the only ornament. Layouts sit on a 12-column grid (8 on tablet, 4 on phone) with a gutter that grows from 20 to 80px. Text blocks are deliberately offset instead of centred in cards. Spacing follows an 8px rhythm with generous section spacing (88–176px). Separation comes from hairlines, never shadows (the floating demo badge is the one exception). Corners are near-square (2px). Motion is slow and quiet: one ease-out curve for reveals (fade plus a small rise), 220ms for UI state changes, transform and opacity only, and nothing at all under `prefers-reduced-motion`.

The accent is the brand cerulean `#5B9FD6`, chosen to stay clear of the status hues (green = for sale, ochre = reserved, grey = sold) and of the danger red. It is a signal, not a surface: CTAs, hotspot strokes and highlights, always with ink-coloured text on it (6.5:1). Accent-coloured text on light grounds uses `--color-accent-ink` (`#1D5C8C`, 6.3:1 on paper).

## Brand

The logo is an original typographic lockup: an accent square with a gable "A" whose crossbar is a single window, next to the wordmark ARRITA in a monoline geometric capital drawn for this project. `npm run assets:brand` (`scripts/generate-brand.mjs`) generates every brand asset from that one geometry, with colours read from `src/styles/index.css`:

| File                                                                       | Notes                                                                 |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `public/brand/arrita-logo.svg`                                             | Lockup with ink wordmark, for paper and white grounds                 |
| `public/brand/arrita-logo-white.svg`                                       | Lockup with white wordmark, for ink grounds (hero, footer, open menu) |
| `public/favicon.svg`, `favicon.ico`                                        | The mark alone (ICO holds 32 and 16 px)                               |
| `public/apple-touch-icon.png`, `public/icons/icon-192.png`, `icon-512.png` | The mark, full bleed                                                  |
| `public/og/rezidenca-arrita.jpg`                                           | Share image, 1200 × 630: lockup on ink, "Demo nga ElevateUrBox"       |

## Demo notices

The site says it is a demo everywhere a visitor could take it for real:

- a fixed, dismissible **"Demo nga ElevateUrBox"** badge in the bottom-right corner of every page, linking to https://elevateurbox.com (`src/components/demo/DemoBadge.tsx`; dismissal lasts for the browser session)
- a demo notice where a real site shows its sales office (contact section, footer)
- the lead form: "Demo: të dhënat nuk dërgohen dhe nuk ruhen askund" under the submit button, and a success state that says nothing was sent
- the share image, the page titles and the meta descriptions

The wording lives in `DEMO` in `src/config/site.ts`.

## Share previews (WhatsApp, Facebook, X)

`index.html` has static Open Graph and Twitter tags. Their URLs must be absolute, so the build fills in `%SITE_URL%` from the `SITE_URL` environment variable, falling back to `VERCEL_PROJECT_PRODUCTION_URL` on Vercel. The demo uses `SITE_URL=https://demo.elevateurbox.com`; see [DEPLOY.md](DEPLOY.md) for deployment, the demo (noindex) flag and DNS. Without either variable the build still succeeds: it uses `http://localhost:5180` and prints a warning, and link previews won't work.

## Data

`src/data/rezidenca-arrita.ts` is the fictional inventory, marked as such at the top: two towers (A1, A2: ground floor + 9) and two lower blocks (B1, B2: ground floor + 5), as on the aerial render, with 104 apartments from studios to penthouses and a fixed mix of statuses. A1 follows its facade render bay by bay; there a few apartments are for sale or reserved and the rest are sold. Units stack, so each position on a typical floor has the same type. There are no floor plans: every apartment page offers "Kërko planin" instead. `src/data/rezidenca-arrita.test.ts` checks the data's integrity.

Headline figures are always derived from the data (`src/lib/inventory.ts`): what is for sale in the project section, the whole project (buildings, apartments, m², sold) in "Në shifra". There is no company history and no testimonials section.

## Tracing hotspots (dev only)

1. Put the renders in `public/renders/demo/original/`, list them in `scripts/renders.config.json`, run `npm run assets:images`, and reference them from the data file with `render('<name>')`.
2. Run `npm run dev` and open `/editor`. The route and its code don't exist in production builds. Pick the overview or a building render.
3. Click to add points and click the first point to close (or press Enter). Ctrl+Z undoes a point; Esc clears.
4. Choose what the polygon belongs to, then save. The picker moves on to the next untraced item, and work is kept in the tab's session storage across reloads. The options are:
   - **On the overview:** a building. Only the buildings visible on it (`overview.buildingIds`) are offered.
   - **On a building render:** an apartment, an existing sold unit, or **+ Njësi e re e shitur…**. Pick a floor, and the editor creates the next free id on it (e.g. `A1-S-0301`). It stays in that mode, so the next sold unit on the same floor gets `A1-S-0302`.

   Sold units have only an id and a floor. They never appear in the apartment list and have no page.

5. **Kopjo të gjitha si JSON**, save the result as `polygons.json`, then run `node scripts/apply-polygons.ts polygons.json`. The script writes every path into `src/data/rezidenca-arrita.ts` and creates new sold units in their building's `soldUnits`. Re-running is safe: existing entries are updated in place. Review the diff before committing.

## Contacts and WhatsApp

The demo has no contact details on purpose: `CONTACT_DETAILS` in `src/config/contact.ts` is `null`, so no phone number, e-mail, address, opening hours or map link appears anywhere, and every contact entry point opens the lead form. A real deployment sets it with `createContactDetails({ phone, email, office })`, which validates the phone number; the call, e-mail and office layouts then appear in the header, contact section, footer, mobile menu and sticky mobile bar.

- **WhatsApp hand-off:** after a lead is "sent", the success state can offer "Dërgo edhe në WhatsApp", which opens wa.me with a pre-written message (apartment, building, type, m², floor, buyer's name). It is **off by default** and only appears when `VITE_WHATSAPP_NUMBER` is set (`.env.local` or the host's environment, see `.env.example`; resolved in `src/lib/whatsapp.ts`).
- **Phone validation** (`src/lib/phone.ts`): Kosovo numbers are checked strictly (`04X XXX XXX`, `+383 …`, `00383 …`, mobile 043–049, fixed 028/029/038/039); other international numbers are accepted with a length check.

## Apartment statuses and the demo admin

Each apartment is `available` (Në shitje), `reserved` (E rezervuar) or `sold` (E shitur):

- **Sold:** grey on the render with a floor-only tooltip, out of the list and every for-sale count. Its page stays and shows "Kjo banesë është shitur" with the building's other apartments for sale.
- **Reserved:** stays in the list with a badge and keeps its page, and is not counted as "në shitje". It is drawn as a diagonal ochre hatch with an outline (render, legend, list, tooltip, admin; `StatusMark`, `bg-hatch-reserved`), so it never relies on hue alone.

`/demo-admin` exists only in demo builds (`VITE_DEMO_MODE`, see DEPLOY.md), is not linked anywhere and is noindex like the rest of the site. It toggles statuses; changes are kept in this browser's localStorage (`src/lib/status-store.ts`) and applied site-wide through `useProject()`. "Rikthe të dhënat fillestare" clears them.

## Routes

| Path                                | Page                                                                                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                 | Project home: hero, project, buildings, figures, contact                                                                                      |
| `/objekti/:buildingId`              | Building: façade with apartments when a render exists, filterable list (`?dhoma=&kati=`)                                                      |
| `/objekti/:buildingId/:apartmentId` | Apartment: facts, plan or "Kërko planin", location on the façade when traced, lead form, previous/next; sold apartments show the "sold" state |

The building and apartment pages are lazy-loaded chunks; `/editor` exists only in development. Unknown buildings and apartments return the not-found page from the route loaders. `vercel.json` rewrites unknown paths to `index.html` (SPA fallback) and caches `/assets/*` as immutable.

The aerial render is the home hero and the clickable overview (all four buildings traced); A1 has its facade render with every apartment traced. A2, B1 and B2 have no facade render, so their pages are text-led, like any part of the data without an image (`heroImage`, `overview`, building `render` are all optional).

## Structure

```
build/public-assets-plugin.ts  Lists files in /public/renders and /public/brand (virtual:public-assets)
build/site-url-plugin.ts        Fills %SITE_URL% in index.html for share previews
build/site-meta-plugin.ts       Demo mode: noindex meta, robots.txt, __DEMO_MODE__
scripts/                        generate-brand.mjs (logo, icons, share image), optimize-renders.mjs, apply-polygons.ts
src/app/                        Router, root layout, route handles, loaders (unknown building → 404)
src/config/                     Site and demo wording, contact details (none in the demo)
src/data/                       Domain types, the fictional project data, project registry
src/lib/                        Pure helpers: inventory selectors, Albanian formatting (unit-tested)
src/hooks/                      useInView, useMediaQuery, usePageMeta
src/components/layout/          Header, mobile menu, footer, sticky contact bar, section links
src/components/demo/            Demo badge and demo notice
src/components/media/           RenderPicture (AVIF/WebP/JPEG srcsets), PanScroller (sideways pan on narrow screens)
src/components/hotspots/        Shared polygon layer: SVG-mask dimming, hover/tap, viewport-clamped tooltip
src/components/building/        Building page: header, façade stage with legend, filterable apartment list
src/components/contact/         Contact dialog (native <dialog>), lead form with optional WhatsApp hand-off
src/components/apartment/       Apartment page: floor plan + zoom viewer, plan request block, façade locator, pager
src/components/ui/              Buttons, icon set
src/pages/                      Route components (see Routes)
src/features/editor/            Dev-only hotspot editor (/editor)
src/styles/index.css            Brand tokens (@theme): colours, type scale, spacing, radii, motion
```

Adding another project means adding a data file shaped like `src/data/rezidenca-arrita.ts` and registering it in `src/data/projects.ts`.

## Images

See [ASSETS.md](ASSETS.md) for where every image comes from. Renders and plans are regenerated by `npm run assets:images` from the untouched originals in `public/renders/<project>/original/` (git-ignored), as described in `scripts/renders.config.json`:

- `renders`: working name → original (or `{ original, crop }`). AVIF/WebP/JPEG variants (640–3840 px, no upscaling) go to `public/renders/<project>/optimized/`.
- `plans`: floor plans cropped out of larger sheets (crop box in original pixels), with the same variants.
- A manifest with every image's real pixel size goes to `src/data/generated/<project>-renders.json`. The data file references images by name (`render('<name>')`); an unknown name fails immediately.

The variants and the manifest are committed, so a build never needs the originals. Polygon coordinates are in the original's (or the crop's) pixels.
