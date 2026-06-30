import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/src/db/client';
import { applications } from '@/src/db/schema';
import { signInAs } from '@/src/lib/vitest/helpers/auth';
import { createJobHunt, createUser, createVerifiedUser } from '@/src/lib/vitest/helpers/db';

const PASSWORD = 'Sup3r$ecret!';

beforeEach(() => {
  vi.resetModules();
});

function importAction() {
  return import('@/src/features/application/actions/updateApplicationAction');
}

describe('updateApplicationAction', () => {
  it('updates company for an owned application', async () => {
    const email = 'update-app@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    const hunt = await createJobHunt(user.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng' })
      .returning();

    await signInAs(email, PASSWORD);

    const { updateApplicationAction } = await importAction();
    const result = await updateApplicationAction({ id: app.id, company: 'NewCo' });

    expect(result).toEqual({ status: 'success' });

    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));

    expect(row.company).toBe('NewCo');
  });

  it('returns errorApplicationNotFound for a foreign application id', async () => {
    const email = 'intruder-update@example.com';
    const owner = await createUser();

    await createVerifiedUser({ email, password: PASSWORD });
    const hunt = await createJobHunt(owner.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng' })
      .returning();

    await signInAs(email, PASSWORD);

    const { updateApplicationAction } = await importAction();
    const result = await updateApplicationAction({ id: app.id, company: 'Hacked' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorApplicationNotFound' });

    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));

    expect(row.company).toBe('Acme');
  });
});
