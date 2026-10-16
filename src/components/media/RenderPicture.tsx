import type { RenderImage } from '@/data/types';

interface RenderPictureProps {
  readonly image: RenderImage;
  readonly alt: string;
  /** Rendered width hint for the browser, e.g. "100vw" or "(min-width: 64rem) 58vw, 100vw". */
  readonly sizes: string;
  readonly className?: string;
  /** Above-the-fold image: loads eagerly with high fetch priority. */
  readonly priority?: boolean;
}

/** Largest JPEG at or below this width is the fallback `src` for browsers without srcset. */
const FALLBACK_WIDTH = 1600;

const srcSet = (image: RenderImage, format: 'avif' | 'webp' | 'jpeg') =>
  image.variants.map((variant) => `${variant[format]} ${variant.width}w`).join(', ');

/** Responsive render: AVIF, then WebP, then JPEG, each at every generated width. */
export function RenderPicture({ image, alt, sizes, className, priority = false }: RenderPictureProps) {
  const fallback = image.variants.findLast((variant) => variant.width <= FALLBACK_WIDTH) ?? image.variants[0];

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(image, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image, 'webp')} sizes={sizes} />
      <img
        src={fallback?.jpeg}
        srcSet={srcSet(image, 'jpeg')}
        sizes={sizes}
        alt={alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={className}
      />
    </picture>
  );
}
