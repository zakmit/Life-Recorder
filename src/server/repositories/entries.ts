import { and, asc, desc, eq, gte, lt } from 'drizzle-orm'
import { entries } from '#/db/schema'
import type { Database } from '#/db/client'
import type { Entry } from '#/db/schema'

export type PatternPoint = [number, number]

export type CreateEntryInput = {
  userId: string
  title: string
  startTime: Date
  endTime: Date
  elapse: number
  isPomodoro: boolean
  pattern: Array<PatternPoint>
}

const LATEST_LIMIT = 10

function newId(): string {
  // crypto.randomUUID is available in the Workers runtime and in Node 19+.
  return crypto.randomUUID()
}

/**
 * Timer-entry persistence. Mirrors the legacy `communication` query surface:
 * newEntry, retrieveLatest10 (cursor by startTime), findByID (all), and
 * findByIDandTime (range). Every query is scoped by `userId`.
 */
export function makeEntriesRepository(db: Database) {
  return {
    async create(input: CreateEntryInput): Promise<Entry> {
      const id = newId()
      await db.insert(entries).values({
        id,
        userId: input.userId,
        title: input.title,
        startTime: input.startTime,
        endTime: input.endTime,
        elapse: input.elapse,
        isPomodoro: input.isPomodoro,
        pattern: input.pattern,
      })
      const rows = await db
        .select()
        .from(entries)
        .where(eq(entries.id, id))
        .limit(1)
      return rows[0]
    },

    /** All entries for a user, newest start time first (table view). */
    async findAll(userId: string): Promise<Array<Entry>> {
      return db
        .select()
        .from(entries)
        .where(eq(entries.userId, userId))
        .orderBy(desc(entries.startTime))
    },

    /**
     * The latest entries for a user, newest first. Optionally paginate by
     * passing a `before` cursor (only entries started strictly before it).
     */
    async findLatest(userId: string, before?: Date): Promise<Array<Entry>> {
      const condition = before
        ? and(eq(entries.userId, userId), lt(entries.startTime, before))
        : eq(entries.userId, userId)
      return db
        .select()
        .from(entries)
        .where(condition)
        .orderBy(desc(entries.startTime))
        .limit(LATEST_LIMIT)
    },

    /** Entries that started within [start, end), oldest first (chart view). */
    async findInRange(
      userId: string,
      start: Date,
      end: Date,
    ): Promise<Array<Entry>> {
      return db
        .select()
        .from(entries)
        .where(
          and(
            eq(entries.userId, userId),
            gte(entries.startTime, start),
            lt(entries.startTime, end),
          ),
        )
        .orderBy(asc(entries.startTime))
    },
  }
}

export type EntriesRepository = ReturnType<typeof makeEntriesRepository>
