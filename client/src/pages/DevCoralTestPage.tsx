import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import ReefScene from '../scene/ReefScene'

export default function DevCoralTestPage() {
  const [coralHealth, setCoralHealth] = useState(0.7)
  const [fishPopulation, setFishPopulation] = useState(0.7)
  const [waterClarity, setWaterClarity] = useState(0.7)

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 2, 6], fov: 60, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
        shadows
      >
        <ReefScene
          coralHealth={coralHealth}
          fishPopulation={fishPopulation}
          waterClarity={waterClarity}
          activeSideQuestEvent={null}
        />
      </Canvas>

      {/* Dev overlay */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: '16px 20px',
          borderRadius: 8,
          fontFamily: 'monospace',
          fontSize: 13,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minWidth: 220,
          backdropFilter: 'blur(4px)',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4, letterSpacing: '0.05em', fontSize: 11, textTransform: 'uppercase', opacity: 0.6 }}>
          Dev — Coral Test
        </div>
        <SliderRow
          label="Coral Health"
          value={coralHealth}
          onChange={setCoralHealth}
        />
        <SliderRow
          label="Fish Population"
          value={fishPopulation}
          onChange={setFishPopulation}
        />
        <SliderRow
          label="Water Clarity"
          value={waterClarity}
          onChange={setWaterClarity}
        />
      </div>
    </div>
  )
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.85 }}>
        <span>{label}</span>
        <span style={{ opacity: 0.6 }}>{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#4fc3f7' }}
      />
    </div>
  )
}
