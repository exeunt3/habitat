// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CreekScene.tsx — Beaver Creek ambient visualization
// coralHealth    → water flow / stream vibrancy: 0=sluggish dark, 1=clear rushing
// fishPopulation → beaver activity: 0=no beavers, 1=full colony (4 beavers)
// waterClarity   → atmosphere: 0=grey misty morning, 1=warm golden afternoon
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface CreekSceneProps {
  coralHealth:          number   // water clarity/flow: 0 = murky sluggish, 1 = crystal rushing
  fishPopulation:       number   // beaver colony size: 0 = empty creek, 1 = busy colony
  waterClarity:         number   // atmosphere: 0 = grey morning mist, 1 = warm golden afternoon
  activeSideQuestEvent: string | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SEED        = 44729
const CREEK_HALF  = 2.2   // water extends ±Z from center
const DAM_X       = 0.8   // dam position along X

const C_WATER_MURKY = new THREE.Color('#1a3d50')
const C_WATER_CLEAR = new THREE.Color('#2e8ab8')
const C_SKY_MIST    = new THREE.Color('#1a1e22')
const C_SKY_GOLDEN  = new THREE.Color('#2a1e0a')
const C_SUN_MIST    = new THREE.Color('#6080a0')
const C_SUN_GOLDEN  = new THREE.Color('#ffa050')

// ── Helpers ───────────────────────────────────────────────────────────────────

function mkRng(seed: number) {
  let s = seed >>> 0
  return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff }
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clamp01(v: number)                     { return Math.max(0, Math.min(1, v)) }

// ── Ground & creek bed ────────────────────────────────────────────────────────

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 18]} />
        <meshLambertMaterial color="#2a1a0a" />
      </mesh>
      {/* Creek bed overlay — darker earthy tone */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, CREEK_HALF * 2]} />
        <meshLambertMaterial color="#181008" />
      </mesh>
    </>
  )
}

// ── Animated water surface ────────────────────────────────────────────────────

function CreekWater({ coralHealth }: { coralHealth: number }) {
  const matRef     = useRef<THREE.MeshStandardMaterial>(null)
  const smoothFlow = useRef(coralHealth)

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(30, CREEK_HALF * 2, 60, 12)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])

  const posAttr = useMemo(() => geo.attributes.position as THREE.BufferAttribute, [geo])
  const baseY   = useMemo(() => {
    const arr = new Float32Array(posAttr.count)
    for (let i = 0; i < posAttr.count; i++) arr[i] = posAttr.getY(i)
    return arr
  }, [posAttr])

  useFrame((state) => {
    smoothFlow.current = lerp(smoothFlow.current, coralHealth, 0.02)
    const flow     = clamp01(smoothFlow.current)
    const t        = state.clock.elapsedTime
    const speed    = 0.6 + flow * 1.6
    const amp      = 0.02 + flow * 0.05

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i)
      const z = posAttr.getZ(i)
      posAttr.setY(i, baseY[i] + Math.sin(x * 0.5 + t * speed) * amp
                                + Math.sin(z * 1.2 + t * speed * 0.7) * amp * 0.5)
    }
    posAttr.needsUpdate = true
    geo.computeVertexNormals()

    if (matRef.current) {
      matRef.current.color.copy(C_WATER_MURKY).lerp(C_WATER_CLEAR, flow)
      matRef.current.opacity = lerp(0.62, 0.82, flow)
    }
  })

  return (
    <mesh geometry={geo} position={[0, 0.12, 0]} receiveShadow>
      <meshStandardMaterial
        ref={matRef}
        color={C_WATER_MURKY}
        transparent
        opacity={0.7}
        roughness={0.06}
        metalness={0.12}
      />
    </mesh>
  )
}

// ── Water glints (surface highlights) ────────────────────────────────────────

function WaterGlints({ coralHealth }: { coralHealth: number }) {
  const COUNT   = 22
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const glintData = useMemo(() => {
    const rng = mkRng(SEED + 11)
    return Array.from({ length: COUNT }, () => ({
      x:     (rng() - 0.5) * 26,
      z:     (rng() - 0.5) * (CREEK_HALF * 2 - 0.5),
      phase: rng() * Math.PI * 2,
      speed: 0.8 + rng() * 1.4,
    }))
  }, [])

  const geo = useMemo(() => new THREE.PlaneGeometry(0.24, 0.08), [])
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55 }), [])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t    = state.clock.elapsedTime
    const flow = clamp01(coralHealth)
    const _m   = new THREE.Matrix4()
    const _r   = new THREE.Matrix4().makeRotationX(-Math.PI / 2)

    for (let i = 0; i < COUNT; i++) {
      const d     = glintData[i]
      const alpha = (Math.sin(t * d.speed + d.phase) + 1) * 0.5
      const show  = alpha > 0.3 && flow > 0.08
      _m.makeTranslation(d.x, 0.16 + Math.sin(t * 0.5 + d.phase) * 0.03, d.z)
      _m.multiply(_r)
      mesh.setMatrixAt(i, _m)
      const v = show ? lerp(0.5, 1.0, alpha * flow) : 0
      mesh.setColorAt(i, new THREE.Color(v, v * 1.05, v * 1.1))
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geo, mat, COUNT]} />
}

// ── River stones ──────────────────────────────────────────────────────────────

function RiverStones() {
  const COUNT   = 90
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const geo     = useMemo(() => new THREE.SphereGeometry(1, 5, 3), [])
  const mat     = useMemo(() => new THREE.MeshLambertMaterial({ color: '#2e2416' }), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const rng = mkRng(SEED + 7)
    const _m  = new THREE.Matrix4()
    const _s  = new THREE.Matrix4()
    const _r  = new THREE.Matrix4()
    const _t  = new THREE.Matrix4()

    for (let i = 0; i < COUNT; i++) {
      const inCreek = rng() < 0.55
      const x  = (rng() - 0.5) * 28
      const z  = inCreek
        ? (rng() - 0.5) * (CREEK_HALF * 2 - 0.3)
        : (rng() < 0.5 ? 1 : -1) * (CREEK_HALF + rng() * 3.5)
      const sx = 0.06 + rng() * 0.12
      const sy = 0.04 + rng() * 0.06
      const sz = 0.06 + rng() * 0.10
      const ry = rng() * Math.PI

      _t.makeTranslation(x, inCreek ? 0.07 : 0.02, z)
      _r.makeRotationY(ry)
      _s.makeScale(sx, sy, sz)
      _m.identity().multiply(_t).multiply(_r).multiply(_s)
      mesh.setMatrixAt(i, _m)

      const g = 0.10 + rng() * 0.12
      mesh.setColorAt(i, new THREE.Color(g * 0.85, g * 0.78, g * 0.68))
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [])

  return <instancedMesh ref={meshRef} args={[geo, mat, COUNT]} castShadow receiveShadow />
}

// ── Beaver dam ────────────────────────────────────────────────────────────────

function BeaverDam({ fishPopulation }: { fishPopulation: number }) {
  const logs = useMemo(() => {
    const rng = mkRng(SEED + 3)
    return Array.from({ length: 14 }, (_, i) => {
      const row = Math.floor(i / 3)
      const col = i % 3
      return {
        x:   DAM_X + (col - 1) * 0.18 + (rng() - 0.5) * 0.08,
        y:   0.09 + row * 0.16 + (rng() - 0.5) * 0.04,
        ry:  (rng() - 0.5) * 0.18,
        rz:  (rng() - 0.5) * 0.12,
        len: 5.2 + (rng() - 0.5) * 0.6,
        r:   0.07 + rng() * 0.035,
        ci:  Math.floor(rng() * 3),
      }
    })
  }, [])

  const logColors = ['#3d2510', '#4a2e14', '#362108']
  const visible   = Math.round(lerp(4, 14, clamp01(fishPopulation)))

  return (
    <group>
      {logs.slice(0, visible).map((log, i) => (
        <mesh key={i} position={[log.x, log.y, 0]} rotation={[Math.PI / 2, log.ry, log.rz]} castShadow receiveShadow>
          <cylinderGeometry args={[log.r, log.r * 0.9, log.len, 6]} />
          <meshLambertMaterial color={logColors[log.ci]} />
        </mesh>
      ))}
      {visible > 6 && [-1.4, -0.5, 0.4, 1.3, 2.1].map((zOff, i) => (
        <mesh key={`stick-${i}`}
          position={[DAM_X + (i % 2 === 0 ? -0.05 : 0.13), 0.62 + (i % 3) * 0.14, zOff]}
          rotation={[Math.PI / 2 + (i % 2 === 0 ? 0.2 : -0.15), 0, (i % 2 === 0 ? 0.1 : -0.1)]}
          castShadow
        >
          <cylinderGeometry args={[0.022, 0.014, 0.5 + (i % 2) * 0.2, 4]} />
          <meshLambertMaterial color="#2e1a08" />
        </mesh>
      ))}
    </group>
  )
}

// ── Beaver ────────────────────────────────────────────────────────────────────

interface BeaverDef {
  x: number; y: number; z: number
  ry: number; phase: number; active: boolean
}

function Beaver({ def, fishPopulation }: { def: BeaverDef; fishPopulation: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const headRef  = useRef<THREE.Mesh>(null)
  const tailRef  = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t      = state.clock.elapsedTime + def.phase
    const active = def.active && fishPopulation > 0.25
    groupRef.current.position.y = def.y + Math.sin(t * (active ? 2.8 : 1.4)) * (active ? 0.04 : 0.02)
    if (headRef.current) headRef.current.rotation.z  = active ? Math.sin(t * 3.2) * 0.18 : 0
    if (tailRef.current) tailRef.current.rotation.x  = Math.sin(t * 2.1 + 1) * 0.14
  })

  return (
    <group ref={groupRef} position={[def.x, def.y, def.z]} rotation={[0, def.ry, 0]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.2, 0.38, 4, 8]} />
        <meshLambertMaterial color="#3a2210" />
      </mesh>
      <mesh ref={headRef} position={[0, 0.08, 0.3]} castShadow>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshLambertMaterial color="#3d2412" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.07, 0.14, 0.43]}>
        <sphereGeometry args={[0.025, 4, 3]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[0.07, 0.14, 0.43]}>
        <sphereGeometry args={[0.025, 4, 3]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.1, 0.22, 0.26]}>
        <sphereGeometry args={[0.04, 4, 3]} />
        <meshLambertMaterial color="#3a2210" />
      </mesh>
      <mesh position={[0.1, 0.22, 0.26]}>
        <sphereGeometry args={[0.04, 4, 3]} />
        <meshLambertMaterial color="#3a2210" />
      </mesh>
      {/* Flat tail */}
      <mesh ref={tailRef} position={[0, -0.06, -0.38]} rotation={[0.3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.05, 8]} />
        <meshLambertMaterial color="#2a180a" />
      </mesh>
    </group>
  )
}

function BeaverColony({ fishPopulation }: { fishPopulation: number }) {
  const defs = useMemo<BeaverDef[]>(() => {
    const rng = mkRng(SEED + 5)
    const base: BeaverDef[] = [
      { x: DAM_X - 0.3, y: 0.22, z: 0.8,              ry: Math.PI * 0.9,  phase: 0.0, active: true  },
      { x: -2.5,        y: 0.22, z: CREEK_HALF + 0.3,  ry: -Math.PI * 0.3, phase: 1.2, active: true  },
      { x: 1.8,         y: 0.1,  z: -0.5,              ry: Math.PI * 1.4,  phase: 2.1, active: true  },
      { x: -1.2,        y: 0.22, z: -(CREEK_HALF + 0.5), ry: Math.PI * 0.4, phase: 3.0, active: false },
    ]
    return base.map(d => ({
      ...d,
      x: d.x + (rng() - 0.5) * 0.4,
      z: d.z + (rng() - 0.5) * 0.3,
    }))
  }, [])

  const count = Math.ceil(clamp01(fishPopulation) * 4)

  return (
    <>
      {defs.slice(0, count).map((def, i) => (
        <Beaver key={i} def={def} fishPopulation={fishPopulation} />
      ))}
    </>
  )
}

// ── Bank trees ────────────────────────────────────────────────────────────────

function BankTrees({ waterClarity }: { waterClarity: number }) {
  const treeData = useMemo(() => {
    const rng = mkRng(SEED + 9)
    const positions: Array<[number, number]> = [
      [-5.5, CREEK_HALF + 1.5], [-2.2, CREEK_HALF + 2.3], [1.8, CREEK_HALF + 1.8],
      [4.8, CREEK_HALF + 1.2],  [7.2, CREEK_HALF + 2.6],  [-8.0, CREEK_HALF + 1.6],
      [-4.2, -(CREEK_HALF + 1.6)], [0.5, -(CREEK_HALF + 2.1)], [3.8, -(CREEK_HALF + 1.4)],
      [6.4, -(CREEK_HALF + 2.3)],  [-7.0, -(CREEK_HALF + 1.8)], [2.2, -(CREEK_HALF + 1.1)],
    ]
    return positions.map(([x, z]) => ({
      x, z,
      trunkH:  1.0 + rng() * 0.9,
      canopyR: 0.55 + rng() * 0.45,
      offX:    (rng() - 0.5) * 0.3,
      offZ:    (rng() - 0.5) * 0.3,
    }))
  }, [])

  // Interpolate leaf color based on atmosphere
  const leafHex = useMemo(() => {
    const mist = new THREE.Color('#1a3a0e')
    const warm = new THREE.Color('#2a5a18')
    return '#' + mist.clone().lerp(warm, clamp01(waterClarity)).getHexString()
  }, [waterClarity])

  return (
    <>
      {treeData.map((tree, i) => (
        <group key={i} position={[tree.x, 0, tree.z]}>
          <mesh position={[0, tree.trunkH / 2, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.11, tree.trunkH, 6]} />
            <meshLambertMaterial color="#2a1508" />
          </mesh>
          <mesh position={[0, tree.trunkH + tree.canopyR * 0.6, 0]} castShadow>
            <sphereGeometry args={[tree.canopyR, 7, 5]} />
            <meshLambertMaterial color={leafHex} />
          </mesh>
          <mesh position={[tree.offX, tree.trunkH + tree.canopyR * 0.4, tree.offZ]} castShadow>
            <sphereGeometry args={[tree.canopyR * 0.72, 6, 5]} />
            <meshLambertMaterial color={leafHex} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── Kingfisher (side-quest event) ─────────────────────────────────────────────

function Kingfisher({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.position.y = 1.65 + Math.sin(t * 2.5) * 0.055
    groupRef.current.rotation.z = Math.sin(t * 1.8) * 0.08
  })

  if (!active) return null

  return (
    <group ref={groupRef} position={[DAM_X + 0.25, 1.65, -0.25]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.06, 0.14, 4, 6]} />
        <meshLambertMaterial color="#1060d0" />
      </mesh>
      <mesh position={[0, 0.06, 0.1]} castShadow>
        <sphereGeometry args={[0.055, 6, 5]} />
        <meshLambertMaterial color="#0850b8" />
      </mesh>
      <mesh position={[0, -0.03, 0.06]}>
        <sphereGeometry args={[0.05, 5, 4]} />
        <meshLambertMaterial color="#e06018" />
      </mesh>
      <mesh position={[0, 0.06, 0.18]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.018, 0.1, 4]} />
        <meshLambertMaterial color="#111" />
      </mesh>
    </group>
  )
}

// ── Lighting ──────────────────────────────────────────────────────────────────

function CreekLighting({ waterClarity }: { waterClarity: number }) {
  const sunRef  = useRef<THREE.DirectionalLight>(null)
  const fillRef = useRef<THREE.DirectionalLight>(null)
  const ambRef  = useRef<THREE.AmbientLight>(null)

  useFrame(() => {
    const t = clamp01(waterClarity)
    if (sunRef.current) {
      sunRef.current.color.copy(C_SUN_MIST).lerp(C_SUN_GOLDEN, t)
      sunRef.current.intensity = lerp(0.55, 1.4, t)
    }
    if (fillRef.current) {
      fillRef.current.intensity = lerp(0.28, 0.14, t)
    }
    if (ambRef.current) {
      ambRef.current.color.copy(C_SKY_MIST).lerp(C_SKY_GOLDEN, t)
      ambRef.current.intensity = lerp(0.9, 0.55, t)
    }
  })

  return (
    <>
      <ambientLight ref={ambRef} color={C_SKY_MIST} intensity={0.9} />
      <directionalLight
        ref={sunRef}
        color={C_SUN_MIST}
        intensity={0.6}
        position={[6, 8, 4]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight ref={fillRef} color="#304060" intensity={0.28} position={[-5, 3, -3]} />
      <pointLight color="#2060a0" intensity={0.22} position={[0, 0.3, 0]} distance={12} />
    </>
  )
}

// ── Atmospheric fog plane ─────────────────────────────────────────────────────

function MistPlane({ waterClarity }: { waterClarity: number }) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(() => {
    if (matRef.current) matRef.current.opacity = lerp(0.42, 0.0, clamp01(waterClarity))
  })
  return (
    <mesh position={[0, 4, -10]}>
      <planeGeometry args={[60, 20]} />
      <meshBasicMaterial ref={matRef} color="#1a1e22" transparent opacity={0.4} depthWrite={false} />
    </mesh>
  )
}

// ── Post-processing ───────────────────────────────────────────────────────────

function CreekEffects() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={0.35} height={300} />
      <Vignette eskil={false} offset={0.30} darkness={0.60} />
    </EffectComposer>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function CreekScene({
  coralHealth,
  fishPopulation,
  waterClarity,
  activeSideQuestEvent,
}: CreekSceneProps) {
  return (
    <>
      <CreekLighting waterClarity={waterClarity} />
      <MistPlane waterClarity={waterClarity} />
      <Ground />
      <CreekWater coralHealth={coralHealth} />
      <WaterGlints coralHealth={coralHealth} />
      <RiverStones />
      <BeaverDam fishPopulation={fishPopulation} />
      <BeaverColony fishPopulation={fishPopulation} />
      <BankTrees waterClarity={waterClarity} />
      <Kingfisher active={activeSideQuestEvent === 'kingfisher'} />
      <CreekEffects />
    </>
  )
}
