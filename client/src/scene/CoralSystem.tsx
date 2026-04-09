import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { noise2D, fbm3D } from '../utils/noise'

// ── Seeded RNG (xorshift) ──────────────────────────────────────────────────────
function seededRng(seed: number): () => number {
  let s = (seed | 0) >>> 0
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5
    return (s >>> 0) / 0xffffffff
  }
}

// ── Merge BufferGeometry array into single draw call ───────────────────────────
function mergeGeoms(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalVerts = 0
  const posArrs: Float32Array[] = []
  const normArrs: Float32Array[] = []
  const uvArrs:  Float32Array[]  = []
  const idxChunks: number[][]    = []

  for (const g of geos) {
    const posA = g.attributes.position as THREE.BufferAttribute
    const normA = g.attributes.normal  as THREE.BufferAttribute | undefined
    const uvA  = g.attributes.uv      as THREE.BufferAttribute | undefined
    const vc = posA.count

    posArrs.push(posA.array  as Float32Array)
    normArrs.push(normA ? (normA.array as Float32Array) : new Float32Array(vc * 3))
    uvArrs.push(uvA  ? (uvA.array  as Float32Array) : new Float32Array(vc * 2))

    const chunk: number[] = []
    if (g.index) {
      for (let i = 0; i < g.index.count; i++) chunk.push(g.index.getX(i) + totalVerts)
    } else {
      for (let i = 0; i < vc; i++) chunk.push(totalVerts + i)
    }
    idxChunks.push(chunk)
    totalVerts += vc
  }

  const mPos  = new Float32Array(totalVerts * 3)
  const mNorm = new Float32Array(totalVerts * 3)
  const mUV   = new Float32Array(totalVerts * 2)
  let po = 0, no = 0, uo = 0
  for (let i = 0; i < posArrs.length; i++) {
    mPos.set(posArrs[i], po);   po += posArrs[i].length
    mNorm.set(normArrs[i], no); no += normArrs[i].length
    mUV.set(uvArrs[i], uo);    uo += uvArrs[i].length
  }

  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(mPos, 3))
  merged.setAttribute('normal',   new THREE.BufferAttribute(mNorm, 3))
  merged.setAttribute('uv',       new THREE.BufferAttribute(mUV, 2))
  merged.setIndex(idxChunks.flat())
  return merged
}

// ── Tapered tube along CatmullRom curve ───────────────────────────────────────
function taperedTube(
  pts: THREE.Vector3[],
  rStart: number,
  rEnd: number,
  tubSegs = 6,
  radSegs = 6,
): THREE.BufferGeometry {
  const curve  = new THREE.CatmullRomCurve3(pts)
  const frames = curve.computeFrenetFrames(tubSegs, false)

  const pos: number[] = [], norm: number[] = [], uv: number[] = [], idx: number[] = []
  const stride = radSegs + 1

  for (let i = 0; i <= tubSegs; i++) {
    const t = i / tubSegs
    const p = curve.getPointAt(t)
    const N = frames.normals[i], B = frames.binormals[i]
    const r = THREE.MathUtils.lerp(rStart, rEnd, t)
    for (let j = 0; j <= radSegs; j++) {
      const a = (j / radSegs) * Math.PI * 2
      const c = Math.cos(a), s = Math.sin(a)
      const nx = c * N.x + s * B.x, ny = c * N.y + s * B.y, nz = c * N.z + s * B.z
      pos.push(p.x + r * nx, p.y + r * ny, p.z + r * nz)
      norm.push(nx, ny, nz)
      uv.push(j / radSegs, t)
    }
  }
  for (let i = 0; i < tubSegs; i++) {
    for (let j = 0; j < radSegs; j++) {
      const a = stride * i + j, b = stride * (i + 1) + j
      const c = stride * (i + 1) + j + 1, d = stride * i + j + 1
      idx.push(a, b, d, b, c, d)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(norm, 3))
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(idx)
  return geo
}

// ── Vector helpers ─────────────────────────────────────────────────────────────
function perpTo(d: THREE.Vector3): THREE.Vector3 {
  const ref = Math.abs(d.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
  return new THREE.Vector3().crossVectors(d, ref).normalize()
}

function childDir(parent: THREE.Vector3, sMin: number, sMax: number, rng: () => number): THREE.Vector3 {
  const spread = sMin + rng() * (sMax - sMin)
  const az = rng() * Math.PI * 2
  const p = parent.clone().normalize()
  const u = perpTo(p)
  const v = new THREE.Vector3().crossVectors(p, u).normalize()
  const cs = Math.cos(spread), sn = Math.sin(spread)
  const ca = Math.cos(az),    sa = Math.sin(az)
  return new THREE.Vector3(
    cs * p.x + sn * (ca * u.x + sa * v.x),
    cs * p.y + sn * (ca * u.y + sa * v.y),
    cs * p.z + sn * (ca * u.z + sa * v.z),
  ).normalize()
}

// ─────────────────────────────────────────────────────────────────────────────
// Staghorn (Acropora) — L-system depth 5, ~90 branches, tapered tubes
// ─────────────────────────────────────────────────────────────────────────────

function buildStaghornColony(seed: number): THREE.BufferGeometry {
  const rng = seededRng(seed)
  const geos: THREE.BufferGeometry[] = []
  const MAX_DEPTH = 5

  function grow(start: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number) {
    if (depth > MAX_DEPTH) return
    const u = perpTo(dir)
    const v = new THREE.Vector3().crossVectors(dir, u).normalize()
    const bend = len * 0.14
    const mid = start.clone()
      .addScaledVector(dir, len * 0.44)
      .addScaledVector(u, (rng() - 0.5) * bend)
      .addScaledVector(v, (rng() - 0.5) * bend * 0.7)
    const end = start.clone()
      .addScaledVector(dir, len)
      .addScaledVector(u, (rng() - 0.5) * bend * 0.4)

    const rEnd  = r * (0.54 + rng() * 0.12)
    const tSeg  = depth < 2 ? 5 : 4
    const rSeg  = depth < 2 ? 7 : 5
    geos.push(taperedTube([start, mid, end], r, rEnd, tSeg, rSeg))

    if (depth === MAX_DEPTH) {
      // Bulbous polyp tip
      const tip = new THREE.IcosahedronGeometry(rEnd * 2.2, 0)
      tip.translate(end.x, end.y, end.z)
      geos.push(tip)
      return
    }

    const nC  = depth === 0 ? 3 : 2
    const sMin = (18 + depth * 3) * (Math.PI / 180)
    const sMax = (42 + depth * 4) * (Math.PI / 180)
    for (let i = 0; i < nC; i++) {
      const cDir = childDir(dir, sMin, sMax, rng)
      grow(end, cDir, len * (0.52 + rng() * 0.18), rEnd, depth + 1)
    }
  }

  grow(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3((rng() - 0.5) * 0.18, 1, (rng() - 0.5) * 0.18).normalize(),
    0.52 + rng() * 0.12,
    0.024,
    0,
  )

  const merged = mergeGeoms(geos)
  merged.computeVertexNormals()
  return merged
}

// ─────────────────────────────────────────────────────────────────────────────
// Brain coral — IcosahedronGeometry detail=3 (~640 verts) + FBM + groove
// ─────────────────────────────────────────────────────────────────────────────

function buildBrainCoral(seed: number, scale: number): THREE.BufferGeometry {
  const rng = seededRng(seed)
  const geo = new THREE.IcosahedronGeometry(scale, 3)
  const posA = geo.attributes.position as THREE.BufferAttribute
  const arr  = posA.array as Float32Array

  for (let i = 0; i < posA.count; i++) {
    const x = arr[i * 3], y = arr[i * 3 + 1], z = arr[i * 3 + 2]
    const r = Math.sqrt(x * x + y * y + z * z)
    if (r < 0.0001) continue
    const nx = x / r, ny = y / r, nz = z / r

    // Low-frequency FBM → big brain lobes
    const bulk  = fbm3D(nx * 2.2, ny * 2.2, nz * 2.2, 3) * 0.18 * scale

    // High-frequency meander grooves (two overlapping sine waves)
    const theta = Math.atan2(z, x)
    const phi   = Math.acos(Math.max(-1, Math.min(1, ny)))
    const groove = Math.sin(phi * 10.0 + theta * 6.0 + 0.5)
                 * Math.sin(phi * 7.0  - theta * 4.5 + 0.8)
                 * 0.046 * scale

    const bump = (rng() - 0.5) * 0.013 * scale
    const disp = bulk + groove + bump

    arr[i * 3]     = x + disp * nx
    arr[i * 3 + 1] = y + disp * ny
    arr[i * 3 + 2] = z + disp * nz
  }

  posA.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

// ─────────────────────────────────────────────────────────────────────────────
// Fan coral — arc-polar mesh (651 verts) with Perlin noise on boundary
// ─────────────────────────────────────────────────────────────────────────────

function buildFanMesh(seed: number): THREE.BufferGeometry {
  const R_SEGS = 20, T_SEGS = 30
  const FAN_R = 0.62, INNER_R = 0.04, SPREAD = 1.05

  const positions: number[] = [], normals: number[] = []
  const uvs: number[] = [], indices: number[] = []

  for (let ri = 0; ri <= R_SEGS; ri++) {
    const vt = ri / R_SEGS
    const baseR = THREE.MathUtils.lerp(INNER_R, FAN_R, vt)
    for (let ti = 0; ti <= T_SEGS; ti++) {
      const u = ti / T_SEGS
      const angle = THREE.MathUtils.lerp(-SPREAD, SPREAD, u) + Math.PI / 2
      let r = baseR
      if (ri === R_SEGS) {
        r += noise2D(Math.cos(angle) * 4.5 + seed * 0.009, Math.sin(angle) * 4.5) * 0.09
      }
      positions.push(Math.cos(angle) * r, Math.sin(angle) * r, 0)
      normals.push(0, 0, 1)
      uvs.push(u, vt)
    }
  }

  const stride = T_SEGS + 1
  for (let ri = 0; ri < R_SEGS; ri++) {
    for (let ti = 0; ti < T_SEGS; ti++) {
      const a = stride * ri + ti, b = stride * (ri + 1) + ti
      const c = stride * (ri + 1) + ti + 1, d = stride * ri + ti + 1
      indices.push(a, b, d, b, c, d)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals,   3))
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  return geo
}

// ── Canvas branching-vein texture for fan coral ───────────────────────────────
function makeFanVeinTexture(seed: number): THREE.CanvasTexture {
  const SIZE = 512
  const canvas = document.createElement('canvas')
  canvas.width = SIZE; canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  const rng = seededRng(seed)

  ctx.fillStyle = 'rgba(40, 10, 65, 0.90)'
  ctx.fillRect(0, 0, SIZE, SIZE)

  function drawVein(x: number, y: number, angle: number, len: number, depth: number) {
    if (depth > 8 || len < 2.5) return
    const x2 = x + Math.cos(angle) * len
    const y2 = y + Math.sin(angle) * len
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2)
    const alpha = Math.max(0.15, 0.80 - depth * 0.09)
    ctx.strokeStyle = `rgba(185, 120, 248, ${alpha.toFixed(2)})`
    ctx.lineWidth   = Math.max(0.4, 2.6 - depth * 0.30)
    ctx.stroke()
    if (rng() < 0.92) drawVein(x2, y2, angle - (0.20 + rng() * 0.22), len * (0.58 + rng() * 0.14), depth + 1)
    if (rng() < 0.86) drawVein(x2, y2, angle + (0.18 + rng() * 0.24), len * (0.55 + rng() * 0.16), depth + 1)
  }

  for (let i = 0; i < 6; i++) {
    const bx = SIZE * (0.18 + i / 5 * 0.64)
    drawVein(bx, SIZE * 0.91, -Math.PI / 2 + (rng() - 0.5) * 0.28, 52 + rng() * 32, 0)
  }
  return new THREE.CanvasTexture(canvas)
}

// ─────────────────────────────────────────────────────────────────────────────
// Soft coral cluster — main stalk + 9-12 fronds with polyp tips
// ─────────────────────────────────────────────────────────────────────────────

function buildSoftCoralCluster(seed: number): THREE.BufferGeometry {
  const rng = seededRng(seed)
  const geos: THREE.BufferGeometry[] = []

  const STALK = 0.52
  const lean = new THREE.Vector3(
    (rng() - 0.5) * 0.30, 1.0, (rng() - 0.5) * 0.30,
  ).normalize()
  const u0 = perpTo(lean)

  const mid = new THREE.Vector3()
    .addScaledVector(lean, STALK * 0.5)
    .addScaledVector(u0, (rng() - 0.5) * 0.04)
  const top = new THREE.Vector3().addScaledVector(lean, STALK)
  geos.push(taperedTube([new THREE.Vector3(), mid, top], 0.022, 0.013, 6, 7))

  const N_FRONDS = 9 + Math.floor(rng() * 4)
  for (let i = 0; i < N_FRONDS; i++) {
    const ht = 0.18 + (i / N_FRONDS) * 0.76
    const frondBase = new THREE.Vector3().addScaledVector(lean, STALK * ht)
    const fDir = childDir(lean, 0.48, 0.82, rng)
    const fLen = 0.09 + rng() * 0.13

    const fMid = frondBase.clone()
      .addScaledVector(fDir, fLen * 0.5)
      .addScaledVector(perpTo(fDir), (rng() - 0.5) * fLen * 0.12)
    const fEnd = frondBase.clone().addScaledVector(fDir, fLen)

    geos.push(taperedTube([frondBase, fMid, fEnd], 0.009, 0.003, 4, 6))

    const tip = new THREE.IcosahedronGeometry(0.007, 0)
    tip.translate(fEnd.x, fEnd.y, fEnd.z)
    geos.push(tip)
  }

  const merged = mergeGeoms(geos)
  merged.computeVertexNormals()
  return merged
}

// ─────────────────────────────────────────────────────────────────────────────
// Module-level geometry cache — built once at load
// ─────────────────────────────────────────────────────────────────────────────

const STAGHORN_PLACEMENTS = [
  { pos: [-3.50, -1.50, -0.80] as [number,number,number], seed: 101 },
  { pos: [-2.30, -1.50,  0.85] as [number,number,number], seed: 142 },
  { pos: [ 2.40, -1.50,  0.50] as [number,number,number], seed: 188 },
  { pos: [ 3.10, -1.50, -0.65] as [number,number,number], seed: 256 },
  { pos: [ 0.40, -1.50, -2.20] as [number,number,number], seed: 321 },
]
const BRAIN_PLACEMENTS = [
  { pos: [-2.85, -1.15,  0.30] as [number,number,number], seed: 400, scale: 0.36 },
  { pos: [ 2.05, -1.10,  0.20] as [number,number,number], seed: 451, scale: 0.43 },
  { pos: [ 0.85, -1.15, -1.55] as [number,number,number], seed: 502, scale: 0.30 },
]
const FAN_PLACEMENTS = [
  { pos: [-3.80, -1.00,  0.55] as [number,number,number], seed: 600, rotY: 0.30 },
  { pos: [ 3.50, -0.90,  0.20] as [number,number,number], seed: 651, rotY: -0.50 },
  { pos: [-1.40, -1.10, -1.80] as [number,number,number], seed: 702, rotY: 1.20 },
]
const SOFT_PLACEMENTS = [
  { pos: [-1.55, -1.50,  0.40] as [number,number,number], seed: 800 },
  { pos: [ 1.10, -1.50, -0.40] as [number,number,number], seed: 851 },
  { pos: [ 0.40, -1.50,  1.90] as [number,number,number], seed: 902 },
  { pos: [-0.55, -1.50, -1.00] as [number,number,number], seed: 953 },
]

const STAGHORN_GEOS = STAGHORN_PLACEMENTS.map(p => buildStaghornColony(p.seed))
const BRAIN_GEOS    = BRAIN_PLACEMENTS.map(p => buildBrainCoral(p.seed, p.scale))
const FAN_GEOS      = FAN_PLACEMENTS.map(p => buildFanMesh(p.seed))
const FAN_TEXTURES  = FAN_PLACEMENTS.map(p => makeFanVeinTexture(p.seed))
const SOFT_GEOS     = SOFT_PLACEMENTS.map(p => buildSoftCoralCluster(p.seed))

// ─────────────────────────────────────────────────────────────────────────────
// Color palette
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  stagH:  new THREE.Color('#d4793a'), stagB:  new THREE.Color('#f0ede6'),
  brainH: new THREE.Color('#c89638'), brainB: new THREE.Color('#e8e0cc'),
  fanH:   new THREE.Color('#7a2d8c'), fanB:   new THREE.Color('#d0c0d8'),
  softH:  new THREE.Color('#e09020'), softB:  new THREE.Color('#e8e0cc'),
}

// ─────────────────────────────────────────────────────────────────────────────
// React components
// ─────────────────────────────────────────────────────────────────────────────

export interface CoralSystemProps {
  healthRef: React.MutableRefObject<number>
}

// ── Staghorn coral ─────────────────────────────────────────────────────────
function StaghornCoral({
  position, seed, geoIdx, healthRef,
}: { position:[number,number,number]; seed:number; geoIdx:number; healthRef:React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef   = useRef<THREE.MeshStandardMaterial>(null)
  const tmp      = useMemo(() => new THREE.Color(), [])

  useFrame(({ clock }) => {
    const h = healthRef.current, t = clock.elapsedTime
    if (groupRef.current) {
      const s = 0.25 + h * 0.75
      groupRef.current.rotation.z = Math.sin(t * 0.38 + seed * 0.017) * 0.030 * s
      groupRef.current.rotation.x = Math.sin(t * 0.27 + seed * 0.031) * 0.015 * s
    }
    if (matRef.current) {
      tmp.lerpColors(C.stagB, C.stagH, Math.pow(Math.max(0, h), 0.7))
      matRef.current.color.copy(tmp)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={STAGHORN_GEOS[geoIdx]} castShadow receiveShadow>
        <meshStandardMaterial ref={matRef} color={C.stagH} roughness={0.74} metalness={0} />
      </mesh>
    </group>
  )
}

// ── Brain coral ────────────────────────────────────────────────────────────
function BrainCoralMesh({
  position, geoIdx, healthRef,
}: { position:[number,number,number]; geoIdx:number; healthRef:React.MutableRefObject<number> }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const tmp    = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    if (!matRef.current) return
    tmp.lerpColors(C.brainB, C.brainH, Math.pow(Math.max(0, healthRef.current), 0.7))
    matRef.current.color.copy(tmp)
  })

  return (
    <mesh geometry={BRAIN_GEOS[geoIdx]} position={position} castShadow receiveShadow>
      <meshStandardMaterial ref={matRef} color={C.brainH} roughness={0.90} metalness={0} />
    </mesh>
  )
}

// ── Fan coral ──────────────────────────────────────────────────────────────
function FanCoralMesh({
  position, rotationY, seed, geoIdx, healthRef,
}: { position:[number,number,number]; rotationY:number; seed:number; geoIdx:number; healthRef:React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef   = useRef<THREE.MeshStandardMaterial>(null)
  const tmp      = useMemo(() => new THREE.Color(), [])

  const stalkGeo = useMemo(() =>
    taperedTube([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0.10,0)], 0.016, 0.010, 4, 6),
  [])
  useEffect(() => () => stalkGeo.dispose(), [stalkGeo])

  useFrame(({ clock }) => {
    const h = healthRef.current, t = clock.elapsedTime
    if (groupRef.current) {
      const s = 0.3 + h * 0.7
      groupRef.current.rotation.z = Math.sin(t * 0.28 + seed * 0.019) * 0.06 * s
    }
    if (matRef.current) {
      tmp.lerpColors(C.fanB, C.fanH, Math.pow(Math.max(0, h), 0.7))
      matRef.current.color.copy(tmp)
      matRef.current.opacity = 0.62 + h * 0.18
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={stalkGeo} castShadow>
        <meshStandardMaterial color={C.fanH} roughness={0.70} />
      </mesh>
      <mesh geometry={FAN_GEOS[geoIdx]} castShadow receiveShadow>
        <meshStandardMaterial
          ref={matRef}
          color={C.fanH}
          roughness={0.68}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
          map={FAN_TEXTURES[geoIdx]}
          alphaTest={0.04}
        />
      </mesh>
    </group>
  )
}

// ── Soft coral cluster ─────────────────────────────────────────────────────
function SoftCoralCluster({
  position, seed, geoIdx, healthRef,
}: { position:[number,number,number]; seed:number; geoIdx:number; healthRef:React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef   = useRef<THREE.MeshStandardMaterial>(null)
  const tmp      = useMemo(() => new THREE.Color(), [])

  useFrame(({ clock }) => {
    const h = healthRef.current, t = clock.elapsedTime
    if (groupRef.current) {
      const s = 0.3 + h * 0.7
      groupRef.current.rotation.z = Math.sin(t * 0.32 + seed * 0.023) * 0.040 * s
      groupRef.current.rotation.x = Math.sin(t * 0.24 + seed * 0.019) * 0.025 * s
    }
    if (matRef.current) {
      tmp.lerpColors(C.softB, C.softH, Math.pow(Math.max(0, h), 0.7))
      matRef.current.color.copy(tmp)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={SOFT_GEOS[geoIdx]} castShadow receiveShadow>
        <meshStandardMaterial
          ref={matRef}
          color={C.softH}
          roughness={0.62}
          metalness={0.02}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CoralSystem — public export
// ─────────────────────────────────────────────────────────────────────────────

export default function CoralSystem({ healthRef }: CoralSystemProps) {
  return (
    <group>
      {STAGHORN_PLACEMENTS.map((p, i) => (
        <StaghornCoral key={p.seed} position={p.pos} seed={p.seed} geoIdx={i} healthRef={healthRef} />
      ))}
      {BRAIN_PLACEMENTS.map((p, i) => (
        <BrainCoralMesh key={p.seed} position={p.pos} geoIdx={i} healthRef={healthRef} />
      ))}
      {FAN_PLACEMENTS.map((p, i) => (
        <FanCoralMesh key={p.seed} position={p.pos} rotationY={p.rotY} seed={p.seed} geoIdx={i} healthRef={healthRef} />
      ))}
      {SOFT_PLACEMENTS.map((p, i) => (
        <SoftCoralCluster key={p.seed} position={p.pos} seed={p.seed} geoIdx={i} healthRef={healthRef} />
      ))}
    </group>
  )
}
