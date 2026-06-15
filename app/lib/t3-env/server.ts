import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const serverEnv = createEnv({
  server: {
    APP_URL: z.url(),
    STAGE: z.enum(['development', 'production']),
    DB_CONNECTION_STRING: z.url(),
    RESEND_API_KEY: z.string(),
    RESEND_FROM_EMAIL: z.string(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
  },
  experimental__runtimeEnv: process.env,
});
