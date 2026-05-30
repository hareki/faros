'use server';

import { auth } from '@/app/lib/better-auth';
import { type NextRoute } from '@/app/types/common';

import { type AuthActionResult } from './types';

type RequestPasswordResetInput = {
  email: string;
};

export async function requestPasswordResetAction({
  email,
}: RequestPasswordResetInput): Promise<AuthActionResult> {
  try {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: '/reset-password' satisfies NextRoute },
    });

    return { status: 'success' };
  } catch {
    return { status: 'error', errorKey: 'errorGeneric' };
  }
}
