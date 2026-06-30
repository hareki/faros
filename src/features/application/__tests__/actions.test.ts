import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/src/db/client';
import { applications } from '@/src/db/schema';
import { auth } from '@/src/lib/better-auth';
import { createJobHunt, createVerifiedUser } from '@/src/lib/vitest/helpers/db';

const PASSWORD = 'Sup3r$ecret!';

// requireUser() reads getSession(), wrapped in React cache(); reset modules per test so each
// dynamically-imported action gets a fresh, un-memoized session read (mirrors job-hunt actions).
beforeEach(() => {
  vi.resetModules();
});

// Sign in via auth.api and expose the session cookie to headers() so requireUser() resolves to
// this user for the dynamically-imported action.
async function signIn(email: string) {
  const { headers: responseHeaders } = await auth.api.signInEmail({
    body: { email, password: PASSWORD },
    headers: new Headers(),
    returnHeaders: true,
  });
  const cookie = responseHeaders
    .getSetCookie()
    .map((entry) => entry.split(';')[0])
    .join('; ');
  const requestHeaders = new Headers();

  requestHeaders.set('cookie', cookie);
  vi.mocked(headers).mockResolvedValue(requestHeaders);
}

function importAction() {
  return import('@/src/features/application/actions/toggleFavoriteAction');
}

async function createApp(userId: string) {
  const hunt = await createJobHunt(userId);
  const [app] = await db
    .insert(applications)
    .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Engineer' })
    .returning();

  return app;
}

describe('toggleFavoriteAction', () => {
  it('sets favorite for the signed-in user’s application', async () => {
    const email = 'fav@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    const app = await createApp(user.id);

    await signIn(email);

    const { toggleFavoriteAction } = await importAction();
    const result = await toggleFavoriteAction({ id: app.id, favorite: true });

    expect(result).toEqual({ status: 'success' });

    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));

    expect(row.favorite).toBe(true);
  });

  it('returns errorApplicationNotFound for an application the user does not own', async () => {
    const owner = await createVerifiedUser({ email: 'owner@example.com', password: PASSWORD });

    await createVerifiedUser({ email: 'intruder@example.com', password: PASSWORD });
    const app = await createApp(owner.id);

    await signIn('intruder@example.com');

    const { toggleFavoriteAction } = await importAction();
    const result = await toggleFavoriteAction({ id: app.id, favorite: true });

    expect(result).toEqual({ status: 'error', errorKey: 'errorApplicationNotFound' });

    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));

    expect(row.favorite).toBe(false);
  });

  it('returns a validation error for a non-uuid id', async () => {
    const email = 'validation@example.com';

    await createVerifiedUser({ email, password: PASSWORD });

    await signIn(email);

    const { toggleFavoriteAction } = await importAction();
    const result = await toggleFavoriteAction({ id: 'not-a-uuid', favorite: true });

    expect(result).toEqual({ status: 'error', errorKey: 'errorValidation' });
  });
});
