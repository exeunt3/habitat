import { Router } from 'express'
import prisma from '../lib/prisma'
import { requireManager, AuthPayload } from '../middleware/auth'
import { getCycleId } from '../utils/cycle'
import { getCycleStart } from '../engine/aggregation'
import { sendMagicLink } from '../lib/mailer'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'

const router = Router()

// POST /api/admin/deployments — create a new deployment + manager user
// Protected by ADMIN_KEY env variable (no JWT auth needed — this bootstraps auth)
router.post('/deployments', async (req, res) => {
  const { adminKey, name, managerEmail, questions, theme } = req.body as {
    adminKey?: string
    name?: string
    managerEmail?: string
    questions?: unknown
    theme?: string
  }

  const expectedKey = process.env.ADMIN_KEY
  if (!expectedKey) {
    res.status(503).json({ error: 'ADMIN_KEY is not configured on this server' })
    return
  }
  if (!adminKey || adminKey !== expectedKey) {
    res.status(401).json({ error: 'Invalid admin key' })
    return
  }

  if (typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'name is required' })
    return
  }
  if (typeof managerEmail !== 'string' || !managerEmail.includes('@')) {
    res.status(400).json({ error: 'valid managerEmail is required' })
    return
  }
  if (!Array.isArray(questions) || questions.length < 3 || questions.length > 5) {
    res.status(400).json({ error: 'questions must be an array of 3–5 strings' })
    return
  }
  const qs = questions as unknown[]
  if (!qs.every(q => typeof q === 'string' && (q as string).trim().length > 0)) {
    res.status(400).json({ error: 'All questions must be non-empty strings' })
    return
  }

  const email = managerEmail.trim().toLowerCase()

  // Create deployment + manager user in a transaction
  const { deployment, manager } = await prisma.$transaction(async (tx) => {
    const allowedThemes = ['reef', 'tree']
    const resolvedTheme = typeof theme === 'string' && allowedThemes.includes(theme) ? theme : 'reef'

    const deployment = await tx.deployment.create({
      data: {
        name: name.trim(),
        theme: resolvedTheme,
        questions: qs.map(q => (q as string).trim()),
        submissionFrequency: 'WEEKLY',
        decayRate: 0.95,
        driftSpeed: 1.0,
      },
    })

    const manager = await tx.user.create({
      data: {
        email,
        deploymentId: deployment.id,
        role: 'MANAGER',
      },
    })

    return { deployment, manager }
  })

  // Issue a magic-link token so the manager can log in immediately
  const TOKEN_TTL_MS = 24 * 60 * 60 * 1_000 // 24h for setup token
  const token = randomUUID()
  await prisma.authToken.create({
    data: { token, userId: manager.id, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  })

  // Send magic link email (non-fatal — deployment is already created)
  try {
    await sendMagicLink(email, token)
  } catch {
    console.error('Failed to send setup magic link to', email)
  }

  res.status(201).json({
    deploymentId: deployment.id,
    managerEmail: email,
  })
})

// Convenience: issue a test JWT for a deployment without email (dev only)
router.post('/dev-token', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const { email, deploymentId } = req.body as { email?: string; deploymentId?: string }
  if (!email || !deploymentId) {
    res.status(400).json({ error: 'email and deploymentId are required' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { email_deploymentId: { email, deploymentId } },
  })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const secret = process.env.JWT_SECRET ?? 'dev-secret'
  const accessToken = jwt.sign(
    { userId: user.id, deploymentId: user.deploymentId, role: user.role },
    secret,
    { expiresIn: '7d' },
  )
  res.json({ token: accessToken })
})

// GET /api/admin/participation — current-cycle participation counts (manager only)
// Returns counts only — never individual identities
router.get('/participation', requireManager, async (_req, res) => {
  const { deploymentId } = res.locals.auth as AuthPayload

  const deployment = await prisma.deployment.findUnique({ where: { id: deploymentId } })
  if (!deployment) {
    res.status(404).json({ error: 'Deployment not found' })
    return
  }

  const frequency = deployment.submissionFrequency as 'DAILY' | 'WEEKLY'
  const now = new Date()
  const cycleId = getCycleId(frequency)
  const cycleStart = getCycleStart(frequency, now)

  const [tokenRequests, responseCount, totalMembers] = await Promise.all([
    // How many users initiated participation this cycle (got a token)
    prisma.cycleParticipation.count({ where: { deploymentId, cycleId } }),
    // How many responses were actually submitted this cycle
    prisma.response.count({ where: { deploymentId, submittedAt: { gte: cycleStart } } }),
    // Total members in the deployment
    prisma.user.count({ where: { deploymentId, role: 'MEMBER' } }),
  ])

  res.json({ cycleId, tokenRequests, responseCount, totalMembers })
})

export default router
