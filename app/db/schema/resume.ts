import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  check,
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { applications } from '@/app/db/schema/application';
import { users } from '@/app/db/schema/auth';

// ============================================================
// RESUME
// ============================================================
// Scope rules:
//   scope = 'library'     + application_id IS NULL  -> shows in picker, reusable
//   scope = 'application' + application_id = <id>   -> hidden from picker, one-off
// Invariant: (scope = 'library') <=> (application_id IS NULL), enforced by the CHECK below.

export const resumeScope = pgEnum('resume_scope', ['library', 'application']);

export const resumes = pgTable(
  'resumes',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar().notNull(),
    scope: resumeScope().notNull(),
    // set if scope = application; circular ref with applications.resume_id.
    // AnyPgColumn return annotation breaks the circular type inference.
    applicationId: uuid('application_id').references((): AnyPgColumn => applications.id, {
      onDelete: 'cascade',
    }),

    // object storage path/key
    fileUrl: varchar('file_url').notNull(),
    fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
    mimeType: varchar('mime_type'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('resumes_user_scope_idx').on(table.userId, table.scope),
    index('resumes_application_id_idx').on(table.applicationId),
    check(
      'resumes_scope_app_id',
      sql`(${table.scope} = 'library' AND ${table.applicationId} IS NULL)
       OR (${table.scope} = 'application' AND ${table.applicationId} IS NOT NULL)`,
    ),
  ],
);
