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
// AUTH (Better Auth, stateless JWT — no sessions table)
// ============================================================
// Managed by Better Auth via the Drizzle adapter. App code
// generally does not write to these directly. See the header of
// docs/database.dbml for the Better Auth field-mapping config.

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

// One row per auth method per user. A single user can have multiple
// rows (linked Google + GitHub + credential).
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
    index('accounts_user_id_idx').on(table.userId),
    // Same provider identity cannot be linked to two different users.
    uniqueIndex('accounts_provider_account_unique').on(table.providerId, table.accountId),
  ],
);

// Email verification, password reset, magic links. These tokens MUST
// persist server-side; they cannot live in cookies. Better Auth
// writes/reads this; app code does not touch it directly.
export const verifications = pgTable('verifications', {
  id: uuid().primaryKey().defaultRandom(),
  // email or other identifier being verified
  identifier: varchar().notNull(),
  // token / code
  value: varchar().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
