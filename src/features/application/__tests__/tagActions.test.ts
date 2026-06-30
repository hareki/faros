import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/src/db/client';
import { tags } from '@/src/db/schema';
import { createTag } from '@/src/features/application/db/tagMutations';
import { signInAs } from '@/src/lib/vitest/helpers/auth';
import { createUser, createVerifiedUser } from '@/src/lib/vitest/helpers/db';

const PASSWORD = 'Sup3r$ecret!';

beforeEach(() => {
  vi.resetModules();
});

function importCreateAction() {
  return import('@/src/features/application/actions/createTagAction');
}

function importUpdateAction() {
  return import('@/src/features/application/actions/updateTagAction');
}

function importDeleteAction() {
  return import('@/src/features/application/actions/deleteTagAction');
}

describe('createTagAction', () => {
  it('creates a tag and persists it to DB', async () => {
    const email = 'create-tag-success@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });

    await signInAs(email, PASSWORD);

    const { createTagAction } = await importCreateAction();
    const result = await createTagAction({ name: 'remote', color: '#89b4fa' });

    expect(result).toEqual({ status: 'success' });

    // Verify DB side effect
    const rows = await db
      .select({ name: tags.name, color: tags.color })
      .from(tags)
      .where(eq(tags.userId, user.id));

    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ name: 'remote', color: '#89b4fa' });
  });

  it('returns errorTagNameTaken for a duplicate name', async () => {
    const email = 'create-tag-dup@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });

    await createTag(db, { userId: user.id, name: 'remote', color: null });

    await signInAs(email, PASSWORD);

    const { createTagAction } = await importCreateAction();
    const result = await createTagAction({ name: 'remote' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorTagNameTaken' });
  });

  it('returns errorValidation for a non-hex color', async () => {
    const email = 'create-tag-invalid-color@example.com';

    await createVerifiedUser({ email, password: PASSWORD });

    await signInAs(email, PASSWORD);

    const { createTagAction } = await importCreateAction();
    const result = await createTagAction({ name: 'remote', color: 'blue' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorValidation' });
  });
});

describe('updateTagAction', () => {
  it('returns errorTagNotFound when updating a foreign tag', async () => {
    const owner = await createUser();
    const email = 'update-tag-foreign@example.com';

    await createVerifiedUser({ email, password: PASSWORD });
    const tag = await createTag(db, { userId: owner.id, name: 'remote', color: null });

    await signInAs(email, PASSWORD);

    const { updateTagAction } = await importUpdateAction();
    const result = await updateTagAction({ id: tag.id, name: 'new-name' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorTagNotFound' });
  });
});

describe('deleteTagAction', () => {
  it('returns errorTagNotFound when deleting a foreign tag', async () => {
    const owner = await createUser();
    const email = 'delete-tag-foreign@example.com';

    await createVerifiedUser({ email, password: PASSWORD });
    const tag = await createTag(db, { userId: owner.id, name: 'remote', color: null });

    await signInAs(email, PASSWORD);

    const { deleteTagAction } = await importDeleteAction();
    const result = await deleteTagAction({ id: tag.id });

    expect(result).toEqual({ status: 'error', errorKey: 'errorTagNotFound' });
  });
});
