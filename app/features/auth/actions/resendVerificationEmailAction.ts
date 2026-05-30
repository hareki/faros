'use server';

import { auth } from '@/app/lib/better-auth';
import { type NextRoute } from '@/app/types/common';

import { type AuthActionResult } from './types';

type ResendVerificationEmailInput = {
  email: string;
};

export async function resendVerificationEmailAction({
  email,
}: ResendVerificationEmailInput): Promise<AuthActionResult> {
  try {
    await auth.api.sendVerificationEmail({
      body: { email, callbackURL: '/' satisfies NextRoute },
    });

    return { status: 'success' };
  } catch {
    return { status: 'error', errorKey: 'errorGeneric' };
  }
}
