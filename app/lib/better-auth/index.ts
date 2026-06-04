import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

import { db } from '@/app/db/client';
import * as schema from '@/app/db/schema';
import {
  sendExistingAccountEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from '@/app/features/auth/utils/email';
import { serverEnv } from '@/app/lib/t3-env/server';

import { MIN_PASSWORD_LENGTH } from '../zod/constants';

export const auth = betterAuth({
  baseURL: serverEnv.BETTER_AUTH_URL,
  secret: serverEnv.BETTER_AUTH_SECRET,
  // https://better-auth.com/docs/adapters/drizzle#using-plural-table-names
  database: drizzleAdapter(db, { provider: 'pg', schema, usePlural: true }),
  // Let Postgres generate ids via gen_random_uuid() (our uuid PK defaults).
  advanced: { database: { generateId: 'uuid' } },
  // One account per email. Signing in with a provider whose VERIFIED email
  // matches an existing user links that provider to the same user instead of
  // creating a second account. Verified-email only: no `trustedProviders`, so a
  // provider that doesn't confirm email verification will not force-link.
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    // Sign-up into email-enumeration protection (OWASP), a duplicate
    // email gets the same generic success + a synthetic user instead of a USER_ALREADY_EXISTS
    // error, and no verification email is sent, `onExistingUserSignUp` is invoked
    // https://better-auth.com/docs/authentication/email-password#require-email-verification
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    // `url` already has the reset token + callbackURL baked in; Resend sends it.
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({ to: user.email, url });
    },
    onExistingUserSignUp: async ({ user }) => {
      await sendExistingAccountEmail({ to: user.email });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ to: user.email, url });
    },
  },
  socialProviders: {
    google: {
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: serverEnv.GITHUB_CLIENT_ID,
      clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (DB session lifetime)
    updateAge: 60 * 60 * 24, // 1 day (sliding refresh of expiry)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 min: reads served from the cookie, no DB hit
      version: '1', // bump + redeploy = immediate global cookie revocation
      strategy: 'compact', // signed (tamper-proof) but readable base64 JSON
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
