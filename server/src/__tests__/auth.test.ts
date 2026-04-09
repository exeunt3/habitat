import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn(), count: jest.fn() },
    authToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    sideQuest: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    cycleParticipation: { count: jest.fn() },
    response: { count: jest.fn() },
    deployment: { findUnique: jest.fn() },
  },
}))

jest.mock('../lib/mailer', () => ({
  __esModule: true,
  sendMagicLink: jest.fn().mockResolvedValue(undefined),
}))

import prisma from '../lib/prisma'
import { sendMagicLink } from '../lib/mailer'
import authRoutes from '../routes/auth'
import sideQuestRoutes from '../routes/sidequests'
import adminRoutes from '../routes/admin'

const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/sidequests', sideQuestRoutes)
app.use('/api/admin', adminRoutes)

const JWT_SECRET = 'test-secret'
const DEPLOYMENT_ID = 'dep-auth-test'

function makeJWT(userId: string, role: 'MEMBER' | 'MANAGER' = 'MEMBER') {
  return jwt.sign({ userId, deploymentId: DEPLOYMENT_ID, role }, JWT_SECRET)
}

beforeEach(() => {
  jest.clearAllMocks()
  process.env.JWT_SECRET = JWT_SECRET
})

// ── POST /api/auth/request ──────────────────────────────────────────────────
describe('POST /api/auth/request', () => {
  it('sends a magic link when the email/deployment combo exists', async () => {
    const userId = randomUUID()
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: userId,
      email: 'alice@example.com',
      deploymentId: DEPLOYMENT_ID,
      role: 'MEMBER',
    })
    ;(prisma.authToken.create as jest.Mock).mockResolvedValue({})

    const res = await request(app)
      .post('/api/auth/request')
      .send({ email: 'alice@example.com', deploymentId: DEPLOYMENT_ID })

    expect(res.status).toBe(200)
    expect(res.body.message).toBeTruthy()
    expect(prisma.authToken.create).toHaveBeenCalledTimes(1)
    expect(sendMagicLink).toHaveBeenCalledTimes(1)

    // Token stored without userId visible in the response
    const createCall = (prisma.authToken.create as jest.Mock).mock.calls[0][0].data
    expect(createCall).toHaveProperty('token')
    expect(createCall).toHaveProperty('userId', userId)
    expect(createCall).toHaveProperty('expiresAt')
  })

  it('still returns 200 for an unknown email (no info leak)', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/auth/request')
      .send({ email: 'nobody@example.com', deploymentId: DEPLOYMENT_ID })

    expect(res.status).toBe(200)
    expect(prisma.authToken.create).not.toHaveBeenCalled()
    expect(sendMagicLink).not.toHaveBeenCalled()
  })

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/request')
      .send({ deploymentId: DEPLOYMENT_ID })
    expect(res.status).toBe(400)
  })

  it('returns 400 when deploymentId is missing', async () => {
    const res = await request(app)
      .post('/api/auth/request')
      .send({ email: 'alice@example.com' })
    expect(res.status).toBe(400)
  })
})

// ── GET /api/auth/verify/:token ─────────────────────────────────────────────
describe('GET /api/auth/verify/:token', () => {
  it('returns a JWT for a valid unused non-expired token', async () => {
    const userId = randomUUID()
    ;(prisma.authToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'at-1',
      token: 'valid-magic-token',
      userId,
      used: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      user: { id: userId, deploymentId: DEPLOYMENT_ID, role: 'MEMBER' },
    })
    ;(prisma.authToken.update as jest.Mock).mockResolvedValue({})

    const res = await request(app).get('/api/auth/verify/valid-magic-token')

    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()

    const decoded = jwt.verify(res.body.token, JWT_SECRET) as {
      userId: string
      deploymentId: string
      role: string
    }
    expect(decoded.userId).toBe(userId)
    expect(decoded.deploymentId).toBe(DEPLOYMENT_ID)
    expect(decoded.role).toBe('MEMBER')

    // Token must be marked used
    expect(prisma.authToken.update).toHaveBeenCalledWith({
      where: { id: 'at-1' },
      data: { used: true },
    })
  })

  it('rejects an already-used token', async () => {
    ;(prisma.authToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'at-2',
      token: 'used-token',
      used: true,
      expiresAt: new Date(Date.now() + 10_000),
      user: { id: randomUUID(), deploymentId: DEPLOYMENT_ID, role: 'MEMBER' },
    })

    const res = await request(app).get('/api/auth/verify/used-token')
    expect(res.status).toBe(401)
    expect(prisma.authToken.update).not.toHaveBeenCalled()
  })

  it('rejects an expired token', async () => {
    ;(prisma.authToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'at-3',
      token: 'expired-token',
      used: false,
      expiresAt: new Date(Date.now() - 1), // already expired
      user: { id: randomUUID(), deploymentId: DEPLOYMENT_ID, role: 'MEMBER' },
    })

    const res = await request(app).get('/api/auth/verify/expired-token')
    expect(res.status).toBe(401)
  })

  it('rejects an unknown token', async () => {
    ;(prisma.authToken.findUnique as jest.Mock).mockResolvedValue(null)

    const res = await request(app).get('/api/auth/verify/no-such-token')
    expect(res.status).toBe(401)
  })
})

// ── POST /api/sidequests ─────────────────────────────────────────────────────
describe('POST /api/sidequests', () => {
  it('creates a side quest for a manager', async () => {
    const created = {
      id: 'sq-1',
      deploymentId: DEPLOYMENT_ID,
      title: 'Q1 fundraiser',
      description: 'Raise $10k',
      deadline: '2024-03-31T00:00:00.000Z',
      completed: false,
    }
    ;(prisma.sideQuest.create as jest.Mock).mockResolvedValue(created)

    const res = await request(app)
      .post('/api/sidequests')
      .set('Authorization', `Bearer ${makeJWT(randomUUID(), 'MANAGER')}`)
      .send({ title: 'Q1 fundraiser', description: 'Raise $10k', deadline: '2024-03-31T00:00:00Z' })

    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Q1 fundraiser')
    expect(prisma.sideQuest.create).toHaveBeenCalledTimes(1)

    const createData = (prisma.sideQuest.create as jest.Mock).mock.calls[0][0].data
    expect(createData.deploymentId).toBe(DEPLOYMENT_ID)
  })

  it('returns 403 for a member', async () => {
    const res = await request(app)
      .post('/api/sidequests')
      .set('Authorization', `Bearer ${makeJWT(randomUUID(), 'MEMBER')}`)
      .send({ title: 'X', description: 'Y', deadline: '2024-03-31T00:00:00Z' })

    expect(res.status).toBe(403)
    expect(prisma.sideQuest.create).not.toHaveBeenCalled()
  })

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/sidequests')
      .send({ title: 'X', description: 'Y', deadline: '2024-03-31T00:00:00Z' })
    expect(res.status).toBe(401)
  })

  it('returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/sidequests')
      .set('Authorization', `Bearer ${makeJWT(randomUUID(), 'MANAGER')}`)
      .send({ title: 'X' })
    expect(res.status).toBe(400)
  })

  it('returns 400 for an invalid deadline', async () => {
    const res = await request(app)
      .post('/api/sidequests')
      .set('Authorization', `Bearer ${makeJWT(randomUUID(), 'MANAGER')}`)
      .send({ title: 'X', description: 'Y', deadline: 'not-a-date' })
    expect(res.status).toBe(400)
  })
})

// ── PATCH /api/sidequests/:id/complete ───────────────────────────────────────
describe('PATCH /api/sidequests/:id/complete', () => {
  it('marks a side quest complete for the owning deployment', async () => {
    const sq = { id: 'sq-1', deploymentId: DEPLOYMENT_ID, completed: false }
    const updated = { ...sq, completed: true, completedAt: new Date().toISOString() }
    ;(prisma.sideQuest.findUnique as jest.Mock).mockResolvedValue(sq)
    ;(prisma.sideQuest.update as jest.Mock).mockResolvedValue(updated)

    const res = await request(app)
      .patch('/api/sidequests/sq-1/complete')
      .set('Authorization', `Bearer ${makeJWT(randomUUID(), 'MANAGER')}`)

    expect(res.status).toBe(200)
    expect(res.body.completed).toBe(true)
    expect(prisma.sideQuest.update).toHaveBeenCalledWith({
      where: { id: 'sq-1' },
      data: { completed: true, completedAt: expect.any(Date) },
    })
  })

  it('returns 404 for a side quest from another deployment', async () => {
    ;(prisma.sideQuest.findUnique as jest.Mock).mockResolvedValue({
      id: 'sq-other',
      deploymentId: 'other-dep',
      completed: false,
    })

    const res = await request(app)
      .patch('/api/sidequests/sq-other/complete')
      .set('Authorization', `Bearer ${makeJWT(randomUUID(), 'MANAGER')}`)

    expect(res.status).toBe(404)
  })

  it('returns 409 if already completed', async () => {
    ;(prisma.sideQuest.findUnique as jest.Mock).mockResolvedValue({
      id: 'sq-done',
      deploymentId: DEPLOYMENT_ID,
      completed: true,
    })

    const res = await request(app)
      .patch('/api/sidequests/sq-done/complete')
      .set('Authorization', `Bearer ${makeJWT(randomUUID(), 'MANAGER')}`)

    expect(res.status).toBe(409)
  })

  it('returns 403 for a member', async () => {
    const res = await request(app)
      .patch('/api/sidequests/sq-1/complete')
      .set('Authorization', `Bearer ${makeJWT(randomUUID(), 'MEMBER')}`)
    expect(res.status).toBe(403)
  })
})

// ── GET /api/admin/participation ─────────────────────────────────────────────
describe('GET /api/admin/participation', () => {
  it('returns participation counts for a manager', async () => {
    ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue({
      id: DEPLOYMENT_ID,
      submissionFrequency: 'WEEKLY',
    })
    ;(prisma.cycleParticipation.count as jest.Mock).mockResolvedValue(5)
    ;(prisma.response.count as jest.Mock).mockResolvedValue(4)
    ;(prisma.user.count as jest.Mock).mockResolvedValue(8)

    const res = await request(app)
      .get('/api/admin/participation')
      .set('Authorization', `Bearer ${makeJWT(randomUUID(), 'MANAGER')}`)

    expect(res.status).toBe(200)
    expect(res.body.tokenRequests).toBe(5)
    expect(res.body.responseCount).toBe(4)
    expect(res.body.totalMembers).toBe(8)
    expect(res.body).toHaveProperty('cycleId')
    // No user IDs or emails in the response
    expect(res.body).not.toHaveProperty('users')
    expect(res.body).not.toHaveProperty('emails')
  })

  it('returns 403 for a member', async () => {
    const res = await request(app)
      .get('/api/admin/participation')
      .set('Authorization', `Bearer ${makeJWT(randomUUID(), 'MEMBER')}`)
    expect(res.status).toBe(403)
  })

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/admin/participation')
    expect(res.status).toBe(401)
  })
})
