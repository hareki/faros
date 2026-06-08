import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { applications } from '@/app/db/schema/application';

export const activityType = pgEnum('activity_type', [
  'created',
  'stage_change',
  'sub_stage_change',
  'note_added',
  'response_received',
  'offer_received',
  'event_scheduled',
  'event_completed',
  'event_cancelled',
  'resume_changed',
  'closed',
]);

export const activityLog = pgTable(
  'activity_log',
  {
    id: uuid().primaryKey().defaultRandom(),
    applicationId: uuid('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    type: activityType().notNull(),
    description: text(),
    // Structured payload for diffs: { from: 'applied', to: 'active' }, etc.
    // Keeps the table generic without a column per activity flavor.
    metadata: jsonb(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('activity_log_application_occurred_idx').on(table.applicationId, table.occurredAt),
  ],
);
