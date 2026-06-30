import 'server-only';

import { and, eq, sql } from 'drizzle-orm';

import { type DbExecutor } from '@/src/db/client';
import { type SubStageRow } from '@/src/features/application/db/queries';
import { subStages } from '@/src/features/application/db/schema';

type StageBound = 'active' | 'final_stages';

/**
 * Appends a sub-stage at the end of its stage's ordering for the user. The next `sortOrder` is
 * `max + 1` within (user, stage). A duplicate name within the stage trips the
 * `sub_stages_user_stage_name_unique` index (Postgres 23505) for the action to map.
 */
export async function createSubStage(
  executor: DbExecutor,
  { userId, stage, name }: { userId: string; stage: StageBound; name: string },
): Promise<SubStageRow> {
  const [{ next }] = await executor
    .select({ next: sql<number>`coalesce(max(${subStages.sortOrder}), -1) + 1` })
    .from(subStages)
    .where(and(eq(subStages.userId, userId), eq(subStages.stage, stage)));

  const [row] = await executor
    .insert(subStages)
    .values({ userId, stage, name, sortOrder: next })
    .returning({
      id: subStages.id,
      stage: subStages.stage,
      name: subStages.name,
      sortOrder: subStages.sortOrder,
    });

  return row;
}

/** Renames an owned sub-stage. Returns the row, or `undefined` when none matches. */
export async function renameSubStage(
  executor: DbExecutor,
  { userId, id, name }: { userId: string; id: string; name: string },
) {
  const rows = await executor
    .update(subStages)
    .set({ name })
    .where(and(eq(subStages.id, id), eq(subStages.userId, userId)))
    .returning({ id: subStages.id, name: subStages.name });

  return rows.at(0);
}

/** Deletes an owned sub-stage (apps referencing it have `sub_stage_id` set null by the FK). */
export async function deleteSubStage(
  executor: DbExecutor,
  { userId, id }: { userId: string; id: string },
) {
  const rows = await executor
    .delete(subStages)
    .where(and(eq(subStages.id, id), eq(subStages.userId, userId)))
    .returning({ id: subStages.id });

  return rows.at(0);
}
