import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/src/db/client';
import { subStages } from '@/src/db/schema';
import { createSubStage } from '@/src/features/application/db/subStageMutations';
import { signInAs } from '@/src/lib/vitest/helpers/auth';
import { createUser, createVerifiedUser } from '@/src/lib/vitest/helpers/db';

const PASSWORD = 'Sup3r$ecret!';

beforeEach(() => {
  vi.resetModules();
});

function importCreateAction() {
  return import('@/src/features/application/actions/createSubStageAction');
}

function importRenameAction() {
  return import('@/src/features/application/actions/renameSubStageAction');
}

function importDeleteAction() {
  return import('@/src/features/application/actions/deleteSubStageAction');
}

function importReorderAction() {
  return import('@/src/features/application/actions/reorderSubStagesAction');
}

describe('createSubStageAction', () => {
  it('creates a sub-stage and persists it to DB', async () => {
    const email = 'create-sub-stage-success@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });

    await signInAs(email, PASSWORD);

    const { createSubStageAction } = await importCreateAction();
    const result = await createSubStageAction({ stage: 'active', name: 'HR Screen' });

    expect(result).toEqual({ status: 'success' });

    // Verify DB side effect
    const rows = await db
      .select({ stage: subStages.stage, name: subStages.name, sortOrder: subStages.sortOrder })
      .from(subStages)
      .where(eq(subStages.userId, user.id));

    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ stage: 'active', name: 'HR Screen', sortOrder: 0 });
  });

  it('returns errorSubStageNameTaken for a duplicate name within the same stage', async () => {
    const email = 'create-sub-stage-dup@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });

    await db
      .insert(subStages)
      .values({ userId: user.id, stage: 'active', name: 'HR Screen', sortOrder: 0 });

    await signInAs(email, PASSWORD);

    const { createSubStageAction } = await importCreateAction();
    const result = await createSubStageAction({ stage: 'active', name: 'HR Screen' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorSubStageNameTaken' });
  });

  it('returns errorValidation for a disallowed stage', async () => {
    const email = 'create-sub-stage-invalid-stage@example.com';

    await createVerifiedUser({ email, password: PASSWORD });

    await signInAs(email, PASSWORD);

    const { createSubStageAction } = await importCreateAction();
    // 'applied' is not in the allowed enum for sub-stages
    const result = await createSubStageAction({ stage: 'applied' as 'active', name: 'HR Screen' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorValidation' });
  });
});

describe('renameSubStageAction', () => {
  it('returns errorSubStageNotFound when renaming a foreign sub-stage', async () => {
    const owner = await createUser();
    const email = 'rename-sub-stage-foreign@example.com';

    await createVerifiedUser({ email, password: PASSWORD });
    const [sub] = await db
      .insert(subStages)
      .values({ userId: owner.id, stage: 'active', name: 'HR Screen', sortOrder: 0 })
      .returning();

    await signInAs(email, PASSWORD);

    const { renameSubStageAction } = await importRenameAction();
    const result = await renameSubStageAction({ id: sub.id, name: 'New Name' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorSubStageNotFound' });
  });
});

describe('deleteSubStageAction', () => {
  it('returns errorSubStageNotFound when deleting a foreign sub-stage', async () => {
    const owner = await createUser();
    const email = 'delete-sub-stage-foreign@example.com';

    await createVerifiedUser({ email, password: PASSWORD });
    const [sub] = await db
      .insert(subStages)
      .values({ userId: owner.id, stage: 'active', name: 'HR Screen', sortOrder: 0 })
      .returning();

    await signInAs(email, PASSWORD);

    const { deleteSubStageAction } = await importDeleteAction();
    const result = await deleteSubStageAction({ id: sub.id });

    expect(result).toEqual({ status: 'error', errorKey: 'errorSubStageNotFound' });
  });
});

// Intentional coverage: reorderSubStagesAction wraps a db.transaction — an envelope-only check
// would not catch an uncommitted-transaction bug, so this test asserts the reorder actually
// persisted through the action.
describe('reorderSubStagesAction', () => {
  it('persists the new sortOrder for each sub-stage through the action', async () => {
    const email = 'reorder-sub-stages-success@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });

    const a = await createSubStage(db, { userId: user.id, stage: 'active', name: 'A' });
    const b = await createSubStage(db, { userId: user.id, stage: 'active', name: 'B' });
    const c = await createSubStage(db, { userId: user.id, stage: 'active', name: 'C' });

    await signInAs(email, PASSWORD);

    const { reorderSubStagesAction } = await importReorderAction();
    const result = await reorderSubStagesAction({
      stage: 'active',
      orderedIds: [c.id, a.id, b.id],
    });

    expect(result).toEqual({ status: 'success' });

    const rows = await db
      .select({ id: subStages.id, sortOrder: subStages.sortOrder })
      .from(subStages)
      .where(eq(subStages.userId, user.id));
    const order = Object.fromEntries(rows.map((r) => [r.id, r.sortOrder]));

    expect(order[c.id]).toBe(0);
    expect(order[a.id]).toBe(1);
    expect(order[b.id]).toBe(2);
  });
});
