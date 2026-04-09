import { useState, useEffect, useRef, Component } from 'react'
import { Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing'
import { EcosystemStateProvider, useEcosystemState } from '../context/EcosystemState'
import ReefScene from '../scene/ReefScene'
import TreeScene from '../scene/TreeScene'
import CreekScene from '../scene/CreekScene'

// ── Error boundary ────────────────────────────────────────────────────────────

class SceneErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 12,
          background: '#07090f',
          color: 'rgba(255,100,100,0.9)',
          fontFamily: 'monospace', fontSize: 13, padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 15, marginBottom: 8, color: 'rgba(255,120,120,1)' }}>Scene render error</div>
          <div style={{ opacity: 0.8, maxWidth: 600, wordBreak: 'break-word' }}>{(this.state.error as Error).message}</div>
          <div style={{ opacity: 0.4, fontSize: 11, marginTop: 8 }}>{(this.state.error as Error).stack?.split('\n').slice(1, 4).join(' → ')}</div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Internal scene components (mirrored from TankView) ────────────────────────

function ReefEffects() {
  return (
    <EffectComposer>
      <DepthOfField focusDistance={0.0} focalLength={0.05} bokehScale={1.8} height={480} />
      <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.85} intensity={0.45} height={300} />
      <Vignette eskil={false} offset={0.28} darkness={0.55} />
    </EffectComposer>
  )
}

function DemoSceneInner() {
  const { scene, activeSideQuestEvent, theme } = useEcosystemState()
  const props = {
    coralHealth:          scene.coralHealth,
    fishPopulation:       scene.fishPopulation,
    waterClarity:         scene.waterClarity,
    activeSideQuestEvent: activeSideQuestEvent?.type ?? null,
  }
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: theme === 'creek' ? [0, 3, 8] : [0, 2, 6], fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false }}
      shadows
    >
      {theme === 'tree' ? (
        <TreeScene {...props} />
      ) : theme === 'creek' ? (
        <CreekScene {...props} />
      ) : (
        <>
          <ReefScene {...props} />
          <ReefEffects />
        </>
      )}
    </Canvas>
  )
}

// ── Overlay — appears on load, fades out after 5 seconds ──────────────────────

function DemoOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    // Fade in
    const fadeIn = requestAnimationFrame(() => setOpacity(1))
    // Start fade out at 4s, fully gone by 5s
    const fadeOut = setTimeout(() => setOpacity(0), 4000)
    const done    = setTimeout(onDismiss, 5200)
    return () => {
      cancelAnimationFrame(fadeIn)
      clearTimeout(fadeOut)
      clearTimeout(done)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60, left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        transition: 'opacity 1.2s ease',
        opacity,
      }}
    >
      <div
        style={{
          background: 'rgba(4, 6, 12, 0.72)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 14,
          padding: '16px 28px',
          maxWidth: 500,
          textAlign: 'center',
          color: 'rgba(220, 226, 235, 0.88)',
          fontSize: 14,
          lineHeight: 1.65,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.01em',
        }}
      >
        This is a living visualization of an organization's health, driven by anonymous employee feedback. Watch it respond in real time.
      </div>
    </div>
  )
}

// ── Back link ─────────────────────────────────────────────────────────────────

function BackLink() {
  return (
    <Link
      to="/"
      style={{
        position: 'absolute',
        bottom: 20,
        left: 24,
        color: 'rgba(255,255,255,0.32)',
        fontSize: 12,
        textDecoration: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        letterSpacing: '0.04em',
        transition: 'color 0.25s',
        userSelect: 'none',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.32)')}
    >
      ← Back to Habitat
    </Link>
  )
}

// ── Loading / error states ────────────────────────────────────────────────────

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#07090f',
      color: 'rgba(180,185,195,0.7)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 14,
      flexDirection: 'column',
      gap: 16,
    }}>
      {children}
    </div>
  )
}

function DemoNotAvailable() {
  return (
    <FullScreen>
      <div style={{ fontSize: 15, color: 'rgba(200,205,215,0.8)' }}>Demo not available</div>
      <div style={{ fontSize: 13, color: 'rgba(140,150,165,0.7)' }}>
        Run <code style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>npm run seed:demo</code> on the server to populate demo data.
      </div>
      <Link to="/" style={{ marginTop: 12, fontSize: 13, color: 'rgba(180,190,210,0.6)', textDecoration: 'none' }}>
        ← Back to Habitat
      </Link>
    </FullScreen>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface DemoInfo {
  deploymentId: string
  name: string
  theme: string
}

interface DemoViewProps {
  theme: 'reef' | 'tree' | 'creek'
}

export default function DemoView({ theme }: DemoViewProps) {
  const [demoInfo,      setDemoInfo]      = useState<DemoInfo | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [notFound,      setNotFound]      = useState(false)
  const [showOverlay,   setShowOverlay]   = useState(true)
  const [cursorVisible, setCursorVisible] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    fetch(`/api/demo/${theme}`)
      .then(r => r.ok ? (r.json() as Promise<DemoInfo>) : Promise.reject(new Error('not found')))
      .then(data  => { setDemoInfo(data); setLoading(false) })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [theme])

  function handleMouseMove() {
    setCursorVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setCursorVisible(false), 3000)
  }

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  if (loading) return (
    <FullScreen>
      <div>Loading…</div>
    </FullScreen>
  )

  if (notFound || !demoInfo) return <DemoNotAvailable />

  return (
    <EcosystemStateProvider deploymentId={demoInfo.deploymentId}>
      <div
        onMouseMove={handleMouseMove}
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          cursor: cursorVisible ? 'default' : 'none',
          background: theme === 'reef' ? '#0d1f2d' : theme === 'creek' ? '#0d0a06' : '#050810',
        }}
      >
        <SceneErrorBoundary>
          <DemoSceneInner />
        </SceneErrorBoundary>
        {showOverlay && <DemoOverlay onDismiss={() => setShowOverlay(false)} />}
        <BackLink />
      </div>
    </EcosystemStateProvider>
  )
}

