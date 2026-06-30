import { describe, expect, it } from 'vitest';

import { db } from '@/src/db/client';
import { applicationTags, applications, subStages, tags } from '@/src/db/schema';
import { getBoardApplications } from '@/src/features/application/db/queries';
import { createJobHunt, createUser } from '@/src/lib/vitest/helpers/db';

describe('getBoardApplications', () => {
  it('maps an application with its sub-stage and tags', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);

    const [subStage] = await db
      .insert(subStages)
      .values({ userId: user.id, stage: 'active', name: 'Tech Screen' })
      .returning();

    const [app] = await db
      .insert(applications)
      .values({
        jobHuntId: hunt.id,
        company: 'Globex',
        role: 'Frontend Engineer',
        stage: 'active',
        subStageId: subStage.id,
        source: 'referral',
        favorite: true,
      })
      .returning();

    const [tag] = await db
      .insert(tags)
      .values({ userId: user.id, name: 'Frontend', color: '#89b4fa' })
      .returning();

    await db.insert(applicationTags).values({ applicationId: app.id, tagId: tag.id });

    const board = await getBoardApplications(db, hunt.id);

    expect(board).toHaveLength(1);
    expect(board[0]).toMatchObject({
      id: app.id,
      company: 'Globex',
      role: 'Frontend Engineer',
      stage: 'active',
      source: 'referral',
      favorite: true,
      subStage: { id: subStage.id, name: 'Tech Screen' },
      tags: [{ id: tag.id, name: 'Frontend', color: '#89b4fa' }],
    });
  });

  it('returns only the requested hunt’s applications', async () => {
    const user = await createUser();
    const huntA = await createJobHunt(user.id, { name: 'A' });
    const huntB = await createJobHunt(user.id, { name: 'B', status: 'ended' });

    await db.insert(applications).values({ jobHuntId: huntB.id, company: 'Other', role: 'Role' });

    const board = await getBoardApplications(db, huntA.id);

    expect(board).toHaveLength(0);
  });
});
