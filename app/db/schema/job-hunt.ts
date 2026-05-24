import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from '@/app/db/schema/auth';

export const jobHuntStatus = pgEnum('job_hunt_status', ['active', 'ended']);

export const jobHunts = pgTable(
  'job_hunts',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar().notNull(),
    status: jobHuntStatus().notNull().default('active'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Partial unique index enforces "one active job_hunt per user".
    uniqueIndex('one_active_job_hunt_per_user')
      .on(table.userId)
      .where(sql`${table.status} = 'active'`),
  ],
);
