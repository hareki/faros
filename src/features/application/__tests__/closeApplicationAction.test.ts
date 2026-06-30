import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/src/db/client';
import { activityLog, applications } from '@/src/db/schema';
import { signInAs } from '@/src/lib/vitest/helpers/auth';
import { createJobHunt, createUser, createVerifiedUser } from '@/src/lib/vitest/helpers/db';

const PASSWORD = 'Sup3r$ecret!';

beforeEach(() => {
  vi.resetModules();
});

function importAction() {
  return import('@/src/features/application/actions/closeApplicationAction');
}

async function activityTypes(applicationId: string) {
  const rows = await db
    .select({ type: activityLog.type })
    .from(activityLog)
    .where(eq(activityLog.applicationId, applicationId));

  return rows.map((r) => r.type).sort();
}

describe('closeApplicationAction', () => {
  it('closes an owned application as accepted and persists DB side effects', async () => {
    const email = 'close-app-owner@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    const hunt = await createJobHunt(user.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng', stage: 'active' })
      .returning();

    await signInAs(email, PASSWORD);

    const { closeApplicationAction } = await importAction();
    const result = await closeApplicationAction({ id: app.id, outcome: 'accepted' });

    expect(result).toEqual({ status: 'success' });

    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));

    expect(row.stage).toBe('closed');
    expect(row.closedOutcome).toBe('accepted');
    expect(row.closedAt).not.toBeNull();
    expect(row.subStageId).toBeNull();
    expect(await activityTypes(app.id)).toEqual(['closed', 'offer_received']);
  });

  it('returns errorApplicationNotFound for a foreign application', async () => {
    const email = 'close-app-intruder@example.com';
    const owner = await createUser();

    await createVerifiedUser({ email, password: PASSWORD });
    const ownerHunt = await createJobHunt(owner.id);
    const [ownerApp] = await db
      .insert(applications)
      .values({ jobHuntId: ownerHunt.id, company: 'Acme', role: 'Eng', stage: 'active' })
      .returning();

    await signInAs(email, PASSWORD);

    const { closeApplicationAction } = await importAction();
    const result = await closeApplicationAction({ id: ownerApp.id, outcome: 'rejected' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorApplicationNotFound' });
  });
});
