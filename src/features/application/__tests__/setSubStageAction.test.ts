import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/src/db/client';
import { applications, subStages } from '@/src/db/schema';
import { signInAs } from '@/src/lib/vitest/helpers/auth';
import { createJobHunt, createUser, createVerifiedUser } from '@/src/lib/vitest/helpers/db';

const PASSWORD = 'Sup3r$ecret!';

beforeEach(() => {
  vi.resetModules();
});

function importAction() {
  return import('@/src/features/application/actions/setSubStageAction');
}

describe('setSubStageAction', () => {
  it('sets a valid sub-stage for an owned application', async () => {
    const email = 'set-sub-stage-owner@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    const hunt = await createJobHunt(user.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng', stage: 'active' })
      .returning();
    const [sub] = await db
      .insert(subStages)
      .values({ userId: user.id, stage: 'active', name: 'HR Screen', sortOrder: 0 })
      .returning();

    await signInAs(email, PASSWORD);

    const { setSubStageAction } = await importAction();
    const result = await setSubStageAction({ id: app.id, subStageId: sub.id });

    expect(result).toEqual({ status: 'success' });
  });

  it('returns errorSubStageInvalid for a sub-stage from a different stage', async () => {
    const email = 'set-sub-stage-wrong-stage@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    const hunt = await createJobHunt(user.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng', stage: 'active' })
      .returning();
    const [wrongStageSub] = await db
      .insert(subStages)
      .values({ userId: user.id, stage: 'final_stages', name: 'Onsite', sortOrder: 0 })
      .returning();

    await signInAs(email, PASSWORD);

    const { setSubStageAction } = await importAction();
    const result = await setSubStageAction({ id: app.id, subStageId: wrongStageSub.id });

    expect(result).toEqual({ status: 'error', errorKey: 'errorSubStageInvalid' });
  });

  it('returns errorApplicationNotFound for a foreign application', async () => {
    const email = 'set-sub-stage-intruder@example.com';
    const owner = await createUser();
    const intruder = await createVerifiedUser({ email, password: PASSWORD });
    const ownerHunt = await createJobHunt(owner.id);
    const [ownerApp] = await db
      .insert(applications)
      .values({ jobHuntId: ownerHunt.id, company: 'Acme', role: 'Eng', stage: 'active' })
      .returning();
    const [sub] = await db
      .insert(subStages)
      .values({ userId: intruder.id, stage: 'active', name: 'HR Screen', sortOrder: 0 })
      .returning();

    await signInAs(email, PASSWORD);

    const { setSubStageAction } = await importAction();
    const result = await setSubStageAction({ id: ownerApp.id, subStageId: sub.id });

    expect(result).toEqual({ status: 'error', errorKey: 'errorApplicationNotFound' });
  });

  it('clears a sub-stage with null and returns success', async () => {
    const email = 'set-sub-stage-clear@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    const hunt = await createJobHunt(user.id);
    const [sub] = await db
      .insert(subStages)
      .values({ userId: user.id, stage: 'active', name: 'HR Screen', sortOrder: 0 })
      .returning();
    const [app] = await db
      .insert(applications)
      .values({
        jobHuntId: hunt.id,
        company: 'Acme',
        role: 'Eng',
        stage: 'active',
        subStageId: sub.id,
      })
      .returning();

    await signInAs(email, PASSWORD);

    const { setSubStageAction } = await importAction();
    const result = await setSubStageAction({ id: app.id, subStageId: null });

    expect(result).toEqual({ status: 'success' });
  });

  it('returns errorSubStageInvalid for a sub-stage belonging to another user even if stage matches', async () => {
    const email = 'set-sub-stage-foreign-sub@example.com';
    const owner = await createVerifiedUser({ email, password: PASSWORD });
    const otherUser = await createUser();
    const hunt = await createJobHunt(owner.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng', stage: 'active' })
      .returning();
    const [foreignSub] = await db
      .insert(subStages)
      .values({ userId: otherUser.id, stage: 'active', name: 'Phone Screen', sortOrder: 0 })
      .returning();

    await signInAs(email, PASSWORD);

    const { setSubStageAction } = await importAction();
    const result = await setSubStageAction({ id: app.id, subStageId: foreignSub.id });

    expect(result).toEqual({ status: 'error', errorKey: 'errorSubStageInvalid' });
  });
});
