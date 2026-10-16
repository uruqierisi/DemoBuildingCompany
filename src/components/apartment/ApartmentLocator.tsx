import { useId } from 'react';
import { RenderPicture } from '@/components/media/RenderPicture';
import type { RenderImage } from '@/data/types';

interface ApartmentLocatorProps {
  readonly render: RenderImage;
  readonly svgPath: string;
  readonly label: string;
}

/** Where the apartment sits on the façade: the building render, dimmed except for this unit. */
export function ApartmentLocator({ render, svgPath, label }: ApartmentLocatorProps) {
  const maskId = `locator-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <figure>
      <div className="relative overflow-hidden rounded-xs bg-ink">
        <RenderPicture
          image={render}
          alt=""
          sizes="(min-width: 90rem) 760px, (min-width: 64rem) 55vw, 100vw"
          className="h-auto w-full"
        />
        <svg
          viewBox={`0 0 ${render.width} ${render.height}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <mask id={maskId}>
              <rect width={render.width} height={render.height} fill="white" />
              <path d={svgPath} fill="black" />
            </mask>
          </defs>
          <rect width={render.width} height={render.height} mask={`url(#${maskId})`} className="fill-ink/45" />
          <path
            d={svgPath}
            vectorEffect="non-scaling-stroke"
            strokeWidth={2}
            className="fill-accent/15 stroke-accent"
          />
        </svg>
      </div>
      <figcaption className="mt-3 text-small text-ink-muted">{label}</figcaption>
    </figure>
  );
}
