'use server';

import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';

import { buildSignInSchema } from '@/src/features/auth/schemas/signIn';
import { auth } from '@/src/lib/better-auth';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type SignInResult } from './types';

/** Signs the user in with email + password. The `nextCookies()` plugin sets the session cookie on the response automatically. */
export const signInAction = createServerAction({
  schema: buildSignInSchema,
  handler: async ({ email, password }): Promise<SignInResult> => {
    try {
      await auth.api.signInEmail({
        headers: await headers(),
        body: { email, password },
      });

      return { status: 'success' };
    } catch (error) {
      if (error instanceof APIError) {
        if (error.body?.code === 'EMAIL_NOT_VERIFIED') {
          return { status: 'needs-verification' };
        }

        if (error.body?.code === 'INVALID_EMAIL_OR_PASSWORD') {
          return { status: 'error', errorKey: 'errorInvalidCredentials' };
        }
      }

      // Unknown failure — let the wrapper log it and return errorGeneric.
      throw error;
    }
  },
});
