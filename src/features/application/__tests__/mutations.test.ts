import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/src/db/client';
import { applications } from '@/src/db/schema';
import { setFavorite } from '@/src/features/application/db/mutations';
import { createJobHunt, createUser } from '@/src/lib/vitest/helpers/db';

// The shared createApplication helper owns its user internally and returns only the id, so the
// chain is built by hand here where ownership (userId) needs to be controlled.
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
