import 'server-only';

import { and, eq } from 'drizzle-orm';

import { type DbExecutor } from '@/app/db/client';
import { jobHunts } from '@/app/features/job-hunt/db/schema';

type StartJobHuntParams = { userId: string; name: string };
type RenameJobHuntParams = { userId: string; id: string; name: string };
type EndJobHuntParams = { userId: string; id: string };

/**
 * Inserts a new active hunt. The `one_active_job_hunt_per_user` partial unique index is the
 * sole guard against a second active hunt: a conflicting insert throws Postgres `23505`,
 * which the calling action maps to a friendly conflict result. Returns the new row.
 */
export async function startJobHunt(executor: DbExecutor, { userId, name }: StartJobHuntParams) {
  const [row] = await executor
    .insert(jobHunts)
    .values({ userId, name, status: 'active' })
    .returning();

  return row;
}

/**
 * Renames a hunt the user owns. Returns the updated row, or `undefined` when no hunt matches
 * (wrong id or not the owner) — the `userId` predicate is the ownership check.
 */
export async function renameJobHunt(
  executor: DbExecutor,
  { userId, id, name }: RenameJobHuntParams,
) {
  const [row] = await executor
    .update(jobHunts)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(jobHunts.id, id), eq(jobHunts.userId, userId)))
    .returning();

  return row;
}

/**
 * Ends an active hunt the user owns, freeing the single active slot. Returns the updated
 * row, or `undefined` when no active hunt matches (wrong id, not the owner, or already
 * ended). `updatedAt` is set explicitly since the column has no `$onUpdate`.
 */
export async function endJobHunt(executor: DbExecutor, { userId, id }: EndJobHuntParams) {
  const now = new Date();

  const [row] = await executor
    .update(jobHunts)
    .set({ status: 'ended', endedAt: now, updatedAt: now })
    .where(and(eq(jobHunts.id, id), eq(jobHunts.userId, userId), eq(jobHunts.status, 'active')))
    .returning();

  return row;
}
