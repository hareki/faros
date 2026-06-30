import 'server-only';

import { and, eq, inArray } from 'drizzle-orm';

import { type DbExecutor } from '@/src/db/client';
import { applications } from '@/src/features/application/db/schema';
import { jobHunts } from '@/src/features/job-hunt/db/schema';

type SetFavoriteParams = { userId: string; id: string; favorite: boolean };

/**
 * Sets `favorite` to an explicit target value on an application the user owns. Ownership flows
 * application => job_hunt => user, so the update is scoped to applications whose `job_hunt_id`
 * belongs to the caller (the subquery is the ownership check). Takes the target value rather than
 * blindly flipping, so an optimistic UI stays idempotent and race-safe (last write wins). Does
 * not write to `activity_log` — favorite is organizational, not a milestone (ADR-0007). Returns
 * the updated row, or `undefined` when no owned application matches (wrong id or not the owner).
 */
export async function setFavorite(
  executor: DbExecutor,
  { userId, id, favorite }: SetFavoriteParams,
) {
  const rows = await executor
    .update(applications)
    .set({ favorite, updatedAt: new Date() })
    .where(
      and(
        eq(applications.id, id),
        inArray(
          applications.jobHuntId,
          executor.select({ id: jobHunts.id }).from(jobHunts).where(eq(jobHunts.userId, userId)),
        ),
      ),
    )
    .returning();

  return rows.at(0);
}
