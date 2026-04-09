// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TreeScene.tsx — Living tree visualization theme
// coralHealth → leaf colour vibrancy
// fishPopulation → leaf density
// waterClarity → lighting atmosphere (golden hour ↔ overcast)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette, HueSaturation, Noise } from '@react-three/postprocessing'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TreeSceneProps {
  coralHealth:          number   // leaf colour: 0 = brown/rust, 1 = rich green
  fishPopulation:       number   // leaf density: 0 = sparse patches, 1 = full canopy
  waterClarity:         number   // atmosphere: 0 = dim overcast, 1 = golden hour
  activeSideQuestEvent: string | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SEED      = 31337
const MAX_DEPTH = 7
const LEAF_POOL = 5000
const FALL_POOL = 120
const GROUND_N  = 250
const TWO_PI    = Math.PI * 2

// Leaf colour palette
const C_DEAD   = new THREE.Color('#7a3e18')  // brown / rust
const C_MID    = new THREE.Color('#6b7d2a')  // olive / khaki
const C_LIVE   = new THREE.Color('#2e7a18')  // rich green
const C_BRIGHT = new THREE.Color('#72d020')  // spring-green accent

// Pre-allocated colour tmp (never recreated)
const _ctmp = new THREE.Color()

// ── Helpers ───────────────────────────────────────────────────────────────────

function mkRng(seed: number) {
  let s = seed >>> 0
  return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff }
}

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t }

function clamp01(v: number): number { return Math.max(0, Math.min(1, v)) }

function easeOut3(t: number): number { return 1 - Math.pow(1 - t, 3) }

// ── Tree data types ───────────────────────────────────────────────────────────

interface BranchDef {
  pts:    [THREE.Vector3, THREE.Vector3, THREE.Vector3]
  rStart: number
  rEnd:   number
  level:  number
}

interface TreeData {
  branches:   BranchDef[]
  leafPos:    THREE.Vector3[]   // LEAF_POOL positions, inner → outer
  perchPos:   THREE.Vector3[]   // level-4 ends (bird perches)
  blossomPos: THREE.Vector3[]   // level-7 ends (blossom tips)
}

// ── Build tree ────────────────────────────────────────────────────────────────

function buildTreeData(): TreeData {
  const rng = mkRng(SEED)
  const branches: BranchDef[]     = []
  const lv5: THREE.Vector3[]      = []
  const lv6: THREE.Vector3[]      = []
  const lv7: THREE.Vector3[]      = []
  const perchPos: THREE.Vector3[] = []

  function grow(
    start:  THREE.Vector3,
    dir:    THREE.Vector3,
    len:    number,
    rStart: number,
    depth:  number
  ) {
    // Perpendicular axes for curvature
    const up    = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
    const perp  = new THREE.Vector3().crossVectors(dir, up).normalize()
    const perp2 = new THREE.Vector3().crossVectors(dir, perp).normalize()

    const cv  = len * 0.20 * (rng() - 0.5)
    const cv2 = len * 0.12 * (rng() - 0.5)

    const ctrl = start.clone()
      .addScaledVector(dir, len * 0.5)
      .addScaledVector(perp, cv)
      .addScaledVector(perp2, cv2)

    const end = start.clone()
      .addScaledVector(dir, len)
      .addScaledVector(perp, cv * 0.28)
      .addScaledVector(perp2, cv2 * 0.28)

    const rEnd = rStart * (0.60 + rng() * 0.12)
    branches.push({ pts: [start.clone(), ctrl, end.clone()], rStart, rEnd, level: depth })

    if (depth === 4) perchPos.push(end.clone())
    if (depth >= MAX_DEPTH) { lv7.push(end.clone()); return }
    if (depth === MAX_DEPTH - 1) lv6.push(end.clone())
    if (depth === MAX_DEPTH - 2) lv5.push(end.clone())

    const numC = depth <= 1 && rng() < 0.45 ? 3 : 2
    for (let c = 0; c < numC; c++) {
      const angle   = 0.33 + rng() * 0.38
      const azimuth = (c / numC) * TWO_PI + (rng() - 0.5) * 0.7

      const childDir = dir.clone()
        .addScaledVector(perp,  Math.sin(angle) * Math.cos(azimuth))
        .addScaledVector(perp2, Math.sin(angle) * Math.sin(azimuth))

      if (childDir.y < 0.05) childDir.y = 0.05
      childDir.normalize()

      grow(end.clone(), childDir, len * (0.62 + rng() * 0.23), rEnd * (0.88 + rng() * 0.12), depth + 1)
    }
  }

  grow(new THREE.Vector3(0, -2.5, 0), new THREE.Vector3(0.04, 1, -0.03).normalize(), 2.2, 0.28, 0)

  // Assemble leaf positions: inner (lv5) → mid (lv6) → outer (lv7)
  const lrng   = mkRng(SEED + 10)
  const leafPos: THREE.Vector3[] = []
  function scatter(centers: THREE.Vector3[], n: number, spread: number) {
    for (const c of centers) for (let i = 0; i < n; i++) {
      leafPos.push(c.clone().add(new THREE.Vector3(
        (lrng() - 0.5) * spread, (lrng() - 0.5) * spread, (lrng() - 0.5) * spread,
      )))
    }
  }
  scatter(lv5,  8, 0.55)
  scatter(lv6, 16, 0.50)
  scatter(lv7, 27, 0.45)
  while (leafPos.length < LEAF_POOL) {
    const src = leafPos[Math.floor(lrng() * (leafPos.length - 1))]
    leafPos.push(src.clone().add(new THREE.Vector3(
      (lrng() - 0.5) * 0.28, (lrng() - 0.5) * 0.28, (lrng() - 0.5) * 0.28,
    )))
  }

  return { branches, leafPos: leafPos.slice(0, LEAF_POOL), perchPos, blossomPos: lv7 }
}

// ── Geometry builders ─────────────────────────────────────────────────────────

function taperedTube(
  pts: THREE.Vector3[],
  rS: number, rE: number,
  tub: number, rad: number
): THREE.BufferGeometry {
  const curve  = new THREE.CatmullRomCurve3(pts)
  const frames = curve.computeFrenetFrames(tub, false)
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = []

  for (let i = 0; i <= tub; i++) {
    const t  = i / tub
    const pt = curve.getPoint(t)
    const r  = rS + (rE - rS) * t
    const N  = frames.normals[i], B = frames.binormals[i]
    for (let j = 0; j <= rad; j++) {
      const θ = (j / rad) * TWO_PI, c = Math.cos(θ), s = Math.sin(θ)
      pos.push(pt.x + r*(c*N.x + s*B.x), pt.y + r*(c*N.y + s*B.y), pt.z + r*(c*N.z + s*B.z))
      nor.push(c*N.x + s*B.x, c*N.y + s*B.y, c*N.z + s*B.z)
      uv.push(j / rad, t)
    }
  }
  for (let i = 0; i < tub; i++) for (let j = 0; j < rad; j++) {
    const a = i*(rad+1)+j, b = a+rad+1
    idx.push(a, b, a+1, b, b+1, a+1)
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('normal',   new THREE.BufferAttribute(new Float32Array(nor), 3))
  g.setAttribute('uv',       new THREE.BufferAttribute(new Float32Array(uv),  2))
  g.setIndex(idx)
  return g
}

function mergeGeos(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let tv = 0, ti = 0
  for (const g of geos) { tv += g.attributes.position.count; ti += (g.index?.count ?? 0) }

  const pos = new Float32Array(tv * 3), nor = new Float32Array(tv * 3)
  const uv  = new Float32Array(tv * 2), idx = new Uint32Array(ti)
  let vOff = 0, iOff = 0

  for (const g of geos) {
    pos.set(g.attributes.position.array as Float32Array, vOff * 3)
    if (g.attributes.normal) nor.set(g.attributes.normal.array as Float32Array, vOff * 3)
    if (g.attributes.uv)     uv.set( g.attributes.uv.array    as Float32Array, vOff * 2)
    if (g.index) {
      const ia = g.index.array as Uint16Array | Uint32Array
      for (let k = 0; k < ia.length; k++) idx[iOff + k] = ia[k] + vOff
      iOff += ia.length
    }
    vOff += g.attributes.position.count
  }

  const m = new THREE.BufferGeometry()
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  m.setAttribute('normal',   new THREE.BufferAttribute(nor, 3))
  m.setAttribute('uv',       new THREE.BufferAttribute(uv,  2))
  m.setIndex(new THREE.BufferAttribute(idx, 1))
  return m
}

// ── Module-level build (runs once at import) ──────────────────────────────────

const TREE_DATA = buildTreeData()

const BRANCH_GEO = (() => {
  const geos = TREE_DATA.branches.map(b => {
    const d = b.level
    return taperedTube(b.pts as THREE.Vector3[], b.rStart, b.rEnd,
      Math.max(3, 6 - Math.floor(d * 0.55)),
      Math.max(3, 6 - Math.floor(d * 0.45)))
  })
  return mergeGeos(geos)
})()

const _pr = mkRng(SEED + 20)
const LEAF_PHASES = new Float32Array(LEAF_POOL)
for (let i = 0; i < LEAF_POOL; i++) LEAF_PHASES[i] = _pr() * TWO_PI

const _vr = mkRng(SEED + 21)
const LEAF_VARS = new Float32Array(LEAF_POOL)
for (let i = 0; i < LEAF_POOL; i++) LEAF_VARS[i] = (_vr() - 0.5) * 0.22

// Small diamond leaf quad
const LEAF_GEO = (() => {
  const w = 0.046, h = 0.072
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(
    new Float32Array([0, h, 0,  w, 0, 0,  0, -h*0.38, 0,  -w, 0, 0]), 3))
  g.setAttribute('normal',   new THREE.BufferAttribute(
    new Float32Array([0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1]), 3))
  g.setAttribute('uv',       new THREE.BufferAttribute(
    new Float32Array([0.5, 1, 1, 0.5, 0.5, 0, 0, 0.5]), 2))
  g.setIndex([0, 1, 2,  0, 2, 3])
  g.setAttribute('a_phase', new THREE.InstancedBufferAttribute(LEAF_PHASES, 1))
  return g
})()

// Shared uTime uniform — updated in TreeCanopy's useFrame, read by flutter shader
const LEAF_UNIFORMS = { uTime: { value: 0 } }

const LEAF_MAT = (() => {
  const m = new THREE.MeshStandardMaterial({
    roughness: 0.80,
    metalness: 0,
    side:          THREE.DoubleSide,
    vertexColors:  true,
  })
  m.onBeforeCompile = shader => {
    shader.uniforms.uTime = LEAF_UNIFORMS.uTime
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>',
        `#include <common>
         attribute float a_phase;
         uniform float uTime;`)
      .replace('#include <begin_vertex>',
        `#include <begin_vertex>
         // Flap around local Y axis
         float fa = sin(uTime * 1.12 + a_phase) * 0.27;
         float fc = cos(fa), fs = sin(fa);
         float px = transformed.x * fc - transformed.z * fs;
         float pz = transformed.x * fs + transformed.z * fc;
         transformed.x = px; transformed.z = pz;
         // Slight tilt
         float ta = cos(uTime * 0.76 + a_phase * 1.18) * 0.09;
         float tc = cos(ta), ts = sin(ta);
         float py = transformed.y * tc - pz * ts;
         pz = transformed.y * ts + pz * tc;
         transformed.y = py; transformed.z = pz;`)
  }
  return m
})()

// ── TreeCamera — barely-moving, slow zoom cycle ───────────────────────────────

function TreeCamera() {
  const { camera } = useThree()
  const tRef = useRef(0)

  useFrame((_, delta) => {
    tRef.current += delta
    const t = tRef.current
    camera.position.set(
      Math.sin(t * 0.0075) * 0.32,
      0.5 + Math.sin(t * 0.0058) * 0.22,
      7.6 + Math.cos(t * 0.0110) * 0.38,
    )
    camera.lookAt(
      Math.sin(t * 0.0068) * 0.18,
      1.5 + Math.cos(t * 0.0050) * 0.14,
      0,
    )
    // Ultra-slow zoom: 10-minute cycle, ±3° fov
    if (camera instanceof THREE.PerspectiveCamera) {
      const z = Math.sin((t / 600) * TWO_PI) * 3
      if (Math.abs((camera.fov - 55) - z) > 0.05) {
        camera.fov = 55 + z
        camera.updateProjectionMatrix()
      }
    }
  })
  return null
}

// ── TreeEnvironment — lights and fog driven by waterClarity ──────────────────

// Pre-allocated temps
const _eLight  = new THREE.Color()
const _eAmbCol = new THREE.Color()
const _eFog    = new THREE.Color()
const _eBg     = new THREE.Color()

function TreeEnvironment({ clarityRef }: { clarityRef: React.MutableRefObject<number> }) {
  const { scene }  = useThree()
  const dirRef     = useRef<THREE.DirectionalLight>(null)
  const ambRef     = useRef<THREE.AmbientLight>(null)

  useMemo(() => {
    scene.background = new THREE.Color('#050810')
    scene.fog        = new THREE.FogExp2('#080c18', 0.07)
  }, [scene])

  useFrame(() => {
    const clarity = clarityRef.current
    // Direction light: warm golden (clarity=1) ↔ cool desaturated (clarity=0)
    _eLight.lerpColors(new THREE.Color('#8a9bc8'), new THREE.Color('#ffd08a'), clarity)
    if (dirRef.current) {
      dirRef.current.color.copy(_eLight)
      dirRef.current.intensity = lerp(0.35, 1.4, clarity)
    }
    // Ambient
    _eAmbCol.lerpColors(new THREE.Color('#0d1020'), new THREE.Color('#1a1510'), clarity)
    if (ambRef.current) {
      ambRef.current.color.copy(_eAmbCol)
      ambRef.current.intensity = lerp(0.7, 0.45, clarity)
    }
    // Fog: thicker and bluer when overcast
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = lerp(0.14, 0.04, clarity)
      _eFog.lerpColors(new THREE.Color('#090d1a'), new THREE.Color('#06090f'), clarity)
      scene.fog.color.copy(_eFog)
    }
    // Background
    _eBg.lerpColors(new THREE.Color('#030508'), new THREE.Color('#06090e'), clarity)
    if (scene.background instanceof THREE.Color) scene.background.copy(_eBg)
  })

  return (
    <>
      <directionalLight ref={dirRef} position={[-4, 6, 3]} intensity={1.2} color="#ffd08a" castShadow={false} />
      <ambientLight      ref={ambRef} intensity={0.5}     color="#15120a" />
    </>
  )
}

// ── TreeBranches — single merged mesh with bark material ─────────────────────

function TreeBranches() {
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: '#3b2210', roughness: 0.93, metalness: 0 })
    m.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>',
          `#include <common>
           float barkHash(vec3 p){
             p=fract(p*vec3(.103,.103,.097)); p+=dot(p,p.yzx+19.2); return fract((p.x+p.y)*p.z);
           }`)
        .replace('#include <begin_vertex>',
          `#include <begin_vertex>
           float bump = barkHash(transformed*9.0)*0.0065 - 0.0032;
           transformed += normal * bump;`)
    }
    return m
  }, [])

  return <mesh geometry={BRANCH_GEO} material={mat} receiveShadow />
}

// ── TreeCanopy — instanced leaves with flutter shader ────────────────────────

function TreeCanopy({
  healthRef,
  populationRef,
}: { healthRef: React.MutableRefObject<number>; populationRef: React.MutableRefObject<number> }) {
  const meshRef     = useRef<THREE.InstancedMesh>(null)
  const prevHealth  = useRef(-1)
  const dummy       = useMemo(() => new THREE.Object3D(), [])

  // Set instance matrices once
  useEffect(() => {
    const mesh = meshRef.current; if (!mesh) return
    const rng  = mkRng(SEED + 200)
    TREE_DATA.leafPos.forEach((p, i) => {
      dummy.position.copy(p)
      dummy.rotation.set(rng() * TWO_PI, rng() * TWO_PI, rng() * TWO_PI)
      dummy.scale.setScalar(0.68 + rng() * 0.64)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true

    // Initialise all instance colours to a mid green so they're not black
    const tmp = new THREE.Color(C_LIVE)
    for (let i = 0; i < LEAF_POOL; i++) mesh.setColorAt(i, tmp)
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame(() => {
    const mesh = meshRef.current; if (!mesh) return

    // Drive flutter time
    LEAF_UNIFORMS.uTime.value = performance.now() / 1000

    // Density: inner leaves survive at low population → canopy thins outward
    mesh.count = Math.round(lerp(500, LEAF_POOL, populationRef.current))

    // Colour when health changes
    const health = healthRef.current
    if (Math.abs(health - prevHealth.current) > 0.004) {
      prevHealth.current = health
      for (let i = 0; i < LEAF_POOL; i++) {
        const h = clamp01(health + LEAF_VARS[i])
        if (h < 0.5) _ctmp.lerpColors(C_DEAD, C_MID,  h * 2)
        else          _ctmp.lerpColors(C_MID,  C_LIVE, (h - 0.5) * 2)
        // Rare bright accent at high health
        if (health > 0.72 && LEAF_VARS[i] > 0.09) _ctmp.lerp(C_BRIGHT, 0.32)
        mesh.setColorAt(i, _ctmp)
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
  })

  return <instancedMesh ref={meshRef} args={[LEAF_GEO, LEAF_MAT, LEAF_POOL]} />
}

// ── FallingLeaves — CPU-updated particle physics ──────────────────────────────

interface FallLeaf {
  pos:    THREE.Vector3
  vel:    THREE.Vector3
  euler:  THREE.Euler
  ang:    THREE.Vector3
  life:   number
  maxL:   number
  phase:  number
}

const _fallRng = mkRng(SEED + 300)
const _allEnds = TREE_DATA.branches.filter(b => b.level >= 5).map(b => b.pts[2])

function spawnFall(): FallLeaf {
  const src = _allEnds[Math.floor(_fallRng() * _allEnds.length)]
  return {
    pos:   src.clone().add(new THREE.Vector3((_fallRng()-0.5)*0.4, 0, (_fallRng()-0.5)*0.4)),
    vel:   new THREE.Vector3((_fallRng()-0.5)*0.12, -(0.18+_fallRng()*0.28), (_fallRng()-0.5)*0.12),
    euler: new THREE.Euler(_fallRng()*TWO_PI, _fallRng()*TWO_PI, _fallRng()*TWO_PI),
    ang:   new THREE.Vector3((_fallRng()-0.5)*1.8, (_fallRng()-0.5)*2.2, (_fallRng()-0.5)*1.6),
    life:  0,
    maxL:  3.5 + _fallRng() * 4,
    phase: _fallRng() * TWO_PI,
  }
}

const FALL_LEAVES: FallLeaf[] = Array.from({ length: FALL_POOL }, spawnFall)

// Scatter initial times so they don't all reset together
for (let i = 0; i < FALL_POOL; i++) {
  FALL_LEAVES[i].life = _fallRng() * FALL_LEAVES[i].maxL
}

const FALL_MAT = new THREE.MeshStandardMaterial({
  color:     '#8b4e20',
  roughness: 0.85,
  side:      THREE.DoubleSide,
  transparent: true,
  opacity:   0.90,
})

function FallingLeaves({ populationRef }: { populationRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, delta) => {
    const mesh = meshRef.current; if (!mesh) return

    const pop = populationRef.current
    const active = Math.round(lerp(FALL_POOL, 2, pop))
    mesh.count = active

    for (let i = 0; i < active; i++) {
      const l = FALL_LEAVES[i]
      l.life += delta

      if (l.pos.y < -3.2 || l.life > l.maxL) {
        Object.assign(l, spawnFall())
        continue
      }

      // Gentle horizontal sway
      const sway = Math.sin(l.life * 1.9 + l.phase) * 0.06
      l.vel.x += (sway - l.vel.x) * 0.12 * delta

      l.pos.addScaledVector(l.vel, delta)
      l.euler.x += l.ang.x * delta
      l.euler.y += l.ang.y * delta * 0.5
      l.euler.z += l.ang.z * delta

      dummy.position.copy(l.pos)
      dummy.rotation.copy(l.euler)
      dummy.scale.setScalar(0.75 + Math.sin(l.life * 1.8) * 0.08)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    if (active > 0) mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[LEAF_GEO, FALL_MAT, FALL_POOL]} />
}

// ── GroundLeaves — static leaf scatter at tree base ───────────────────────────

const GROUND_MAT = new THREE.MeshStandardMaterial({
  color: '#6a3a12', roughness: 0.92, side: THREE.DoubleSide,
})

function GroundLeaves({ populationRef }: { populationRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])
  const prevPop = useRef(-1)

  const groundData = useMemo(() => {
    const r = mkRng(SEED + 400)
    return Array.from({ length: GROUND_N }, () => ({
      x: (r() - 0.5) * 4.5, z: (r() - 0.5) * 4.5,
      ry: r() * TWO_PI, tilt: (r() - 0.5) * 0.18, s: 0.6 + r() * 0.9,
    }))
  }, [])

  useEffect(() => {
    const mesh = meshRef.current; if (!mesh) return
    groundData.forEach(({ x, z, ry, tilt, s }, i) => {
      dummy.position.set(x, -2.47, z)
      dummy.rotation.set(-Math.PI / 2 + tilt, ry, 0)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame(() => {
    const mesh = meshRef.current; if (!mesh) return
    const pop = populationRef.current
    if (Math.abs(pop - prevPop.current) < 0.004) return
    prevPop.current = pop
    // More fallen leaves at low density
    mesh.count = Math.round(lerp(GROUND_N, 12, pop))
  })

  return <instancedMesh ref={meshRef} args={[LEAF_GEO, GROUND_MAT, GROUND_N]} />
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SIDE QUEST EVENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Fireflies (210 s) — warm glowing particles drifting among branches ────────

const FF_COUNT    = 60
const FF_DURATION = 210

const _ffRng  = mkRng(SEED + 500)
const FF_DATA = Array.from({ length: FF_COUNT }, () => ({
  cx: (_ffRng()-0.5)*3.2, cy: _ffRng()*4,    cz: (_ffRng()-0.5)*3.2,
  ax: 0.9+_ffRng()*1.2,   ay: 0.5+_ffRng(),  az: 0.8+_ffRng()*1.1,
  fx: 0.28+_ffRng()*0.45, fy: 0.20+_ffRng()*0.38, fz: 0.24+_ffRng()*0.40,
  px: _ffRng()*TWO_PI, py: _ffRng()*TWO_PI, pz: _ffRng()*TWO_PI,
}))

function FirefliesEvent() {
  const tRef     = useRef(0)
  const pointsRef= useRef<THREE.Points>(null)
  const posArr   = useMemo(() => new Float32Array(FF_COUNT * 3), [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
    return g
  }, [posArr])

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: '#ffaa28', size: 0.10, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  }), [])

  useFrame((_, delta) => {
    tRef.current += delta
    const t   = tRef.current
    const pts = pointsRef.current; if (!pts) return
    if (t > FF_DURATION) { mat.opacity = 0; return }

    FF_DATA.forEach((d, i) => {
      posArr[i*3]   = d.cx + Math.sin(d.fx*t + d.px) * d.ax
      posArr[i*3+1] = d.cy + Math.sin(d.fy*t + d.py) * d.ay
      posArr[i*3+2] = d.cz + Math.sin(d.fz*t + d.pz) * d.az
    })
    ;(pts.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true

    const fadeIn  = t < 20  ? t / 20  : 1
    const fadeOut = t > FF_DURATION - 25 ? (FF_DURATION - t) / 25 : 1
    mat.opacity   = fadeIn * fadeOut * (0.60 + Math.sin(t * 0.5) * 0.22)
  })

  return <points ref={pointsRef} geometry={geo} material={mat} />
}

// ── Blossoms (180 s) — white/pink clusters bloom at tips, then petals fall ────

const BL_DURATION = 180
const BL_BLOOM    = 30
const BL_HOLD     = 120
const BL_FALL     = 30  // BL_BLOOM + BL_HOLD + BL_FALL = 180

const BLOSSOM_TIPS = TREE_DATA.blossomPos.slice(0, 80)
const BL_COUNT     = BLOSSOM_TIPS.length

// Falling petal pool (reuses leaf geometry, driven by blossoms event)
interface Petal { pos: THREE.Vector3; vel: THREE.Vector3; rot: THREE.Euler; angV: THREE.Vector3; life: number }
const _blRng = mkRng(SEED + 600)
function spawnPetal(i: number): Petal {
  const src = BLOSSOM_TIPS[i % BL_COUNT]
  return {
    pos:  src.clone().add(new THREE.Vector3((_blRng()-0.5)*0.2, 0, (_blRng()-0.5)*0.2)),
    vel:  new THREE.Vector3((_blRng()-0.5)*0.1, -(0.1+_blRng()*0.2), (_blRng()-0.5)*0.1),
    rot:  new THREE.Euler(_blRng()*TWO_PI, _blRng()*TWO_PI, _blRng()*TWO_PI),
    angV: new THREE.Vector3((_blRng()-0.5)*2, (_blRng()-0.5)*2, (_blRng()-0.5)*2),
    life: 0,
  }
}

const BLOSSOM_MAT = new THREE.MeshStandardMaterial({
  color: '#ffe8f0', roughness: 0.5, emissive: '#ff6688', emissiveIntensity: 0.18,
  side: THREE.DoubleSide,
})
const PETAL_MAT = new THREE.MeshStandardMaterial({
  color: '#ffdbe8', roughness: 0.6, transparent: true, opacity: 0.85,
  side: THREE.DoubleSide,
})
const BLOSSOM_MESH_GEO = new THREE.IcosahedronGeometry(1, 0)

function BlossomsEvent() {
  const tRef     = useRef(0)
  const blRef    = useRef<THREE.InstancedMesh>(null)
  const ptRef    = useRef<THREE.InstancedMesh>(null)
  const dummyRef = useMemo(() => new THREE.Object3D(), [])
  const petals   = useMemo(() => Array.from({ length: BL_COUNT }, (_, i) => spawnPetal(i)), [])

  useEffect(() => {
    const mesh = blRef.current; if (!mesh) return
    const d = dummyRef
    BLOSSOM_TIPS.forEach((p, i) => {
      d.position.copy(p); d.scale.setScalar(0); d.rotation.set(0, 0, 0); d.updateMatrix()
      mesh.setMatrixAt(i, d.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, delta) => {
    tRef.current += delta
    const t    = tRef.current
    const bl   = blRef.current
    const pt   = ptRef.current
    const d    = dummyRef
    if (!bl) return
    if (t > BL_DURATION) { bl.count = 0; if (pt) pt.count = 0; return }

    if (t <= BL_BLOOM) {
      // Bloom in
      const s = easeOut3(t / BL_BLOOM) * 0.14
      BLOSSOM_TIPS.forEach((p, i) => {
        d.position.copy(p); d.scale.setScalar(s); d.rotation.set(0, 0, 0); d.updateMatrix()
        bl.setMatrixAt(i, d.matrix)
      })
      bl.instanceMatrix.needsUpdate = true; bl.count = BL_COUNT
    } else if (t <= BL_BLOOM + BL_HOLD) {
      bl.count = BL_COUNT  // hold steady
    } else if (pt) {
      // Petals fall
      bl.count = 0
      const fadeTime = t - BL_BLOOM - BL_HOLD
      const active   = Math.min(BL_COUNT, Math.round((fadeTime / BL_FALL) * BL_COUNT))
      pt.count       = active

      for (let i = 0; i < active; i++) {
        const p = petals[i]
        p.life += delta
        if (p.pos.y < -2.5 || p.life > 5) { Object.assign(p, spawnPetal(i)); p.life = 0 }
        p.pos.addScaledVector(p.vel, delta)
        p.rot.x += p.angV.x * delta; p.rot.y += p.angV.y * delta * 0.4; p.rot.z += p.angV.z * delta
        d.position.copy(p.pos); d.rotation.copy(p.rot); d.scale.setScalar(0.10); d.updateMatrix()
        pt.setMatrixAt(i, d.matrix)
      }
      pt.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <>
      <instancedMesh ref={blRef} args={[BLOSSOM_MESH_GEO, BLOSSOM_MAT, BL_COUNT]} />
      <instancedMesh ref={ptRef} args={[LEAF_GEO, PETAL_MAT, BL_COUNT]} />
    </>
  )
}

// ── Birds (270 s) — silhouettes arrive, perch, hop, depart ───────────────────

const BIRD_COUNT    = 6
const BIRD_DURATION = 270
const BIRD_ARRIVE   = 60   // each bird arrives during first 60s (staggered)
const BIRD_PERCH    = 175  // perching window
const BIRD_DEPART   = 35   // fly-off time

const BIRD_GEO = (() => {
  const g = new THREE.SphereGeometry(1, 6, 4)
  const p = g.attributes.position.array as Float32Array
  for (let i = 0; i < p.length; i += 3) { p[i] *= 1.6; p[i+1] *= 0.45; p[i+2] *= 0.75 }
  g.attributes.position.needsUpdate = true
  g.computeVertexNormals()
  return g
})()

const BIRD_MAT = new THREE.MeshBasicMaterial({ color: '#0c0c0c' })

type BirdPhase = 'arriving' | 'perching' | 'hopping' | 'departing'

interface BirdState {
  phase:      BirdPhase
  pos:        THREE.Vector3
  fromPos:    THREE.Vector3
  toPos:      THREE.Vector3
  progress:   number
  delay:      number     // seconds before this bird starts arriving
  perchIdx:   number
  hopTargetI: number
  hopAfter:   number     // scene time when bird will hop
  hasHopped:  boolean
  wingPhase:  number
  scale:      number
}

const _bRng = mkRng(SEED + 700)
const BIRD_STATES: BirdState[] = Array.from({ length: BIRD_COUNT }, (_, i) => {
  const pi = Math.floor(_bRng() * TREE_DATA.perchPos.length)
  const offDir = new THREE.Vector3((_bRng()-0.5)*20, 3+_bRng()*3, (_bRng()-0.5)*20)
  return {
    phase:      'arriving',
    pos:        offDir.clone(),
    fromPos:    offDir.clone(),
    toPos:      TREE_DATA.perchPos[pi % TREE_DATA.perchPos.length].clone(),
    progress:   0,
    delay:      i * 9 + _bRng() * 5,
    perchIdx:   pi,
    hopTargetI: Math.floor(_bRng() * TREE_DATA.perchPos.length),
    hopAfter:   BIRD_ARRIVE + 20 + _bRng() * 80,
    hasHopped:  false,
    wingPhase:  _bRng() * TWO_PI,
    scale:      0.04 + _bRng() * 0.015,
  }
})

function BirdsEvent() {
  const tRef     = useRef(0)
  const meshRef  = useRef<THREE.InstancedMesh>(null)
  const dummyRef = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, delta) => {
    tRef.current += delta
    const t  = tRef.current
    const m  = meshRef.current
    const d  = dummyRef
    if (!m || t > BIRD_DURATION + 5) return

    let visible = 0

    BIRD_STATES.forEach((b, i) => {
      const localT = t - b.delay
      if (localT < 0) return  // not started yet
      visible++

      const totalPerch = BIRD_ARRIVE + BIRD_PERCH

      if (b.phase === 'arriving') {
        b.progress = Math.min(1, localT / 18)  // 18s flight
        b.pos.lerpVectors(b.fromPos, b.toPos, easeOut3(b.progress))
        // arc: rise above midpoint
        b.pos.y += Math.sin(b.progress * Math.PI) * 1.2 * (1 - b.progress)
        if (b.progress >= 1) { b.phase = 'perching'; b.progress = 0 }
      } else if (b.phase === 'perching') {
        const pp = TREE_DATA.perchPos[b.perchIdx % TREE_DATA.perchPos.length]
        b.pos.lerp(pp, 0.06)
        // hop
        if (!b.hasHopped && t > b.hopAfter && t < totalPerch - 10) {
          b.hasHopped = true
          b.fromPos.copy(b.pos)
          b.toPos.copy(TREE_DATA.perchPos[b.hopTargetI % TREE_DATA.perchPos.length])
          b.phase    = 'hopping'
          b.progress = 0
        }
        if (t > totalPerch) {
          b.phase    = 'departing'
          b.fromPos.copy(b.pos)
          b.toPos.set((_bRng()-0.5)*25, 8+_bRng()*5, (_bRng()-0.5)*25)
          b.progress = 0
        }
      } else if (b.phase === 'hopping') {
        b.progress = Math.min(1, b.progress + delta / 2.5)
        b.pos.lerpVectors(b.fromPos, b.toPos, easeOut3(b.progress))
        b.pos.y += Math.sin(b.progress * Math.PI) * 0.6
        if (b.progress >= 1) { b.perchIdx = b.hopTargetI; b.phase = 'perching' }
      } else if (b.phase === 'departing') {
        b.progress = Math.min(1, b.progress + delta / BIRD_DEPART)
        b.pos.lerpVectors(b.fromPos, b.toPos, easeOut3(b.progress))
      }

      // Wing flap: vigorous when flying, slow bob when perching
      const flapSpeed = (b.phase === 'arriving' || b.phase === 'departing' || b.phase === 'hopping') ? 5.5 : 1.0
      const flapAmp   = b.phase === 'perching' ? 0.04 : 0.35
      d.position.copy(b.pos)
      d.rotation.set(Math.sin(t * flapSpeed + b.wingPhase) * flapAmp, 0, 0)
      d.scale.setScalar(b.scale)
      d.updateMatrix()
      m.setMatrixAt(i, d.matrix)
    })

    m.count = visible
    m.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[BIRD_GEO, BIRD_MAT, BIRD_COUNT]} />
}

// ── TreeEffects — post-processing pipeline ────────────────────────────────────

function TreeEffects({ waterClarity }: { waterClarity: number }) {
  const sat = lerp(-0.40, 0.12, waterClarity)
  const hue = lerp(0.04, 0.0, waterClarity)  // very slight blue-shift at low clarity

  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.28} luminanceSmoothing={0.82} intensity={0.55} height={320} />
      <Vignette eskil={false} offset={0.30} darkness={0.68} />
      <HueSaturation hue={hue} saturation={sat} />
      <Noise opacity={0.034} />
    </EffectComposer>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TreeScene — main export
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function TreeScene({
  coralHealth,
  fishPopulation,
  waterClarity,
  activeSideQuestEvent,
}: TreeSceneProps) {
  // Local lerp refs — same smoothing pattern as ReefScene
  const clarityRef    = useRef(waterClarity)
  const healthRef     = useRef(coralHealth)
  const populationRef = useRef(fishPopulation)
  const tgtClarity    = useRef(waterClarity)
  const tgtHealth     = useRef(coralHealth)
  const tgtPop        = useRef(fishPopulation)

  tgtClarity.current = waterClarity
  tgtHealth.current  = coralHealth
  tgtPop.current     = fishPopulation

  useFrame(() => {
    clarityRef.current    = lerp(clarityRef.current,    tgtClarity.current, 0.015)
    healthRef.current     = lerp(healthRef.current,     tgtHealth.current,  0.015)
    populationRef.current = lerp(populationRef.current, tgtPop.current,     0.015)
  })

  return (
    <>
      <TreeCamera />
      <TreeEnvironment clarityRef={clarityRef} />
      <TreeBranches />
      <TreeCanopy     healthRef={healthRef}     populationRef={populationRef} />
      <FallingLeaves  populationRef={populationRef} />
      <GroundLeaves   populationRef={populationRef} />

      {activeSideQuestEvent === 'fireflies' && <FirefliesEvent />}
      {activeSideQuestEvent === 'blossoms'  && <BlossomsEvent  />}
      {activeSideQuestEvent === 'birds'     && <BirdsEvent     />}

      <TreeEffects waterClarity={waterClarity} />
    </>
  )
}
