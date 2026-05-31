'use server';

import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { auth } from '@/app/lib/better-auth';
import { zPassword } from '@/app/lib/zod/schemas/primitive';
import { type NextRoute } from '@/app/types/common';

import { type AuthActionResult } from './types';

type SignUpInput = {
  email: string;
  password: string;
};

// Creates a credential account and triggers the verification email
// derive a default users.name from email local-part.
export async function signUpAction({ email, password }: SignUpInput): Promise<AuthActionResult> {
  const [tValidation, tAuth] = await Promise.all([
    getTranslations('GlobalValidation'),
    getTranslations('ClientAuthentication'),
  ]);

  if (!zPassword(tValidation, tAuth('password')).safeParse(password).success) {
    return { status: 'error', errorKey: 'errorGeneric' };
  }

  try {
    await auth.api.signUpEmail({
      headers: await headers(),
      body: {
        email,
        password,
        name: email.split('@')[0],
        callbackURL: '/' satisfies NextRoute,
      },
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof APIError && error.body?.code === 'USER_ALREADY_EXISTS') {
      return { status: 'error', errorKey: 'errorEmailInUse' };
    }

    return { status: 'error', errorKey: 'errorGeneric' };
  }
}
