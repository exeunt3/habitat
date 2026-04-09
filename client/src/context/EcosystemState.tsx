import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { fetchEcosystemState, SideQuestInfo, SideQuestEventInfo, ParameterState } from '../api/client'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SceneValues {
  coralHealth: number     // 0–1
  fishPopulation: number  // 0–1
  waterClarity: number    // 0–1
}

export interface EcosystemContextValue {
  /** Smoothly client-interpolated values for the 3D scene (lerp over 30s). */
  scene: SceneValues
  /** Raw parameter states from the latest API response, for dashboard display. */
  parameters: ParameterState[]
  activeSideQuests: SideQuestInfo[]
  lastSubmissionAt: string | null
  /** Visual event triggered by a completed side quest. Contains type + triggeredAt for dedup. */
  activeSideQuestEvent: SideQuestEventInfo | null
  /** Visualization theme: "reef" | "tree" */
  theme: string
  loading: boolean
}

// ── Interpolation constants ────────────────────────────────────────────────────

const POLL_MS   = 60_000   // poll API every 60 seconds
const LERP_MS   = 30_000   // drift to new values over 30 seconds
const UPDATE_MS = 120      // React state update interval during drift (~8 fps)

// ── Helpers ────────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

const DEFAULT_SCENE: SceneValues = { coralHealth: 0.5, fishPopulation: 0.5, waterClarity: 0.5 }

// ── Context ────────────────────────────────────────────────────────────────────

const EcosystemCtx = createContext<EcosystemContextValue>({
  scene: DEFAULT_SCENE,
  parameters: [],
  activeSideQuests: [],
  lastSubmissionAt: null,
  activeSideQuestEvent: null,
  theme: 'reef',
  loading: true,
})

export function useEcosystemState(): EcosystemContextValue {
  return useContext(EcosystemCtx)
}

// ── Provider ───────────────────────────────────────────────────────────────────

interface LerpState {
  from:    SceneValues
  to:      SceneValues
  startMs: number
}

export function EcosystemStateProvider({
  deploymentId,
  children,
}: {
  deploymentId: string
  children: React.ReactNode
}) {
  const [loading,              setLoading]              = useState(true)
  const [scene,                setScene]                = useState<SceneValues>(DEFAULT_SCENE)
  const [parameters,           setParameters]           = useState<ParameterState[]>([])
  const [activeSideQuests,     setActiveSideQuests]     = useState<SideQuestInfo[]>([])
  const [lastSubmissionAt,     setLastSubmissionAt]     = useState<string | null>(null)
  const [activeSideQuestEvent, setActiveSideQuestEvent] = useState<SideQuestEventInfo | null>(null)
  const [theme,                setTheme]                = useState('reef')

  const lerpRef      = useRef<LerpState | null>(null)
  const currentScene = useRef<SceneValues>(DEFAULT_SCENE)
  // Track last seen event triggeredAt so we don't reset an in-progress animation
  const lastEventAt  = useRef<string | null>(null)

  // ── Poll API ──────────────────────────────────────────────────────────────
  const poll = useCallback(async () => {
    try {
      const state = await fetchEcosystemState(deploymentId)

      const to: SceneValues = {
        coralHealth:    state.parameters['0']?.value ?? 0.5,
        fishPopulation: state.parameters['1']?.value ?? 0.5,
        waterClarity:   state.parameters['2']?.value ?? 0.5,
      }

      lerpRef.current = { from: { ...currentScene.current }, to, startMs: Date.now() }

      setParameters([0, 1, 2].map(i => state.parameters[String(i)] ?? {
        name:          `Question ${i + 1}`,
        value:         0.5,
        trend:         'stable' as const,
        responseCount: 0,
      }))
      setActiveSideQuests(state.activeSideQuests ?? [])
      setLastSubmissionAt(state.lastSubmissionAt ?? null)
      setTheme(state.theme ?? 'reef')

      // Only update activeSideQuestEvent when a genuinely new event arrives
      const incoming = state.activeSideQuestEvent ?? null
      if (incoming && incoming.triggeredAt !== lastEventAt.current) {
        lastEventAt.current = incoming.triggeredAt
        setActiveSideQuestEvent(incoming)
      } else if (!incoming) {
        // Event window expired — only clear if we haven't seen one recently
        // (leave the current event playing if it's still within 48h locally)
      }

      setLoading(false)
    } catch {
      setLoading(false)
    }
  }, [deploymentId])

  useEffect(() => {
    poll()
    const id = setInterval(poll, POLL_MS)
    return () => clearInterval(id)
  }, [poll])

  // ── Drive interpolation at ~8 fps ─────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const ls = lerpRef.current
      if (!ls) return

      const t  = Math.min(1, (Date.now() - ls.startMs) / LERP_MS)
      const et = smoothstep(t)

      const next: SceneValues = {
        coralHealth:    lerp(ls.from.coralHealth,    ls.to.coralHealth,    et),
        fishPopulation: lerp(ls.from.fishPopulation, ls.to.fishPopulation, et),
        waterClarity:   lerp(ls.from.waterClarity,   ls.to.waterClarity,   et),
      }

      currentScene.current = next
      setScene({ ...next })

      if (t >= 1) lerpRef.current = null
    }, UPDATE_MS)

    return () => clearInterval(id)
  }, [])

  return (
    <EcosystemCtx.Provider
      value={{ scene, parameters, activeSideQuests, lastSubmissionAt, activeSideQuestEvent, theme, loading }}
    >
      {children}
    </EcosystemCtx.Provider>
  )
}
