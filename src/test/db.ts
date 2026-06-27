import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '#/db/schema'
import type { Database as AppDatabase } from '#/db/client'

const MIGRATIONS_DIR = join(process.cwd(), 'src/db/migrations')

/**
 * Build an in-memory SQLite database with the production schema applied, then
 * wrap it in a Drizzle client typed as the app's D1-backed `Database`. The
 * Drizzle query API is identical across the D1 and better-sqlite3 drivers, so
 * repositories run unchanged against this test database.
 */
export function createTestDb(): AppDatabase {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
    // Drizzle migration files separate statements with this breakpoint marker.
    for (const statement of sql.split('--> statement-breakpoint')) {
      const trimmed = statement.trim()
      if (trimmed) sqlite.exec(trimmed)
    }
  }

  return drizzle(sqlite, { schema }) as unknown as AppDatabase
}

/**
 * Insert a Better-Auth-style user row so foreign-key-constrained product rows
 * can reference it in tests.
 */
export async function seedUser(
  db: AppDatabase,
  id: string,
  email = `${id}@example.com`,
): Promise<void> {
  await db.insert(schema.user).values({
    id,
    name: id,
    email,
    emailVerified: true,
  })
}
