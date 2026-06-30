import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/src/db/client';
import { jobHunts } from '@/src/db/schema';
import { signInAs } from '@/src/lib/vitest/helpers/auth';
import { createVerifiedUser } from '@/src/lib/vitest/helpers/db';

const PASSWORD = 'Sup3r$ecret!';

// requireUser() reads getSession(), which is wrapped in React cache(); reset modules per
// test so each action import gets a fresh, un-memoized session read (mirrors guards.test).
beforeEach(() => {
  vi.resetModules();
});

function importStart() {
  return import('@/src/features/job-hunt/actions/startJobHuntAction');
}

describe('startJobHuntAction', () => {
  it('starts a hunt for the signed-in user', async () => {
    const email = 'starter@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });

    await signInAs(email, PASSWORD);

    const { startJobHuntAction } = await importStart();
    const result = await startJobHuntAction({ name: 'My Hunt' });

    expect(result).toEqual({ status: 'success' });

    const rows = await db.select().from(jobHunts).where(eq(jobHunts.userId, user.id));

    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('active');
  });

  it('surfaces a friendly conflict when one is already active', async () => {
    const email = 'conflict@example.com';

    await createVerifiedUser({ email, password: PASSWORD });
    await signInAs(email, PASSWORD);

    const { startJobHuntAction } = await importStart();

    await startJobHuntAction({ name: 'First' });
    const result = await startJobHuntAction({ name: 'Second' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorActiveJobHuntExists' });
  });
});

describe('renameJobHuntAction', () => {
  it('renames the user’s own hunt', async () => {
    const email = 'renamer@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });

    await signInAs(email, PASSWORD);

    const { startJobHuntAction } = await importStart();

    await startJobHuntAction({ name: 'Old' });

    const [hunt] = await db.select().from(jobHunts).where(eq(jobHunts.userId, user.id));

    const { renameJobHuntAction } =
      await import('@/src/features/job-hunt/actions/renameJobHuntAction');
    const result = await renameJobHuntAction({ id: hunt.id, name: 'New' });

    expect(result).toEqual({ status: 'success' });

    const [row] = await db.select().from(jobHunts).where(eq(jobHunts.id, hunt.id));

    expect(row.name).toBe('New');
  });

  it('returns not-found for a foreign hunt id', async () => {
    const email = 'rename-foreign@example.com';

    await createVerifiedUser({ email, password: PASSWORD });
    await signInAs(email, PASSWORD);

    const { renameJobHuntAction } =
      await import('@/src/features/job-hunt/actions/renameJobHuntAction');
    const result = await renameJobHuntAction({ id: crypto.randomUUID(), name: 'X' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorJobHuntNotFound' });
  });
});

describe('endJobHuntAction', () => {
  it('ends the user’s active hunt', async () => {
    const email = 'ender@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });

    await signInAs(email, PASSWORD);

    const { startJobHuntAction } = await importStart();

    await startJobHuntAction({ name: 'Hunt' });

    const [hunt] = await db.select().from(jobHunts).where(eq(jobHunts.userId, user.id));

    const { endJobHuntAction } = await import('@/src/features/job-hunt/actions/endJobHuntAction');
    const result = await endJobHuntAction({ id: hunt.id });

    expect(result).toEqual({ status: 'success' });

    const [row] = await db.select().from(jobHunts).where(eq(jobHunts.id, hunt.id));

    expect(row.status).toBe('ended');
    expect(row.endedAt).toBeInstanceOf(Date);
  });
});
