import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import CoralSystem from './CoralSystem'
import FishSystem from './FishSystem'
import SideQuestEvents from './SideQuestEvents'
import { fbm2D, fbm3D } from '../utils/noise'

export interface ReefSceneProps {
  coralHealth: number
  fishPopulation: number
  waterClarity: number
  activeSideQuestEvent: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lerpColor(a: string, b: string, t: number): string {
  const ca = new THREE.Color(a)
  const cb = new THREE.Color(b)
  ca.lerp(cb, t)
  return `#${ca.getHexString()}`
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// ---------------------------------------------------------------------------
// Camera waypoints
// ---------------------------------------------------------------------------

const WAYPOINTS: Array<{ position: THREE.Vector3; lookAt: THREE.Vector3 }> = [
  {
    position: new THREE.Vector3(0, 2, 6),
    lookAt: new THREE.Vector3(0, 0, 0),
  },
  {
    position: new THREE.Vector3(-4, 1.5, 4),
    lookAt: new THREE.Vector3(1, 0, 0),
  },
  {
    position: new THREE.Vector3(3, 3, 3),
    lookAt: new THREE.Vector3(-1, -0.5, 0),
  },
  {
    position: new THREE.Vector3(1, 1, 7),
    lookAt: new THREE.Vector3(0, 0.5, 0),
  },
]

// Each waypoint lasts ~60 seconds; total cycle ~240 s (4 min)
const WAYPOINT_DURATION = 60

// ---------------------------------------------------------------------------
// CameraRig
// ---------------------------------------------------------------------------

function CameraRig() {
  const { camera } = useThree()
  const timeRef = useRef(0)
  const currentPosRef = useRef(new THREE.Vector3(0, 2, 6))
  const currentLookRef = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((_, delta) => {
    timeRef.current += delta

    const totalTime = WAYPOINTS.length * WAYPOINT_DURATION
    const t = timeRef.current % totalTime

    const wpIndex = Math.floor(t / WAYPOINT_DURATION)
    const nextIndex = (wpIndex + 1) % WAYPOINTS.length
    const progress = (t % WAYPOINT_DURATION) / WAYPOINT_DURATION

    // Smooth step for less mechanical feel
    const smoothT = progress * progress * (3 - 2 * progress)

    const targetPos = new THREE.Vector3().lerpVectors(
      WAYPOINTS[wpIndex].position,
      WAYPOINTS[nextIndex].position,
      smoothT
    )
    const targetLook = new THREE.Vector3().lerpVectors(
      WAYPOINTS[wpIndex].lookAt,
      WAYPOINTS[nextIndex].lookAt,
      smoothT
    )

    // Very gentle lerp so camera floats, not snaps
    currentPosRef.current.lerp(targetPos, 0.01)
    currentLookRef.current.lerp(targetLook, 0.01)

    camera.position.copy(currentPosRef.current)
    camera.lookAt(currentLookRef.current)
  })

  return null
}

// ---------------------------------------------------------------------------
// Sediment particles
// ---------------------------------------------------------------------------

interface SedimentProps {
  waterClarity: number
  clarityRef: React.MutableRefObject<number>
}

function SedimentParticles({ clarityRef }: SedimentProps) {
  const COUNT = 1000
  const pointsRef = useRef<THREE.Points>(null)
  const timeRef = useRef(0)

  const { positions, offsets } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const off = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = Math.random() * 6 - 1
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      off[i] = Math.random() * Math.PI * 2
    }
    return { positions: pos, offsets: off }
  }, [])

  const originalY = useMemo(() => {
    const arr = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      arr[i] = positions[i * 3 + 1]
    }
    return arr
  }, [positions])

  useFrame((_, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    const clarity = clarityRef.current

    if (!pointsRef.current) return
    const geo = pointsRef.current.geometry
    const posAttr = geo.attributes.position as THREE.BufferAttribute
    const posArray = posAttr.array as Float32Array

    for (let i = 0; i < COUNT; i++) {
      const off = offsets[i]
      posArray[i * 3] += Math.sin(t * 0.3 + off) * 0.0003
      posArray[i * 3 + 1] =
        originalY[i] + Math.sin(t * 0.5 + off * 1.3) * 0.08
      posArray[i * 3 + 2] += Math.cos(t * 0.2 + off * 0.7) * 0.0002
    }
    posAttr.needsUpdate = true

    const mat = pointsRef.current.material as THREE.PointsMaterial
    // More particles visible when murky; invert clarity for opacity
    mat.opacity = lerp(0.6, 0.08, clarity)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#c8dde8"
        size={0.025}
        transparent
        opacity={0.3}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

// ---------------------------------------------------------------------------
// Caustic light dapples
// ---------------------------------------------------------------------------

interface CausticLightsProps {
  clarityRef: React.MutableRefObject<number>
}

function CausticLights({ clarityRef }: CausticLightsProps) {
  const light1Ref = useRef<THREE.PointLight>(null)
  const light2Ref = useRef<THREE.PointLight>(null)
  const light3Ref = useRef<THREE.PointLight>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    const clarity = clarityRef.current
    const baseIntensity = lerp(0, 1.5, clarity)

    if (light1Ref.current) {
      light1Ref.current.position.x = Math.sin(t * 0.4) * 2.5
      light1Ref.current.position.z = Math.cos(t * 0.3) * 2.0
      light1Ref.current.intensity =
        baseIntensity * (0.7 + 0.3 * Math.sin(t * 1.7 + 0.5))
    }
    if (light2Ref.current) {
      light2Ref.current.position.x = Math.cos(t * 0.35 + 1.2) * 3
      light2Ref.current.position.z = Math.sin(t * 0.45 + 2.1) * 2.5
      light2Ref.current.intensity =
        baseIntensity * (0.6 + 0.4 * Math.sin(t * 2.1 + 1.0))
    }
    if (light3Ref.current) {
      light3Ref.current.position.x = Math.sin(t * 0.28 + 3.0) * 2.0
      light3Ref.current.position.z = Math.cos(t * 0.52 + 0.8) * 1.8
      light3Ref.current.intensity =
        baseIntensity * (0.5 + 0.5 * Math.abs(Math.sin(t * 1.3 + 2.5)))
    }
  })

  return (
    <>
      <pointLight
        ref={light1Ref}
        position={[0, 0.3, 0]}
        color="#8dd8f0"
        intensity={1.0}
        distance={5}
        decay={2}
      />
      <pointLight
        ref={light2Ref}
        position={[2, 0.3, 1]}
        color="#70c8e8"
        intensity={0.8}
        distance={4}
        decay={2}
      />
      <pointLight
        ref={light3Ref}
        position={[-2, 0.3, -1]}
        color="#98e0f8"
        intensity={0.6}
        distance={4}
        decay={2}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// God rays
// ---------------------------------------------------------------------------

function GodRays() {
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  const rays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      x: lerp(-3, 3, i / 4),
      z: lerp(-2, 2, Math.sin(i * 1.3)),
      rotZ: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2,
    }))
  }, [])

  useFrame((_, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      const ray = rays[i]
      if (ray) {
        child.rotation.z = ray.rotZ + Math.sin(t * 0.15 + ray.phase) * 0.06
        child.rotation.x = Math.sin(t * 0.1 + ray.phase * 1.4) * 0.04
      }
    })
  })

  return (
    <group ref={groupRef}>
      {rays.map((ray, i) => (
        <mesh
          key={i}
          position={[ray.x, 7, ray.z]}
          rotation={[Math.PI, 0, ray.rotZ]}
        >
          {/* cone geometry: radiusTop, radiusBottom, height, segments */}
          <coneGeometry args={[0.3, 12, 6, 1, true]} />
          <meshBasicMaterial
            color="#c8eeff"
            transparent
            opacity={0.028}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Sea floor helpers
// ---------------------------------------------------------------------------

function seededRngFloor(seed: number): () => number {
  let s = (seed | 0) >>> 0
  return () => { s ^= s<<13; s ^= s>>17; s ^= s<<5; return (s>>>0)/0xffffffff }
}

/** 64×64 heightmap displaced by 3-octave FBM noise */
function buildFloorGeo(): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(14, 9, 64, 64)
  geo.rotateX(-Math.PI / 2)
  const posA = geo.attributes.position as THREE.BufferAttribute
  const arr  = posA.array as Float32Array
  for (let i = 0; i < posA.count; i++) {
    const x = arr[i*3], z = arr[i*3+2]
    arr[i*3+1] = fbm2D(x * 0.32, z * 0.32, 3) * 0.40 - 1.50
  }
  posA.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

/** Procedurally deformed icosphere rock */
function buildRockGeo(seed: number, scale: number): THREE.BufferGeometry {
  const rng = seededRngFloor(seed)
  const geo = new THREE.IcosahedronGeometry(scale, 2)
  const posA = geo.attributes.position as THREE.BufferAttribute
  const arr  = posA.array as Float32Array
  for (let i = 0; i < posA.count; i++) {
    const x = arr[i*3], y = arr[i*3+1], z = arr[i*3+2]
    const r = Math.sqrt(x*x+y*y+z*z) || 0.001
    const nx = x/r, ny = y/r, nz = z/r
    const d = fbm3D(nx*3+seed, ny*3, nz*3, 2) * 0.34 * scale + (rng()-0.5)*0.06*scale
    const squash = 1.0 - Math.max(0, ny) * 0.40
    arr[i*3]   = x + d*nx
    arr[i*3+1] = (y + d*ny) * squash
    arr[i*3+2] = z + d*nz
  }
  posA.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

const FLOOR_GEO = buildFloorGeo()

const ROCK_DATA = [
  { x:-3.1, z:-1.0, seed:10, scale:0.52 }, { x:-2.2, z:-0.8, seed:20, scale:0.32 },
  { x:-3.6, z:-0.3, seed:30, scale:0.28 }, { x: 2.6, z: 0.5, seed:40, scale:0.60 },
  { x: 1.9, z: 0.9, seed:50, scale:0.38 }, { x: 3.1, z:-0.4, seed:60, scale:0.30 },
  { x: 0.5, z:-2.6, seed:70, scale:0.44 }, { x: 0.9, z:-2.1, seed:80, scale:0.50 },
  { x:-0.8, z: 2.2, seed:90, scale:0.36 }, { x: 1.5, z: 2.5, seed:100,scale:0.26 },
]
const ROCK_GEOS = ROCK_DATA.map(r => buildRockGeo(r.seed, r.scale))

// ---------------------------------------------------------------------------
// Sea grass — instanced thin cones, vertex-shader wave animation
// ---------------------------------------------------------------------------

const GRASS_COUNT = 300

function SeaGrass({ healthRef }: { healthRef: React.MutableRefObject<number> }) {
  const meshRef  = useRef<THREE.InstancedMesh>(null)
  const tmpColor = useMemo(() => new THREE.Color(), [])
  const uTime    = useRef({ value: 0 })

  const grassMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color:     new THREE.Color('#4a8c30'),
      roughness: 0.88,
      side:      THREE.DoubleSide,
    })
    const ut = uTime.current
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = ut
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>\nuniform float uTime;`,
      )
      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        `// Sea grass wave — amplitude grows toward tip (uv.y → 1)
        float tipFactor = uv.y * uv.y;
        #ifdef USE_INSTANCING
          float wPhase = instanceMatrix[3].x * 3.0 + instanceMatrix[3].z * 2.0;
        #else
          float wPhase = position.x * 3.0 + position.z * 2.0;
        #endif
        transformed.x += sin(uTime * 1.8 + wPhase)        * 0.15 * tipFactor;
        transformed.z += cos(uTime * 1.4 + wPhase * 0.7)  * 0.08 * tipFactor;

        #include <project_vertex>`,
      )
    }
    return m
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const placements = useMemo(() => {
    const rng = seededRngFloor(9999)
    return Array.from({ length: GRASS_COUNT }, () => ({
      x: (rng()-0.5)*12, z: (rng()-0.5)*8,
      rotY: rng()*Math.PI*2,
      lean: rng()*0.16,
      scale: 0.45 + rng()*0.80,
    }))
  }, [])

  useEffect(() => {
    if (!meshRef.current) return
    const mat4 = new THREE.Matrix4()
    const pos  = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const scl  = new THREE.Vector3()
    const euler = new THREE.Euler()
    placements.forEach((p, i) => {
      pos.set(p.x, fbm2D(p.x*0.32, p.z*0.32, 3)*0.40 - 1.50, p.z)
      euler.set(p.lean, p.rotY, 0)
      quat.setFromEuler(euler)
      scl.setScalar(p.scale)
      mat4.compose(pos, quat, scl)
      meshRef.current!.setMatrixAt(i, mat4)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [placements])

  useFrame((_, delta) => {
    uTime.current.value += delta
    tmpColor.lerpColors(
      new THREE.Color('#8a7040'),
      new THREE.Color('#4a8c30'),
      Math.max(0, healthRef.current),
    )
    grassMat.color.copy(tmpColor)
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, GRASS_COUNT]} material={grassMat} castShadow>
      <coneGeometry args={[0.026, 0.34, 5, 4]} />
    </instancedMesh>
  )
}

// ---------------------------------------------------------------------------
// Sea floor
// ---------------------------------------------------------------------------

function SeaFloor({ healthRef }: { healthRef: React.MutableRefObject<number> }) {
  return (
    <group>
      {/* Noise-displaced 64×64 heightmap */}
      <mesh geometry={FLOOR_GEO} receiveShadow>
        <meshStandardMaterial color="#c0a070" roughness={0.94} metalness={0.0} />
      </mesh>

      {/* Procedurally deformed rocks */}
      {ROCK_DATA.map((r, i) => (
        <mesh
          key={r.seed}
          geometry={ROCK_GEOS[i]}
          position={[r.x, fbm2D(r.x*0.32, r.z*0.32, 3)*0.40 - 1.50 + r.scale*0.42, r.z]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#3a3530" roughness={0.95} metalness={0.05} />
        </mesh>
      ))}

      {/* Sea grass with vertex-shader wave */}
      <SeaGrass healthRef={healthRef} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Scene environment updater — drives fog + background from waterClarity
// ---------------------------------------------------------------------------

interface EnvironmentUpdaterProps {
  clarityRef: React.MutableRefObject<number>
}

function EnvironmentUpdater({ clarityRef }: EnvironmentUpdaterProps) {
  const { scene } = useThree()
  const fogRef      = useRef<THREE.FogExp2 | null>(null)
  const breathRef   = useRef(0)

  // Attach fog once
  useMemo(() => {
    const fog = new THREE.FogExp2('#1a4a5c', 0.12)
    scene.fog = fog
    fogRef.current = fog
    scene.background = new THREE.Color('#0d3d5c')
  }, [scene])

  useFrame((_, delta) => {
    breathRef.current += delta
    // Very slow fog breath — ±0.008 density, period ~35s
    const breathFog = Math.sin(breathRef.current * 0.18) * 0.008

    const clarity = clarityRef.current

    // Fog: density 0.08 (clear) → 0.55 (murky), plus gentle breathing
    if (fogRef.current) {
      fogRef.current.density = lerp(0.55, 0.08, clarity) + breathFog
      const fogColor = lerpColor('#2a3a35', '#1a4a5c', clarity)
      fogRef.current.color.set(fogColor)
    }

    // Background color
    const bgColor = lerpColor('#1a2e28', '#0d3d5c', clarity)
    scene.background = (scene.background as THREE.Color).set(bgColor)
  })

  return null
}

// ---------------------------------------------------------------------------
// Directional light wrapper (needs to update per-frame from clarityRef)
// ---------------------------------------------------------------------------

function DirLight({ clarityRef }: { clarityRef: React.MutableRefObject<number> }) {
  const lightRef  = useRef<THREE.DirectionalLight>(null)
  const breathRef = useRef(Math.random() * Math.PI * 2) // random phase offset

  useFrame((_, delta) => {
    breathRef.current += delta
    // Light intensity breath — ±0.08, period ~28s, offset from fog breath
    const breathLight = Math.sin(breathRef.current * 0.22 + 1.0) * 0.08
    if (lightRef.current) {
      lightRef.current.intensity = lerp(0, 1.8, clarityRef.current) + breathLight
    }
  })

  return (
    <directionalLight
      ref={lightRef}
      position={[5, 15, 5]}
      color="#b8e0f0"
      intensity={1.2}
      castShadow
    />
  )
}

// ---------------------------------------------------------------------------
// Main ReefScene
// ---------------------------------------------------------------------------

export default function ReefScene({
  waterClarity,
  coralHealth,
  fishPopulation,
  activeSideQuestEvent,
}: ReefSceneProps) {
  // Use refs so useFrame closures always read the latest smoothed value
  // without triggering re-renders
  const clarityRef = useRef(waterClarity)
  const targetClarityRef = useRef(waterClarity)
  const healthRef = useRef(coralHealth)
  const targetHealthRef = useRef(coralHealth)
  const populationRef = useRef(fishPopulation)
  const targetPopulationRef = useRef(fishPopulation)

  // Keep targets up to date when props change
  targetClarityRef.current = waterClarity
  targetHealthRef.current = coralHealth
  targetPopulationRef.current = fishPopulation

  // Smooth lerp toward targets each frame.
  // 0.015/frame → converges in ~3-5 s, fast enough to track the context's
  // 30-second drift without adding its own perceptible lag.
  useFrame(() => {
    clarityRef.current    = lerp(clarityRef.current,    targetClarityRef.current,    0.015)
    healthRef.current     = lerp(healthRef.current,     targetHealthRef.current,     0.015)
    populationRef.current = lerp(populationRef.current, targetPopulationRef.current, 0.015)
  })

  return (
    <>
      {/* Environment fog + background */}
      <EnvironmentUpdater clarityRef={clarityRef} />

      {/* Camera */}
      <CameraRig />

      {/* Lighting */}
      <ambientLight color="#1a3a4a" intensity={0.4} />
      <DirLight clarityRef={clarityRef} />

      {/* Scattered low point lights for scatter/fill */}
      <pointLight position={[-5, 0, -3]} color="#1a6080" intensity={0.5} distance={8} decay={2} />
      <pointLight position={[5, 0.5, 2]} color="#0d5068" intensity={0.4} distance={7} decay={2} />

      {/* Caustic animated dapples on floor */}
      <CausticLights clarityRef={clarityRef} />

      {/* God rays */}
      <GodRays />

      {/* Geometry */}
      <SeaFloor healthRef={healthRef} />

      {/* Sediment */}
      <SedimentParticles waterClarity={waterClarity} clarityRef={clarityRef} />

      {/* Coral ecosystem */}
      <CoralSystem healthRef={healthRef} />

      {/* Fish */}
      <FishSystem populationRef={populationRef} />

      {/* Side quest visual events */}
      <SideQuestEvents event={activeSideQuestEvent} />
    </>
  )
}
