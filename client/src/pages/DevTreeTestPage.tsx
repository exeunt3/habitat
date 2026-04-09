import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import TreeScene from '../scene/TreeScene'

export default function DevTreeTestPage() {
  const [health,     setHealth]     = useState(0.7)
  const [population, setPopulation] = useState(0.8)
  const [clarity,    setClarity]    = useState(0.7)
  const [event,      setEvent]      = useState<string | null>(null)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#050810' }}>
      {/* 3D canvas */}
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0.5, 7.5], fov: 55, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
      >
        <TreeScene
          coralHealth={health}
          fishPopulation={population}
          waterClarity={clarity}
          activeSideQuestEvent={event}
        />
      </Canvas>

      {/* Controls overlay */}
      <div style={S.panel}>
        <div style={S.title}>Tree Scene — Dev Controls</div>

        <SliderRow label="Leaf colour (health)" value={health} onChange={setHealth} />
        <SliderRow label="Leaf density (pop)"   value={population} onChange={setPopulation} />
        <SliderRow label="Lighting (clarity)"   value={clarity} onChange={setClarity} />

        <div style={S.row}>
          <span style={S.label}>Side-quest event</span>
          <div style={S.btnGroup}>
            {[null, 'fireflies', 'blossoms', 'birds'].map(e => (
              <button
                key={String(e)}
                style={{ ...S.btn, ...(event === e ? S.btnActive : {}) }}
                onClick={() => setEvent(e)}
              >
                {e ?? 'none'}
              </button>
            ))}
          </div>
        </div>

        <div style={S.presets}>
          {PRESETS.map(p => (
            <button key={p.label} style={S.presetBtn} onClick={() => {
              setHealth(p.h); setPopulation(p.p); setClarity(p.c)
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const PRESETS = [
  { label: 'Full health',  h: 1.0, p: 1.0, c: 1.0 },
  { label: 'Mid state',    h: 0.5, p: 0.55, c: 0.5 },
  { label: 'Bare / dying', h: 0.0, p: 0.05, c: 0.0 },
  { label: 'Golden + thin', h: 0.75, p: 0.35, c: 1.0 },
  { label: 'Green + dim',  h: 0.9, p: 0.9, c: 0.1 },
]

function SliderRow({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={S.row}>
      <span style={S.label}>{label}</span>
      <input
        type="range" min={0} max={1} step={0.01}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: '#8bc08a' }}
      />
      <span style={S.val}>{value.toFixed(2)}</span>
    </div>
  )
}

const S = {
  panel: {
    position: 'absolute' as const,
    top: 20, right: 20,
    background: 'rgba(8, 10, 14, 0.88)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 12,
    padding: '20px 24px',
    width: 340,
    backdropFilter: 'blur(8px)',
    color: '#d0d4dc',
    fontFamily: '"SF Mono", monospace',
    fontSize: 12,
  },
  title: {
    fontSize: 13, fontWeight: 500, letterSpacing: '0.06em',
    textTransform: 'uppercase' as const, color: '#8b9aac',
    marginBottom: 18,
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 14,
  },
  label: { width: 150, flexShrink: 0, color: '#7a8898', fontSize: 11 },
  val: { width: 36, textAlign: 'right' as const, color: '#a0b0c0' },
  btnGroup: { display: 'flex', gap: 6, flexWrap: 'wrap' as const },
  btn: {
    padding: '4px 10px', fontSize: 11, borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)', color: '#9aaabb',
    cursor: 'pointer',
  },
  btnActive: {
    background: 'rgba(120,180,140,0.25)',
    border: '1px solid rgba(120,180,140,0.5)',
    color: '#8bc09a',
  },
  presets: { display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginTop: 8 },
  presetBtn: {
    padding: '5px 10px', fontSize: 11, borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.04)', color: '#8a9aaa',
    cursor: 'pointer',
  },
}
