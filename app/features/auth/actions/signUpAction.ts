'use server';

import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';

import { buildSignUpSchema } from '@/app/features/auth/schemas/signUp';
import { auth } from '@/app/lib/better-auth';
import { createServerAction } from '@/app/lib/next/createServerAction';
import { type NextRoute } from '@/app/types/common';

import { type AuthActionResult } from './types';

export const signUpAction = createServerAction({
  schema: buildSignUpSchema,
  handler: async ({ email, password }): Promise<AuthActionResult> => {
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

      // Unknown failure — let the wrapper log it and return errorGeneric.
      throw error;
    }
  },
});
