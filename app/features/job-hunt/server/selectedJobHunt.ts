import 'server-only';

import { cookies } from 'next/headers';

import { type DbExecutor } from '@/app/db/client';
import { listJobHunts } from '@/app/features/job-hunt/db/queries';
import { type JobHuntSummary } from '@/app/features/job-hunt/types';

/**
 * Cookie holding the id of the hunt the user is currently viewing — active *or* ended. It is
 * the single source of truth for the "selected hunt"; the resolver below re-validates it on
 * every load, so a stale or foreign id is harmless (it just falls back).
 */
export const SELECTED_JOB_HUNT_COOKIE = 'faros.selected_job_hunt';

/**
 * Resolves which hunt is selected from the cookie id, falling back when it is missing or
 * stale: the cookie's hunt if it still exists, else the active hunt, else the most-recent
 * ended hunt (the first ended one in the `status,startedAt desc`-ordered list from
 * {@link listJobHunts}), else `null` (the user has no hunts at all).
 */
export function pickSelectedJobHunt(
  jobHunts: JobHuntSummary[],
  cookieId: string | undefined,
): JobHuntSummary | null {
  const fromCookie = cookieId ? jobHunts.find((jobHunt) => jobHunt.id === cookieId) : undefined;

  if (fromCookie) {
    return fromCookie;
  }

  const activeJobHunt = jobHunts.find((jobHunt) => jobHunt.status === 'active') ?? null;
  const mostRecentEndedJobHunt = jobHunts.find((jobHunt) => jobHunt.status === 'ended') ?? null;

  return activeJobHunt ?? mostRecentEndedJobHunt;
}

/** Reads the raw selected-hunt id from the request cookies. */
export async function readSelectedJobHuntId(): Promise<string | undefined> {
  return (await cookies()).get(SELECTED_JOB_HUNT_COOKIE)?.value;
}

/**
 * Page-side convenience: lists the user's hunts, reads the cookie, and resolves the selected
 * hunt — the same resolution the app shell layout performs, so a page and the shell always
 * agree on which hunt is in view.
 */
export async function getSelectedJobHunt(
  executor: DbExecutor,
  userId: string,
): Promise<JobHuntSummary | null> {
  const jobHunts = (await listJobHunts(executor, userId)).map(({ id, name, status }) => ({
    id,
    name,
    status,
  }));

  return pickSelectedJobHunt(jobHunts, await readSelectedJobHuntId());
}
