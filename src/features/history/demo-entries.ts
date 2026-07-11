import type { Entry } from '#/db/schema'

const DEMO_USER_ID = 'demo'

export const DEMO_ENTRIES: ReadonlyArray<Entry> = [
  {
    id: 'demo-deep-work',
    userId: DEMO_USER_ID,
    title: 'Deep work',
    startTime: new Date('2026-07-08T09:00:00Z'),
    endTime: new Date('2026-07-08T09:25:00Z'),
    elapse: 1500,
    isPomodoro: true,
    pattern: [
      [24, 4],
      [82, 20],
      [148, 36],
      [212, 64],
    ],
    createdAt: new Date('2026-07-08T09:25:00Z'),
  },
  {
    id: 'demo-reading',
    userId: DEMO_USER_ID,
    title: 'Reading',
    startTime: new Date('2026-07-09T14:10:00Z'),
    endTime: new Date('2026-07-09T14:55:00Z'),
    elapse: 2700,
    isPomodoro: false,
    pattern: [
      [36, 8],
      [104, 28],
      [176, 48],
      [232, 72],
    ],
    createdAt: new Date('2026-07-09T14:55:00Z'),
  },
  {
    id: 'demo-planning',
    userId: DEMO_USER_ID,
    title: 'Weekly planning',
    startTime: new Date('2026-07-10T03:30:00Z'),
    endTime: new Date('2026-07-10T03:50:00Z'),
    elapse: 1200,
    isPomodoro: false,
    pattern: [
      [18, 2],
      [72, 16],
      [132, 32],
      [198, 54],
    ],
    createdAt: new Date('2026-07-10T03:50:00Z'),
  },
]
