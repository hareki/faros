import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/src/db/client';
import { tags } from '@/src/db/schema';
import { createTag, deleteTag, updateTag } from '@/src/features/application/db/tagMutations';
import { createUser } from '@/src/lib/vitest/helpers/db';

describe('tag mutations', () => {
  it('creates a tag with a color', async () => {
    const user = await createUser();

    const tag = await createTag(db, { userId: user.id, name: 'remote', color: '#89b4fa' });

    expect(tag.name).toBe('remote');
    expect(tag.color).toBe('#89b4fa');
  });

  it('rejects a duplicate name with a unique violation', async () => {
    const user = await createUser();

    await createTag(db, { userId: user.id, name: 'remote', color: null });

    await expect(createTag(db, { userId: user.id, name: 'remote', color: null })).rejects.toThrow();
  });

  it('updates an owned tag', async () => {
    const user = await createUser();
    const tag = await createTag(db, { userId: user.id, name: 'remote', color: null });

    const updated = await updateTag(db, {
      userId: user.id,
      id: tag.id,
      name: 'fully-remote',
      color: '#a6e3a1',
    });

    expect(updated?.name).toBe('fully-remote');
    expect(updated?.color).toBe('#a6e3a1');
  });

  it('deletes an owned tag', async () => {
    const user = await createUser();
    const tag = await createTag(db, { userId: user.id, name: 'remote', color: null });

    await deleteTag(db, { userId: user.id, id: tag.id });

    expect(await db.select().from(tags).where(eq(tags.id, tag.id))).toHaveLength(0);
  });

  it('returns undefined when updating a foreign tag', async () => {
    const owner = await createUser();
    const other = await createUser();
    const tag = await createTag(db, { userId: owner.id, name: 'remote', color: null });

    expect(
      await updateTag(db, { userId: other.id, id: tag.id, name: 'x', color: null }),
    ).toBeUndefined();
  });
});
