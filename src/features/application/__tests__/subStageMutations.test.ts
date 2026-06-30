import { and, eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/src/db/client';
import { subStages } from '@/src/db/schema';
import {
  createSubStage,
  deleteSubStage,
  renameSubStage,
} from '@/src/features/application/db/subStageMutations';
import { createUser } from '@/src/lib/vitest/helpers/db';

describe('createSubStage', () => {
  it('appends sub-stages with increasing sortOrder per stage', async () => {
    const user = await createUser();

    const first = await createSubStage(db, { userId: user.id, stage: 'active', name: 'HR' });
    const second = await createSubStage(db, { userId: user.id, stage: 'active', name: 'Tech' });

    expect(first.sortOrder).toBe(0);
    expect(second.sortOrder).toBe(1);
  });

  it('throws a unique violation on a duplicate name within a stage', async () => {
    const user = await createUser();

    await createSubStage(db, { userId: user.id, stage: 'active', name: 'HR' });

    await expect(
      createSubStage(db, { userId: user.id, stage: 'active', name: 'HR' }),
    ).rejects.toThrow();
  });
});

describe('renameSubStage / deleteSubStage', () => {
  it('renames an owned sub-stage', async () => {
    const user = await createUser();
    const sub = await createSubStage(db, { userId: user.id, stage: 'active', name: 'HR' });

    const renamed = await renameSubStage(db, { userId: user.id, id: sub.id, name: 'HR Screen' });

    expect(renamed).toEqual({ id: sub.id, stage: 'active', name: 'HR Screen', sortOrder: 0 });
  });

  it('returns undefined when renaming a foreign sub-stage', async () => {
    const owner = await createUser();
    const other = await createUser();
    const sub = await createSubStage(db, { userId: owner.id, stage: 'active', name: 'HR' });

    expect(await renameSubStage(db, { userId: other.id, id: sub.id, name: 'X' })).toBeUndefined();
  });

  it('deletes an owned sub-stage', async () => {
    const user = await createUser();
    const sub = await createSubStage(db, { userId: user.id, stage: 'active', name: 'HR' });

    expect((await deleteSubStage(db, { userId: user.id, id: sub.id }))?.id).toBe(sub.id);

    const rows = await db
      .select()
      .from(subStages)
      .where(and(eq(subStages.id, sub.id)));

    expect(rows).toHaveLength(0);
  });
});
