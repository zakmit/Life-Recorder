import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * Schema for Life Recorder on Cloudflare D1 (SQLite).
 *
 * The `user`, `session`, `account`, and `verification` tables are the standard
 * Better Auth core schema. The `preferences` and `entries` tables carry the
 * product data ported from the legacy Mongoose models, scoped to a user.
 */

// --- Better Auth core tables ---

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .notNull()
    .default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp',
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp',
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})

// --- Product tables ---

/**
 * One preferences row per user. Maps the legacy `User` model fields:
 * themeName, pomoMinutes, showHours.
 */
export const preferences = sqliteTable('preferences', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  themeName: text('theme_name').notNull().default('Seashore[Blue]'),
  pomoMinutes: integer('pomo_minutes').notNull().default(10),
  showHours: integer('show_hours', { mode: 'boolean' }).notNull().default(true),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

/**
 * One row per recorded timer entry. Maps the legacy `Entry` model:
 * user, title, startTime, endTime, elapse, isPomodoro, pattern.
 *
 * `pattern` stores only processed signal points (pairs of derived peaks),
 * never raw audio. It is persisted as JSON text.
 */
export const entries = sqliteTable('entries', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default(''),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  elapse: integer('elapse').notNull(),
  isPomodoro: integer('is_pomodoro', { mode: 'boolean' })
    .notNull()
    .default(false),
  // JSON-encoded array of [max, min] processed pattern points.
  pattern: text('pattern', { mode: 'json' })
    .notNull()
    .$type<Array<[number, number]>>()
    .default(sql`'[]'`),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type User = typeof user.$inferSelect
export type Preferences = typeof preferences.$inferSelect
export type Entry = typeof entries.$inferSelect
export type NewEntry = typeof entries.$inferInsert
