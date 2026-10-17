# Assets

Every asset in this repository is original to the demo or generated from data in it. Nothing comes
from a real developer's website, brochure or social profile.

## Brand

The Arrita Ndërtim logo, favicons, touch icons and share image are drawn by
`scripts/generate-brand.mjs` (`npm run assets:brand`) from geometry defined in that script, with
colours read from the tokens in `src/styles/index.css`. The lettering is a monoline alphabet drawn
for this project; no font file is involved. See the table in the README for each output file.

## Icons

All UI icons (arrows, phone, mail, chat, menu, close, zoom) come from our own line set in
`src/components/ui/Icon.tsx`. There are no social icons: the fictional developer has no profiles.

## Fonts

DM Sans (variable, SIL Open Font License), self-hosted through `@fontsource-variable/dm-sans`.

## Renders

Both renders are AI-generated images, made for this demo on 2026-10-17 with Canva's image
generation (through the Canva connector, in ElevateUrBox's Canva account) from text prompts that
describe a fictional complex: no real building, site, brand or person is depicted. They were exported
from Canva at their native size as PNG, then upscaled 2× (see below). The upscaled files are the
originals in `public/renders/demo/original/` (git-ignored); the Canva exports are kept beside them in
`original/pre-upscale/`. `npm run assets:images` generates the AVIF/WebP/JPEG variants and the
manifest.

| Original     | Size                                                    | Prompt (summary)                                                                                                                                                                                                                                                      | Used as                                                                                                                                    |
| ------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `aerial.png` | 3360 × 1888 PNG (Canva export 1680 × 944, upscaled 2×)  | Aerial view at ~45° of a modern complex of four separate buildings on a 2 × 2 grid, two taller towers behind and two lower blocks in front, white and light grey facades with wood accents, balconies with glass railings, green courtyards; no text, logos or people | `overview`: the home hero and the building selector. Buildings traced: A1 (back left), A2 (back right), B1 (front left), B2 (front right). |
| `facade.png` | 2272 × 2816 PNG (Canva export 1136 × 1408, upscaled 2×) | Straight-on frontal elevation of one tower of the same architecture: ground floor with two units and a glazed entrance, typical floors of four apartment bays, set-back top floor with two penthouse terraces                                                         | `objekti-a1`: A1's facade, every apartment traced                                                                                          |

The image generator did not follow the requested floor counts exactly; the data follows the images
(towers ground floor + 9, low blocks ground floor + 5). The towers on the aerial show a different
bay rhythm from the facade render, as the two images were generated separately; both read as the
same architecture at the sizes they are shown.

### Upscaling

The Canva exports were too soft for a full-width hero, so both were upscaled locally on 2026-10-17
with **Real-ESRGAN** (`realesrgan-ncnn-vulkan` v0.2.5.0, Windows build from the official GitHub
release https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0), model **realesrgan-x4plus**:

1. `realesrgan-ncnn-vulkan -n realesrgan-x4plus -s 4`: 4× output (the model is 4× only).
2. Downscaled to exactly 2× with a Lanczos-3 resize (sharp).
3. `aerial.png` only: blended 75 % Real-ESRGAN with 25 % of the original enlarged 2× with Lanczos-3.
   Pure Real-ESRGAN made paving and lawns look painted and drew small crack lines into the paving;
   the blend keeps the sharpened buildings and brings back the original texture there.
   `facade.png` is pure Real-ESRGAN, which reads clean on the facade.

Every polygon coordinate was doubled with the images (`review/overlays/polygons.json`; the 1×
version is `polygons-pre-upscale.json`) and checked again with the overlays. A 1920 px hero
before/after comparison is in `review/upscale/`.

Polygon review overlays (each outline drawn on its image with its id and status colour) are in
`review/overlays/` (git-ignored), together with the `polygons.json` that was applied.

## Floor plans

None. Every apartment page offers "Kërko planin" instead of a floor plan.
