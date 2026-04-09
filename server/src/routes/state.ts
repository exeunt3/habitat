import { Router } from 'express'
import { getCurrentState } from '../engine/aggregation'
import prisma from '../lib/prisma'

const router = Router()

const MS_48H = 48 * 60 * 60 * 1000

// Public — no auth required; anyone with the URL can view the tank
router.get('/:deploymentId', async (req, res) => {
  const { deploymentId } = req.params

  const since48h = new Date(Date.now() - MS_48H)

  const [state, deployment, latestResponse, latestEvent] = await Promise.all([
    getCurrentState(deploymentId),
    prisma.deployment.findUnique({ where: { id: deploymentId }, select: { theme: true } }),
    prisma.response.findFirst({
      where:   { deploymentId },
      orderBy: { submittedAt: 'desc' },
      select:  { submittedAt: true },
    }),
    prisma.sideQuestEvent.findFirst({
      where:   { deploymentId, triggeredAt: { gte: since48h } },
      orderBy: { triggeredAt: 'desc' },
      select:  { eventType: true, triggeredAt: true },
    }),
  ])

  if (!state) {
    res.status(404).json({ error: 'Deployment not found' })
    return
  }

  res.json({
    ...state,
    theme:               deployment?.theme ?? 'reef',
    lastSubmissionAt:    latestResponse?.submittedAt?.toISOString() ?? null,
    activeSideQuestEvent: latestEvent
      ? { type: latestEvent.eventType, triggeredAt: latestEvent.triggeredAt.toISOString() }
      : null,
  })
})

export default router
