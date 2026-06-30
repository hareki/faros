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
  return import('@/src/features/application/actions/moveStageAction');
}

describe('moveStageAction', () => {
  it('moves applied => active for an owned application', async () => {
    const email = 'move-stage-owner@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    const hunt = await createJobHunt(user.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng', stage: 'applied' })
      .returning();

    await signInAs(email, PASSWORD);

    const { moveStageAction } = await importAction();
    const result = await moveStageAction({ id: app.id, to: 'active' });

    expect(result).toEqual({ status: 'success' });
  });

  it('returns errorApplicationNotFound for a foreign application', async () => {
    const email = 'move-stage-intruder@example.com';
    const owner = await createUser();

    await createVerifiedUser({ email, password: PASSWORD });
    const hunt = await createJobHunt(owner.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng', stage: 'applied' })
      .returning();

    await signInAs(email, PASSWORD);

    const { moveStageAction } = await importAction();
    const result = await moveStageAction({ id: app.id, to: 'active' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorApplicationNotFound' });
  });

  it('rejects to: closed with errorValidation (schema only allows applied/active/final_stages)', async () => {
    const email = 'move-stage-closed@example.com';

    await createVerifiedUser({ email, password: PASSWORD });

    await signInAs(email, PASSWORD);

    const { moveStageAction } = await importAction();
    // @ts-expect-error - deliberately passing an invalid value to test schema rejection
    const result = await moveStageAction({ id: crypto.randomUUID(), to: 'closed' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorValidation' });
  });
});
