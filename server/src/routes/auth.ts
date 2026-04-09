import { Router } from 'express'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { sendMagicLink } from '../lib/mailer'

const router = Router()
const TOKEN_TTL_MS = 15 * 60 * 1_000 // 15 minutes
const JWT_TTL = '7d'

// POST /api/auth/request — { email, deploymentId }
// Always returns 200 to avoid revealing whether an email is registered
router.post('/request', async (req, res) => {
  const { email, deploymentId } = req.body as { email?: string; deploymentId?: string }

  if (typeof email !== 'string' || !email || typeof deploymentId !== 'string' || !deploymentId) {
    res.status(400).json({ error: 'email and deploymentId are required' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { email_deploymentId: { email: email.toLowerCase().trim(), deploymentId } },
  })

  if (user) {
    const token = randomUUID()
    await prisma.authToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    })
    await sendMagicLink(user.email, token)
  }

  // Always 200 — don't reveal if the email/deployment combo exists
  res.json({ message: 'If that email is registered, a login link is on its way.' })
})

// GET /api/auth/verify/:token — validates magic-link token, returns JWT
router.get('/verify/:token', async (req, res) => {
  const authToken = await prisma.authToken.findUnique({
    where: { token: req.params.token },
    include: { user: true },
  })

  if (!authToken || authToken.used || authToken.expiresAt < new Date()) {
    res.status(401).json({ error: 'Invalid or expired login link' })
    return
  }

  await prisma.authToken.update({ where: { id: authToken.id }, data: { used: true } })

  const payload = {
    userId: authToken.user.id,
    deploymentId: authToken.user.deploymentId,
    role: authToken.user.role,
  }

  const secret = process.env.JWT_SECRET ?? 'dev-secret'
  const accessToken = jwt.sign(payload, secret, { expiresIn: JWT_TTL })

  res.json({ token: accessToken })
})

export default router
