import '@/app/lib/t3-env/load-env';

import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';

import { getTableName, is, sql } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

import { db } from '@/app/db/client';
import * as schema from '@/app/db/schema';
import {
  accounts,
  activityLog,
  applicationTags,
  applications,
  events,
  jobHunts,
  resumes,
  subStages,
  tags,
  users,
} from '@/app/db/schema';
import { auth } from '@/app/lib/better-auth';

const SEED_EMAIL = 'minhtu1392000@gmail.com';
// Super weak on purpose — local testing only.
const SEED_PASSWORD = 'admin';

const DAY = 24 * 60 * 60 * 1000;

// Interactive guard: every run wipes the ENTIRE database, so make the caller
// confirm. Pass --yes / -y to skip the prompt (CI / scripted runs).
async function confirmWipe() {
  if (process.argv.includes('--yes') || process.argv.includes('-y')) {
    return;
  }

  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(
    '\n⚠️  WARNING: this will PERMANENTLY DELETE ALL data in the database before seeding.\n   Type "yes" to continue: ',
  );

  rl.close();

  if (answer.trim().toLowerCase() !== 'yes') {
    console.log('Aborted. No changes made.');
    process.exit(0);
  }
}

// Truncate every table in one shot. The table list is derived from the schema
// so nothing is missed; CASCADE makes FK ordering irrelevant and RESTART
// IDENTITY is harmless (all PKs are uuid defaultRandom).
async function wipe() {
  console.log('Wiping all tables...');
  const tables = Object.values(schema).filter((value) => is(value, PgTable)) as PgTable[];
  const names = tables.map((t) => `"${getTableName(t)}"`).join(', ');

  await db.execute(sql.raw(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`));
}

async function seed() {
  console.log('Seeding user...');
  const [user] = await db
    .insert(users)
    .values({ email: SEED_EMAIL, name: 'Dev User', emailVerified: true })
    .returning();

  // Credential (non-OAuth) account so the seeded user can sign in with
  // email/password. Reuse Better Auth's own hasher so the stored hash always
  // matches the live verifier; credential rows use users.id as accountId.
  console.log('Seeding credential account...');
  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(SEED_PASSWORD);

  await db.insert(accounts).values({
    userId: user.id,
    accountId: user.id,
    providerId: 'credential',
    password: hashedPassword,
  });

  console.log('Seeding job_hunt...');
  const [hunt] = await db
    .insert(jobHunts)
    .values({ userId: user.id, name: '2026 Senior FE Hunt', status: 'active' })
    .returning();

  console.log('Seeding sub-stages...');
  const [, techScreen, onsite] = await db
    .insert(subStages)
    .values([
      { userId: user.id, stage: 'active', name: 'HR Screen', sortOrder: 0 },
      { userId: user.id, stage: 'active', name: 'Tech Screen', sortOrder: 1 },
      { userId: user.id, stage: 'final_stages', name: 'Onsite', sortOrder: 0 },
    ])
    .returning();

  console.log('Seeding tags...');
  const tagRows = await db
    .insert(tags)
    .values([
      { userId: user.id, name: 'frontend', color: '#89b4fa' },
      { userId: user.id, name: 'remote', color: '#a6e3a1' },
      { userId: user.id, name: 'startup', color: '#f9e2af' },
    ])
    .returning();

  // Library resumes (scope = 'library', application_id NULL).
  console.log('Seeding library resumes...');
  const [resumeFE, resumeGeneric] = await db
    .insert(resumes)
    .values([
      {
        userId: user.id,
        name: 'Frontend Resume',
        scope: 'library',
        fileUrl: 'https://blob.example/fe.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 142_000,
      },
      {
        userId: user.id,
        name: 'Generalist Resume',
        scope: 'library',
        fileUrl: 'https://blob.example/generic.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 138_000,
      },
    ])
    .returning();

  // Applications across all 4 board stages (closed one satisfies the CHECK).
  console.log('Seeding applications...');
  const [applied, active, finalApp, closed] = await db
    .insert(applications)
    .values([
      {
        jobHuntId: hunt.id,
        company: 'Acme',
        role: 'Senior FE Engineer',
        stage: 'applied',
        source: 'linkedin',
        resumeId: resumeFE.id,
        location: 'Remote',
        workingModel: 'remote',
      },
      {
        jobHuntId: hunt.id,
        company: 'Globex',
        role: 'Frontend Engineer',
        stage: 'active',
        subStageId: techScreen.id,
        source: 'referral',
        resumeId: resumeFE.id,
      },
      {
        jobHuntId: hunt.id,
        company: 'Initech',
        role: 'UI Engineer',
        stage: 'final_stages',
        subStageId: onsite.id,
        source: 'direct',
        resumeId: resumeGeneric.id,
      },
      {
        jobHuntId: hunt.id,
        company: 'Hooli',
        role: 'Web Engineer',
        stage: 'closed',
        source: 'recruiter',
        closedOutcome: 'rejected',
        closedAt: new Date(),
      },
    ])
    .returning();

  // One-off, application-scoped resume (scope = 'application', application_id set).
  console.log('Seeding application-scoped resume...');
  await db.insert(resumes).values({
    userId: user.id,
    name: 'Globex-tailored',
    scope: 'application',
    applicationId: active.id,
    fileUrl: 'https://blob.example/globex.pdf',
    mimeType: 'application/pdf',
    fileSizeBytes: 145_000,
  });

  console.log('Seeding application tags...');
  await db.insert(applicationTags).values([
    { applicationId: applied.id, tagId: tagRows[0].id },
    { applicationId: applied.id, tagId: tagRows[1].id },
    { applicationId: active.id, tagId: tagRows[0].id },
    { applicationId: finalApp.id, tagId: tagRows[2].id },
  ]);

  console.log('Seeding events...');
  await db.insert(events).values([
    {
      applicationId: active.id,
      type: 'tech_screen',
      title: 'Tech screen w/ Globex',
      scheduledAt: new Date(Date.now() + 2 * DAY),
      durationMinutes: 60,
      location: 'https://meet.example/globex',
    },
    {
      applicationId: finalApp.id,
      type: 'onsite',
      title: 'Initech onsite',
      scheduledAt: new Date(Date.now() + 5 * DAY),
      durationMinutes: 240,
      location: 'Initech HQ',
    },
  ]);

  console.log('Seeding activity log...');
  await db.insert(activityLog).values([
    { applicationId: applied.id, type: 'created', description: 'Application created' },
    { applicationId: active.id, type: 'created', description: 'Application created' },
    {
      applicationId: active.id,
      type: 'stage_change',
      description: 'Moved Applied => Active',
      metadata: { from: 'applied', to: 'active' },
    },
    { applicationId: active.id, type: 'sub_stage_change', metadata: { to: 'Tech Screen' } },
    { applicationId: finalApp.id, type: 'created' },
    {
      applicationId: finalApp.id,
      type: 'stage_change',
      metadata: { from: 'active', to: 'final_stages' },
    },
    { applicationId: closed.id, type: 'created' },
    {
      applicationId: closed.id,
      type: 'closed',
      description: 'Rejected',
      metadata: { outcome: 'rejected' },
    },
  ]);

  console.log(
    `Seeded ${user.email} (password: ${SEED_PASSWORD}): hunt "${hunt.name}", 3 sub-stages, ` +
      `${tagRows.length} tags, 4 applications (1 per stage), 3 resumes, 2 events.`,
  );
}

async function main() {
  await confirmWipe();
  await wipe();
  await seed();
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
