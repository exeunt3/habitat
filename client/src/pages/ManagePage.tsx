import { useState, useEffect, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  SideQuestInfo,
  fetchSideQuests,
  createSideQuest,
  completeSideQuest,
} from '../api/client'

// ── Helpers ────────────────────────────────────────────────────────────────────

function decodeRole(jwt: string): string | null {
  try {
    const b64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(b64)) as { role?: string }
    return payload.role ?? null
  } catch { return null }
}

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const days = Math.ceil(diff / 86_400_000)
  if (days < 0)  return 'overdue'
  if (days === 0) return 'due today'
  return `${days}d`
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function QuestRow({
  quest,
  onComplete,
}: {
  quest: SideQuestInfo
  onComplete: (id: string) => void
}) {
  const [busy, setBusy] = useState(false)

  async function handleComplete() {
    setBusy(true)
    await onComplete(quest.id)
    setBusy(false)
  }

  return (
    <div style={S.questRow}>
      <div style={S.questInfo}>
        <span style={S.questTitle}>{quest.title}</span>
        <span style={S.questDesc}>{quest.description}</span>
      </div>
      <div style={S.questMeta}>
        {quest.completed ? (
          <span style={S.badge('done')}>done</span>
        ) : (
          <>
            <span style={S.deadline}>{daysUntil(quest.deadline)}</span>
            <button
              style={S.completeBtn(busy)}
              disabled={busy}
              onClick={handleComplete}
            >
              {busy ? '…' : 'Complete'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ManagePage() {
  const { deploymentId } = useParams<{ deploymentId: string }>()
  const { session } = useAuth()
  const navigate = useNavigate()

  const [quests, setQuests]     = useState<SideQuestInfo[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [flash, setFlash]       = useState<string | null>(null)

  // Create form state
  const [title, setTitle]       = useState('')
  const [desc, setDesc]         = useState('')
  const [deadline, setDeadline] = useState('')
  const [creating, setCreating] = useState(false)

  const jwt = session.jwt

  // Guard: must be authenticated MANAGER
  useEffect(() => {
    if (!jwt) { navigate('/login', { replace: true }); return }
    if (decodeRole(jwt) !== 'MANAGER') { navigate('/login', { replace: true }); return }
  }, [jwt, navigate])

  // Load quests
  useEffect(() => {
    if (!jwt) return
    fetchSideQuests(jwt)
      .then(data => { setQuests(data); setLoading(false) })
      .catch(() => { setError('Could not load quests'); setLoading(false) })
  }, [jwt])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!jwt || !title.trim() || !desc.trim() || !deadline) return
    setCreating(true)
    try {
      const q = await createSideQuest(jwt, title.trim(), desc.trim(), deadline)
      setQuests(prev => [q, ...prev])
      setTitle(''); setDesc(''); setDeadline('')
      showFlash('Side quest created.')
    } catch {
      setError('Failed to create side quest')
    } finally {
      setCreating(false)
    }
  }

  async function handleComplete(id: string) {
    if (!jwt) return
    try {
      const updated = await completeSideQuest(jwt, id)
      setQuests(prev => prev.map(q => q.id === id ? { ...q, ...updated } : q))
      showFlash('Quest completed — a visual event will appear in the tank.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error'
      setError(msg)
    }
  }

  function showFlash(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(null), 4000)
  }

  const active    = quests.filter(q => !q.completed)
  const completed = quests.filter(q => q.completed)

  if (!jwt) return null

  return (
    <div style={S.page}>
      <div style={S.container}>

        {/* Header */}
        <div style={S.header}>
          <span style={S.headerTitle}>Side Quests</span>
          <span style={S.headerSub}>{deploymentId}</span>
        </div>

        {flash && <div style={S.flash}>{flash}</div>}
        {error && <div style={S.errorBanner}>{error}</div>}

        {/* Create form */}
        <form onSubmit={handleCreate} style={S.form}>
          <div style={S.formTitle}>New quest</div>
          <label style={S.label}>
            Title
            <input
              style={S.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Run an all-hands retro"
              maxLength={80}
              disabled={creating}
            />
          </label>
          <label style={S.label}>
            Description
            <input
              style={S.input}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Brief context for participants"
              maxLength={200}
              disabled={creating}
            />
          </label>
          <label style={S.label}>
            Deadline
            <input
              style={{ ...S.input, colorScheme: 'light' }}
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              disabled={creating}
            />
          </label>
          <button
            type="submit"
            style={S.submitBtn(creating || !title || !desc || !deadline)}
            disabled={creating || !title || !desc || !deadline}
          >
            {creating ? 'Creating…' : 'Create quest'}
          </button>
        </form>

        {/* Active quests */}
        {loading ? (
          <p style={S.muted}>Loading…</p>
        ) : (
          <>
            <div style={S.sectionHead}>
              Active <span style={S.count}>{active.length}</span>
            </div>
            {active.length === 0 && <p style={S.muted}>No active quests.</p>}
            {active.map(q => (
              <QuestRow key={q.id} quest={q} onComplete={handleComplete} />
            ))}

            {completed.length > 0 && (
              <>
                <div style={{ ...S.sectionHead, marginTop: 32 }}>
                  Completed <span style={S.count}>{completed.length}</span>
                </div>
                {completed.map(q => (
                  <QuestRow key={q.id} quest={q} onComplete={handleComplete} />
                ))}
              </>
            )}
          </>
        )}

        <div style={S.footer}>
          <a style={S.link} href={`/tank/${deploymentId}`} target="_blank" rel="noreferrer">
            View tank ↗
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

void formatDeadline  // used implicitly via quest display

const S = {
  page: {
    minHeight: '100vh',
    background: '#f9f9f7',
    padding: '0 0 60px',
  } as React.CSSProperties,

  container: {
    maxWidth: 560,
    margin: '0 auto',
    padding: '0 24px',
  } as React.CSSProperties,

  header: {
    borderBottom: '1px solid #e8e8e4',
    padding: '40px 0 20px',
    marginBottom: 32,
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
  } as React.CSSProperties,

  headerTitle: {
    fontSize: 20,
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: '#1a1a1a',
  } as React.CSSProperties,

  headerSub: {
    fontSize: 12,
    color: '#9a9a96',
    fontFamily: '"SF Mono", monospace',
  } as React.CSSProperties,

  flash: {
    background: '#e8f4ec',
    color: '#2a6a3a',
    border: '1px solid #b8e0c4',
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 13,
    marginBottom: 20,
  } as React.CSSProperties,

  errorBanner: {
    background: '#fce8e8',
    color: '#a03030',
    border: '1px solid #f0c0c0',
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 13,
    marginBottom: 20,
  } as React.CSSProperties,

  form: {
    background: '#ffffff',
    border: '1px solid #e8e8e4',
    borderRadius: 12,
    padding: '24px',
    marginBottom: 36,
  } as React.CSSProperties,

  formTitle: {
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#6a6a66',
    marginBottom: 20,
  },

  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color: '#8a8a86',
    marginBottom: 16,
  },

  input: {
    display: 'block',
    width: '100%',
    padding: '11px 14px',
    fontSize: 14,
    color: '#1a1a1a',
    background: '#fafaf8',
    border: '1px solid #e6e6e2',
    borderRadius: 8,
    outline: 'none',
    marginTop: 6,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  submitBtn: (disabled: boolean): React.CSSProperties => ({
    marginTop: 8,
    padding: '11px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: disabled ? '#999' : '#ffffff',
    background: disabled ? '#eaeae6' : '#1a1a1a',
    border: 'none',
    borderRadius: 8,
    cursor: disabled ? 'default' : 'pointer',
  }),

  sectionHead: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#9a9a96',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } as React.CSSProperties,

  count: {
    background: '#e8e8e4',
    color: '#6a6a66',
    borderRadius: 10,
    padding: '1px 7px',
    fontSize: 11,
    fontWeight: 600,
  } as React.CSSProperties,

  questRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '14px 0',
    borderBottom: '1px solid #f0f0ec',
  } as React.CSSProperties,

  questInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 3,
    minWidth: 0,
  },

  questTitle: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  questDesc: {
    fontSize: 12,
    color: '#8a8a86',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,

  questMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  } as React.CSSProperties,

  deadline: {
    fontSize: 12,
    color: '#9a9a96',
    fontFamily: '"SF Mono", monospace',
  } as React.CSSProperties,

  completeBtn: (busy: boolean): React.CSSProperties => ({
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 500,
    color: busy ? '#999' : '#1a6a3a',
    background: busy ? '#eaeae6' : '#e8f4ec',
    border: '1px solid ' + (busy ? '#ddd' : '#b8e0c4'),
    borderRadius: 6,
    cursor: busy ? 'default' : 'pointer',
  }),

  badge: (status: string): React.CSSProperties => ({
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 10,
    background: status === 'done' ? '#e8f4ec' : '#fce8e8',
    color:      status === 'done' ? '#2a6a3a' : '#a03030',
    fontWeight: 500,
    letterSpacing: '0.03em',
  }),

  muted: {
    fontSize: 13,
    color: '#9a9a96',
    padding: '8px 0',
  } as React.CSSProperties,

  footer: {
    marginTop: 48,
    paddingTop: 20,
    borderTop: '1px solid #e8e8e4',
  } as React.CSSProperties,

  link: {
    fontSize: 13,
    color: '#4a8a6a',
    textDecoration: 'none',
  } as React.CSSProperties,
}
