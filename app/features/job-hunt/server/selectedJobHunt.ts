import 'server-only';

import { type DbExecutor } from '@/app/db/client';
import { listJobHunts } from '@/app/features/job-hunt/db/queries';
import { type JobHuntSummary } from '@/app/features/job-hunt/types';
import { resolveSelectedJobHunt } from '@/app/features/job-hunt/utils/selectedJobHunt';

/**
 * Page-side convenience: lists the user's hunts and resolves the selected one from the
 * `?job_hunt` id (see {@link resolveSelectedJobHunt}) — the same resolution the app shell performs
 * client-side, so a page and the shell always agree on which hunt is in view.
 */
export async function getSelectedJobHunt(
  executor: DbExecutor,
  userId: string,
  selectedId: string | null | undefined,
): Promise<JobHuntSummary | null> {
  const jobHunts = (await listJobHunts(executor, userId)).map(({ id, name, status }) => ({
    id,
    name,
    status,
  }));

  return resolveSelectedJobHunt(jobHunts, selectedId);
}
