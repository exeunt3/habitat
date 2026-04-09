import prisma from '../lib/prisma'

const MVP_QUESTIONS = [
  'How meaningful does your work feel right now?',
  'How connected do you feel to the people you work with?',
  'How confident are you that the company is heading in the right direction?',
]

const CREEK_QUESTIONS = [
  'How energized and present do you feel today?',
  'How connected do you feel to the people around you?',
  'How clear does your path forward feel right now?',
]

const DEPLOYMENTS = [
  { id: 'demo-reef',  name: 'Habitat Demo — Coral Reef',   theme: 'reef',  questions: MVP_QUESTIONS },
  { id: 'demo-tree',  name: 'Habitat Demo — Living Tree',   theme: 'tree',  questions: MVP_QUESTIONS },
  { id: 'demo-creek', name: 'Habitat Demo — Beaver Creek',  theme: 'creek', questions: CREEK_QUESTIONS },
]

// Deterministic xorshift32 RNG
function mkRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s ^= s << 13
    s ^= s >> 17
    s ^= s << 5
    return (s >>> 0) / 0xffffffff
  }
}

// Simple hash to get a numeric seed from a string
function hashStr(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (Math.imul(h, 0x01000193) >>> 0)
  }
  return h >>> 0
}

// Generate a value with center C and variance V, clamped to 1-10
function randVal(rng: () => number, center: number, variance: number): number {
  return Math.max(1, Math.min(10, Math.round(center + (rng() - 0.5) * variance * 2)))
}

// Wednesday 11am UTC for a given "weeksAgo"
function wedDate(weeksAgo: number): Date {
  const d = new Date(Date.now() - weeksAgo * 7 * 24 * 3600 * 1000)
  // Move to Wednesday (day 3) of that week
  const dow = d.getUTCDay()
  const diffToWed = 3 - dow
  d.setUTCDate(d.getUTCDate() + diffToWed)
  d.setUTCHours(11, 0, 0, 0)
  return d
}

// Returns [q0, q1, q2] values for a given week index (1-based) and employee index
interface WeekSpec {
  q0Center: number
  q0Variance: number
  q1Center: number
  q1Variance: number
  q2Center: number
  q2Variance: number
}

function getWeekSpec(weekNum: number): WeekSpec {
  // Weeks 1-3: Healthy
  if (weekNum <= 3) {
    return { q0Center: 8, q0Variance: 1.5, q1Center: 8, q1Variance: 1.5, q2Center: 8, q2Variance: 1.5 }
  }
  // Week 4: Rough patch starts
  if (weekNum === 4) {
    return { q0Center: 5, q0Variance: 1.5, q1Center: 7, q1Variance: 1.5, q2Center: 7, q2Variance: 1.5 }
  }
  // Weeks 5-6: Rough patch deepens
  if (weekNum === 5) {
    return { q0Center: 5, q0Variance: 1.5, q1Center: 5, q1Variance: 1.5, q2Center: 6, q2Variance: 1.5 }
  }
  if (weekNum === 6) {
    return { q0Center: 5, q0Variance: 1.5, q1Center: 5, q1Variance: 1.5, q2Center: 5, q2Variance: 1.5 }
  }
  // Week 7: Side quest moment — slight improvement
  if (weekNum === 7) {
    return { q0Center: 7, q0Variance: 1.5, q1Center: 6.5, q1Variance: 1.5, q2Center: 7, q2Variance: 1.5 }
  }
  // Weeks 8-10: Cohesion collapse
  if (weekNum >= 8 && weekNum <= 10) {
    return { q0Center: 6, q0Variance: 1.5, q1Center: 4, q1Variance: 1.5, q2Center: 5, q2Variance: 1.5 }
  }
  // Weeks 11-12: Recovery arc
  return { q0Center: 7.5, q0Variance: 1.5, q1Center: 6, q1Variance: 1.5, q2Center: 7, q2Variance: 1.5 }
}

async function seedDeployment(deploymentId: string, name: string, theme: string, questions: string[]) {
  console.log(`\n=== Seeding deployment: ${name} (${deploymentId}) ===`)

  // 1. Upsert deployment
  await prisma.deployment.upsert({
    where: { id: deploymentId },
    update: { name, theme, questions },
    create: {
      id: deploymentId,
      name,
      theme,
      questions,
      submissionFrequency: 'WEEKLY',
      decayRate: 0.95,
      driftSpeed: 1.0,
    },
  })
  console.log(`  Deployment upserted.`)

  // 2. Delete existing data in dependency order
  console.log('  Deleting existing responses, tokens, side quest events, side quests...')

  // Find existing side quests to delete their events
  const existingSideQuests = await prisma.sideQuest.findMany({
    where: { deploymentId },
    select: { id: true },
  })
  const sqIds = existingSideQuests.map((sq) => sq.id)

  await prisma.$transaction([
    prisma.sideQuestEvent.deleteMany({ where: { deploymentId } }),
    prisma.sideQuest.deleteMany({ where: { deploymentId } }),
    prisma.response.deleteMany({ where: { deploymentId } }),
    prisma.token.deleteMany({ where: { deploymentId } }),
    prisma.cycleParticipation.deleteMany({ where: { deploymentId } }),
  ])

  // Suppress unused variable warning
  void sqIds

  console.log('  Existing data cleared.')

  // 3. Generate 12 weeks of data, 30 employees per week
  // Seed RNG differently for each deployment
  const rng = mkRng(hashStr(theme))

  const NUM_WEEKS = 12
  const NUM_EMPLOYEES = 30

  // week 1 = 12 weeks ago, week 12 = 1 week ago (most recent week past)
  for (let weekNum = 1; weekNum <= NUM_WEEKS; weekNum++) {
    const weeksAgo = NUM_WEEKS - weekNum + 1 // week 1 => 12 weeksAgo, week 12 => 1 weeksAgo
    const submittedAt = wedDate(weeksAgo)
    const spec = getWeekSpec(weekNum)

    const tokensData: Array<{ token: string; deploymentId: string; issued: boolean; used: boolean }> = []
    const responsesData: Array<{
      deploymentId: string
      token: string
      answers: Array<{ questionIndex: number; value: number }>
      submittedAt: Date
    }> = []

    for (let e = 0; e < NUM_EMPLOYEES; e++) {
      const tokenStr = `demo-resp-${deploymentId.slice(0, 8)}-w${weeksAgo}-e${e}`
      const q0 = randVal(rng, spec.q0Center, spec.q0Variance)
      const q1 = randVal(rng, spec.q1Center, spec.q1Variance)
      const q2 = randVal(rng, spec.q2Center, spec.q2Variance)

      tokensData.push({ token: tokenStr, deploymentId, issued: true, used: true })
      responsesData.push({
        deploymentId,
        token: tokenStr,
        answers: [
          { questionIndex: 0, value: q0 },
          { questionIndex: 1, value: q1 },
          { questionIndex: 2, value: q2 },
        ],
        submittedAt,
      })
    }

    // Batch create tokens and responses
    await prisma.$transaction([
      prisma.token.createMany({ data: tokensData }),
      prisma.response.createMany({ data: responsesData }),
    ])

    console.log(`  Week ${weekNum} (${weeksAgo} weeks ago, ${submittedAt.toISOString().slice(0, 10)}): ${NUM_EMPLOYEES} responses`)

    // Week 7: Create a SideQuest and SideQuestEvent
    if (weekNum === 7) {
      const eventType = theme === 'reef' ? 'manta_ray' : theme === 'tree' ? 'blossoms' : 'kingfisher'
      const sqId = `demo-sq-${deploymentId.slice(0, 8)}-w7`
      const sqDeadline = new Date(submittedAt)
      sqDeadline.setUTCDate(sqDeadline.getUTCDate() + 14)

      const sq = await prisma.sideQuest.create({
        data: {
          id: sqId,
          deploymentId,
          title: theme === 'reef' ? 'Team Reconnect — Coral Revival' : theme === 'tree' ? 'Team Reconnect — New Growth' : 'Moment of Clarity — Still Waters',
          description:
            theme === 'reef'
              ? 'Scores have dipped. Rally the team with a shared activity to rebuild connection and confidence.'
              : theme === 'tree'
              ? 'The tree needs tending. A shared team moment can spark new branches of trust.'
              : 'The creek is quiet. A pause to reflect and reconnect can clear the waters.',
          deadline: sqDeadline,
          completed: true,
          completedAt: submittedAt,
        },
      })

      await prisma.sideQuestEvent.create({
        data: {
          sideQuestId: sq.id,
          deploymentId,
          eventType,
          triggeredAt: submittedAt,
        },
      })

      console.log(`  Week 7: SideQuest created (id: ${sqId}, event: ${eventType})`)
    }
  }

  console.log(`  Seeding complete for ${deploymentId}.`)
}

async function main() {
  console.log('Starting demo seed...')

  for (const { id, name, theme, questions } of DEPLOYMENTS) {
    await seedDeployment(id, name, theme, questions)
  }

  console.log('\n=== Demo seed complete ===')
  console.log('Reef demo:  /demo/reef   (id: demo-reef)')
  console.log('Tree demo:  /demo/tree   (id: demo-tree)')
  console.log('Creek demo: /demo/creek  (id: demo-creek)')
  console.log('Use POST /api/demo/start { "deploymentId": "demo-reef" } to start live demo mode')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

