import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { applications } from '@/src/features/application/db/schema';
import { users } from '@/src/features/auth/db/schema';
import { events } from '@/src/features/event/db/schema';

// ============================================================
// NOTIFICATION ENGINE (shared for action-needed + time-based)
// ============================================================

export const ruleKind = pgEnum('rule_kind', ['condition', 'time_based']);
export const notificationStatus = pgEnum('notification_status', [
  'unread',
  'read',
  'snoozed',
  'dismissed',
]);

export const notificationRules = pgTable(
  'notification_rules',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar().notNull(),
    kind: ruleKind().notNull(),
    enabled: boolean().notNull().default(true),

    // Flexible config so we don't need a new column per rule variant.
    // condition example:  { when: { stage: 'applied', idle_days_gte: 14 } }
    // time_based example: { when: { event_type: 'interview', offset_days: -3 } }
    triggerConfig: jsonb('trigger_config').notNull(),
    // delivery prefs override (channels, quiet hours), optional
    actionConfig: jsonb('action_config'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // hot path: the engine fetches a user's rules filtered by kind (condition vs time_based)
  // when evaluating each stream; also serves the settings rule list. `kind` is low-
  // cardinality, so it buys little over a plain (user_id) index — kept for the engine's
  // per-kind fetch, cheap to revisit if it never materializes.
  (table) => [index('notification_rules_user_kind_idx').on(table.userId, table.kind)],
);

/**
 * dedup_key prevents the same logical notification from firing repeatedly.
 * The engine relies on (user_id, dedup_key) for upsert/no-op on re-fire.
 */
export const notifications = pgTable(
  'notifications',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ruleId: uuid('rule_id').references(() => notificationRules.id, { onDelete: 'set null' }),
    // At most one of these is set; both nullable.
    applicationId: uuid('application_id').references(() => applications.id, {
      onDelete: 'set null',
    }),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),

    title: varchar().notNull(),
    content: text(),
    status: notificationStatus().notNull().default('unread'),
    snoozedUntil: timestamp('snoozed_until', { withTimezone: true }),

    // see comment above table for format
    dedupKey: varchar('dedup_key').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    readAt: timestamp('read_at', { withTimezone: true }),
  },
  (table) => [
    // hot path: the in-app notifications feed and unread badge count
    // (WHERE user_id AND status ORDER BY created_at).
    index('notifications_user_status_created_idx').on(table.userId, table.status, table.createdAt),
    // hot path: the engine's upsert/no-op on re-fire keyed by (user_id, dedup_key) so a
    // rule doesn't surface the same logical notification twice.
    uniqueIndex('notifications_user_dedup_key_unique').on(table.userId, table.dedupKey),
  ],
);

export const userNotificationPrefs = pgTable('user_notification_prefs', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  inAppEnabled: boolean('in_app_enabled').notNull().default(true),
  emailDigestEnabled: boolean('email_digest_enabled').notNull().default(false),
  // daily | weekly
  emailDigestCadence: varchar('email_digest_cadence'),
  quietHoursStart: time('quiet_hours_start'),
  quietHoursEnd: time('quiet_hours_end'),
  timezone: varchar(),
});
