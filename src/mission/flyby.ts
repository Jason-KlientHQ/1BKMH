import type { Vec3 } from "@/astrometry/positions";

export function len3(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

export function add3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function sub3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function scale3(v: Vec3, k: number): Vec3 {
  return [v[0] * k, v[1] * k, v[2] * k];
}

export function dot3(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cross3(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function normalize3(v: Vec3, fallback: Vec3 = [0, 1, 0]): Vec3 {
  const l = len3(v);
  if (l < 1e-9) return fallback;
  return scale3(v, 1 / l);
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

function cubicBezier(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return [
    uu * u * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + tt * t * p3[0],
    uu * u * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + tt * t * p3[1],
    uu * u * p0[2] + 3 * uu * t * p1[2] + 3 * u * tt * p2[2] + tt * t * p3[2],
  ];
}

function sampleBezier(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, samples: number): Vec3[] {
  const n = Math.max(2, samples);
  const pts: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    pts.push(cubicBezier(p0, p1, p2, p3, i / (n - 1)));
  }
  return pts;
}

/** Gentle ballistic transfer — slight bow for visual interest. */
export function transferArc(from: Vec3, to: Vec3, samples: number): Vec3[] {
  const delta = sub3(to, from);
  const dist = len3(delta);
  if (dist < 1e-6) return [from, to];

  const dir = scale3(delta, 1 / dist);
  const mid = add3(from, scale3(delta, 0.5));
  const up = Math.abs(dir[1]) < 0.9 ? [0, 1, 0] as Vec3 : [1, 0, 0];
  const lateral = normalize3(cross3(dir, up));
  const bow = scale3(lateral, dist * 0.06);
  const control = add3(mid, bow);

  return sampleBezier(from, add3(from, scale3(delta, 0.33)), add3(control, scale3(delta, 0.08)), to, samples);
}

/**
 * Hyperbola-style gravity-assist arc swinging around a planet.
 * `clearance` is the closest-approach offset in scene units.
 */
export function flybyArc(from: Vec3, planet: Vec3, to: Vec3, samples: number, clearance: number): Vec3[] {
  const inbound = sub3(planet, from);
  const outbound = sub3(to, planet);
  const inDist = len3(inbound);
  const outDist = len3(outbound);
  if (inDist < 1e-6 || outDist < 1e-6) return transferArc(from, to, samples);

  const inDir = scale3(inbound, 1 / inDist);
  const outDir = scale3(outbound, 1 / outDist);

  let normal = cross3(inDir, outDir);
  if (len3(normal) < 1e-6) normal = normalize3(cross3(inDir, [0, 1, 0]));
  else normal = normalize3(normal);

  const turn = Math.acos(clamp(dot3(scale3(inDir, -1), outDir), -1, 1));
  const swing = clearance * (0.85 + turn / Math.PI);

  const approach = add3(planet, scale3(inDir, -clearance * 2.2));
  const periapsis = add3(planet, scale3(normal, swing));
  const exit = add3(planet, scale3(outDir, clearance * 1.8));
  const end = add3(exit, scale3(outDir, Math.min(outDist * 0.2, clearance * 4)));

  // Two chained beziers: inbound leg → periapsis → outbound leg.
  const leg1 = sampleBezier(from, approach, periapsis, exit, Math.ceil(samples * 0.55));
  const leg2 = sampleBezier(exit, add3(periapsis, scale3(outDir, clearance * 0.4)), exit, end, Math.ceil(samples * 0.45));

  const merged = [...leg1];
  for (let i = 1; i < leg2.length; i++) merged.push(leg2[i]);
  return merged;
}

/** Distance from point P to the infinite line through A→B. */
export function distanceToLine(p: Vec3, a: Vec3, b: Vec3): number {
  const ab = sub3(b, a);
  const ap = sub3(p, a);
  const abLen = len3(ab);
  if (abLen < 1e-9) return len3(ap);
  const t = clamp(dot3(ap, ab) / (abLen * abLen), 0, 1);
  const closest = add3(a, scale3(ab, t));
  return len3(sub3(p, closest));
}