import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/app/db/client';
import { jobHunts } from '@/app/db/schema';
import { endJobHunt, renameJobHunt, startJobHunt } from '@/app/features/job-hunt/db/mutations';
import { getActiveJobHunt, listJobHunts } from '@/app/features/job-hunt/db/queries';
import { isUniqueViolation } from '@/app/lib/drizzle/errors';
import { createJobHunt, createUser } from '@/app/lib/vitest/helpers/db';

describe('startJobHunt', () => {
  it('creates an active hunt', async () => {
    const user = await createUser();

    const hunt = await startJobHunt(db, { userId: user.id, name: 'My Hunt' });

    expect(hunt.status).toBe('active');
    expect(hunt.name).toBe('My Hunt');
    expect(hunt.endedAt).toBeNull();
  });

  it('rejects a second active hunt via the partial unique index', async () => {
    const user = await createUser();

    await startJobHunt(db, { userId: user.id, name: 'First' });
    const error = await startJobHunt(db, { userId: user.id, name: 'Second' }).catch(
      (e: unknown) => e,
    );

    // Plain code match and the specific index name the action keys off of.
    expect(isUniqueViolation(error)).toBe(true);
    expect(isUniqueViolation(error, 'one_active_job_hunt_per_user')).toBe(true);
  });

  it('allows an active hunt for a different user', async () => {
    const userA = await createUser();
    const userB = await createUser();

    await startJobHunt(db, { userId: userA.id, name: 'A' });
    const huntB = await startJobHunt(db, { userId: userB.id, name: 'B' });

    expect(huntB.status).toBe('active');
  });
});

describe('endJobHunt', () => {
  it('ends an active hunt and frees the active slot', async () => {
    const user = await createUser();
    const hunt = await startJobHunt(db, { userId: user.id, name: 'Hunt' });

    const ended = await endJobHunt(db, { userId: user.id, id: hunt.id });

    expect(ended?.status).toBe('ended');
    expect(ended?.endedAt).toBeInstanceOf(Date);

    // Slot freed: a fresh active hunt can now be created.
    const next = await startJobHunt(db, { userId: user.id, name: 'Next' });

    expect(next.status).toBe('active');
  });

  it('returns undefined for a hunt the user does not own', async () => {
    const owner = await createUser();
    const other = await createUser();
    const hunt = await startJobHunt(db, { userId: owner.id, name: 'Owned' });

    expect(await endJobHunt(db, { userId: other.id, id: hunt.id })).toBeUndefined();
  });

  it('returns undefined when the hunt is already ended', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id, { status: 'ended' });

    expect(await endJobHunt(db, { userId: user.id, id: hunt.id })).toBeUndefined();
  });
});

describe('renameJobHunt', () => {
  it('renames a hunt the user owns', async () => {
    const user = await createUser();
    const hunt = await startJobHunt(db, { userId: user.id, name: 'Old' });

    const renamed = await renameJobHunt(db, { userId: user.id, id: hunt.id, name: 'New' });

    expect(renamed?.name).toBe('New');
  });

  it('leaves another user’s hunt untouched and returns undefined', async () => {
    const owner = await createUser();
    const other = await createUser();
    const hunt = await startJobHunt(db, { userId: owner.id, name: 'Owned' });

    const result = await renameJobHunt(db, { userId: other.id, id: hunt.id, name: 'Hijack' });

    expect(result).toBeUndefined();

    const [row] = await db.select().from(jobHunts).where(eq(jobHunts.id, hunt.id));

    expect(row.name).toBe('Owned');
  });
});

describe('getActiveJobHunt / listJobHunts', () => {
  it('returns the active hunt and lists active before ended', async () => {
    const user = await createUser();
    const ended = await createJobHunt(user.id, { name: 'Ended', status: 'ended' });
    const active = await startJobHunt(db, { userId: user.id, name: 'Active' });

    expect((await getActiveJobHunt(db, user.id))?.id).toBe(active.id);

    const all = await listJobHunts(db, user.id);

    expect(all.map((hunt) => hunt.id)).toEqual([active.id, ended.id]);
  });

  it('returns undefined when there is no active hunt', async () => {
    const user = await createUser();

    await createJobHunt(user.id, { status: 'ended' });

    expect(await getActiveJobHunt(db, user.id)).toBeUndefined();
  });
});
