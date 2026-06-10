import { getTableName, is, sql } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

import { db } from '@/app/db/client';
import * as schema from '@/app/db/schema';
import { accounts, applications, jobHunts, users } from '@/app/db/schema';
import { auth } from '@/app/lib/better-auth';

// Wipes every table (schema-derived, like app/db/seed.ts). CASCADE makes FK
// ordering irrelevant. Runs between tests for isolation.
export async function truncateAll() {
  const tables = Object.values(schema).filter((value) => is(value, PgTable)) as PgTable[];
  const names = tables.map((table) => `"${getTableName(table)}"`).join(', ');

  await db.execute(sql.raw(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`));
}

// Inserts a verified user with a credential account, reusing Better Auth's own
// hasher so the stored hash matches the live verifier (mirrors app/db/seed.ts).
export async function createVerifiedUser({ email, password }: { email: string; password: string }) {
  const [user] = await db
    .insert(users)
    .values({ email, name: email.split('@')[0], emailVerified: true })
    .returning();

  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(password);

  await db.insert(accounts).values({
    userId: user.id,
    accountId: user.id,
    providerId: 'credential',
    password: hashedPassword,
  });

  return user;
}

// Builds the user => job_hunt => application chain so activity-log tests have a real
// application_id to attach rows to. Returns the new application's id.
export async function createApplication(
  overrides: {
    company?: string;
    role?: string;
    stage?: (typeof schema.boardStage.enumValues)[number];
  } = {},
) {
  const email = `app-${crypto.randomUUID()}@example.com`;
  const [user] = await db
    .insert(users)
    .values({ email, name: email.split('@')[0], emailVerified: true })
    .returning();

  const [hunt] = await db
    .insert(jobHunts)
    .values({ userId: user.id, name: 'Test Hunt' })
    .returning();

  const [application] = await db
    .insert(applications)
    .values({
      jobHuntId: hunt.id,
      company: overrides.company ?? 'Acme',
      role: overrides.role ?? 'Engineer',
      stage: overrides.stage ?? 'applied',
    })
    .returning();

  return application.id;
}
