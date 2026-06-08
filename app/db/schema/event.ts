import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { applications } from '@/app/db/schema/application';

// ============================================================
// EVENTS (future-dated: interviews, take-homes, deadlines)
// ============================================================

export const eventType = pgEnum('event_type', [
  'hr_screen',
  'tech_screen',
  'onsite',
  'take_home_due',
  'offer_deadline',
  'other',
]);
export const eventStatus = pgEnum('event_status', ['scheduled', 'completed', 'cancelled']);

export const events = pgTable(
  'events',
  {
    id: uuid().primaryKey().defaultRandom(),
    applicationId: uuid('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    type: eventType().notNull(),
    title: varchar(),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    durationMinutes: integer('duration_minutes'),
    // address or video link
    location: varchar(),
    notes: text(),
    status: eventStatus().notNull().default('scheduled'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // hot path: events list in the application drawer + ON DELETE CASCADE when the
    // application is removed.
    index('events_application_id_idx').on(table.applicationId),
    // hot path: the global time-based reminder cron — "events scheduled in the next N days
    // across all users". This serves the engine scan, NOT the hunt-scoped dashboard
    // upcoming-events read (which filters via the application join); don't drop it on the
    // assumption that the dashboard is its only reader.
    index('events_scheduled_at_idx').on(table.scheduledAt),
  ],
);
