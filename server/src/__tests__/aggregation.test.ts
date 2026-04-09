import request from 'supertest'
import express from 'express'

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    deployment: { findUnique: jest.fn() },
    response: { findMany: jest.fn() },
    sideQuest: { findMany: jest.fn() },
  },
}))

import prisma from '../lib/prisma'
import {
  getCurrentState,
  trimmedMean,
  buildCycleList,
  getCycleStart,
  clearCache,
} from '../engine/aggregation'
import stateRoutes from '../routes/state'

// ── Express app for route tests ──────────────────────────────────────────────
const app = express()
app.use(express.json())
app.use('/api/state', stateRoutes)

// ── Shared fixtures ───────────────────────────────────────────────────────────
const DEPLOYMENT_ID = 'dep-agg-1'
const NOW = new Date('2024-01-17T12:00:00Z') // Wednesday of 2024-W03

function makeDeployment(overrides: Record<string, unknown> = {}) {
  return {
    id: DEPLOYMENT_ID,
    submissionFrequency: 'WEEKLY',
    decayRate: 0.95,
    questions: ['How meaningful does your work feel?', 'How connected do you feel?', 'How confident are you?'],
    ...overrides,
  }
}

// Build a response object whose submittedAt falls in the given ISO week offset
// (0 = current week relative to NOW, -1 = previous week, etc.)
function makeResponse(weekOffset: number, answers: Array<{ questionIndex: number; value: number }>) {
  const d = new Date(NOW)
  d.setUTCDate(d.getUTCDate() + weekOffset * 7)
  return { answers, submittedAt: d }
}

// ── trimmedMean ───────────────────────────────────────────────────────────────
describe('trimmedMean', () => {
  it('returns the single value unchanged', () => {
    expect(trimmedMean([7])).toBe(7)
  })

  it('averages all values when fewer than 10 (no trimming)', () => {
    expect(trimmedMean([2, 4, 6, 8])).toBe(5)
  })

  it('drops outer 10% on each side for 10+ values', () => {
    // 10 values: sorted [1,2,3,4,5,6,7,8,9,10]
    // trim 1 from each end → [2,3,4,5,6,7,8,9] → mean = 44/8 = 5.5
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    expect(trimmedMean(values)).toBeCloseTo(5.5)
  })

  it('is resistant to outliers', () => {
    // 10 responses: one respondent answers 1, one answers 10, rest answer 7
    const values = [1, 7, 7, 7, 7, 7, 7, 7, 7, 10]
    // sorted: [1,7,7,7,7,7,7,7,7,10], trim 1 each side → [7,7,7,7,7,7,7,7] → 7
    expect(trimmedMean(values)).toBeCloseTo(7)
  })

  it('handles empty array', () => {
    expect(trimmedMean([])).toBe(0)
  })
})

// ── buildCycleList ─────────────────────────────────────────────────────────────
describe('buildCycleList', () => {
  it('returns correct weekly cycle IDs starting from current', () => {
    const cycles = buildCycleList('WEEKLY', 4, NOW)
    // NOW is 2024-01-17 = 2024-W03
    expect(cycles[0]).toBe('2024-W03')
    expect(cycles[1]).toBe('2024-W02')
    expect(cycles[2]).toBe('2024-W01')
    expect(cycles[3]).toBe('2023-W52')
  })

  it('returns correct daily cycle IDs', () => {
    const cycles = buildCycleList('DAILY', 3, NOW)
    expect(cycles[0]).toBe('2024-D017')
    expect(cycles[1]).toBe('2024-D016')
    expect(cycles[2]).toBe('2024-D015')
  })

  it('produces distinct IDs for each entry', () => {
    const cycles = buildCycleList('WEEKLY', 4, NOW)
    expect(new Set(cycles).size).toBe(4)
  })
})

// ── getCycleStart ──────────────────────────────────────────────────────────────
describe('getCycleStart', () => {
  it('returns Monday 00:00 UTC for weekly', () => {
    // NOW is Wednesday 2024-01-17; Monday of that week is 2024-01-15
    const start = getCycleStart('WEEKLY', NOW)
    expect(start.toISOString()).toBe('2024-01-15T00:00:00.000Z')
  })

  it('returns today 00:00 UTC for daily', () => {
    const start = getCycleStart('DAILY', NOW)
    expect(start.toISOString()).toBe('2024-01-17T00:00:00.000Z')
  })
})

// ── getCurrentState ───────────────────────────────────────────────────────────
describe('getCurrentState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearCache()
  })

  it('returns null for a non-existent deployment', async () => {
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(null)
    const result = await getCurrentState('nonexistent', { now: NOW })
    expect(result).toBeNull()
  })

  it('returns neutral 0.5 for all parameters when there are no responses', async () => {
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    const state = await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    expect(state).not.toBeNull()
    expect(state!.parameters[0].value).toBe(0.5)
    expect(state!.parameters[1].value).toBe(0.5)
    expect(state!.parameters[2].value).toBe(0.5)
    expect(state!.overallHealth).toBe(0.5)
  })

  it('normalises a perfect score (10) to 1.0', async () => {
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue([
      makeResponse(0, [{ questionIndex: 0, value: 10 }]),
    ])
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    const state = await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    expect(state!.parameters[0].value).toBeCloseTo(1.0)
  })

  it('normalises a minimum score (1) to 0.0', async () => {
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue([
      makeResponse(0, [{ questionIndex: 0, value: 1 }]),
    ])
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    const state = await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    expect(state!.parameters[0].value).toBeCloseTo(0.0)
  })

  it('applies temporal weighting — current cycle outweighs older cycles', async () => {
    // Current cycle: all 10s. Three cycles ago: all 1s.
    const responses = [
      makeResponse(0, [{ questionIndex: 0, value: 10 }]), // weight 1.0
      makeResponse(-3, [{ questionIndex: 0, value: 1 }]), // weight 0.2
    ]
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue(responses)
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    const state = await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    // Weighted mean: (1.0*10 + 0.2*1) / (1.0+0.2) = 10.2 / 1.2 = 8.5 → (8.5-1)/9 ≈ 0.833
    expect(state!.parameters[0].value).toBeCloseTo(0.833, 2)
  })

  it('applies decay when there are no current-cycle responses', async () => {
    // Only a response from 2 weeks ago
    const responses = [makeResponse(-2, [{ questionIndex: 0, value: 10 }])]
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue(responses)
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    // Response is 2 weeks (14 days) in the past relative to NOW
    const state = await getCurrentState(DEPLOYMENT_ID, { now: NOW })

    // Without decay: (10-1)/9 = 1.0; with 14 days at 0.95/day: 1.0 * 0.95^14 ≈ 0.488
    expect(state!.parameters[0].value).toBeCloseTo(Math.pow(0.95, 14), 2)
  })

  it('marks trend as rising when current > previous by more than 0.5 points', async () => {
    const responses = [
      makeResponse(0, [{ questionIndex: 0, value: 9 }]),  // current week
      makeResponse(-1, [{ questionIndex: 0, value: 5 }]), // previous week
    ]
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue(responses)
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    const state = await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    expect(state!.parameters[0].trend).toBe('rising')
  })

  it('marks trend as falling when current < previous by more than 0.5 points', async () => {
    const responses = [
      makeResponse(0, [{ questionIndex: 0, value: 3 }]),
      makeResponse(-1, [{ questionIndex: 0, value: 8 }]),
    ]
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue(responses)
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    const state = await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    expect(state!.parameters[0].trend).toBe('falling')
  })

  it('marks trend as stable when change is within 0.5 points', async () => {
    const responses = [
      makeResponse(0, [{ questionIndex: 0, value: 7 }]),
      makeResponse(-1, [{ questionIndex: 0, value: 7 }]),
    ]
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue(responses)
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    const state = await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    expect(state!.parameters[0].trend).toBe('stable')
  })

  it('aggregates responseCount across all lookback cycles', async () => {
    const responses = [
      makeResponse(0, [{ questionIndex: 0, value: 7 }]),
      makeResponse(-1, [{ questionIndex: 0, value: 6 }]),
      makeResponse(-2, [{ questionIndex: 0, value: 5 }]),
    ]
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue(responses)
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    const state = await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    expect(state!.parameters[0].responseCount).toBe(3)
  })

  it('includes question text as parameter name', async () => {
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    const state = await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    expect(state!.parameters[0].name).toBe('How meaningful does your work feel?')
    expect(state!.parameters[2].name).toBe('How confident are you?')
  })

  it('returns active and completed-this-cycle side quests', async () => {
    const activeSQ = [{ id: 'sq1', title: 'Sprint goal', completed: false }]
    const completedSQ = [{ id: 'sq2', title: 'Fundraiser', completed: true }]

    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.sideQuest.findMany as jest.Mock)
      .mockResolvedValueOnce(activeSQ)
      .mockResolvedValueOnce(completedSQ)

    const state = await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    expect(state!.activeSideQuests).toEqual(activeSQ)
    expect(state!.completedSideQuestsThisCycle).toEqual(completedSQ)
  })

  it('overall health is the average of all parameter values', async () => {
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    // q0=10 (→1.0), q1=1 (→0.0), q2=5.5 (→0.5) → health = 0.5
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue([
      makeResponse(0, [
        { questionIndex: 0, value: 10 },
        { questionIndex: 1, value: 1 },
        { questionIndex: 2, value: 5.5 },
      ]),
    ])
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    const state = await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    expect(state!.overallHealth).toBeCloseTo(0.5, 5)
  })
})

// ── Cache ─────────────────────────────────────────────────────────────────────
describe('Cache', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearCache()
  })

  it('returns the same object on a second call within TTL', async () => {
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    const first = await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    const second = await getCurrentState(DEPLOYMENT_ID, { now: NOW })

    expect(second).toBe(first) // same object reference
    // DB should only have been hit once
    expect(prisma.deployment.findUnique).toHaveBeenCalledTimes(1)
  })

  it('recalculates after the cache is cleared', async () => {
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    await getCurrentState(DEPLOYMENT_ID, { now: NOW })
    clearCache()
    await getCurrentState(DEPLOYMENT_ID, { now: NOW })

    expect(prisma.deployment.findUnique).toHaveBeenCalledTimes(2)
  })
})

// ── GET /api/state/:deploymentId ──────────────────────────────────────────────
describe('GET /api/state/:deploymentId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearCache()
  })

  it('returns 200 with the ecosystem state', async () => {
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(makeDeployment())
    ;(prisma.response.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.sideQuest.findMany as jest.Mock).mockResolvedValue([])

    const res = await request(app).get(`/api/state/${DEPLOYMENT_ID}`)
    expect(res.status).toBe(200)
    expect(res.body.deploymentId).toBe(DEPLOYMENT_ID)
    expect(res.body).toHaveProperty('parameters')
    expect(res.body).toHaveProperty('overallHealth')
    expect(res.body).toHaveProperty('activeSideQuests')
    expect(res.body).toHaveProperty('completedSideQuestsThisCycle')
  })

  it('returns 404 for an unknown deployment', async () => {
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(null)

    const res = await request(app).get('/api/state/no-such-deployment')
    expect(res.status).toBe(404)
  })
})
