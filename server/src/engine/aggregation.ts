import { SideQuest } from '@prisma/client'
import prisma from '../lib/prisma'
import { getCycleId } from '../utils/cycle'

// Temporal weights indexed by cycles-ago: 0=current, 1=previous, etc.
export const TEMPORAL_WEIGHTS: readonly number[] = [1.0, 0.7, 0.4, 0.2]

const CACHE_TTL_MS = 5 * 60 * 1_000 // 5 minutes

export interface ParameterState {
  name: string
  value: number // 0.0 – 1.0
  trend: 'rising' | 'falling' | 'stable'
  responseCount: number
}

export interface EcosystemState {
  deploymentId: string
  timestamp: string
  parameters: Record<number, ParameterState>
  overallHealth: number // 0.0 – 1.0
  activeSideQuests: SideQuest[]
  completedSideQuestsThisCycle: SideQuest[]
}

interface CacheEntry {
  state: EcosystemState
  cachedAt: number
}

const cache = new Map<string, CacheEntry>()

/** Clear the in-memory cache — for testing only. */
export function clearCache(): void {
  cache.clear()
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function getCurrentState(
  deploymentId: string,
  {
    lookbackCycles = 4,
    now = new Date(),
  }: { lookbackCycles?: number; now?: Date } = {},
): Promise<EcosystemState | null> {
  const cached = cache.get(deploymentId)
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.state
  }

  const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } })
  if (!deployment) return null

  const frequency = deployment.submissionFrequency as 'DAILY' | 'WEEKLY'
  const questions = deployment.questions as string[]
  const decayRate: number = deployment.decayRate

  // Ordered list of cycle IDs: [current, previous, 2-ago, …]
  const cycles = buildCycleList(frequency, lookbackCycles, now)

  // Fetch all responses in the lookback window in one query
  const windowStart = getWindowStart(frequency, lookbackCycles, now)
  const responses = await prisma.response.findMany({
    where: { deploymentId, submittedAt: { gte: windowStart } },
    orderBy: { submittedAt: 'desc' },
  })

  // Group by cycle
  const byCycle = new Map<string, Array<{ questionIndex: number; value: number }[]>>()
  for (const r of responses) {
    const cid = getCycleId(frequency, r.submittedAt)
    if (!byCycle.has(cid)) byCycle.set(cid, [])
    byCycle.get(cid)!.push(r.answers as Array<{ questionIndex: number; value: number }>)
  }

  const parameters: Record<number, ParameterState> = {}

  for (let qi = 0; qi < questions.length; qi++) {
    // Per-cycle trimmed means
    const cycleMeans: (number | null)[] = cycles.map((cid) => {
      const answers = byCycle.get(cid) ?? []
      const vals = answers
        .map((a) => a.find((x) => x.questionIndex === qi)?.value ?? null)
        .filter((v): v is number => v !== null)
      return vals.length > 0 ? trimmedMean(vals) : null
    })

    // Weighted average across cycles
    let weightedSum = 0
    let weightSum = 0
    let totalCount = 0
    let hasCurrent = false

    for (let i = 0; i < cycles.length; i++) {
      const mean = cycleMeans[i]
      if (mean !== null) {
        const w = TEMPORAL_WEIGHTS[i] ?? 0.1
        weightedSum += w * mean
        weightSum += w
        totalCount += (byCycle.get(cycles[i]) ?? []).length
        if (i === 0) hasCurrent = true
      }
    }

    let value: number
    if (weightSum === 0) {
      value = 0.5 // no data → neutral
    } else {
      // Normalize 1-10 → 0-1
      const normalized = (weightedSum / weightSum - 1) / 9

      if (!hasCurrent) {
        const daysSince = getDaysSinceLastResponse(responses, now)
        value = Math.max(0, normalized * Math.pow(decayRate, daysSince))
      } else {
        value = normalized
      }

      value = Math.min(1, Math.max(0, value))
    }

    // Trend: current vs previous cycle (on raw 1-10 scale)
    const curr = cycleMeans[0]
    const prev = cycleMeans[1]
    let trend: 'rising' | 'falling' | 'stable' = 'stable'
    if (curr !== null && prev !== null) {
      const diff = curr - prev
      if (diff > 0.5) trend = 'rising'
      else if (diff < -0.5) trend = 'falling'
    }

    parameters[qi] = { name: questions[qi] ?? `Question ${qi + 1}`, value, trend, responseCount: totalCount }
  }

  const paramValues = Object.values(parameters).map((p) => p.value)
  const overallHealth =
    paramValues.length > 0 ? paramValues.reduce((a, b) => a + b, 0) / paramValues.length : 0

  const currentCycleStart = getWindowStart(frequency, 1, now)

  const [activeSideQuests, completedSideQuestsThisCycle] = await Promise.all([
    prisma.sideQuest.findMany({
      where: { deploymentId, completed: false, deadline: { gte: now } },
    }),
    prisma.sideQuest.findMany({
      where: { deploymentId, completed: true, completedAt: { gte: currentCycleStart } },
    }),
  ])

  const state: EcosystemState = {
    deploymentId,
    timestamp: now.toISOString(),
    parameters,
    overallHealth,
    activeSideQuests,
    completedSideQuestsThisCycle,
  }

  cache.set(deploymentId, { state, cachedAt: Date.now() })
  return state
}

// ---------------------------------------------------------------------------
// Helpers (exported for unit testing)
// ---------------------------------------------------------------------------

/**
 * Trimmed mean: drop the bottom and top 10% of values, average the rest.
 * With fewer than 10 values the trim count rounds down to 0 (no trimming).
 */
export function trimmedMean(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const trim = Math.floor(sorted.length * 0.1)
  const inner = sorted.slice(trim, sorted.length - trim)
  const arr = inner.length > 0 ? inner : sorted // safety: if trim removed everything use full
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

/**
 * Build an ordered list of cycle IDs starting from the current cycle.
 * Index 0 = current, 1 = one cycle ago, etc.
 */
export function buildCycleList(
  frequency: 'DAILY' | 'WEEKLY',
  count: number,
  now: Date,
): string[] {
  const step = frequency === 'WEEKLY' ? 7 : 1
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i * step)
    return getCycleId(frequency, d)
  })
}

/** Start of the current cycle (Monday 00:00 UTC for weekly, today 00:00 UTC for daily). */
export function getCycleStart(frequency: 'DAILY' | 'WEEKLY', date: Date): Date {
  if (frequency === 'WEEKLY') {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    const dow = d.getUTCDay() || 7 // 1=Mon … 7=Sun
    d.setUTCDate(d.getUTCDate() - dow + 1)
    return d
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

/** The earliest date we need to fetch responses from for the given lookback window. */
function getWindowStart(frequency: 'DAILY' | 'WEEKLY', lookbackCycles: number, now: Date): Date {
  const step = frequency === 'WEEKLY' ? 7 : 1
  const offsetDays = (lookbackCycles - 1) * step
  const anchor = new Date(now)
  anchor.setUTCDate(anchor.getUTCDate() - offsetDays)
  return getCycleStart(frequency, anchor)
}

function getDaysSinceLastResponse(
  responses: Array<{ submittedAt: Date }>,
  now: Date,
): number {
  if (responses.length === 0) return 0
  const latest = responses.reduce((a, b) => (a.submittedAt > b.submittedAt ? a : b))
  return (now.getTime() - latest.submittedAt.getTime()) / 86_400_000
}
