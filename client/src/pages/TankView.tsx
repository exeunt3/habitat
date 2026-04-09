import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useParams } from 'react-router-dom'
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing'
import { EcosystemStateProvider, useEcosystemState } from '../context/EcosystemState'
import ReefScene from '../scene/ReefScene'
import TreeScene from '../scene/TreeScene'

// Reef post-processing (TreeScene includes its own EffectComposer)
function ReefEffects() {
  return (
    <EffectComposer>
      <DepthOfField focusDistance={0.0} focalLength={0.05} bokehScale={1.8} height={480} />
      <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.85} intensity={0.45} height={300} />
      <Vignette eskil={false} offset={0.28} darkness={0.55} />
    </EffectComposer>
  )
}

function TankViewInner() {
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
      camera={{ position: [0, 2, 6], fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false }}
      shadows
    >
      {theme === 'tree' ? (
        <TreeScene {...props} />
      ) : (
        <>
          <ReefScene {...props} />
          <ReefEffects />
        </>
      )}
    </Canvas>
  )
}

export default function TankView() {
  const { deploymentId } = useParams<{ deploymentId: string }>()
  const [cursorVisible, setCursorVisible] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>()

  function handleMouseMove() {
    setCursorVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setCursorVisible(false), 3000)
  }

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  // Prevent screen sleep via Wake Lock API
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let sentinel: WakeLockSentinel | null = null

    async function acquire() {
      try { sentinel = await navigator.wakeLock.request('screen') } catch { /* unavailable */ }
    }
    function onVisible() { if (document.visibilityState === 'visible') acquire() }

    acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      sentinel?.release()
    }
  }, [])

  return (
    <EcosystemStateProvider deploymentId={deploymentId!}>
      <div
        onMouseMove={handleMouseMove}
        style={{
          width: '100vw', height: '100vh',
          overflow: 'hidden',
          cursor: cursorVisible ? 'default' : 'none',
          background: '#0d1f2d',
        }}
      >
        <TankViewInner />
      </div>
    </EcosystemStateProvider>
  )
}
