import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/src/db/client';
import { activityLog, applications } from '@/src/db/schema';
import {
  createApplication,
  moveStage,
  setFavorite,
  updateApplication,
} from '@/src/features/application/db/mutations';
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

describe('updateApplication', () => {
  async function ownedApp(userId: string) {
    const hunt = await createJobHunt(userId);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng' })
      .returning();

    return app;
  }

  it('updates metadata for an owned app', async () => {
    const user = await createUser();
    const app = await ownedApp(user.id);

    const updated = await updateApplication(db, {
      userId: user.id,
      id: app.id,
      data: { company: 'NewCo', location: 'Remote' },
    });

    expect(updated?.company).toBe('NewCo');
    expect(updated?.location).toBe('Remote');
  });

  it('logs note_added once when notes go empty => non-empty', async () => {
    const user = await createUser();
    const app = await ownedApp(user.id);

    await updateApplication(db, { userId: user.id, id: app.id, data: { notes: 'first note' } });
    await updateApplication(db, { userId: user.id, id: app.id, data: { notes: 'edited note' } });

    expect(await activityTypes(app.id)).toEqual(['note_added']);
  });

  it("leaves another user's app untouched and returns undefined", async () => {
    const owner = await createUser();
    const other = await createUser();
    const app = await ownedApp(owner.id);

    const result = await updateApplication(db, {
      userId: other.id,
      id: app.id,
      data: { company: 'Hacked' },
    });

    expect(result).toBeUndefined();
    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));

    expect(row.company).toBe('Acme');
  });

  it('does not log note_added for whitespace-only notes, logs exactly once for real note', async () => {
    const user = await createUser();
    const app = await ownedApp(user.id);

    await updateApplication(db, { userId: user.id, id: app.id, data: { notes: '   ' } });

    expect(await activityTypes(app.id)).toEqual([]);

    await updateApplication(db, { userId: user.id, id: app.id, data: { notes: 'real note' } });

    expect(await activityTypes(app.id)).toEqual(['note_added']);
  });

  it('does not log note_added when clearing notes to null', async () => {
    const user = await createUser();
    const app = await ownedApp(user.id);

    await updateApplication(db, { userId: user.id, id: app.id, data: { notes: 'real note' } });
    await updateApplication(db, { userId: user.id, id: app.id, data: { notes: null } });

    expect(await activityTypes(app.id)).toEqual(['note_added']);
  });
});

describe('moveStage', () => {
  async function ownedAppAt(
    userId: string,
    stage: 'applied' | 'active' | 'final_stages' | 'closed',
  ) {
    const hunt = await createJobHunt(userId);
    const [app] = await db
      .insert(applications)
      .values({
        jobHuntId: hunt.id,
        company: 'Acme',
        role: 'Eng',
        stage,
        ...(stage === 'closed'
          ? { closedOutcome: 'withdrawn' as const, closedAt: new Date() }
          : {}),
      })
      .returning();

    return app;
  }

  it('moves applied => active, clears sub-stage, derives first response', async () => {
    const user = await createUser();
    const app = await ownedAppAt(user.id, 'applied');

    const updated = await moveStage(db, { userId: user.id, id: app.id, to: 'active' });

    expect(updated?.stage).toBe('active');
    expect(updated?.subStageId).toBeNull();
    expect(await activityTypes(app.id)).toEqual(['response_received', 'stage_change']);
  });

  it('re-opening from closed clears closed columns', async () => {
    const user = await createUser();
    const app = await ownedAppAt(user.id, 'closed');

    const updated = await moveStage(db, { userId: user.id, id: app.id, to: 'active' });

    expect(updated?.stage).toBe('active');
    expect(updated?.closedOutcome).toBeNull();
    expect(updated?.closedAt).toBeNull();
  });

  it('returns undefined for a foreign app', async () => {
    const owner = await createUser();
    const other = await createUser();
    const app = await ownedAppAt(owner.id, 'applied');

    expect(await moveStage(db, { userId: other.id, id: app.id, to: 'active' })).toBeUndefined();
  });

  it('same-stage no-op returns the row and writes no stage_change', async () => {
    const user = await createUser();
    const app = await ownedAppAt(user.id, 'active');

    const updated = await moveStage(db, { userId: user.id, id: app.id, to: 'active' });

    expect(updated?.stage).toBe('active');
    expect(await activityTypes(app.id)).not.toContain('stage_change');
  });
});
