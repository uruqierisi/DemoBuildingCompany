import { gardenBuildings } from './garden-buildings';
import type { Project } from './types';

/**
 * Registry of projects on the site. The demo ships one project; the other Pozhegu projects
 * are added here as new data files with the same shape.
 */
export const projects: readonly Project[] = [gardenBuildings];

/** The project featured on the home page. */
export const featuredProject: Project = gardenBuildings;
