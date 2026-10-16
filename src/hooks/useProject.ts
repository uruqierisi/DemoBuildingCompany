import { useMemo } from 'react';
import { featuredProject } from '@/data/projects';
import type { Project } from '@/data/types';
import { useStatusOverrides } from '@/lib/status-store';
import { applyStatusOverrides } from '@/lib/status-overrides';

/**
 * The featured project as the site should show it: the published data with any demo status changes
 * applied (statuses, and the stats derived from them). Pages read the project through this hook.
 */
export function useProject(): Project {
  const overrides = useStatusOverrides();
  return useMemo(() => applyStatusOverrides(featuredProject, overrides), [overrides]);
}
