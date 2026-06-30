import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/src/db/client';
import { activityLog, applications } from '@/src/db/schema';
import { createApplication, setFavorite } from '@/src/features/application/db/mutations';
import { createJobHunt, createUser } from '@/src/lib/vitest/helpers/db';

// This local helper builds the user => hunt => application chain itself so the test can
// control which userId owns the application. The real createApplication mutation takes
// jobHuntId externally and does not manage user ownership internally.
async function createApp(userId: string, overrides: { favorite?: boolean } = {}) {
  const hunt = await createJobHunt(userId);
  const [app] = await db
    .insert(applications)
    .values({
      jobHuntId: hunt.id,
      company: 'Acme',
      role: 'Engineer',
      favorite: overrides.favorite ?? false,
    })
    .returning();

  return app;
}

describe('setFavorite', () => {
  it('sets favorite true on an owned application', async () => {
    const user = await createUser();
    const app = await createApp(user.id);

    const updated = await setFavorite(db, { userId: user.id, id: app.id, favorite: true });

    expect(updated?.favorite).toBe(true);
  });

  it('sets favorite false on an owned application', async () => {
    const user = await createUser();
    const app = await createApp(user.id, { favorite: true });

    const updated = await setFavorite(db, { userId: user.id, id: app.id, favorite: false });

    expect(updated?.favorite).toBe(false);
  });

  it("leaves another user's application untouched and returns undefined", async () => {
    const owner = await createUser();
    const other = await createUser();
    const app = await createApp(owner.id, { favorite: false });

    const result = await setFavorite(db, { userId: other.id, id: app.id, favorite: true });

    expect(result).toBeUndefined();

    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));

    expect(row.favorite).toBe(false);
  });
});

async function activityTypes(applicationId: string) {
  const rows = await db
    .select({ type: activityLog.type })
    .from(activityLog)
    .where(eq(activityLog.applicationId, applicationId));

  return rows.map((r) => r.type).sort();
}

describe('createApplication', () => {
  it('logs only created for an applied app', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);

    const { id } = await createApplication(db, {
      jobHuntId: hunt.id,
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
    });

    expect(await activityTypes(id)).toEqual(['created']);
  });

  it('backfills response_received for an active app (ADR-0006)', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);

    const { id } = await createApplication(db, {
      jobHuntId: hunt.id,
      company: 'Globex',
      role: 'FE',
      stage: 'active',
    });

    expect(await activityTypes(id)).toEqual(['created', 'response_received']);
  });

  it('backfills response_received for a final_stages app', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);

    const { id } = await createApplication(db, {
      jobHuntId: hunt.id,
      company: 'Initech',
      role: 'UI',
      stage: 'final_stages',
    });

    expect(await activityTypes(id)).toEqual(['created', 'response_received']);
  });

  it('closed+rejected logs created+closed+response_received and sets closed columns', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);

    const { id } = await createApplication(db, {
      jobHuntId: hunt.id,
      company: 'Hooli',
      role: 'Web',
      stage: 'closed',
      closedOutcome: 'rejected',
    });

    expect(await activityTypes(id)).toEqual(['closed', 'created', 'response_received']);
    const [row] = await db.select().from(applications).where(eq(applications.id, id));

    expect(row.closedOutcome).toBe('rejected');
    expect(row.closedAt).not.toBeNull();
  });

  it('closed+accepted backfills offer_received', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);

    const { id } = await createApplication(db, {
      jobHuntId: hunt.id,
      company: 'Stark',
      role: 'Eng',
      stage: 'closed',
      closedOutcome: 'accepted',
    });

    expect(await activityTypes(id)).toEqual(['closed', 'created', 'offer_received']);
  });
});
