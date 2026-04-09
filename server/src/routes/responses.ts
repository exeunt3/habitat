import { Router } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma'

interface Answer {
  questionIndex: number
  value: number
}

function isValidAnswers(raw: unknown): raw is Answer[] {
  if (!Array.isArray(raw) || raw.length === 0) return false
  return raw.every(
    (a) =>
      typeof a === 'object' &&
      a !== null &&
      typeof (a as Record<string, unknown>).questionIndex === 'number' &&
      typeof (a as Record<string, unknown>).value === 'number',
  )
}

const router = Router()

// No auth — accepts anonymous token only
router.post('/submit', async (req, res) => {
  const { token, answers } = req.body as { token: unknown; answers: unknown }

  if (typeof token !== 'string' || !token) {
    res.status(400).json({ error: 'token is required' })
    return
  }
  if (!isValidAnswers(answers)) {
    res.status(400).json({ error: 'answers must be a non-empty array of {questionIndex, value}' })
    return
  }

  const tokenRecord = await prisma.token.findUnique({ where: { token } })
  if (!tokenRecord) {
    res.status(404).json({ error: 'Token not found' })
    return
  }
  if (tokenRecord.used) {
    res.status(409).json({ error: 'Token already used' })
    return
  }

  await prisma.$transaction([
    prisma.response.create({
      data: { deploymentId: tokenRecord.deploymentId, token, answers: answers as unknown as Prisma.InputJsonValue },
    }),
    prisma.token.update({ where: { token }, data: { used: true } }),
  ])

  res.json({ success: true })
})

export default router
