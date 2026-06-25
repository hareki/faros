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

// Type cycles are broken via AnyPgColumn, and the FK
// references are lazy callbacks resolved after all modules load.
// eslint-disable-next-line import-x/no-cycle
import { applications } from '@/src/features/application/db/schema';
import { users } from '@/src/features/auth/db/schema';

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
    // Soft delete (ADR-0003): NULL = live. Deleting a library resume removes it from the
    // picker but keeps the row so applications.resume_id attribution survives.
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // hot path: resume-library list — a user's library-scope resumes for the picker
    // (WHERE user_id AND scope='library').
    index('resumes_user_scope_idx').on(table.userId, table.scope),
    // hot path: one-off resumes scoped to an application + ON DELETE CASCADE when the
    // application is removed.
    index('resumes_application_id_idx').on(table.applicationId),
    check(
      'resumes_scope_app_id',
      sql`(${table.scope} = 'library' AND ${table.applicationId} IS NULL)
       OR (${table.scope} = 'application' AND ${table.applicationId} IS NOT NULL)`,
    ),
  ],
);
