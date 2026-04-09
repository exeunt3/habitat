import { Canvas } from '@react-three/fiber'
import { useParams } from 'react-router-dom'
import { EcosystemStateProvider, useEcosystemState, SceneValues } from '../context/EcosystemState'
import { ParameterState, SideQuestInfo } from '../api/client'
import ReefScene from '../scene/ReefScene'
import TreeScene from '../scene/TreeScene'

// ── Helpers ────────────────────────────────────────────────────────────────────

function lerpN(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Map a 0–1 value to a reef-palette hsl color. */
function barColor(v: number): string {
  // 0 → warm amber-brown  0.5 → golden  1 → reef blue
  if (v < 0.5) {
    const t = v * 2
    return `hsl(${lerpN(18, 48, t).toFixed(0)}, 60%, ${lerpN(40, 56, t).toFixed(0)}%)`
  }
  const t = (v - 0.5) * 2
  return `hsl(${lerpN(48, 198, t).toFixed(0)}, ${lerpN(60, 55, t).toFixed(0)}%, ${lerpN(56, 50, t).toFixed(0)}%)`
}

function trendGlyph(trend: 'rising' | 'falling' | 'stable'): { glyph: string; color: string } {
  if (trend === 'rising')  return { glyph: '↑', color: '#6ac4aa' }
  if (trend === 'falling') return { glyph: '↓', color: '#c48a5a' }
  return { glyph: '→', color: '#5a8090' }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  return `${days}d ago`
}

function daysUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const days = Math.ceil(diff / 86_400_000)
  if (days <= 0)   return 'due today'
  if (days === 1)  return '1 day'
  return `${days} days`
}

/** Shorten a question to a readable label. */
function shortLabel(name: string): string {
  if (/meaningful|fulfil/i.test(name)) return 'Fulfillment'
  if (/connected|cohes/i.test(name))   return 'Cohesion'
  if (/confident|direct|heading/i.test(name)) return 'Confidence'
  return name.slice(0, 18)
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ParameterRow({ param }: { param: ParameterState }) {
  const { glyph, color } = trendGlyph(param.trend)
  const fill = barColor(param.value)

  return (
    <div style={S.paramRow}>
      <span style={S.paramLabel}>{shortLabel(param.name)}</span>
      <div style={S.trackWrap}>
        <div
          style={{
            ...S.trackBg,
          }}
        >
          <div
            style={{
              ...S.trackFill,
              width: `${(param.value * 100).toFixed(1)}%`,
              background: fill,
              transition: 'width 0.8s ease, background 0.8s ease',
            }}
          />
        </div>
      </div>
      <span style={{ ...S.trendGlyph, color }}>{glyph}</span>
    </div>
  )
}

function SideQuestRow({ sq }: { sq: SideQuestInfo }) {
  return (
    <div style={S.sqRow}>
      <span style={S.sqDot}>·</span>
      <span style={S.sqTitle}>{sq.title}</span>
      <span style={S.sqDeadline}>{daysUntil(sq.deadline)}</span>
    </div>
  )
}

function DataPanel({
  scene,
  parameters,
  activeSideQuests,
  lastSubmissionAt,
}: {
  scene: SceneValues
  parameters: ParameterState[]
  activeSideQuests: SideQuestInfo[]
  lastSubmissionAt: string | null
}) {
  void scene  // scene values drive the 3D canvas; panel shows raw params

  return (
    <div style={S.panel}>
      {/* Parameter bars */}
      <div style={S.paramList}>
        {parameters.map((p, i) => (
          <ParameterRow key={i} param={p} />
        ))}
      </div>

      {/* Side quests */}
      {activeSideQuests.length > 0 && (
        <div style={S.sqSection}>
          {activeSideQuests.map(sq => (
            <SideQuestRow key={sq.id} sq={sq} />
          ))}
        </div>
      )}

      {/* Last fed */}
      <div style={S.footer}>
        <span style={S.lastFed}>
          {lastSubmissionAt
            ? `last fed ${timeAgo(lastSubmissionAt)}`
            : 'not yet fed this cycle'}
        </span>
      </div>
    </div>
  )
}

// ── Inner page (has context access) ───────────────────────────────────────────

function DashboardInner() {
  const { scene, parameters, activeSideQuests, lastSubmissionAt, activeSideQuestEvent, theme } = useEcosystemState()

  const sceneProps = {
    coralHealth:          scene.coralHealth,
    fishPopulation:       scene.fishPopulation,
    waterClarity:         scene.waterClarity,
    activeSideQuestEvent: activeSideQuestEvent?.type ?? null,
  }

  return (
    <div style={S.root}>
      {/* 3D scene — top 60% */}
      <div style={S.canvasWrap}>
        <Canvas
          style={{ width: '100%', height: '100%' }}
          camera={{ position: [0, 2, 6], fov: 60, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false }}
          shadows
        >
          {theme === 'tree' ? <TreeScene {...sceneProps} /> : <ReefScene {...sceneProps} />}
        </Canvas>
      </div>

      {/* Data panel — bottom 40% */}
      <DataPanel
        scene={scene}
        parameters={parameters}
        activeSideQuests={activeSideQuests}
        lastSubmissionAt={lastSubmissionAt}
      />
    </div>
  )
}

// ── Page export ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { deploymentId } = useParams<{ deploymentId: string }>()

  return (
    <EcosystemStateProvider deploymentId={deploymentId!}>
      <DashboardInner />
    </EcosystemStateProvider>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const TEXT    = '#aac8d8'
const MUTED   = '#4a6878'
const BG      = '#0b1c28'
const PANEL   = '#0d2030'

const S = {
  root: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: BG,
    overflow: 'hidden',
    cursor: 'none',
  },
  canvasWrap: {
    height: '60vh',
    flexShrink: 0,
    position: 'relative' as const,
  },
  panel: {
    flex: 1,
    background: PANEL,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '20px 32px 16px',
    gap: 0,
    overflow: 'hidden',
    borderTop: '1px solid #182e3e',
  },

  // Parameter rows
  paramList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    flex: 1,
  },
  paramRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  paramLabel: {
    color: TEXT,
    fontSize: 12,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    width: 88,
    flexShrink: 0,
    fontFamily: '"SF Mono", "Fira Mono", monospace',
  },
  trackWrap: {
    flex: 1,
  },
  trackBg: {
    height: 4,
    background: '#1a3044',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  trendGlyph: {
    fontSize: 14,
    width: 16,
    textAlign: 'center' as const,
    flexShrink: 0,
    lineHeight: 1,
  },

  // Side quests
  sqSection: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    borderTop: `1px solid #182e3e`,
    paddingTop: 10,
  },
  sqRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
  },
  sqDot: {
    color: MUTED,
    fontSize: 18,
    lineHeight: 1,
    flexShrink: 0,
  },
  sqTitle: {
    color: TEXT,
    fontSize: 11,
    letterSpacing: '0.04em',
    flex: 1,
  },
  sqDeadline: {
    color: MUTED,
    fontSize: 10,
    letterSpacing: '0.06em',
    fontFamily: '"SF Mono", "Fira Mono", monospace',
    flexShrink: 0,
  },

  // Footer
  footer: {
    paddingTop: 10,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  lastFed: {
    color: MUTED,
    fontSize: 10,
    letterSpacing: '0.08em',
    fontFamily: '"SF Mono", "Fira Mono", monospace',
  },
}
