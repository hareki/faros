import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

import { db } from '@/app/db/client';
import * as schema from '@/app/db/schema';
import { env } from '@/app/lib/t3-env';

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  // https://better-auth.com/docs/adapters/drizzle#using-plural-table-names
  database: drizzleAdapter(db, { provider: 'pg', schema, usePlural: true }),
  // Let Postgres generate ids via gen_random_uuid() (our uuid PK defaults).
  advanced: { database: { generateId: 'uuid' } },
  // Verification + reset flows are wired in later todos (D.41–42).
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
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
  // nextCookies() must be the last plugin — it lets server actions set
  // the auth cookies that the upcoming auth flows rely on.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
