'use server';

import { APIError } from 'better-auth/api';

import { auth } from '@/app/lib/better-auth';
import { zPassword } from '@/app/lib/zod/schemas/primitive';

import { type AuthActionResult } from './types';

type ResetPasswordInput = {
  // Token extracted from the `?token=` query param on /reset-password.
  token: string;
  newPassword: string;
};

// Consumes a reset token and sets the new password. Tokens are single-use and
// time-limited; an invalid/expired one throws and is mapped to `errorInvalidToken`.
// With `revokeSessionsOnPasswordReset`, all of the user's sessions are cleared.
export async function resetPasswordAction({
  token,
  newPassword,
}: ResetPasswordInput): Promise<AuthActionResult> {
  if (!zPassword().safeParse(newPassword).success) {
    return { status: 'error', errorKey: 'errorGeneric' };
  }

  try {
    await auth.api.resetPassword({
      body: { token, newPassword },
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof APIError) {
      return { status: 'error', errorKey: 'errorInvalidToken' };
    }

    return { status: 'error', errorKey: 'errorGeneric' };
  }
}
