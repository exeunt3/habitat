import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Slider from '../components/Slider'
import { useAuth } from '../context/AuthContext'
import { requestAnonToken, submitResponses, fetchEcosystemState } from '../api/client'

type PageStatus = 'loading' | 'ready' | 'submitting' | 'done' | 'error' | 'already_submitted'

export default function SubmitPage() {
  const { session, claimAnonToken } = useAuth()
  const navigate = useNavigate()
  const ran = useRef(false)

  const [status, setStatus] = useState<PageStatus>('loading')
  const [questions, setQuestions] = useState<string[]>([])
  const [values, setValues] = useState<number[]>([])

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    if (!session.jwt) {
      navigate('/login', { replace: true })
      return
    }

    const jwt = session.jwt
    const deploymentId = session.deploymentId

    async function init() {
      try {
        // Fetch questions and request anon token in parallel
        const [state, anonToken] = await Promise.all([
          deploymentId ? fetchEcosystemState(deploymentId) : Promise.resolve(null),
          requestAnonToken(jwt),
        ])

        // Extract ordered question names from the state
        const qs = state
          ? Object.entries(state.parameters)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([, p]) => p.name)
          : []

        setQuestions(qs)
        setValues(qs.map(() => 5)) // default all sliders to 5

        // JWT is cleared here — session becomes anonymous
        claimAnonToken(anonToken)
        setStatus('ready')
      } catch (err) {
        if (err instanceof Error && err.message === 'already_submitted') {
          setStatus('already_submitted')
        } else {
          setStatus('error')
        }
      }
    }

    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit() {
    if (!session.anonToken || status !== 'ready') return
    setStatus('submitting')

    try {
      const answers = values.map((value, questionIndex) => ({ questionIndex, value }))
      await submitResponses(session.anonToken, answers)
      setStatus('done')

      setTimeout(() => {
        navigate(session.deploymentId ? `/tank/${session.deploymentId}` : '/', { replace: true })
      }, 2800)
    } catch {
      setStatus('error')
    }
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (status === 'loading') {
    return <Shell><Muted>Preparing your form…</Muted></Shell>
  }

  if (status === 'already_submitted') {
    return (
      <Shell>
        <p style={S.body}>You've already submitted this week.</p>
        <p style={{ ...S.body, marginTop: 8, color: '#8A8A86' }}>Come back next cycle.</p>
      </Shell>
    )
  }

  if (status === 'error') {
    return (
      <Shell>
        <Muted>Something went wrong. Please close this tab and try again.</Muted>
      </Shell>
    )
  }

  if (status === 'done') {
    return (
      <Shell>
        <p style={{ fontSize: 20, fontWeight: 400, color: '#1A1A1A', letterSpacing: '-0.02em', lineHeight: 1.4 }}>
          Thank you.
          <br />
          The tank has been fed.
        </p>
      </Shell>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  const submitting = status === 'submitting'

  return (
    <div style={S.page}>
      <div style={S.content}>
        <div style={S.questions}>
          {questions.map((q, i) => (
            <div key={i} style={S.question}>
              <p style={S.questionText}>{q}</p>
              <Slider
                value={values[i] ?? 5}
                onChange={v => setValues(prev => prev.map((x, j) => j === i ? v : x))}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={S.submitButton(submitting)}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </div>
  )
}

// ── Small layout helpers ───────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {children}
    </div>
  )
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, color: '#8A8A86' }}>{children}</p>
}

// ── Styles ─────────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    // clamp: generous desktop padding, comfortable mobile padding
    padding: 'clamp(40px, 8vw, 64px) clamp(16px, 5vw, 32px) 80px',
    boxSizing: 'border-box' as const,
    overflowX: 'hidden' as const,
  } as React.CSSProperties,

  content: {
    width: '100%',
    maxWidth: 520,
  } as React.CSSProperties,

  questions: {
    display: 'flex',
    flexDirection: 'column' as const,
    // tighter gap on small screens
    gap: 'clamp(36px, 8vw, 56px)',
    marginBottom: 'clamp(40px, 8vw, 56px)',
  } as React.CSSProperties,

  question: {} as React.CSSProperties,

  questionText: {
    // scale down a touch on narrow screens
    fontSize: 'clamp(16px, 4.5vw, 18px)',
    fontWeight: 400,
    color: '#1A1A1A',
    lineHeight: 1.55,
    letterSpacing: '-0.01em',
    marginBottom: 24,
  } as React.CSSProperties,

  body: {
    fontSize: 'clamp(16px, 4.5vw, 18px)',
    fontWeight: 400,
    color: '#1A1A1A',
    lineHeight: 1.5,
  } as React.CSSProperties,

  submitButton: (disabled: boolean): React.CSSProperties => ({
    display: 'block',
    width: '100%',
    // min 48px tall — satisfies mobile touch target guidelines
    padding: '15px 24px',
    minHeight: 48,
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: '0.01em',
    color: disabled ? '#999' : '#ffffff',
    background: disabled ? '#EAEAE6' : '#1A1A1A',
    border: 'none',
    borderRadius: 10,
    cursor: disabled ? 'default' : 'pointer',
    transition: 'background 0.15s ease',
    WebkitTapHighlightColor: 'transparent',
  }),
}
