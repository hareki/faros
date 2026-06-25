import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// ============================================================
// AUTH (Better Auth, DB-backed sessions + cookie cache)
// ============================================================
// Four tables: users, accounts, sessions, verifications. All are
// managed by Better Auth via the Drizzle adapter; app code
// generally does not write to them directly.
//
// Sessions live in the `sessions` table. A short-lived signed
// cookie cache (configured in src/lib/auth) serves session reads
// without a DB hit; once it lapses the next read revalidates
// against this table. See the header of docs/database.dbml for the
// session/cookie-cache config rationale.

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar().notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: varchar().notNull(),
  // avatar url, populated from OAuth profile when available
  image: varchar(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * One row per auth method per user. A single user can have multiple
 * rows (linked Google + GitHub + credential).
 */
export const accounts = pgTable(
  'accounts',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // provider account id, or users.id for credential
    accountId: varchar('account_id').notNull(),
    // 'credential' | 'google' | 'github'
    providerId: varchar('provider_id').notNull(),

    // OAuth tokens (nullable, only set for OAuth providers)
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: varchar(),
    idToken: text('id_token'),

    // password hash; only set when provider_id = credential
    password: text(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // hot path: listAccounts for a user + ON DELETE CASCADE lookups when a user is removed.
    index('accounts_user_id_idx').on(table.userId),
    // hot path: sign-in lookup of an identity by (provider, account_id). Also enforces that
    // the same provider identity cannot be linked to two different users.
    uniqueIndex('accounts_provider_account_unique').on(table.providerId, table.accountId),
  ],
);

// https://better-auth.com/docs/concepts/session-management#session-table
export const sessions = pgTable(
  'sessions',
  {
    id: uuid().primaryKey().defaultRandom(),
    token: varchar().notNull().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    // captured from the request when the session is created; nullable
    ipAddress: varchar('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // hot path: "revoke all sessions for a user" + list-sessions, and ON DELETE CASCADE
  // lookups when a user is removed.
  (table) => [index('sessions_user_id_idx').on(table.userId)],
);

/**
 * Email verification, password reset, magic links. These tokens MUST
 * persist server-side; they cannot live in cookies. Better Auth
 * writes/reads this; app code does not touch it directly.
 */
export const verifications = pgTable(
  'verifications',
  {
    id: uuid().primaryKey().defaultRandom(),
    // email or other identifier being verified
    identifier: varchar().notNull(),
    // token / code
    value: varchar().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // hot path: Better Auth resolves an email-verification / password-reset token by
  // `identifier` on every confirm; without this the short-lived table is seq-scanned.
  (table) => [index('verifications_identifier_idx').on(table.identifier)],
);
