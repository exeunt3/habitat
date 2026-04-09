import { useState, FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { requestMagicLink } from '../api/client'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: '#ffffff',
  } as React.CSSProperties,

  card: {
    width: '100%',
    maxWidth: 400,
  } as React.CSSProperties,

  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#8A8A86',
    marginBottom: 8,
  },

  input: {
    display: 'block',
    width: '100%',
    padding: '13px 16px',
    fontSize: 15,
    color: '#1A1A1A',
    background: '#FAFAF8',
    border: '1px solid #E6E6E2',
    borderRadius: 8,
    outline: 'none',
    marginBottom: 16,
    transition: 'border-color 0.15s ease',
  } as React.CSSProperties,

  button: (disabled: boolean): React.CSSProperties => ({
    display: 'block',
    width: '100%',
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 500,
    color: disabled ? '#999' : '#ffffff',
    background: disabled ? '#EAEAE6' : '#1A1A1A',
    border: 'none',
    borderRadius: 8,
    cursor: disabled ? 'default' : 'pointer',
    transition: 'background 0.15s ease',
    marginTop: 8,
  }),
}

export default function LoginPage() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [deploymentId, setDeploymentId] = useState(params.get('deployment') ?? '')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !deploymentId.trim()) return
    setStatus('sending')
    try {
      await requestMagicLink(email.trim().toLowerCase(), deploymentId.trim())
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div style={S.page}>
        <div style={{ ...S.card, textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 400, color: '#1A1A1A', letterSpacing: '-0.02em' }}>
            Check your email.
          </p>
          <p style={{ marginTop: 12, fontSize: 14, color: '#8A8A86', lineHeight: 1.6 }}>
            A login link is on its way to {email}.
            <br />
            It expires in 15 minutes.
          </p>
        </div>
      </div>
    )
  }

  const busy = status === 'sending'
  const canSubmit = email.trim().length > 0 && deploymentId.trim().length > 0 && !busy

  return (
    <div style={S.page}>
      <div style={S.card}>
        <p style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em', color: '#1A1A1A', marginBottom: 36 }}>
          Sign in
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label style={S.label}>
            Email
            <input
              style={{ ...S.input, marginTop: 6 }}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              disabled={busy}
            />
          </label>

          <label style={S.label}>
            Team ID
            <input
              style={{ ...S.input, marginTop: 6 }}
              type="text"
              value={deploymentId}
              onChange={e => setDeploymentId(e.target.value)}
              placeholder="your-team-id"
              disabled={busy}
            />
          </label>

          {status === 'error' && (
            <p style={{ fontSize: 13, color: '#B04040', marginBottom: 12 }}>
              Something went wrong. Please try again.
            </p>
          )}

          <button type="submit" disabled={!canSubmit} style={S.button(!canSubmit)}>
            {busy ? 'Sending…' : 'Send login link'}
          </button>
        </form>
      </div>
    </div>
  )
}
