import prisma from '../lib/prisma'

const DEPLOYMENT_ID      = 'seed-deployment-1'
const DEPLOYMENT_ID_TREE = 'seed-deployment-tree'

const MVP_QUESTIONS = [
  'How meaningful does your work feel right now?',
  'How connected do you feel to the people you work with?',
  'How confident are you that the company is heading in the right direction?',
]

const TEST_USERS = [
  { email: 'manager@example.com', role: 'MANAGER' as const },
  { email: 'alice@example.com', role: 'MEMBER' as const },
  { email: 'bob@example.com', role: 'MEMBER' as const },
  { email: 'carol@example.com', role: 'MEMBER' as const },
  { email: 'dan@example.com', role: 'MEMBER' as const },
  { email: 'eve@example.com', role: 'MEMBER' as const },
  { email: 'frank@example.com', role: 'MEMBER' as const },
  { email: 'grace@example.com', role: 'MEMBER' as const },
]

// Historical response data.
// Story: fulfillment is rising (work feels more meaningful lately),
//        cohesion is falling (people feel less connected — side quest target),
//        confidence is stable (direction is clear).
const WEEKLY_DATA: Array<{
  weeksAgo: number   // how many weeks back this data was submitted
  // [Q0_fulfillment, Q1_cohesion, Q2_confidence] per respondent
  responses: Array<[number, number, number]>
}> = [
  {
    weeksAgo: 0,  // current week — partial, only a few have submitted
    responses: [
      [8, 5, 7],
      [7, 5, 8],
      [8, 6, 7],
      [9, 4, 7],
    ],
  },
  {
    weeksAgo: 1,  // last week — full team participation
    responses: [
      [6, 6, 7],
      [7, 7, 8],
      [6, 6, 7],
      [6, 7, 7],
      [7, 6, 8],
      [7, 7, 7],
    ],
  },
  {
    weeksAgo: 2,
    responses: [
      [5, 7, 7],
      [6, 8, 6],
      [5, 7, 7],
      [6, 7, 6],
      [6, 8, 7],
    ],
  },
  {
    weeksAgo: 3,
    responses: [
      [4, 8, 6],
      [5, 8, 7],
      [4, 7, 6],
      [5, 8, 6],
    ],
  },
]

function midWeekDate(weeksAgo: number): Date {
  const d = new Date()
  // Tuesday of the target week: -7*weeksAgo days, then adjusted to Tuesday
  d.setUTCDate(d.getUTCDate() - weeksAgo * 7 - 1)
  // Keep the time around midday UTC
  d.setUTCHours(12, 0, 0, 0)
  return d
}

async function seed() {
  console.log('Seeding database…')

  // ── Deployment ─────────────────────────────────────────────────────────────
  const deployment = await prisma.deployment.upsert({
    where: { id: DEPLOYMENT_ID },
    update: {},
    create: {
      id: DEPLOYMENT_ID,
      name: 'Acme Corp',
      theme: 'underwater',
      questions: MVP_QUESTIONS,
      submissionFrequency: 'WEEKLY',
      decayRate: 0.95,
      driftSpeed: 1.0,
    },
  })
  console.log(`Deployment: ${deployment.id} (${deployment.name})`)

  // ── Users ──────────────────────────────────────────────────────────────────
  for (const { email, role } of TEST_USERS) {
    const user = await prisma.user.upsert({
      where: { email_deploymentId: { email, deploymentId: deployment.id } },
      update: {},
      create: { email, deploymentId: deployment.id, role },
    })
    console.log(`  ${role.padEnd(7)} ${user.email}`)
  }

  // ── Historical responses (skip if already seeded) ──────────────────────────
  const existingCount = await prisma.response.count({
    where: { deploymentId: deployment.id },
  })

  if (existingCount > 0) {
    console.log(`\nResponses already seeded (${existingCount} found). Skipping response creation.`)
  } else {
    console.log('\nSeeding historical responses…')
    let totalCreated = 0

    for (const week of WEEKLY_DATA) {
      const submittedAt = midWeekDate(week.weeksAgo)
      for (let r = 0; r < week.responses.length; r++) {
        const [q0, q1, q2] = week.responses[r]
        await prisma.response.create({
          data: {
            deploymentId: deployment.id,
            token: `seed-token-w${week.weeksAgo}-r${r}`,
            answers: [
              { questionIndex: 0, value: q0 },
              { questionIndex: 1, value: q1 },
              { questionIndex: 2, value: q2 },
            ],
            submittedAt,
          },
        })
        totalCreated++
      }
      console.log(`  Week -${week.weeksAgo}: ${week.responses.length} responses (${submittedAt.toISOString().slice(0, 10)})`)
    }
    console.log(`  Total: ${totalCreated} responses created`)
  }

  // ── Side quests (upsert so re-running is safe) ─────────────────────────────
  const sqDeadline1 = new Date()
  sqDeadline1.setUTCDate(sqDeadline1.getUTCDate() + 14)
  sqDeadline1.setUTCHours(23, 59, 59, 0)

  const sqDeadline2 = new Date()
  sqDeadline2.setUTCDate(sqDeadline2.getUTCDate() + 7)
  sqDeadline2.setUTCHours(23, 59, 59, 0)

  // Use deterministic IDs so upsert works on re-run
  await prisma.sideQuest.upsert({
    where: { id: 'seed-sq-1' },
    update: { deadline: sqDeadline1 },
    create: {
      id: 'seed-sq-1',
      deploymentId: deployment.id,
      title: 'All-hands reconnect session',
      description: 'Cohesion scores have been falling. Schedule a team gathering to rebuild connection.',
      deadline: sqDeadline1,
      completed: false,
    },
  })

  await prisma.sideQuest.upsert({
    where: { id: 'seed-sq-2' },
    update: { deadline: sqDeadline2 },
    create: {
      id: 'seed-sq-2',
      deploymentId: deployment.id,
      title: 'Share the product roadmap',
      description: 'Help the team understand where the company is heading. Present the Q2 plan.',
      deadline: sqDeadline2,
      completed: false,
    },
  })

  console.log('\nSide quests seeded.')
  // ── Tree-theme deployment ──────────────────────────────────────────────────
  const treeDeployment = await prisma.deployment.upsert({
    where: { id: DEPLOYMENT_ID_TREE },
    update: {},
    create: {
      id: DEPLOYMENT_ID_TREE,
      name: 'Acme Corp (Tree)',
      theme: 'tree',
      questions: MVP_QUESTIONS,
      submissionFrequency: 'WEEKLY',
      decayRate: 0.95,
      driftSpeed: 1.0,
    },
  })
  console.log(`Deployment: ${treeDeployment.id} (${treeDeployment.name}) — tree theme`)

  // Add the same manager to the tree deployment
  await prisma.user.upsert({
    where: { email_deploymentId: { email: 'manager@example.com', deploymentId: treeDeployment.id } },
    update: {},
    create: { email: 'manager@example.com', deploymentId: treeDeployment.id, role: 'MANAGER' },
  })

  console.log('\nDone. To log in, POST /api/auth/request with:')
  console.log(`  { "email": "manager@example.com", "deploymentId": "${deployment.id}" }`)
  console.log(`\nReef theme:`)
  console.log(`  Tank:      /tank/${deployment.id}`)
  console.log(`  Dashboard: /dashboard/${deployment.id}`)
  console.log(`\nTree theme:`)
  console.log(`  Tank:      /tank/${treeDeployment.id}`)
  console.log(`  Dashboard: /dashboard/${treeDeployment.id}`)
}

seed()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
