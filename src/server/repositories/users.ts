import { eq } from 'drizzle-orm'
import { user } from '#/db/schema'
import type { Database } from '#/db/client'
import type { User } from '#/db/schema'

/**
 * User reads. User creation itself is owned by Better Auth's adapter; this
 * repository only exposes lookups the product code needs.
 */
export function makeUsersRepository(db: Database) {
  return {
    async findById(id: string): Promise<User | null> {
      const rows = await db.select().from(user).where(eq(user.id, id)).limit(1)
      return rows[0] ?? null
    },
  }
}

export type UsersRepository = ReturnType<typeof makeUsersRepository>
