/**
 * Simplex noise — 2D and 3D.
 * Based on Stefan Gustavson's public-domain implementation (2012).
 * Returns values in approximately [-1, 1].
 */

// ── Skewing / unskewing factors ───────────────────────────────────────────────
const F2 = 0.5 * (Math.sqrt(3) - 1)
const G2 = (3 - Math.sqrt(3)) / 6
const F3 = 1 / 3
const G3 = 1 / 6

// 2D gradient table: 8 unit vectors in the XY plane
const GRAD2 = new Float32Array([
   1,  1,  -1,  1,   1, -1,  -1, -1,
   1,  0,  -1,  0,   0,  1,   0, -1,
])

// 3D gradient table: 12 midpoints of cube edges
const GRAD3 = new Float32Array([
   1,  1,  0,  -1,  1,  0,   1, -1,  0,  -1, -1,  0,
   1,  0,  1,  -1,  0,  1,   1,  0, -1,  -1,  0, -1,
   0,  1,  1,   0, -1,  1,   0,  1, -1,   0, -1, -1,
])

// ── Permutation table (deterministic, seed = 31337) ───────────────────────────
const PERM: Uint8Array = (() => {
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  let s = 31337
  const rng = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0x100000000 }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = p[i]; p[i] = p[j]; p[j] = tmp
  }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
  return perm
})()

// ── 2D simplex noise ──────────────────────────────────────────────────────────
export function noise2D(x: number, y: number): number {
  const s  = (x + y) * F2
  const i  = Math.floor(x + s)
  const j  = Math.floor(y + s)
  const t  = (i + j) * G2
  const x0 = x - (i - t)
  const y0 = y - (j - t)

  const i1 = x0 > y0 ? 1 : 0
  const j1 = x0 > y0 ? 0 : 1

  const x1 = x0 - i1 + G2,     y1 = y0 - j1 + G2
  const x2 = x0 - 1 + 2 * G2,  y2 = y0 - 1 + 2 * G2

  const ii = i & 255, jj = j & 255
  const gi0 = (PERM[ii +      PERM[jj     ]] & 7) << 1
  const gi1 = (PERM[ii + i1 + PERM[jj + j1]] & 7) << 1
  const gi2 = (PERM[ii + 1  + PERM[jj + 1 ]] & 7) << 1

  const c2D = (g: number, dx: number, dy: number) => {
    let t = 0.5 - dx * dx - dy * dy
    if (t < 0) return 0
    t *= t
    return t * t * (GRAD2[g] * dx + GRAD2[g + 1] * dy)
  }

  return 70 * (c2D(gi0, x0, y0) + c2D(gi1, x1, y1) + c2D(gi2, x2, y2))
}

// ── 3D simplex noise ──────────────────────────────────────────────────────────
export function noise3D(x: number, y: number, z: number): number {
  const s  = (x + y + z) * F3
  const i  = Math.floor(x + s)
  const j  = Math.floor(y + s)
  const k  = Math.floor(z + s)
  const t  = (i + j + k) * G3
  const x0 = x - (i - t), y0 = y - (j - t), z0 = z - (k - t)

  let i1, j1, k1, i2, j2, k2
  if (x0 >= y0) {
    if      (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0 }
    else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1 }
    else               { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1 }
  } else {
    if      (y0 <  z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1 }
    else if (x0 <  z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1 }
    else               { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0 }
  }

  const x1=x0-i1+G3, y1=y0-j1+G3, z1=z0-k1+G3
  const x2=x0-i2+2*G3, y2=y0-j2+2*G3, z2=z0-k2+2*G3
  const x3=x0-1+3*G3, y3=y0-1+3*G3, z3=z0-1+3*G3

  const ii=i&255, jj=j&255, kk=k&255
  const gi0 = PERM[ii+    PERM[jj+    PERM[kk   ]]] % 12
  const gi1 = PERM[ii+i1+ PERM[jj+j1+ PERM[kk+k1]]] % 12
  const gi2 = PERM[ii+i2+ PERM[jj+j2+ PERM[kk+k2]]] % 12
  const gi3 = PERM[ii+1+  PERM[jj+1+  PERM[kk+1 ]]] % 12

  const c3D = (g: number, dx: number, dy: number, dz: number) => {
    let t = 0.6 - dx*dx - dy*dy - dz*dz
    if (t < 0) return 0
    t *= t
    const b = g * 3
    return t * t * (GRAD3[b]*dx + GRAD3[b+1]*dy + GRAD3[b+2]*dz)
  }

  return 32 * (
    c3D(gi0,x0,y0,z0) + c3D(gi1,x1,y1,z1) +
    c3D(gi2,x2,y2,z2) + c3D(gi3,x3,y3,z3)
  )
}

// ── Fractional Brownian Motion ────────────────────────────────────────────────
export function fbm2D(
  x: number, y: number,
  octaves = 4, lacunarity = 2.0, gain = 0.5,
): number {
  let v = 0, a = 1, f = 1, max = 0
  for (let i = 0; i < octaves; i++) {
    v += noise2D(x * f, y * f) * a
    max += a; a *= gain; f *= lacunarity
  }
  return v / max
}

export function fbm3D(
  x: number, y: number, z: number,
  octaves = 3, lacunarity = 2.0, gain = 0.5,
): number {
  let v = 0, a = 1, f = 1, max = 0
  for (let i = 0; i < octaves; i++) {
    v += noise3D(x * f, y * f, z * f) * a
    max += a; a *= gain; f *= lacunarity
  }
  return v / max
}
