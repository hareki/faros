import 'server-only';

import { and, eq } from 'drizzle-orm';

import { type DbExecutor } from '@/src/db/client';
import { type TagRow } from '@/src/features/application/db/queries';
import { tags } from '@/src/features/application/db/schema';

const RETURNING = { id: tags.id, name: tags.name, color: tags.color } as const;

/** Creates a user-owned tag. A duplicate name trips `tags_user_name_unique` (23505). */
export async function createTag(
  executor: DbExecutor,
  { userId, name, color }: { userId: string; name: string; color: string | null },
): Promise<TagRow> {
  const [row] = await executor.insert(tags).values({ userId, name, color }).returning(RETURNING);

  return row;
}

/** Updates an owned tag's name and color. Returns the row, or `undefined` when none matches. */
export async function updateTag(
  executor: DbExecutor,
  { userId, id, name, color }: { userId: string; id: string; name: string; color: string | null },
): Promise<TagRow | undefined> {
  const rows = await executor
    .update(tags)
    .set({ name, color })
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .returning(RETURNING);

  return rows.at(0);
}

/** Deletes an owned tag (its `application_tags` rows cascade away). */
export async function deleteTag(
  executor: DbExecutor,
  { userId, id }: { userId: string; id: string },
) {
  const rows = await executor
    .delete(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .returning({ id: tags.id });

  return rows.at(0);
}
