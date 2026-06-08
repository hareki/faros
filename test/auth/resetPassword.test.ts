import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/app/db/client';
import { sessions } from '@/app/db/schema';
import { requestPasswordResetAction } from '@/app/features/auth/actions/requestPasswordResetAction';
import { resetPasswordAction } from '@/app/features/auth/actions/resetPasswordAction';
import { signInAction } from '@/app/features/auth/actions/signInAction';

import { createVerifiedUser } from '../helpers/db';
import { emailsOfType, tokenForEmail } from '../helpers/email';

const PASSWORD = 'Sup3r$ecret!';
const NEW_PASSWORD = 'Br4nd$newPass!';

describe('password reset', () => {
  it('emails a reset link with a token to a verified user', async () => {
    const email = 'reset@example.com';

    await createVerifiedUser({ email, password: PASSWORD });

    const result = await requestPasswordResetAction({ email });

    expect(result).toEqual({ status: 'success' });

    const reset = emailsOfType('reset');

    expect(reset).toHaveLength(1);
    expect(tokenForEmail('reset')).toBeTruthy();
  });

  it('resets the password with a valid token, revokes sessions, and swaps credentials', async () => {
    const email = 'reset-flow@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });

    // Establish a live session, then request a reset.
    await signInAction({ email, password: PASSWORD });
    expect(await db.select().from(sessions).where(eq(sessions.userId, user.id))).toHaveLength(1);

    await requestPasswordResetAction({ email });
    const token = tokenForEmail('reset');

    const result = await resetPasswordAction({ token, newPassword: NEW_PASSWORD });

    expect(result).toEqual({ status: 'success' });

    // revokeSessionsOnPasswordReset clears existing sessions.
    expect(await db.select().from(sessions).where(eq(sessions.userId, user.id))).toHaveLength(0);

    // Old password no longer works; the new one does.
    expect(await signInAction({ email, password: PASSWORD })).toEqual({
      status: 'error',
      errorKey: 'errorInvalidCredentials',
    });
    expect(await signInAction({ email, password: NEW_PASSWORD })).toEqual({ status: 'success' });
  });

  it('rejects an invalid or already-used token', async () => {
    const email = 'reset-bad@example.com';

    await createVerifiedUser({ email, password: PASSWORD });

    await requestPasswordResetAction({ email });
    const token = tokenForEmail('reset');

    // First use succeeds, second use (same token) is rejected.
    await resetPasswordAction({ token, newPassword: NEW_PASSWORD });
    expect(await resetPasswordAction({ token, newPassword: 'An0ther$pass!' })).toEqual({
      status: 'error',
      errorKey: 'errorInvalidToken',
    });

    // A garbage token is likewise rejected.
    expect(
      await resetPasswordAction({ token: 'not-a-real-token', newPassword: 'An0ther$pass!' }),
    ).toEqual({ status: 'error', errorKey: 'errorInvalidToken' });
  });
});
