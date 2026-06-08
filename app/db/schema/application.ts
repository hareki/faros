import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  check,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { users } from '@/app/db/schema/auth';
import { jobHunts } from '@/app/db/schema/job-hunt';
import { resumes } from '@/app/db/schema/resume';

// Top-level board stages. Rendered as columns in the UI, but they are stages.
export const boardStage = pgEnum('board_stage', ['applied', 'active', 'final_stages', 'closed']);
export const closedOutcome = pgEnum('closed_outcome', [
  'rejected',
  'withdrawn',
  'accepted',
  'ghosted',
]);
export const applicationSource = pgEnum('application_source', [
  'linkedin',
  'itviec',
  'referral',
  'direct',
  'recruiter',
  'other',
]);
export const workingModel = pgEnum('working_model', ['remote', 'hybrid', 'onsite']);

// User-configurable sub-stages (HR screen, tech screen, onsite, etc.)
export const subStages = pgTable(
  'sub_stages',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar().notNull(),
    // which board stage this sub-stage belongs to
    stage: boardStage().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('sub_stages_user_stage_name_unique').on(table.userId, table.stage, table.name),
    // Target for the composite FK from applications(sub_stage_id, stage) — id alone is
    // already unique, but the FK must reference an exact unique constraint on (id, stage).
    unique('sub_stages_id_stage_unique').on(table.id, table.stage),
  ],
);

export const applications = pgTable(
  'applications',
  {
    id: uuid().primaryKey().defaultRandom(),
    jobHuntId: uuid('job_hunt_id')
      .notNull()
      .references(() => jobHunts.id, { onDelete: 'cascade' }),
    company: varchar().notNull(),
    role: varchar().notNull(),

    // Board position
    stage: boardStage().notNull().default('applied'),
    subStageId: uuid('sub_stage_id').references(() => subStages.id, { onDelete: 'set null' }),

    // Optional metadata (all nullable on purpose)
    source: applicationSource(),
    jdUrl: varchar('jd_url'),
    // fallback if posting gets taken down
    jdText: text('jd_text'),
    location: varchar(),
    workingModel: workingModel('working_model'),
    salaryMin: integer('salary_min'),
    salaryMax: integer('salary_max'),
    salaryCurrency: varchar('salary_currency'),
    notes: text(),

    // Resume used for this application (circular ref with resumes.application_id).
    // AnyPgColumn return annotation breaks the circular type inference.
    resumeId: uuid('resume_id').references((): AnyPgColumn => resumes.id, {
      onDelete: 'set null',
    }),

    // Closed-state details: both set iff stage = 'closed' (see CHECK below).
    closedOutcome: closedOutcome('closed_outcome'),
    closedAt: timestamp('closed_at', { withTimezone: true }),

    appliedAt: timestamp('applied_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('applications_job_hunt_stage_idx').on(table.jobHuntId, table.stage),
    index('applications_sub_stage_id_idx').on(table.subStageId),
    // Integrity FK (ADR-0001): a card's sub-stage must belong to its own stage. The
    // inline single-column FK above keeps onDelete='set null'; this one is NO ACTION and,
    // with MATCH SIMPLE, is skipped once sub_stage_id is nulled — so deleting a sub-stage
    // still works while a cross-stage mismatch is rejected.
    foreignKey({
      columns: [table.subStageId, table.stage],
      foreignColumns: [subStages.id, subStages.stage],
      name: 'applications_sub_stage_stage_fk',
    }),
    check(
      'applications_closed_state',
      sql`(${table.stage} = 'closed' AND ${table.closedOutcome} IS NOT NULL AND ${table.closedAt} IS NOT NULL)
       OR (${table.stage} <> 'closed' AND ${table.closedOutcome} IS NULL AND ${table.closedAt} IS NULL)`,
    ),
  ],
);

// Free-form filter tags (frontend, remote, startup, etc.) - user-owned, reusable
export const tags = pgTable(
  'tags',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar().notNull(),
    color: varchar(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('tags_user_name_unique').on(table.userId, table.name)],
);

export const applicationTags = pgTable(
  'application_tags',
  {
    applicationId: uuid('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.applicationId, table.tagId] })],
);
