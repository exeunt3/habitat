/**
 * SideQuestEvents — transient visual events triggered by side quest completions.
 *
 * Events play for 2–4 minutes, then fade out naturally.
 * Three types from the ecology reference:
 *   manta_ray      – large manta glides through the scene on a lazy arc
 *   bioluminescence – plankton cloud illuminates with additive cyan glow
 *   turtle_visit   – sea turtle swims in, pauses near coral, swims out
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Shared seeded RNG ─────────────────────────────────────────────────────────
function rngFrom(seed: number): () => number {
  let s = (seed | 0) >>> 0
  return () => { s ^= s<<13; s ^= s>>17; s ^= s<<5; return (s>>>0)/0xffffffff }
}

// ── Shared temp objects ───────────────────────────────────────────────────────
const _look  = new THREE.Vector3()

// =============================================================================
// MANTA RAY
// Duration: 220 seconds.
// Enters from screen-right, arcs in a wide sweep, exits screen-left.
// Wing-flap via vertex Y displacement; belly slightly lighter.
// =============================================================================

/** Build the manta ray body as a flat custom polygon + tail cylinder */
function buildMantaGeo(): THREE.BufferGeometry {
  // Vertices in local XZ plane (Y = 0), looking from above.
  // Scaled so wingspan ≈ 4.4 units (large — you notice it crossing the scene).
  const V = [
    //  x      y    z     (body polygon, CCW from above)
    [  0.00,  0,  0.80],  // 0 snout
    [ -0.18,  0,  0.68],  // 1 left horn base
    [ -0.28,  0,  0.78],  // 2 left horn tip
    [ -1.10,  0,  0.30],  // 3 left mid-leading edge
    [ -2.20,  0, -0.08],  // 4 left wing tip
    [ -1.60,  0, -0.55],  // 5 left trailing inner
    [ -0.40,  0, -0.68],  // 6 left rear
    [  0.00,  0, -0.60],  // 7 centre rear
    [  0.40,  0, -0.68],  // 8 right rear
    [  1.60,  0, -0.55],  // 9 right trailing inner
    [  2.20,  0, -0.08],  // 10 right wing tip
    [  1.10,  0,  0.30],  // 11 right mid-leading edge
    [  0.18,  0,  0.68],  // 12 right horn base
    [  0.28,  0,  0.78],  // 13 right horn tip
  ]

  const positions: number[] = []
  const normals:   number[] = []
  const uvs:       number[] = []
  const indices:   number[] = []

  // Add vertices, UV.x encodes lateral position (0 = full left, 1 = full right)
  for (const [x, y, z] of V) {
    positions.push(x, y, z)
    normals.push(0, 1, 0)
    uvs.push((x / 2.4 + 0.5), (z / 0.8 + 0.5))  // rough UV
  }

  // Fan triangulation from centre rear (7)
  const center = 7
  const rim = [0,1,2,3,4,5,6, 8,9,10,11,12,13,0]
  for (let i = 0; i < rim.length - 1; i++) {
    indices.push(center, rim[i], rim[i+1])
  }
  // Close the fan: connect horn tips to snout
  indices.push(center, 6, 0)
  // Horn triangles
  indices.push(0, 1, 2)
  indices.push(12, 13, 0)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals,   3))
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

const MANTA_GEO     = buildMantaGeo()
const MANTA_DURATION = 220  // seconds

// Catmull-Rom path: enter right, arc through scene, exit left
const MANTA_WAYPOINTS = [
  new THREE.Vector3( 12,  0.8,  1.0),   // start (off screen right)
  new THREE.Vector3(  6,  1.0,  0.0),   // entering scene
  new THREE.Vector3(  1,  1.2, -2.0),   // arc midpoint high
  new THREE.Vector3( -3,  0.8,  0.5),   // curve back
  new THREE.Vector3( -7,  0.5,  1.5),   // exiting left
  new THREE.Vector3(-12,  0.3,  2.0),   // fully off screen
]
const MANTA_CURVE = new THREE.CatmullRomCurve3(MANTA_WAYPOINTS)

function MantaRayEvent() {
  const groupRef  = useRef<THREE.Group>(null)
  const leftWing  = useRef<THREE.Group>(null)
  const rightWing = useRef<THREE.Group>(null)
  const matRef    = useRef<THREE.MeshStandardMaterial>(null)
  const tRef      = useRef(0)

  useFrame((_, delta) => {
    tRef.current += delta
    const t = tRef.current
    const group = groupRef.current
    if (!group) return

    // Fade envelope
    const fadeIn  = Math.min(1, t / 20)
    const fadeOut = Math.max(0, 1 - (t - (MANTA_DURATION - 25)) / 25)
    const opacity = Math.min(fadeIn, fadeOut)
    if (matRef.current) matRef.current.opacity = opacity

    if (t > MANTA_DURATION) { group.visible = false; return }
    group.visible = true

    // Position along Catmull-Rom curve
    const pathT = Math.min(1, t / MANTA_DURATION)
    const pos = MANTA_CURVE.getPointAt(pathT)
    const ahead = MANTA_CURVE.getPointAt(Math.min(1, pathT + 0.005))
    group.position.copy(pos)
    group.lookAt(ahead)
    // Manta faces -Z by default from buildMantaGeo, so rotate 90° Y to face forward
    group.rotateY(Math.PI / 2)

    // Gentle bank into turns
    const tangent = new THREE.Vector3().subVectors(ahead, pos).normalize()
    group.rotation.z = Math.atan2(tangent.x, tangent.z) * -0.3

    // Wing flap — very slow, gentle undulation like a real manta
    const flap = Math.sin(t * 0.55) * 0.12
    if (leftWing.current)  leftWing.current.rotation.z  =  flap
    if (rightWing.current) rightWing.current.rotation.z = -flap
  })

  return (
    <group ref={groupRef}>
      {/* Left wing */}
      <group ref={leftWing}>
        <mesh geometry={MANTA_GEO} castShadow>
          <meshStandardMaterial
            ref={matRef}
            color="#2a3d50"
            roughness={0.55}
            metalness={0.08}
            side={THREE.DoubleSide}
            transparent
            opacity={0}
          />
        </mesh>
      </group>
      {/* Tail: thin tapered cylinder */}
      <mesh position={[0, 0, -1.2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.005, 1.4, 5]} />
        <meshStandardMaterial color="#1e2e3a" roughness={0.6} />
      </mesh>
    </group>
  )
}

// =============================================================================
// BIOLUMINESCENCE
// Duration: 170 seconds.
// 900 additive-blended particles pulse with cyan glow,
// then fade out like a dying light.
// =============================================================================

const BIO_COUNT    = 900
const BIO_DURATION = 170

const bioData = (() => {
  const rng = rngFrom(12345)
  const pos = new Float32Array(BIO_COUNT * 3)
  const phase = new Float32Array(BIO_COUNT)
  const freq  = new Float32Array(BIO_COUNT)
  for (let i = 0; i < BIO_COUNT; i++) {
    pos[i*3]   = (rng()-0.5) * 12
    pos[i*3+1] = (rng())     *  3.5 - 1.4
    pos[i*3+2] = (rng()-0.5) *  8
    phase[i]   = rng() * Math.PI * 2
    freq[i]    = 0.8 + rng() * 1.8   // 0.8–2.6 Hz
  }
  return { pos, phase, freq }
})()

function BioluminescenceEvent() {
  const pointsRef = useRef<THREE.Points>(null)
  const tRef      = useRef(0)

  useFrame((_, delta) => {
    tRef.current += delta
    const t = tRef.current
    const pts = pointsRef.current
    if (!pts) return

    if (t > BIO_DURATION) { pts.visible = false; return }
    pts.visible = true

    // Envelope: fade in 20s, active, fade out last 25s
    const fadeIn  = Math.min(1, t / 20)
    const fadeOut = Math.max(0, 1 - (t - (BIO_DURATION - 25)) / 25)
    const env = fadeIn * fadeOut

    const mat = pts.material as THREE.PointsMaterial
    // Base opacity oscillates for the whole cloud + individual phases handled by opacity
    mat.opacity = env * (0.55 + 0.25 * Math.sin(t * 0.4))

    // Slow drift: particles drift slightly in +Y (rising bioluminescent plankton)
    const posAttr = pts.geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array
    for (let i = 0; i < BIO_COUNT; i++) {
      arr[i*3+1] += delta * 0.012  // very slow upward drift
      if (arr[i*3+1] > 3.0) arr[i*3+1] = -1.4  // wrap to bottom
    }
    posAttr.needsUpdate = true
  })

  const positions = useMemo(() => {
    // Copy initial positions so drift doesn't carry over between mounts
    const arr = new Float32Array(bioData.pos.length)
    arr.set(bioData.pos)
    return arr
  }, [])

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#22ffcc"
        size={0.055}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

// =============================================================================
// TURTLE VISIT
// Duration: 200 seconds.
// Enters from right, swims to coral area (1, -0.8, -0.5),
// pauses 40 seconds, then swims out left.
// =============================================================================

const TURTLE_DURATION = 200

// Path waypoints
const TURTLE_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(  8, -0.3,  1.0),   // start off-screen right
  new THREE.Vector3(  4, -0.5,  0.5),   // entering
  new THREE.Vector3(  1, -0.8, -0.5),   // near coral (pause here)
  new THREE.Vector3( -3, -0.4,  0.2),   // leaving
  new THREE.Vector3( -8, -0.2,  1.2),   // off-screen left
])

// The turtle lingers at the coral position (t ≈ 0.4) for 40 seconds.
// We map wall-clock time → path-t with a pause plateau.
function turtlePathT(elapsed: number): number {
  const ENTER_DUR  = 55   // seconds to reach coral
  const PAUSE_DUR  = 40   // seconds hovering near coral
  const EXIT_DUR   = 80   // seconds to leave
  const PAUSE_T    = 0.40 // path-t at the pause point

  if (elapsed < ENTER_DUR) {
    // Approach: 0 → PAUSE_T
    return (elapsed / ENTER_DUR) * PAUSE_T
  } else if (elapsed < ENTER_DUR + PAUSE_DUR) {
    // Hovering: stay at PAUSE_T with tiny oscillation
    return PAUSE_T + Math.sin((elapsed - ENTER_DUR) * 0.3) * 0.005
  } else {
    // Depart: PAUSE_T → 1
    const e = elapsed - ENTER_DUR - PAUSE_DUR
    return PAUSE_T + (e / EXIT_DUR) * (1 - PAUSE_T)
  }
}

/** Build a simple turtle carapace (domed) */
function buildTurtleBodyGeo(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(0.22, 1)
  const posA = geo.attributes.position as THREE.BufferAttribute
  const arr = posA.array as Float32Array
  for (let i = 0; i < posA.count; i++) {
    arr[i*3+1] *= 0.52  // squash Y for dome shape
  }
  posA.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

const TURTLE_BODY_GEO = buildTurtleBodyGeo()

function TurtleVisitEvent() {
  const groupRef   = useRef<THREE.Group>(null)
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null)

  // Flipper refs for animation
  const flipFL = useRef<THREE.Mesh>(null) // front-left
  const flipFR = useRef<THREE.Mesh>(null)
  const flipRL = useRef<THREE.Mesh>(null) // rear-left
  const flipRR = useRef<THREE.Mesh>(null)

  const tRef = useRef(0)

  const bodyGeo = useMemo(() => buildTurtleBodyGeo(), [])
  useEffect(() => () => bodyGeo.dispose(), [bodyGeo])

  // Flipper geometry: thin irregular trapezoid
  const flipperGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array([
      0, 0, 0,
      0.28, 0.01, 0.06,
      0.26, -0.01, -0.12,
      0.04, 0, -0.10,
    ])
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setIndex([0,1,2, 0,2,3])
    g.computeVertexNormals()
    return g
  }, [])
  useEffect(() => () => flipperGeo.dispose(), [flipperGeo])

  useFrame((_, delta) => {
    tRef.current += delta
    const t = tRef.current
    const group = groupRef.current
    if (!group) return

    if (t > TURTLE_DURATION) { group.visible = false; return }
    group.visible = true

    // Fade envelope
    const fadeIn  = Math.min(1, t / 18)
    const fadeOut = Math.max(0, 1 - (t - (TURTLE_DURATION - 20)) / 20)
    const opacity = Math.min(fadeIn, fadeOut)
    if (bodyMatRef.current) bodyMatRef.current.opacity = opacity

    // Position along path
    const pathT = Math.min(1, turtlePathT(t))
    const pos   = TURTLE_CURVE.getPointAt(pathT)
    const ahead = TURTLE_CURVE.getPointAt(Math.min(1, pathT + 0.004))
    group.position.copy(pos)

    // Face direction of travel (smooth with lerp)
    _look.copy(ahead)
    group.lookAt(_look)

    // Gentle vertical breathing bob
    group.position.y += Math.sin(t * 0.8) * 0.018

    // Flipper paddling: front-left & rear-right in phase, front-right & rear-left offset by π
    const paddle = Math.sin(t * 2.0) * 0.38
    const isHovering = t > 55 && t < 95
    const flipAmp = isHovering ? 0.08 : 1.0  // barely move while pausing
    if (flipFL.current) flipFL.current.rotation.z =  paddle * flipAmp
    if (flipRR.current) flipRR.current.rotation.z =  paddle * flipAmp
    if (flipFR.current) flipFR.current.rotation.z = -paddle * flipAmp
    if (flipRL.current) flipRL.current.rotation.z = -paddle * flipAmp
  })

  const shellColor = '#5a6a40'
  const skinColor  = '#3a4a28'

  return (
    <group ref={groupRef}>
      {/* Carapace (shell) */}
      <mesh geometry={TURTLE_BODY_GEO} castShadow>
        <meshStandardMaterial
          ref={bodyMatRef}
          color={shellColor}
          roughness={0.80}
          metalness={0.05}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Plastron (underside lighter patch) */}
      <mesh position={[0, -0.09, 0]} rotation={[Math.PI/2, 0, 0]} scale={[0.16, 0.18, 1]}>
        <circleGeometry args={[1, 8]} />
        <meshStandardMaterial color="#8a9a60" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.01, 0.24]}>
        <sphereGeometry args={[0.072, 7, 6]} />
        <meshStandardMaterial color={skinColor} roughness={0.75} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0, 0.18]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.038, 0.044, 0.10, 6]} />
        <meshStandardMaterial color={skinColor} roughness={0.75} />
      </mesh>

      {/* Flippers — Front-left */}
      <mesh ref={flipFL} geometry={flipperGeo} position={[-0.16, 0, 0.06]} rotation={[0, -0.3, 0.2]}>
        <meshStandardMaterial color={skinColor} roughness={0.78} side={THREE.DoubleSide} />
      </mesh>
      {/* Front-right (mirrored) */}
      <mesh ref={flipFR} geometry={flipperGeo} position={[0.16, 0, 0.06]}
            rotation={[0, Math.PI + 0.3, 0.2]} scale={[-1, 1, 1]}>
        <meshStandardMaterial color={skinColor} roughness={0.78} side={THREE.DoubleSide} />
      </mesh>
      {/* Rear-left */}
      <mesh ref={flipRL} geometry={flipperGeo} position={[-0.14, 0, -0.12]}
            rotation={[0, -0.8, 0.15]} scale={[0.65, 0.65, 0.65]}>
        <meshStandardMaterial color={skinColor} roughness={0.78} side={THREE.DoubleSide} />
      </mesh>
      {/* Rear-right */}
      <mesh ref={flipRR} geometry={flipperGeo} position={[0.14, 0, -0.12]}
            rotation={[0, Math.PI + 0.8, 0.15]} scale={[-0.65, 0.65, 0.65]}>
        <meshStandardMaterial color={skinColor} roughness={0.78} side={THREE.DoubleSide} />
      </mesh>

      {/* Tail stub */}
      <mesh position={[0, -0.02, -0.22]} rotation={[-0.3, 0, 0]}>
        <coneGeometry args={[0.022, 0.08, 5]} />
        <meshStandardMaterial color={skinColor} roughness={0.75} />
      </mesh>
    </group>
  )
}

// =============================================================================
// SideQuestEvents — public export
// =============================================================================

export interface SideQuestEventsProps {
  /** The active event type, or null if none. */
  event: string | null
}

export default function SideQuestEvents({ event }: SideQuestEventsProps) {
  // Use a key that changes whenever a new event fires — forces a fresh mount
  // so the timer resets. The parent re-keys when activeSideQuestEvent.triggeredAt changes.
  if (!event) return null

  return (
    <>
      {event === 'manta_ray'       && <MantaRayEvent />}
      {event === 'bioluminescence' && <BioluminescenceEvent />}
      {event === 'turtle_visit'    && <TurtleVisitEvent />}
    </>
  )
}
