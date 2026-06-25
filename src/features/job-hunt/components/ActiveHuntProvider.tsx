'use client';

import { type PropsWithChildren, useEffect } from 'react';

import { parseAsString, useQueryState } from 'nuqs';

import { JobHuntContext } from '@/src/features/job-hunt/hooks/useJobHuntContext';
import { type JobHuntSummary } from '@/src/features/job-hunt/types';
import {
  JOB_HUNT_PARAM,
  resolveSelectedJobHunt,
} from '@/src/features/job-hunt/utils/selectedJobHunt';

type ActiveHuntProviderProps = PropsWithChildren<{
  jobHunts: JobHuntSummary[];
  activeJobHunt: JobHuntSummary | null;
}>;

/**
 * Distributes the server-fetched hunts to the app shell and resolves the *selected* hunt from
 * the `?job_hunt` URL param — the single source of truth. It also canonicalizes the URL: when a
 * hunt is selectable but the param is missing or stale it writes the resolved id back (a shallow
 * `replace`, so no history entry and no server round-trip); when the user has no hunts it strips
 * any leftover param. Hunt-scoped pages (Dashboard/Retro) already redirect to the canonical URL
 * server-side, so there this is a no-op — it mainly keeps the hunt-independent pages in sync.
 */
export function JobHuntProvider({ jobHunts, activeJobHunt, children }: ActiveHuntProviderProps) {
  const [param, setParam] = useQueryState(JOB_HUNT_PARAM, parseAsString);
  const selectedJobHunt = resolveSelectedJobHunt(jobHunts, param);

  useEffect(() => {
    if (jobHunts.length === 0) {
      if (param) {
        void setParam(null);
      }

      return;
    }

    if (selectedJobHunt && param !== selectedJobHunt.id) {
      void setParam(selectedJobHunt.id);
    }
  }, [jobHunts.length, param, selectedJobHunt, setParam]);

  return (
    <JobHuntContext value={{ activeJobHunt, selectedJobHunt, jobHunts }}>{children}</JobHuntContext>
  );
}
