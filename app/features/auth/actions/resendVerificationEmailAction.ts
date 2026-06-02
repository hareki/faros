'use server';

import { auth } from '@/app/lib/better-auth';
import { createServerAction } from '@/app/lib/next/createServerAction';
import { type NextRoute } from '@/app/types/common';

import { type AuthActionResult } from './types';

type ResendVerificationEmailInput = {
  email: string;
};

export const resendVerificationEmailAction = createServerAction({
  handler: async ({ email }: ResendVerificationEmailInput): Promise<AuthActionResult> => {
    await auth.api.sendVerificationEmail({
      body: { email, callbackURL: '/' satisfies NextRoute },
    });

    return { status: 'success' };
  },
});
