import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_FISH  = 32
const BOUND_X   = 5.0
const BOUND_Y_MIN = -1.2
const BOUND_Y_MAX = 1.8
const BOUND_Z   = 3.5

const CORAL_OBSTACLES = [
  { cx: -3.0, cz:  0.0, r: 0.9 },
  { cx:  2.5, cz:  0.5, r: 1.0 },
  { cx:  0.5, cz: -2.0, r: 0.8 },
  { cx: -0.5, cz:  1.0, r: 0.6 },
]

// 3 species color variants
const FISH_COLORS = [
  new THREE.Color('#f0c828'),   // angelfish yellow
  new THREE.Color('#8ab2d8'),   // silver schooling
  new THREE.Color('#e05e20'),   // clownfish orange
]

// ─────────────────────────────────────────────────────────────────────────────
// Custom fish body geometry — revolution with elliptical cross-section
// + dorsal fin strip + forked caudal fin
// Total: ~200 vertices
// UV.y = 0 at nose, 1 at tail (drives vertex-shader tail undulation)
// ─────────────────────────────────────────────────────────────────────────────

function buildFishGeo(): THREE.BufferGeometry {
  // [z-position, base-radius] — nose at +Z, tail at −Z
  const PROFILE = [
    [ 0.50, 0.000],
    [ 0.40, 0.036],
    [ 0.26, 0.062],
    [ 0.10, 0.074],
    [-0.04, 0.068],
    [-0.16, 0.058],
    [-0.28, 0.046],
    [-0.38, 0.032],
    [-0.44, 0.018],
    [-0.50, 0.007],
  ] as const
  const NS = PROFILE.length   // 10 stations
  const RAD = 12              // radial segments per ring
  const XSQ = 0.58            // lateral-compression factor

  const pos: number[] = [], norm: number[] = [], uv: number[] = [], idx: number[] = []

  // ── Body rings ─────────────────────────────────────────────────────────────
  for (let i = 0; i < NS; i++) {
    const [z, r] = PROFILE[i]
    const vt = i / (NS - 1)   // 0 = nose, 1 = tail base
    for (let j = 0; j <= RAD; j++) {
      const a = (j / RAD) * Math.PI * 2
      const c = Math.cos(a), s = Math.sin(a)
      pos.push(r * XSQ * c, r * s, z)
      norm.push(c, s, 0)
      uv.push(j / RAD, vt)
    }
  }
  const stride = RAD + 1
  for (let i = 0; i < NS - 1; i++) {
    for (let j = 0; j < RAD; j++) {
      const a = stride * i + j, b = stride * (i + 1) + j
      const c = stride * (i + 1) + j + 1, d = stride * i + j + 1
      idx.push(a, b, d, b, c, d)
    }
  }

  // ── Dorsal fin — quad strip along top (stations 1–6) ──────────────────────
  const DSTATIONS = [1, 2, 3, 4, 5, 6] as const
  const DHEIGHT   = [0.055, 0.090, 0.092, 0.080, 0.062, 0.040]
  const dBase     = pos.length / 3

  for (let k = 0; k < DSTATIONS.length; k++) {
    const [z, r] = PROFILE[DSTATIONS[k]]
    const vt = DSTATIONS[k] / (NS - 1)
    pos.push(0, r,              z); norm.push(0, 1, 0); uv.push(0.5, vt)
    pos.push(0, r + DHEIGHT[k], z); norm.push(0, 1, 0); uv.push(0.5, vt)
  }
  for (let k = 0; k < DSTATIONS.length - 1; k++) {
    const a = dBase + k * 2, b = dBase + k * 2 + 1
    const c = dBase + (k+1) * 2 + 1, d = dBase + (k+1) * 2
    idx.push(a, b, c, a, c, d)  // front face
    idx.push(a, c, b, a, d, c)  // back face (DoubleSide via material)
  }

  // ── Caudal fin — forked V with UV.y near 1.0 ──────────────────────────────
  const tBase = pos.length / 3
  const TAIL = [
    // x,   y,      z,     uvU,  uvV
    [0,  0.000, -0.50,  0.50, 0.90],
    [0,  0.062, -0.60,  0.35, 0.95],
    [0,  0.092, -0.72,  0.25, 1.00],
    [0, -0.062, -0.60,  0.65, 0.95],
    [0, -0.092, -0.72,  0.75, 1.00],
  ] as const
  for (const [x, y, z, u, v] of TAIL) {
    pos.push(x, y, z); norm.push(0, 0, -1); uv.push(u, v)
  }
  // Upper lobe
  idx.push(tBase+0, tBase+1, tBase+2, tBase+0, tBase+2, tBase+1)
  // Lower lobe
  idx.push(tBase+0, tBase+4, tBase+3, tBase+0, tBase+3, tBase+4)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(norm, 3))
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return geo
}

// Shared geometry — built once
const FISH_GEO = buildFishGeo()

// ─────────────────────────────────────────────────────────────────────────────
// Module-level temp objects — zero per-frame allocation
// ─────────────────────────────────────────────────────────────────────────────

const _sep   = new THREE.Vector3()
const _ali   = new THREE.Vector3()
const _coh   = new THREE.Vector3()
const _force = new THREE.Vector3()
const _steer = new THREE.Vector3()
const _diff  = new THREE.Vector3()
const _dummy = new THREE.Object3D()
const _look  = new THREE.Vector3()

const l = THREE.MathUtils.lerp

// ─────────────────────────────────────────────────────────────────────────────
// Seeded RNG
// ─────────────────────────────────────────────────────────────────────────────

function seededRng(seed: number): () => number {
  let s = (seed | 0) >>> 0
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5
    return (s >>> 0) / 0xffffffff
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Boid agent
// ─────────────────────────────────────────────────────────────────────────────

interface FishAgent {
  pos:         THREE.Vector3
  vel:         THREE.Vector3
  colorIdx:    number
  phase:       number
  personality: number
  isBreak:     boolean
  breakTimer:  number
  breakDir:    THREE.Vector3
}

function initAgents(): FishAgent[] {
  const rng = seededRng(777)
  return Array.from({ length: MAX_FISH }, (_, i) => ({
    pos: new THREE.Vector3((rng()-0.5)*4, -0.8+(rng()-0.5)*0.8, (rng()-0.5)*3),
    vel: new THREE.Vector3((rng()-0.5)*0.06, (rng()-0.5)*0.01, (rng()-0.5)*0.06),
    colorIdx:    i % FISH_COLORS.length,
    phase:       rng() * Math.PI * 2,
    personality: 0.7 + rng() * 0.6,
    isBreak:     false,
    breakTimer:  rng() * 20 + 5,
    breakDir:    new THREE.Vector3((rng()-0.5), 0, (rng()-0.5)).normalize(),
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Boids simulation
// ─────────────────────────────────────────────────────────────────────────────

function computeBoids(agents: FishAgent[], count: number, pop: number, dt: number, time: number) {
  const perceptR = l(2.2, 1.0, pop)
  const sepR     = l(1.0, 0.22, pop)
  const wSep     = l(0.90, 0.35, pop)
  const wAli     = l(0.05, 0.70, pop)
  const wCoh     = l(0.05, 0.80, pop)
  const maxSpeed = l(0.10, 0.036, pop)
  const maxForce = maxSpeed * 4.0
  const reefAttr = l(0.0, 0.45, pop)

  for (let i = 0; i < count; i++) {
    const a = agents[i]

    a.breakTimer -= dt
    if (a.breakTimer <= 0) {
      if (a.isBreak) {
        a.isBreak = false
        a.breakTimer = l(8, 28, pop) + Math.random() * l(5, 18, pop)
      } else {
        if (Math.random() < l(0.82, 0.12, pop)) {
          a.isBreak = true
          a.breakDir.set((Math.random()-0.5)*2, (Math.random()-0.5)*0.25, (Math.random()-0.5)*2).normalize()
          a.breakTimer = l(5.0, 1.4, pop)
        } else {
          a.breakTimer = l(8, 28, pop) + Math.random() * l(5, 18, pop)
        }
      }
    }

    _force.set(0, 0, 0)

    if (a.isBreak) {
      _steer.copy(a.breakDir).multiplyScalar(maxSpeed)
      _steer.sub(a.vel).clampLength(0, maxForce * 0.75)
      _force.add(_steer)
    } else {
      _sep.set(0,0,0); _ali.set(0,0,0); _coh.set(0,0,0)
      let nSep = 0, nAli = 0

      for (let j = 0; j < count; j++) {
        if (i === j) continue
        const b = agents[j]
        const d = a.pos.distanceTo(b.pos)
        if (d < sepR && d > 0.001) {
          _diff.copy(a.pos).sub(b.pos).divideScalar(d * d)
          _sep.add(_diff); nSep++
        }
        if (d < perceptR) { _ali.add(b.vel); _coh.add(b.pos); nAli++ }
      }

      if (nSep > 0) {
        _sep.divideScalar(nSep).normalize().multiplyScalar(maxSpeed)
        _sep.sub(a.vel).clampLength(0, maxForce)
        _force.addScaledVector(_sep, wSep)
      }
      if (nAli > 0) {
        _ali.divideScalar(nAli).normalize().multiplyScalar(maxSpeed)
        _ali.sub(a.vel).clampLength(0, maxForce)
        _force.addScaledVector(_ali, wAli)
        _coh.divideScalar(nAli).sub(a.pos).normalize().multiplyScalar(maxSpeed)
        _coh.sub(a.vel).clampLength(0, maxForce)
        _force.addScaledVector(_coh, wCoh)
      }
      if (reefAttr > 0) {
        _steer.set(0, -0.6, 0).sub(a.pos).normalize().multiplyScalar(maxSpeed)
        _steer.sub(a.vel).clampLength(0, maxForce * 0.5)
        _force.addScaledVector(_steer, reefAttr * 0.28)
      }
      const jitter = 0.0035 * a.personality
      _force.x += Math.sin(time * 0.9 + a.phase * 1.1) * jitter
      _force.z += Math.cos(time * 0.7 + a.phase * 0.9) * jitter
    }

    _force.y += (-0.6 - a.pos.y) * 0.9

    const margin = 0.9, bf = maxSpeed * 3.5
    if (a.pos.x < -BOUND_X + margin) _force.x += bf * (1 - (a.pos.x + BOUND_X) / margin)
    if (a.pos.x >  BOUND_X - margin) _force.x -= bf * (1 - (BOUND_X - a.pos.x) / margin)
    if (a.pos.z < -BOUND_Z + margin) _force.z += bf * (1 - (a.pos.z + BOUND_Z) / margin)
    if (a.pos.z >  BOUND_Z - margin) _force.z -= bf * (1 - (BOUND_Z - a.pos.z) / margin)
    if (a.pos.y < BOUND_Y_MIN + margin) _force.y += bf * (1 - (a.pos.y - BOUND_Y_MIN) / margin)
    if (a.pos.y > BOUND_Y_MAX - margin) _force.y -= bf * (1 - (BOUND_Y_MAX - a.pos.y) / margin)

    for (const obs of CORAL_OBSTACLES) {
      const dx = a.pos.x - obs.cx, dz = a.pos.z - obs.cz
      const d2 = dx*dx + dz*dz, avoidR = obs.r + 0.35
      if (d2 < avoidR*avoidR && d2 > 0.0001) {
        const d = Math.sqrt(d2)
        const str = Math.max(0, 1 - (d - obs.r) / 0.35) * maxSpeed * 4.5
        _force.x += (dx/d)*str; _force.z += (dz/d)*str
      }
    }

    a.vel.addScaledVector(_force, dt)
    const sp = a.vel.length(), minSp = maxSpeed * 0.38
    if (sp > maxSpeed)                a.vel.multiplyScalar(maxSpeed / sp)
    else if (sp > 0.0001 && sp < minSp) a.vel.multiplyScalar(minSp / sp)

    a.pos.addScaledVector(a.vel, dt)
    a.pos.x = THREE.MathUtils.clamp(a.pos.x, -BOUND_X, BOUND_X)
    a.pos.y = THREE.MathUtils.clamp(a.pos.y, BOUND_Y_MIN, BOUND_Y_MAX)
    a.pos.z = THREE.MathUtils.clamp(a.pos.z, -BOUND_Z, BOUND_Z)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FishSchool — InstancedMesh with custom geometry + vertex/fragment shaders
// ─────────────────────────────────────────────────────────────────────────────

interface FishSchoolProps { populationRef: React.MutableRefObject<number> }

function FishSchool({ populationRef }: FishSchoolProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const agents  = useMemo(() => initAgents(), [])
  const tRef    = useRef(0)
  const prevCnt = useRef(0)
  const colInit = useRef(false)

  // Uniforms shared with the shader (updated each frame via ref)
  const uTime     = useRef({ value: 0 })
  const uSwayAmp  = useRef({ value: 0.038 })
  const uSwayFreq = useRef({ value: 2.8 })

  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness:    0.40,
      metalness:    0.30,
      clearcoat:    0.25,
      clearcoatRoughness: 0.55,
      side: THREE.DoubleSide,
    })

    const uT = uTime.current
    const uA = uSwayAmp.current
    const uF = uSwayFreq.current

    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime     = uT
      shader.uniforms.uSwayAmp  = uA
      shader.uniforms.uSwayFreq = uF

      // Declare uniforms at top of vertex shader
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uSwayAmp;
        uniform float uSwayFreq;`,
      )

      // Tail-wave displacement: UV.y = 0 (nose) → 1 (tail)
      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        `// Tail undulation — amplitude grows toward tail (uv.y → 1)
        float tailFactor = uv.y * uv.y;
        #ifdef USE_INSTANCING
          float wavePhase = instanceMatrix[3].x * 2.5 + instanceMatrix[3].z * 1.7;
        #else
          float wavePhase = position.x * 2.5 + position.z * 1.7;
        #endif
        transformed.x += sin(uTime * uSwayFreq + wavePhase) * uSwayAmp * tailFactor;

        #include <project_vertex>`,
      )

      // Countershading: dorsal (normal.y > 0 in view space) is darker
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float csFactor = clamp(normal.y * 0.5 + 0.5, 0.0, 1.0);
        diffuseColor.rgb *= mix(1.28, 0.60, csFactor);`,
      )
    }
    return m
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    const dt  = Math.min(delta, 0.05)
    tRef.current += dt
    const t   = tRef.current
    const pop = populationRef.current

    const activeCnt = Math.max(2, Math.round(l(2, 28, pop)))

    // Set per-instance colors once
    if (!colInit.current && mesh.instanceColor) {
      for (let i = 0; i < MAX_FISH; i++) {
        mesh.setColorAt(i, FISH_COLORS[agents[i].colorIdx])
      }
      mesh.instanceColor!.needsUpdate = true
      colInit.current = true
    }

    // Spawn newly-active fish near reef centre
    if (activeCnt > prevCnt.current) {
      for (let i = prevCnt.current; i < activeCnt; i++) {
        agents[i].pos.set((Math.random()-0.5)*2, -0.4+Math.random()*0.4, (Math.random()-0.5)*2)
        agents[i].vel.set((Math.random()-0.5)*0.04, 0, (Math.random()-0.5)*0.04)
      }
    }
    prevCnt.current = activeCnt

    computeBoids(agents, activeCnt, pop, dt, t)

    // Update sway uniforms
    uTime.current.value    = t
    uSwayAmp.current.value = l(0.065, 0.030, pop)
    uSwayFreq.current.value = l(5.0, 2.0, pop)

    for (let i = 0; i < activeCnt; i++) {
      const a = agents[i]
      _dummy.position.copy(a.pos)
      _look.copy(a.pos).addScaledVector(a.vel, 0.5)
      _dummy.lookAt(_look)
      _dummy.scale.set(0.80, 0.80, 0.80)
      _dummy.updateMatrix()
      mesh.setMatrixAt(i, _dummy.matrix)
    }

    mesh.count = activeCnt
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[FISH_GEO, material, MAX_FISH]}
      castShadow
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HeroFish — Napoleon Wrasse, upgraded geometry
// ─────────────────────────────────────────────────────────────────────────────

function HeroFish({ populationRef }: { populationRef: React.MutableRefObject<number> }) {
  const groupRef   = useRef<THREE.Group>(null)
  const tailRef    = useRef<THREE.Mesh>(null)
  const bodyMatRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const tRef       = useRef(0)

  // Napoleon wrasse body — wider/flatter than school fish, so we build a
  // simple merged set: large body mesh + characteristic forehead hump
  const bodyGeo = useMemo(() => {
    // Slightly wider profile than school fish
    const PROFILE = [
      [ 0.55, 0.000],[0.44,0.042],[0.28,0.075],[0.10,0.092],
      [-0.06,0.088],[-0.20,0.076],[-0.32,0.058],[-0.42,0.038],[-0.52,0.012],
    ] as const
    const NS = PROFILE.length, RAD = 10, XSQ = 0.62
    const pos: number[] = [], norm: number[] = [], uv: number[] = [], idx: number[] = []
    for (let i = 0; i < NS; i++) {
      const [z, r] = PROFILE[i]
      const vt = i / (NS - 1)
      for (let j = 0; j <= RAD; j++) {
        const a = (j/RAD)*Math.PI*2, c = Math.cos(a), s = Math.sin(a)
        pos.push(r*XSQ*c, r*s, z); norm.push(c,s,0); uv.push(j/RAD, vt)
      }
    }
    const stride = RAD+1
    for (let i = 0; i < NS-1; i++) {
      for (let j = 0; j < RAD; j++) {
        const a=stride*i+j, b=stride*(i+1)+j, c=stride*(i+1)+j+1, d=stride*i+j+1
        idx.push(a,b,d,b,c,d)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('normal',   new THREE.Float32BufferAttribute(norm, 3))
    g.setAttribute('uv',       new THREE.Float32BufferAttribute(uv, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    tRef.current += delta
    const t = tRef.current, pop = populationRef.current

    const vis = THREE.MathUtils.smoothstep(pop, 0.32, 0.55)
    group.visible = vis > 0.01
    if (!group.visible) return

    const angle = t * 0.11 + 2.2
    const rx = 2.3, rz = 1.6
    group.position.set(Math.cos(angle)*rx, -0.32+Math.sin(t*0.09)*0.20, Math.sin(angle)*rz)
    _look.set(Math.cos(angle+0.06)*rx, group.position.y, Math.sin(angle+0.06)*rz)
    group.lookAt(_look)
    group.scale.setScalar(l(0.01, 1.0, vis))

    if (tailRef.current) tailRef.current.rotation.y = Math.sin(t * 1.55) * 0.28
    if (bodyMatRef.current) bodyMatRef.current.opacity = vis
  })

  return (
    <group ref={groupRef}>
      <mesh geometry={bodyGeo} scale={[1.0, 1.0, 1.0]}>
        <meshPhysicalMaterial
          ref={bodyMatRef}
          color="#3a9aaa"
          roughness={0.32}
          metalness={0.18}
          clearcoat={0.4}
          clearcoatRoughness={0.5}
          transparent
          opacity={1}
        />
      </mesh>
      {/* Forehead hump — characteristic Napoleon feature */}
      <mesh position={[0, 0.07, 0.18]} scale={[0.048, 0.052, 0.07]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshPhysicalMaterial color="#2e8898" roughness={0.38} metalness={0.14} />
      </mesh>
      {/* Caudal fin */}
      <mesh ref={tailRef} position={[0, 0, -0.58]}>
        <planeGeometry args={[0.30, 0.22]} />
        <meshStandardMaterial color="#2d8899" roughness={0.45} side={THREE.DoubleSide} transparent opacity={0.92} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface FishSystemProps {
  populationRef: React.MutableRefObject<number>
}

export default function FishSystem({ populationRef }: FishSystemProps) {
  return (
    <group>
      <FishSchool populationRef={populationRef} />
      <HeroFish   populationRef={populationRef} />
    </group>
  )
}
