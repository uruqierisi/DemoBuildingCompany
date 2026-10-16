/**
 * Fixed bars that cover an edge of the viewport (the site header, the mobile contact bar) carry
 * data-fixed-edge="top" | "bottom", so floating UI such as hotspot tooltips can stay clear of them.
 */
export const FIXED_EDGE_ATTRIBUTE = 'data-fixed-edge';

export interface ViewportBand {
  readonly top: number;
  readonly bottom: number;
}

function edgeRects(edge: 'top' | 'bottom'): DOMRect[] {
  return [...document.querySelectorAll(`[${FIXED_EDGE_ATTRIBUTE}="${edge}"]`)]
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight);
}

/** The vertical band of the viewport, in client pixels, that no fixed bar covers. */
export function uncoveredViewport(): ViewportBand {
  return {
    top: Math.max(0, ...edgeRects('top').map((rect) => rect.bottom)),
    bottom: Math.min(window.innerHeight, ...edgeRects('bottom').map((rect) => rect.top)),
  };
}
