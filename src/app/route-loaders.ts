import type { LoaderFunctionArgs } from 'react-router';
import { featuredProject } from '@/data/projects';
import { findBuilding } from '@/lib/inventory';

function notFound(message: string): Response {
  return new Response(message, { status: 404, statusText: 'Not Found' });
}

/** 404 for unknown building ids, so the error boundary shows the not-found page. */
export function buildingLoader({ params }: LoaderFunctionArgs): null {
  if (!findBuilding(featuredProject, params.buildingId ?? '')) throw notFound('Objekti nuk u gjet');
  return null;
}

/**
 * 404 for ids that are not a listed apartment of that building. A listed apartment that has been
 * sold keeps its page (it shows a "sold" state); the sold units traced on the render have none.
 */
export function apartmentLoader({ params }: LoaderFunctionArgs): null {
  const building = findBuilding(featuredProject, params.buildingId ?? '');
  const isListed = building?.apartments.some((apartment) => apartment.id === params.apartmentId);
  if (!isListed) throw notFound('Banesa nuk u gjet');
  return null;
}
