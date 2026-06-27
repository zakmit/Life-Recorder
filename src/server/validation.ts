import { z } from 'zod'

/**
 * Shared validation schemas for server-function inputs. Server functions never
 * trust a client-supplied user id; ownership always comes from the session.
 * These schemas therefore validate payload shape only, not identity.
 */

export const preferenceUpdateSchema = z
  .object({
    themeName: z.enum(['Seashore[Blue]', 'Seashore']).optional(),
    pomoMinutes: z.number().int().positive().max(24 * 60).optional(),
    showHours: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'At least one preference field is required',
  })

export type PreferenceUpdateInput = z.infer<typeof preferenceUpdateSchema>

// A single processed pattern point: [max, min] derived from frequency data.
const patternPointSchema = z.tuple([
  z.number().int().min(0).max(255),
  z.number().int().min(0).max(255),
])

export const createEntrySchema = z.object({
  title: z.string().max(200).default(''),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  elapse: z.number().int().min(0),
  isPomodoro: z.boolean(),
  pattern: z.array(patternPointSchema).max(2000),
})

export type CreateEntryInput = z.infer<typeof createEntrySchema>

export const rangeQuerySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
})

export const latestQuerySchema = z.object({
  before: z.coerce.date().optional(),
})
