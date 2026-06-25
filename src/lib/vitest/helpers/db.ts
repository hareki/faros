import { getTableName, is, sql } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

import { db } from '@/src/db/client';
import * as schema from '@/src/db/schema';
import { accounts, applications, jobHunts, users } from '@/src/db/schema';
import { auth } from '@/src/lib/better-auth';

// Wipes every table (schema-derived, like src/db/seed.ts). CASCADE makes FK
// ordering irrelevant. Runs between tests for isolation.
export async function truncateAll() {
  const tables = Object.values(schema).filter((value) => is(value, PgTable)) as PgTable[];
  const names = tables.map((table) => `"${getTableName(table)}"`).join(', ');

  await db.execute(sql.raw(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`));
}

// Inserts a verified user with a credential account, reusing Better Auth's own
// hasher so the stored hash matches the live verifier (mirrors src/db/seed.ts).
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

// Inserts a verified user (no credential account). Returns the new user row.
export async function createUser(overrides: { email?: string } = {}) {
  const email = overrides.email ?? `user-${crypto.randomUUID()}@example.com`;
  const [user] = await db
    .insert(users)
    .values({ email, name: email.split('@')[0], emailVerified: true })
    .returning();

  return user;
}

// Inserts a job_hunt for the given user. Defaults to an active hunt.
export async function createJobHunt(
  userId: string,
  overrides: {
    name?: string;
    status?: (typeof schema.jobHuntStatus.enumValues)[number];
  } = {},
) {
  const [hunt] = await db
    .insert(jobHunts)
    .values({
      userId,
      name: overrides.name ?? 'Test Hunt',
      status: overrides.status ?? 'active',
    })
    .returning();

  return hunt;
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
  const user = await createUser();
  const hunt = await createJobHunt(user.id);

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
