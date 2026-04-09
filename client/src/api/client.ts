export interface Answer {
  questionIndex: number
  value: number
}

export interface ParameterState {
  name: string
  value: number
  trend: 'rising' | 'falling' | 'stable'
  responseCount: number
}

export interface SideQuestInfo {
  id: string
  title: string
  description: string
  deadline: string   // ISO string
  completed: boolean
  completedAt?: string | null
  createdAt?: string
}

export interface SideQuestEventInfo {
  type: string        // "manta_ray" | "bioluminescence" | "turtle_visit"
  triggeredAt: string // ISO string — used by client to deduplicate
}

export interface EcosystemState {
  deploymentId: string
  timestamp: string
  theme: string    // "reef" | "tree"
  parameters: Record<string, ParameterState>
  overallHealth: number
  activeSideQuests: SideQuestInfo[]
  completedSideQuestsThisCycle: SideQuestInfo[]
  lastSubmissionAt: string | null
  activeSideQuestEvent: SideQuestEventInfo | null
}

// ── Auth ───────────────────────────────────────────────────────────────────────

export async function requestMagicLink(email: string, deploymentId: string): Promise<void> {
  const res = await fetch('/api/auth/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, deploymentId }),
  })
  if (!res.ok) throw new Error('Request failed')
}

export async function verifyMagicToken(token: string): Promise<string> {
  const res = await fetch(`/api/auth/verify/${token}`)
  if (!res.ok) throw new Error('Invalid or expired link')
  const data = await res.json() as { token: string }
  return data.token
}

// ── Submission ─────────────────────────────────────────────────────────────────

export async function requestAnonToken(jwt: string): Promise<string> {
  const res = await fetch('/api/tokens/request', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
  })
  if (res.status === 409) throw new Error('already_submitted')
  if (!res.ok) throw new Error('Failed to get submission token')
  const data = await res.json() as { token: string }
  return data.token
}

export async function submitResponses(token: string, answers: Answer[]): Promise<void> {
  const res = await fetch('/api/responses/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, answers }),
  })
  if (!res.ok) throw new Error('Submission failed')
}

// ── Ecosystem state ─────────────────────────────────────────────────────────────

export async function fetchEcosystemState(deploymentId: string): Promise<EcosystemState> {
  const res = await fetch(`/api/state/${deploymentId}`)
  if (!res.ok) throw new Error('Failed to load state')
  return res.json() as Promise<EcosystemState>
}

// ── Side quests (manager) ───────────────────────────────────────────────────────

function authHeaders(jwt: string) {
  return { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }
}

export async function fetchSideQuests(jwt: string): Promise<SideQuestInfo[]> {
  const res = await fetch('/api/sidequests', { headers: authHeaders(jwt) })
  if (!res.ok) throw new Error('Failed to fetch side quests')
  return res.json() as Promise<SideQuestInfo[]>
}

export async function createSideQuest(
  jwt: string,
  title: string,
  description: string,
  deadline: string,
): Promise<SideQuestInfo> {
  const res = await fetch('/api/sidequests', {
    method:  'POST',
    headers: authHeaders(jwt),
    body:    JSON.stringify({ title, description, deadline }),
  })
  if (!res.ok) throw new Error('Failed to create side quest')
  return res.json() as Promise<SideQuestInfo>
}

export async function completeSideQuest(jwt: string, id: string): Promise<SideQuestInfo> {
  const res = await fetch(`/api/sidequests/${id}/complete`, {
    method:  'PATCH',
    headers: authHeaders(jwt),
  })
  if (!res.ok) throw new Error('Failed to complete side quest')
  return res.json() as Promise<SideQuestInfo>
}
