import { useState, FormEvent } from 'react'

// ── API call ───────────────────────────────────────────────────────────────────

async function createDeployment(body: {
  adminKey: string
  name: string
  managerEmail: string
  questions: string[]
  theme: string
}): Promise<{ deploymentId: string; managerEmail: string }> {
  const res = await fetch('/api/admin/deployments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(err.error ?? 'Setup failed')
  }
  return res.json()
}

// ── Page ───────────────────────────────────────────────────────────────────────

type Status = 'idle' | 'submitting' | 'done' | 'error'

export default function SetupPage() {
  const [adminKey,      setAdminKey]      = useState('')
  const [name,          setName]          = useState('')
  const [managerEmail,  setManagerEmail]  = useState('')
  const [questions,     setQuestions]     = useState(['', '', ''])
  const [theme,         setTheme]         = useState('reef')
  const [status,        setStatus]        = useState<Status>('idle')
  const [errorMsg,      setErrorMsg]      = useState('')
  const [result,        setResult]        = useState<{ deploymentId: string; managerEmail: string } | null>(null)

  function setQuestion(i: number, val: string) {
    setQuestions(prev => prev.map((q, j) => j === i ? val : q))
  }

  function addQuestion() {
    if (questions.length < 5) setQuestions(prev => [...prev, ''])
  }

  function removeQuestion(i: number) {
    if (questions.length > 3) setQuestions(prev => prev.filter((_, j) => j !== i))
  }

  const validQuestions = questions.filter(q => q.trim().length > 0)
  const canSubmit = adminKey.trim() && name.trim() && managerEmail.trim() && validQuestions.length >= 3

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit || status === 'submitting') return
    setStatus('submitting')
    setErrorMsg('')
    try {
      const data = await createDeployment({
        adminKey: adminKey.trim(),
        name: name.trim(),
        managerEmail: managerEmail.trim().toLowerCase(),
        questions: validQuestions,
        theme,
      })
      setResult(data)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Setup failed')
      setStatus('error')
    }
  }

  if (status === 'done' && result) {
    const origin = window.location.origin
    return (
      <div style={S.page}>
        <div style={S.container}>
          <div style={S.header}>
            <span style={S.headerTitle}>Deployment created</span>
          </div>

          <div style={S.successBox}>
            <p style={S.successMsg}>
              A login link has been sent to <strong>{result.managerEmail}</strong>.<br />
              Use it to access the manager console and add team members.
            </p>
          </div>

          <div style={S.infoGrid}>
            <InfoRow label="Deployment ID" value={result.deploymentId} mono />
            <InfoRow label="Tank (projection)"   value={`${origin}/tank/${result.deploymentId}`}  link />
            <InfoRow label="Dashboard"           value={`${origin}/dashboard/${result.deploymentId}`} link />
            <InfoRow label="Manager console"     value={`${origin}/manage/${result.deploymentId}`}   link />
          </div>

          <p style={S.hint}>
            Share the login page (<code style={S.code}>{origin}/login</code>) with your team
            members once you have added their emails.
          </p>
        </div>
      </div>
    )
  }

  const busy = status === 'submitting'

  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={S.header}>
          <span style={S.headerTitle}>New deployment</span>
        </div>

        {status === 'error' && (
          <div style={S.errorBanner}>{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Admin key */}
          <Section title="Authentication">
            <label style={S.label}>
              Admin key
              <input
                style={S.input}
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                placeholder="Set via ADMIN_KEY env variable on the server"
                disabled={busy}
                autoComplete="off"
              />
            </label>
          </Section>

          {/* Deployment */}
          <Section title="Deployment">
            <label style={S.label}>
              Organisation name
              <input
                style={S.input}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Acme Corp"
                maxLength={80}
                disabled={busy}
              />
            </label>
            <label style={S.label}>
              Manager email
              <input
                style={S.input}
                type="email"
                value={managerEmail}
                onChange={e => setManagerEmail(e.target.value)}
                placeholder="manager@yourcompany.com"
                disabled={busy}
              />
            </label>
            <label style={S.label}>
              Visualization theme
              <select
                style={{ ...S.input, cursor: 'pointer' }}
                value={theme}
                onChange={e => setTheme(e.target.value)}
                disabled={busy}
              >
                <option value="reef">Reef — underwater coral ecosystem</option>
                <option value="tree">Tree — living forest canopy</option>
              </select>
            </label>
          </Section>

          {/* Questions */}
          <Section title={`Questions (${validQuestions.length}/5)`}>
            <p style={S.hint}>
              3–5 questions, each answered on a 1–10 scale. Keep them short and open-ended.
            </p>
            {questions.map((q, i) => (
              <div key={i} style={S.questionRow}>
                <input
                  style={{ ...S.input, flex: 1, marginBottom: 0 }}
                  value={q}
                  onChange={e => setQuestion(i, e.target.value)}
                  placeholder={`Question ${i + 1}`}
                  maxLength={160}
                  disabled={busy}
                />
                {questions.length > 3 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(i)}
                    style={S.removeBtn}
                    disabled={busy}
                    aria-label="Remove question"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {questions.length < 5 && (
              <button
                type="button"
                onClick={addQuestion}
                style={S.addBtn}
                disabled={busy}
              >
                + Add question
              </button>
            )}
          </Section>

          <button
            type="submit"
            style={S.submitBtn(!canSubmit || busy)}
            disabled={!canSubmit || busy}
          >
            {busy ? 'Creating…' : 'Create deployment'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={S.section}>
      <div style={S.sectionTitle}>{title}</div>
      {children}
    </div>
  )
}

function InfoRow({ label, value, mono, link }: { label: string; value: string; mono?: boolean; link?: boolean }) {
  return (
    <div style={S.infoRow}>
      <span style={S.infoLabel}>{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noreferrer" style={S.infoLink}>{value}</a>
      ) : (
        <span style={mono ? S.infoMono : S.infoValue}>{value}</span>
      )}
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: '100vh',
    background: '#f9f9f7',
    padding: '0 0 80px',
  } as React.CSSProperties,

  container: {
    maxWidth: 580,
    margin: '0 auto',
    padding: '0 24px',
  } as React.CSSProperties,

  header: {
    borderBottom: '1px solid #e8e8e4',
    padding: '40px 0 20px',
    marginBottom: 36,
  } as React.CSSProperties,

  headerTitle: {
    fontSize: 20,
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: '#1a1a1a',
  } as React.CSSProperties,

  section: {
    background: '#ffffff',
    border: '1px solid #e8e8e4',
    borderRadius: 12,
    padding: '24px',
    marginBottom: 20,
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#9a9a96',
    marginBottom: 18,
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

  questionRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    marginBottom: 10,
  } as React.CSSProperties,

  removeBtn: {
    flexShrink: 0,
    width: 32,
    height: 32,
    border: '1px solid #e6e6e2',
    borderRadius: 6,
    background: '#fafaf8',
    color: '#8a8a86',
    fontSize: 18,
    lineHeight: '1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  } as React.CSSProperties,

  addBtn: {
    marginTop: 6,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 500,
    color: '#4a8a6a',
    background: 'transparent',
    border: '1px solid #b8e0c4',
    borderRadius: 8,
    cursor: 'pointer',
  } as React.CSSProperties,

  submitBtn: (disabled: boolean): React.CSSProperties => ({
    marginTop: 8,
    padding: '13px 24px',
    fontSize: 14,
    fontWeight: 500,
    width: '100%',
    color: disabled ? '#999' : '#ffffff',
    background: disabled ? '#eaeae6' : '#1a1a1a',
    border: 'none',
    borderRadius: 10,
    cursor: disabled ? 'default' : 'pointer',
  }),

  errorBanner: {
    background: '#fce8e8',
    color: '#a03030',
    border: '1px solid #f0c0c0',
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 13,
    marginBottom: 20,
  } as React.CSSProperties,

  successBox: {
    background: '#e8f4ec',
    border: '1px solid #b8e0c4',
    borderRadius: 10,
    padding: '20px 24px',
    marginBottom: 24,
  } as React.CSSProperties,

  successMsg: {
    fontSize: 14,
    color: '#1a4a2a',
    lineHeight: 1.6,
    margin: 0,
  } as React.CSSProperties,

  infoGrid: {
    background: '#ffffff',
    border: '1px solid #e8e8e4',
    borderRadius: 12,
    padding: '4px 0',
    marginBottom: 24,
  } as React.CSSProperties,

  infoRow: {
    display: 'flex',
    gap: 12,
    padding: '12px 20px',
    borderBottom: '1px solid #f2f2ee',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  infoLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: '#8a8a86',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    minWidth: 130,
    flexShrink: 0,
    paddingTop: 1,
  } as React.CSSProperties,

  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
  } as React.CSSProperties,

  infoMono: {
    fontSize: 13,
    color: '#1a1a1a',
    fontFamily: '"SF Mono", "Fira Code", monospace',
  } as React.CSSProperties,

  infoLink: {
    fontSize: 13,
    color: '#4a8a6a',
    textDecoration: 'none',
    wordBreak: 'break-all' as const,
  } as React.CSSProperties,

  hint: {
    fontSize: 13,
    color: '#9a9a96',
    lineHeight: 1.6,
    marginBottom: 16,
  } as React.CSSProperties,

  code: {
    fontFamily: '"SF Mono", "Fira Code", monospace',
    fontSize: 12,
    color: '#4a4a46',
  } as React.CSSProperties,
}
