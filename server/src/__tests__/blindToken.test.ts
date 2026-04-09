import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

// Mock Prisma before importing routes
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    deployment: { findUnique: jest.fn() },
    cycleParticipation: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    token: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    response: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}))

import prisma from '../lib/prisma'
import tokenRoutes from '../routes/tokens'
import responseRoutes from '../routes/responses'

const app = express()
app.use(express.json())
app.use('/api/tokens', tokenRoutes)
app.use('/api/responses', responseRoutes)

const JWT_SECRET = 'test-secret'
const DEPLOYMENT_ID = 'dep-test-1'
const DEPLOYMENT = { id: DEPLOYMENT_ID, submissionFrequency: 'WEEKLY' }

function makeJWT(userId: string) {
  return jwt.sign(
    { userId, deploymentId: DEPLOYMENT_ID, role: 'MEMBER' },
    JWT_SECRET,
  )
}

describe('Blind Token Anonymity System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = JWT_SECRET
  })

  // ---------------------------------------------------------------------------
  // Token request
  // ---------------------------------------------------------------------------

  describe('POST /api/tokens/request', () => {
    it('issues a token and records participation in separate writes', async () => {
      const userId = randomUUID()

      ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(DEPLOYMENT)
      ;(prisma.cycleParticipation.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.token.create as jest.Mock).mockResolvedValue({})
      ;(prisma.cycleParticipation.create as jest.Mock).mockResolvedValue({})

      const res = await request(app)
        .post('/api/tokens/request')
        .set('Authorization', `Bearer ${makeJWT(userId)}`)

      expect(res.status).toBe(200)
      expect(typeof res.body.token).toBe('string')
      expect(res.body.token.length).toBeGreaterThan(0)
    })

    it('rejects duplicate request in the same cycle', async () => {
      const userId = randomUUID()

      ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(DEPLOYMENT)
      ;(prisma.cycleParticipation.findUnique as jest.Mock).mockResolvedValue({
        userId,
        deploymentId: DEPLOYMENT_ID,
        cycleId: '2024-W01',
      })

      const res = await request(app)
        .post('/api/tokens/request')
        .set('Authorization', `Bearer ${makeJWT(userId)}`)

      expect(res.status).toBe(409)
      expect(prisma.token.create).not.toHaveBeenCalled()
    })

    it('returns 401 without an auth header', async () => {
      const res = await request(app).post('/api/tokens/request')
      expect(res.status).toBe(401)
    })

    it('returns 401 with a tampered JWT', async () => {
      const res = await request(app)
        .post('/api/tokens/request')
        .set('Authorization', 'Bearer not.a.real.jwt')
      expect(res.status).toBe(401)
    })

    it('returns 404 when the deployment does not exist', async () => {
      ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(null)

      const res = await request(app)
        .post('/api/tokens/request')
        .set('Authorization', `Bearer ${makeJWT(randomUUID())}`)

      expect(res.status).toBe(404)
    })
  })

  // ---------------------------------------------------------------------------
  // Response submission
  // ---------------------------------------------------------------------------

  describe('POST /api/responses/submit', () => {
    it('accepts a valid anonymous submission — no Authorization header required', async () => {
      const token = randomUUID()
      const answers = [
        { questionIndex: 0, value: 8 },
        { questionIndex: 1, value: 6 },
        { questionIndex: 2, value: 7 },
      ]

      ;(prisma.token.findUnique as jest.Mock).mockResolvedValue({
        token,
        deploymentId: DEPLOYMENT_ID,
        used: false,
      })
      ;(prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}])

      const res = await request(app)
        .post('/api/responses/submit')
        .send({ token, answers })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('rejects an already-used token', async () => {
      ;(prisma.token.findUnique as jest.Mock).mockResolvedValue({
        token: randomUUID(),
        deploymentId: DEPLOYMENT_ID,
        used: true,
      })

      const res = await request(app)
        .post('/api/responses/submit')
        .send({ token: randomUUID(), answers: [{ questionIndex: 0, value: 5 }] })

      expect(res.status).toBe(409)
    })

    it('rejects an unknown token', async () => {
      ;(prisma.token.findUnique as jest.Mock).mockResolvedValue(null)

      const res = await request(app)
        .post('/api/responses/submit')
        .send({ token: 'nonexistent', answers: [{ questionIndex: 0, value: 5 }] })

      expect(res.status).toBe(404)
    })

    it('rejects missing token field', async () => {
      const res = await request(app)
        .post('/api/responses/submit')
        .send({ answers: [{ questionIndex: 0, value: 5 }] })
      expect(res.status).toBe(400)
    })

    it('rejects malformed answers', async () => {
      ;(prisma.token.findUnique as jest.Mock).mockResolvedValue({
        token: randomUUID(),
        deploymentId: DEPLOYMENT_ID,
        used: false,
      })

      const res = await request(app)
        .post('/api/responses/submit')
        .send({ token: randomUUID(), answers: 'not an array' })

      expect(res.status).toBe(400)
    })

    it('rejects empty answers array', async () => {
      ;(prisma.token.findUnique as jest.Mock).mockResolvedValue({
        token: randomUUID(),
        deploymentId: DEPLOYMENT_ID,
        used: false,
      })

      const res = await request(app)
        .post('/api/responses/submit')
        .send({ token: randomUUID(), answers: [] })

      expect(res.status).toBe(400)
    })
  })

  // ---------------------------------------------------------------------------
  // Unlinkability
  // ---------------------------------------------------------------------------

  describe('Unlinkability guarantees', () => {
    it('token.create is never called with a userId', async () => {
      ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(DEPLOYMENT)
      ;(prisma.cycleParticipation.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.token.create as jest.Mock).mockResolvedValue({})
      ;(prisma.cycleParticipation.create as jest.Mock).mockResolvedValue({})

      await request(app)
        .post('/api/tokens/request')
        .set('Authorization', `Bearer ${makeJWT(randomUUID())}`)

      const tokenCreateData = (prisma.token.create as jest.Mock).mock.calls[0][0].data
      expect(tokenCreateData).not.toHaveProperty('userId')
    })

    it('cycleParticipation.create is never called with a token value', async () => {
      ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(DEPLOYMENT)
      ;(prisma.cycleParticipation.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.token.create as jest.Mock).mockResolvedValue({})
      ;(prisma.cycleParticipation.create as jest.Mock).mockResolvedValue({})

      await request(app)
        .post('/api/tokens/request')
        .set('Authorization', `Bearer ${makeJWT(randomUUID())}`)

      const participationData = (prisma.cycleParticipation.create as jest.Mock).mock.calls[0][0].data
      expect(participationData).not.toHaveProperty('token')
    })

    it('the token value issued to the client never appears in the participation record', async () => {
      ;(prisma.deployment.findUnique as jest.Mock).mockResolvedValue(DEPLOYMENT)
      ;(prisma.cycleParticipation.findUnique as jest.Mock).mockResolvedValue(null)

      let issuedToken: string | undefined

      ;(prisma.token.create as jest.Mock).mockImplementation(
        async ({ data }: { data: { token: string } }) => {
          issuedToken = data.token
          return {}
        },
      )
      ;(prisma.cycleParticipation.create as jest.Mock).mockImplementation(
        async ({ data }: { data: Record<string, unknown> }) => {
          // The participation record must not contain the issued token anywhere
          expect(Object.values(data)).not.toContain(issuedToken)
          return {}
        },
      )

      const res = await request(app)
        .post('/api/tokens/request')
        .set('Authorization', `Bearer ${makeJWT(randomUUID())}`)

      expect(res.status).toBe(200)
      expect(issuedToken).toBeTruthy()
      expect(prisma.cycleParticipation.create).toHaveBeenCalledTimes(1)
    })

    it('response.submit does not accept or store a userId', async () => {
      const token = randomUUID()
      ;(prisma.token.findUnique as jest.Mock).mockResolvedValue({
        token,
        deploymentId: DEPLOYMENT_ID,
        used: false,
      })
      // response.create is called to build the query before being passed to $transaction
      ;(prisma.response.create as jest.Mock).mockReturnValue(undefined)
      ;(prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}])

      // Even if a client sends a userId field, the route should ignore it
      const res = await request(app)
        .post('/api/responses/submit')
        .send({ token, answers: [{ questionIndex: 0, value: 7 }], userId: 'sneaky-id' })

      expect(res.status).toBe(200)

      // Verify response.create was called without userId
      const responseCreateData = (prisma.response.create as jest.Mock).mock.calls[0][0].data
      expect(responseCreateData).not.toHaveProperty('userId')
      expect(responseCreateData).toHaveProperty('token', token)
      expect(responseCreateData).toHaveProperty('deploymentId')
    })
  })

  // ---------------------------------------------------------------------------
  // Cycle utility
  // ---------------------------------------------------------------------------

  describe('getCycleId', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCycleId } = require('../utils/cycle') as { getCycleId: (f: string, d?: Date) => string }

    it('returns the same ID for two dates in the same ISO week', () => {
      const monday = new Date('2024-01-15T00:00:00Z')
      const friday = new Date('2024-01-19T23:59:59Z')
      expect(getCycleId('WEEKLY', monday)).toBe(getCycleId('WEEKLY', friday))
    })

    it('returns different IDs for different weeks', () => {
      const week2 = new Date('2024-01-08T12:00:00Z')
      const week3 = new Date('2024-01-15T12:00:00Z')
      expect(getCycleId('WEEKLY', week2)).not.toBe(getCycleId('WEEKLY', week3))
    })

    it('formats weekly IDs as YYYY-Www', () => {
      const date = new Date('2024-01-15T00:00:00Z') // ISO week 3 of 2024
      expect(getCycleId('WEEKLY', date)).toBe('2024-W03')
    })

    it('handles the year-boundary week correctly (2025-W01 not 2024-W53)', () => {
      const date = new Date('2024-12-30T12:00:00Z') // falls in ISO week 1 of 2025
      expect(getCycleId('WEEKLY', date)).toBe('2025-W01')
    })

    it('returns the same ID for two timestamps on the same day (DAILY)', () => {
      const morning = new Date('2024-03-15T08:00:00Z')
      const evening = new Date('2024-03-15T20:00:00Z')
      expect(getCycleId('DAILY', morning)).toBe(getCycleId('DAILY', evening))
    })

    it('returns different IDs for consecutive days (DAILY)', () => {
      const day1 = new Date('2024-03-15T12:00:00Z')
      const day2 = new Date('2024-03-16T12:00:00Z')
      expect(getCycleId('DAILY', day1)).not.toBe(getCycleId('DAILY', day2))
    })
  })
})
