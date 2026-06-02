'use server';

import { auth } from '@/app/lib/better-auth';
import { createServerAction } from '@/app/lib/next/createServerAction';
import { type NextRoute } from '@/app/types/common';

import { type AuthActionResult } from './types';

type RequestPasswordResetInput = {
  email: string;
};

export const requestPasswordResetAction = createServerAction({
  handler: async ({ email }: RequestPasswordResetInput): Promise<AuthActionResult> => {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: '/reset-password' satisfies NextRoute },
    });

    return { status: 'success' };
  },
});
