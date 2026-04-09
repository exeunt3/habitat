import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyMagicToken } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AuthVerifyPage() {
  const { token } = useParams<{ token: string }>()
  const { setJWT } = useAuth()
  const navigate = useNavigate()
  const ran = useRef(false) // guard against React strict-mode double-invoke

  useEffect(() => {
    if (ran.current || !token) return
    ran.current = true

    verifyMagicToken(token)
      .then(jwt => {
        setJWT(jwt)
        // Decode role — managers go to their manage page, members go to submit
        try {
          const b64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
          const payload = JSON.parse(atob(b64)) as { role?: string; deploymentId?: string }
          if (payload.role === 'MANAGER' && payload.deploymentId) {
            navigate(`/manage/${payload.deploymentId}`, { replace: true })
            return
          }
        } catch { /* fall through */ }
        navigate('/submit', { replace: true })
      })
      .catch(() => {
        navigate('/login?error=expired', { replace: true })
      })
  }, [token, setJWT, navigate])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8A8A86',
        fontSize: 14,
      }}
    >
      Verifying…
    </div>
  )
}
