import { Router } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma'

const router = Router()

// Map of deploymentId -> active interval
const activeIntervals = new Map<string, NodeJS.Timeout>()
// Per-deployment tick counter for live demo value progression
const tickCounters = new Map<string, number>()

// ---------------------------------------------------------------------------
// GET /api/demo/status — list active demo deployments
// ---------------------------------------------------------------------------
router.get('/status', (_req, res) => {
  res.json({ active: Array.from(activeIntervals.keys()) })
})

// ---------------------------------------------------------------------------
// GET /api/demo/:theme — get deployment info for a theme
// ---------------------------------------------------------------------------
router.get('/:theme', async (req, res) => {
  const { theme } = req.params

  if (theme !== 'reef' && theme !== 'tree' && theme !== 'creek') {
    res.status(400).json({ error: 'theme must be "reef", "tree", or "creek"' })
    return
  }

  const deploymentId = theme === 'reef' ? 'demo-reef' : theme === 'tree' ? 'demo-tree' : 'demo-creek'

  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      select: { id: true, name: true, theme: true },
    })

    if (!deployment) {
      res.status(404).json({ error: `Demo deployment for theme "${theme}" not found. Run npm run seed:demo first.` })
      return
    }

    res.json({
      deploymentId: deployment.id,
      name: deployment.name,
      theme: deployment.theme,
    })
  } catch (err) {
    console.error('GET /api/demo/:theme error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ---------------------------------------------------------------------------
// POST /api/demo/start — start live demo mode
// ---------------------------------------------------------------------------
router.post('/start', async (req, res) => {
  const { deploymentId } = req.body as { deploymentId?: string }

  if (!deploymentId || typeof deploymentId !== 'string') {
    res.status(400).json({ error: 'deploymentId is required' })
    return
  }

  // Check already running
  if (activeIntervals.has(deploymentId)) {
    res.json({ started: false, message: 'Already running' })
    return
  }

  // Validate deployment exists
  try {
    const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } })
    if (!deployment) {
      res.status(404).json({ error: 'Deployment not found' })
      return
    }
  } catch (err) {
    console.error('POST /api/demo/start error checking deployment:', err)
    res.status(500).json({ error: 'Internal server error' })
    return
  }

  // Initialise tick counter
  tickCounters.set(deploymentId, 0)

  const interval = setInterval(async () => {
    const counter = (tickCounters.get(deploymentId) ?? 0) + 1
    tickCounters.set(deploymentId, counter)

    const clamp = (v: number) => Math.max(1, Math.min(10, v))
    const q0 = clamp(Math.round(5 + counter * 0.15 + Math.random() * 1.5))
    const q1 = clamp(Math.round(5 + counter * 0.15 + Math.random() * 1.5))
    const q2 = clamp(Math.round(5 + counter * 0.15 + Math.random() * 1.5))

    const tokenStr = `demo-live-${deploymentId.slice(0, 8)}-${Date.now()}-${counter}`
    const submittedAt = new Date()

    try {
      await prisma.$transaction([
        prisma.token.create({
          data: { token: tokenStr, deploymentId, issued: true, used: true },
        }),
        prisma.response.create({
          data: {
            deploymentId,
            token: tokenStr,
            answers: [
              { questionIndex: 0, value: q0 },
              { questionIndex: 1, value: q1 },
              { questionIndex: 2, value: q2 },
            ] as unknown as Prisma.InputJsonValue,
            submittedAt,
          },
        }),
      ])
      console.log(`[demo] Live tick #${counter} for ${deploymentId}: [${q0}, ${q1}, ${q2}]`)
    } catch (err) {
      console.error(`[demo] Failed to create live response for ${deploymentId}:`, err)
    }
  }, 30_000)

  activeIntervals.set(deploymentId, interval)

  console.log(`[demo] Live demo started for ${deploymentId}`)
  res.json({ started: true, deploymentId })
})

// ---------------------------------------------------------------------------
// POST /api/demo/stop — stop live demo mode
// ---------------------------------------------------------------------------
router.post('/stop', (req, res) => {
  const { deploymentId } = req.body as { deploymentId?: string }

  if (!deploymentId || typeof deploymentId !== 'string') {
    res.status(400).json({ error: 'deploymentId is required' })
    return
  }

  const interval = activeIntervals.get(deploymentId)
  if (interval) {
    clearInterval(interval)
    activeIntervals.delete(deploymentId)
    tickCounters.delete(deploymentId)
    console.log(`[demo] Live demo stopped for ${deploymentId}`)
  }

  res.json({ stopped: true })
})

export default router
