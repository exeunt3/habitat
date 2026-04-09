import { Router } from 'express'
import prisma from '../lib/prisma'
import { requireManager } from '../middleware/auth'
import { AuthPayload } from '../middleware/auth'

const router = Router()

// Visual event types drawn from the ecology reference
const VISUAL_EVENTS = ['manta_ray', 'bioluminescence', 'turtle_visit'] as const

// GET /api/sidequests — list all side quests for this deployment (manager only)
router.get('/', requireManager, async (_req, res) => {
  const { deploymentId } = res.locals.auth as AuthPayload

  const quests = await prisma.sideQuest.findMany({
    where:   { deploymentId },
    orderBy: { createdAt: 'desc' },
  })

  res.json(quests)
})

// POST /api/sidequests — create a side quest (manager only)
router.post('/', requireManager, async (_req, res) => {
  const { deploymentId } = res.locals.auth as AuthPayload
  const { title, description, deadline } = _req.body as {
    title?: string
    description?: string
    deadline?: string
  }

  if (!title || !description || !deadline) {
    res.status(400).json({ error: 'title, description, and deadline are required' })
    return
  }

  const deadlineDate = new Date(deadline)
  if (isNaN(deadlineDate.getTime())) {
    res.status(400).json({ error: 'deadline must be a valid ISO date string' })
    return
  }

  const sideQuest = await prisma.sideQuest.create({
    data: { deploymentId, title, description, deadline: deadlineDate },
  })

  res.status(201).json(sideQuest)
})

// PATCH /api/sidequests/:id/complete — mark complete + create visual event (manager only)
router.patch('/:id/complete', requireManager, async (req, res) => {
  const { deploymentId } = res.locals.auth as AuthPayload

  const sideQuest = await prisma.sideQuest.findUnique({ where: { id: req.params.id } })

  if (!sideQuest || sideQuest.deploymentId !== deploymentId) {
    res.status(404).json({ error: 'Side quest not found' })
    return
  }

  if (sideQuest.completed) {
    res.status(409).json({ error: 'Side quest already completed' })
    return
  }

  const eventType = VISUAL_EVENTS[Math.floor(Math.random() * VISUAL_EVENTS.length)]

  const [updated] = await prisma.$transaction([
    prisma.sideQuest.update({
      where: { id: req.params.id },
      data:  { completed: true, completedAt: new Date() },
    }),
    prisma.sideQuestEvent.create({
      data: { sideQuestId: req.params.id, deploymentId, eventType },
    }),
  ])

  res.json({ ...updated, eventType })
})

export default router
