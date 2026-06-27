import { createServerFn } from '@tanstack/react-start'
import { requireUser } from '#/server/auth.server'
import { getRepositories } from '#/server/repositories'
import {
  createEntrySchema,
  latestQuerySchema,
  rangeQuerySchema,
} from '#/server/validation'
import type {
  CreateEntryInput,
  rangeQuerySchema as RangeSchema,
} from '#/server/validation'
import type { z } from 'zod'

/**
 * Persist a completed timer entry for the signed-in user. The entry is owned
 * by the session user; the payload cannot set a different owner.
 */
export const createEntry = createServerFn({ method: 'POST' })
  .validator((data: CreateEntryInput) => createEntrySchema.parse(data))
  .handler(async ({ data }) => {
    const user = await requireUser()
    const { entries } = getRepositories()
    return entries.create({
      userId: user.id,
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      elapse: data.elapse,
      isPomodoro: data.isPomodoro,
      pattern: data.pattern,
    })
  })

/** Latest entries for the signed-in user (cards view, paginated by cursor). */
export const getLatestEntries = createServerFn({ method: 'GET' })
  .validator((data: unknown) => latestQuerySchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const user = await requireUser()
    const { entries } = getRepositories()
    return entries.findLatest(user.id, data.before)
  })

/** All entries for the signed-in user (table view). */
export const getAllEntries = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await requireUser()
    const { entries } = getRepositories()
    return entries.findAll(user.id)
  },
)

/** Entries within a date window for the signed-in user (chart view). */
export const getEntriesInRange = createServerFn({ method: 'GET' })
  .validator((data: z.infer<typeof RangeSchema>) =>
    rangeQuerySchema.parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireUser()
    const { entries } = getRepositories()
    return entries.findInRange(user.id, data.startDate, data.endDate)
  })
