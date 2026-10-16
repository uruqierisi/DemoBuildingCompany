/** Per-route layout options, set via the route's `handle`. */
export interface RouteHandle {
  /** The page opens with a dark full-bleed image under a transparent header. */
  readonly overlaysHero?: boolean;
}

export function isRouteHandle(value: unknown): value is RouteHandle {
  return typeof value === 'object' && value !== null;
}
