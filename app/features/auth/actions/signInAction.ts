'use server';

import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';

import { auth } from '@/app/lib/better-auth';

import { type SignInResult } from './types';

type SignInInput = {
  email: string;
  password: string;
};

// Signs the user in with email + password. The `nextCookies()` plugin sets the session cookie on the response automatically.
export async function signInAction({ email, password }: SignInInput): Promise<SignInResult> {
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

    return { status: 'error', errorKey: 'errorGeneric' };
  }
}
