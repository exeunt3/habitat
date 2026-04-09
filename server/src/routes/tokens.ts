import { Router } from 'express'
import { randomUUID } from 'crypto'
import prisma from '../lib/prisma'
import { requireAuth, AuthPayload } from '../middleware/auth'
import { getCycleId } from '../utils/cycle'

const router = Router()

router.post('/request', requireAuth, async (_req, res) => {
  const { userId, deploymentId } = res.locals.auth as AuthPayload

  const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } })
  if (!deployment) {
    res.status(404).json({ error: 'Deployment not found' })
    return
  }

  const cycleId = getCycleId(deployment.submissionFrequency)

  const existing = await prisma.cycleParticipation.findUnique({
    where: { userId_deploymentId_cycleId: { userId, deploymentId, cycleId } },
  })
  if (existing) {
    res.status(409).json({ error: 'Token already issued for this cycle' })
    return
  }

  // Generate anonymous token — no userId stored here
  const token = randomUUID()
  await prisma.token.create({ data: { deploymentId, token } })

  // Record participation — no token stored here
  await prisma.cycleParticipation.create({ data: { userId, deploymentId, cycleId } })

  res.json({ token })
})

export default router
