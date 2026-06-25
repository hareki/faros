import { type Route } from 'next';

import { type JobHuntSummary } from '@/src/features/job-hunt/types';

/** Query param holding the id of the selected hunt — the single source of truth for the selection. */
export const JOB_HUNT_PARAM = 'job_hunt';

/**
 * Resolves which hunt is selected from the `?job_hunt` id, falling back when it is missing or
 * stale: the id's hunt if it belongs to the user, else the active hunt, else the most-recent
 * ended hunt (the first ended one in the `status,startedAt desc`-ordered list from
 * {@link listJobHunts}), else `null` (the user has no hunts at all). Ownership is enforced by
 * construction — `jobHunts` only ever holds the caller's own hunts, so a foreign or garbage id
 * is simply not found and falls back.
 */
export function resolveSelectedJobHunt(
  jobHunts: JobHuntSummary[],
  selectedId: string | null | undefined,
): JobHuntSummary | null {
  const fromParam = selectedId ? jobHunts.find((jobHunt) => jobHunt.id === selectedId) : undefined;

  if (fromParam) {
    return fromParam;
  }

  const activeJobHunt = jobHunts.find((jobHunt) => jobHunt.status === 'active') ?? null;
  const mostRecentEndedJobHunt = jobHunts.find((jobHunt) => jobHunt.status === 'ended') ?? null;

  return activeJobHunt ?? mostRecentEndedJobHunt;
}

/**
 * Builds a route that carries the current selection as `?job_hunt` (or the bare path when none),
 * usable for both `<Link href>` and `router.push`.
 */
export function jobHuntHref(path: Route, jobHuntId: string | null | undefined): Route {
  return jobHuntId ? `${path}?${JOB_HUNT_PARAM}=${jobHuntId}` : path;
}
