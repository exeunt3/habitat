import { createContext, useContext, useState, ReactNode } from 'react'

interface Session {
  jwt: string | null
  anonToken: string | null
  deploymentId: string | null // retained even after JWT is cleared
}

interface AuthContextValue {
  session: Session
  setJWT: (jwt: string) => void
  claimAnonToken: (token: string) => void // stores anon token and wipes the JWT
  clearSession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(b64))
  } catch {
    return null
  }
}

const STORAGE_KEY = 'habitat_session'

function loadSession(): Session {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Session
  } catch { /* ignore */ }
  return { jwt: null, anonToken: null, deploymentId: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(loadSession)

  function persist(s: Session) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
    setSession(s)
  }

  function setJWT(jwt: string) {
    const payload = decodeJWTPayload(jwt)
    const deploymentId = typeof payload?.deploymentId === 'string' ? payload.deploymentId : null
    persist({ jwt, anonToken: null, deploymentId })
  }

  function claimAnonToken(anonToken: string) {
    // JWT is cleared here — from this point the session is anonymous
    persist({ jwt: null, anonToken, deploymentId: session.deploymentId })
  }

  function clearSession() {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    setSession({ jwt: null, anonToken: null, deploymentId: null })
  }

  return (
    <AuthContext.Provider value={{ session, setJWT, claimAnonToken, clearSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
