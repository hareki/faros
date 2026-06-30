import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/src/db/client';
import { applicationTags, applications, tags } from '@/src/db/schema';
import { signInAs } from '@/src/lib/vitest/helpers/auth';
import { createJobHunt, createUser, createVerifiedUser } from '@/src/lib/vitest/helpers/db';

const PASSWORD = 'Sup3r$ecret!';

beforeEach(() => {
  vi.resetModules();
});

function importAction() {
  return import('@/src/features/application/actions/setTagsAction');
}

describe('setTagsAction', () => {
  it('sets tags for an owned application and persists to DB', async () => {
    const email = 'set-tags-owner@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    const hunt = await createJobHunt(user.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng' })
      .returning();
    const [tag1, tag2] = await db
      .insert(tags)
      .values([
        { userId: user.id, name: 'remote' },
        { userId: user.id, name: 'startup' },
      ])
      .returning();

    await signInAs(email, PASSWORD);

    const { setTagsAction } = await importAction();
    const result = await setTagsAction({ id: app.id, tagIds: [tag1.id, tag2.id] });

    expect(result).toEqual({ status: 'success' });

    // Verify DB side effect
    const persisted = await db
      .select({ tagId: applicationTags.tagId })
      .from(applicationTags)
      .where(eq(applicationTags.applicationId, app.id));

    expect(persisted.map((r) => r.tagId).sort()).toEqual([tag1.id, tag2.id].sort());
  });

  it('returns errorTagInvalid for a tag belonging to another user', async () => {
    const email = 'set-tags-foreign-tag@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    const stranger = await createUser();
    const hunt = await createJobHunt(user.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng' })
      .returning();
    const [foreignTag] = await db
      .insert(tags)
      .values({ userId: stranger.id, name: 'x' })
      .returning();

    await signInAs(email, PASSWORD);

    const { setTagsAction } = await importAction();
    const result = await setTagsAction({ id: app.id, tagIds: [foreignTag.id] });

    expect(result).toEqual({ status: 'error', errorKey: 'errorTagInvalid' });
  });

  it('returns errorApplicationNotFound for a foreign application', async () => {
    const email = 'set-tags-intruder@example.com';
    const owner = await createUser();
    const intruder = await createVerifiedUser({ email, password: PASSWORD });
    const ownerHunt = await createJobHunt(owner.id);
    const [ownerApp] = await db
      .insert(applications)
      .values({ jobHuntId: ownerHunt.id, company: 'Acme', role: 'Eng' })
      .returning();
    const [tag] = await db.insert(tags).values({ userId: intruder.id, name: 'remote' }).returning();

    await signInAs(email, PASSWORD);

    const { setTagsAction } = await importAction();
    const result = await setTagsAction({ id: ownerApp.id, tagIds: [tag.id] });

    expect(result).toEqual({ status: 'error', errorKey: 'errorApplicationNotFound' });
  });

  it('clears all tags and returns success when tagIds is empty', async () => {
    const email = 'set-tags-clear@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    const hunt = await createJobHunt(user.id);
    const [tag] = await db.insert(tags).values({ userId: user.id, name: 'remote' }).returning();
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng' })
      .returning();

    // Pre-insert a tag association
    await db.insert(applicationTags).values({ applicationId: app.id, tagId: tag.id });

    await signInAs(email, PASSWORD);

    const { setTagsAction } = await importAction();
    const result = await setTagsAction({ id: app.id, tagIds: [] });

    expect(result).toEqual({ status: 'success' });

    const persisted = await db
      .select({ tagId: applicationTags.tagId })
      .from(applicationTags)
      .where(eq(applicationTags.applicationId, app.id));

    expect(persisted).toHaveLength(0);
  });
});
