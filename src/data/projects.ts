import { rezidencaArrita } from './rezidenca-arrita';
import type { Project } from './types';

/**
 * Registry of projects on the site. The demo ships one fictional project; more projects are added
 * here as new data files with the same shape.
 */
export const projects: readonly Project[] = [rezidencaArrita];

/** The project featured on the home page. */
export const featuredProject: Project = rezidencaArrita;
