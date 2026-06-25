import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/src/db/client';
import { sessions } from '@/src/db/schema';
import { signInAction } from '@/src/features/auth/actions/signInAction';
import { createVerifiedUser } from '@/src/lib/vitest/helpers/db';

const PASSWORD = 'Sup3r$ecret!';

describe('sign-in', () => {
  it('signs in a verified user and creates a session', async () => {
    const email = 'verified@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });

    const result = await signInAction({ email, password: PASSWORD });

    expect(result).toEqual({ status: 'success' });

    const rows = await db.select().from(sessions).where(eq(sessions.userId, user.id));

    expect(rows).toHaveLength(1);
  });

  it('rejects a wrong password with invalid-credentials', async () => {
    const email = 'verified@example.com';

    await createVerifiedUser({ email, password: PASSWORD });

    const result = await signInAction({ email, password: 'WrongP4ss$word' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorInvalidCredentials' });
  });
});
