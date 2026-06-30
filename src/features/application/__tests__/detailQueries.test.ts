import { describe, expect, it } from 'vitest';

import { db } from '@/src/db/client';
import { applications } from '@/src/db/schema';
import { createApplication } from '@/src/features/application/db/mutations';
import {
  getApplicationActivity,
  getApplicationDetail,
} from '@/src/features/application/db/queries';
import { createJobHunt, createUser } from '@/src/lib/vitest/helpers/db';

describe('getApplicationDetail', () => {
  it('returns the detail with tagIds and readOnly=false for an active hunt', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng', notes: 'hi' })
      .returning();

    const detail = await getApplicationDetail(db, user.id, app.id);

    expect(detail?.company).toBe('Acme');
    expect(detail?.notes).toBe('hi');
    expect(detail?.tagIds).toEqual([]);
    expect(detail?.readOnly).toBe(false);
  });

  it('flags readOnly=true for an ended hunt', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id, { status: 'ended' });
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng' })
      .returning();

    expect((await getApplicationDetail(db, user.id, app.id))?.readOnly).toBe(true);
  });

  it('returns null for a foreign application', async () => {
    const owner = await createUser();
    const other = await createUser();
    const hunt = await createJobHunt(owner.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng' })
      .returning();

    expect(await getApplicationDetail(db, other.id, app.id)).toBeNull();
  });

  it('returns the activity log newest-first', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);
    const { id } = await createApplication(db, {
      jobHuntId: hunt.id,
      company: 'Acme',
      role: 'Eng',
      stage: 'active',
    });

    const activity = await getApplicationActivity(db, id);

    expect(activity.map((a) => a.type)).toContain('created');
    expect(activity.map((a) => a.type)).toContain('response_received');
  });
});
