import 'server-only';

import { and, asc, desc, eq } from 'drizzle-orm';

import { type DbExecutor } from '@/src/db/client';
import { jobHunts } from '@/src/features/job-hunt/db/schema';

/** A row of the `job_hunts` table. */
export type JobHunt = typeof jobHunts.$inferSelect;

/**
 * The user's single active hunt, or `undefined` when they have none. Served by the
 * `one_active_job_hunt_per_user` partial unique index — the read behind every shell load.
 */
export async function getActiveJobHunt(executor: DbExecutor, userId: string) {
  const rows = await executor
    .select()
    .from(jobHunts)
    .where(and(eq(jobHunts.userId, userId), eq(jobHunts.status, 'active')))
    .limit(1);

  return rows.at(0);
}

/**
 * All of a user's hunts for the switcher: the active hunt first (enum order: `active`
 * before `ended`), then ended hunts most-recently-started first.
 */
export async function listJobHunts(executor: DbExecutor, userId: string) {
  return executor
    .select()
    .from(jobHunts)
    .where(eq(jobHunts.userId, userId))
    .orderBy(asc(jobHunts.status), desc(jobHunts.startedAt));
}
