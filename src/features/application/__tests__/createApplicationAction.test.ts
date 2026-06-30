import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/src/db/client';
import { applications } from '@/src/db/schema';
import { signInAs } from '@/src/lib/vitest/helpers/auth';
import { createJobHunt, createVerifiedUser } from '@/src/lib/vitest/helpers/db';

const PASSWORD = 'Sup3r$ecret!';

beforeEach(() => {
  vi.resetModules();
});

function importAction() {
  return import('@/src/features/application/actions/createApplicationAction');
}

describe('createApplicationAction', () => {
  it('creates an application in the user’s active hunt', async () => {
    const email = 'create@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    const hunt = await createJobHunt(user.id);

    await signInAs(email, PASSWORD);

    const { createApplicationAction } = await importAction();
    const result = await createApplicationAction({
      company: 'Acme',
      role: 'Eng',
      stage: 'applied',
    });

    expect(result).toEqual({ status: 'success' });
    const rows = await db.select().from(applications).where(eq(applications.jobHuntId, hunt.id));

    expect(rows).toHaveLength(1);
    expect(rows[0].company).toBe('Acme');
  });

  it('returns errorNoActiveJobHunt when the user has no active hunt', async () => {
    const email = 'nohunt@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });

    await createJobHunt(user.id, { status: 'ended' });
    await signInAs(email, PASSWORD);

    const { createApplicationAction } = await importAction();
    const result = await createApplicationAction({
      company: 'Acme',
      role: 'Eng',
      stage: 'applied',
    });

    expect(result).toEqual({ status: 'error', errorKey: 'errorNoActiveJobHunt' });
  });

  it('rejects a closed stage without an outcome (validation)', async () => {
    const email = 'closedval@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });

    await createJobHunt(user.id);
    await signInAs(email, PASSWORD);

    const { createApplicationAction } = await importAction();
    const result = await createApplicationAction({ company: 'Acme', role: 'Eng', stage: 'closed' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorValidation' });
  });
});
