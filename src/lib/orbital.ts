/**
 * Orbital mechanics + scale helpers for the solar-system view.
 *
 * Positions are computed from real Keplerian elements (J2000 epoch). The scene
 * is LOG-SCALED: relative ordering and ratios of distances/sizes are preserved
 * but compressed logarithmically so that bodies spanning ~10 orders of
 * magnitude (moons to the Oort cloud) all coexist in one zoomable scene.
 * Orbital PERIODS stay physically correct — inner bodies really do move faster
 * than outer ones (Kepler's third law), because each body advances by its true
 * mean motion 2π/period each unit of simulated time.
 *
 * Coordinate convention: astronomy works in the ecliptic plane with z out of
 * plane. We map to three.js as (x, z_ecliptic_out → y_up, y_ecliptic → z) so the
 * ecliptic is the horizontal XZ plane and inclinations lift bodies in Y.
 */

const DEG = Math.PI / 180;

export interface OrbitalElements {
  a: number; // semi-major axis (AU)
  e: number; // eccentricity
  i: number; // inclination to ecliptic (deg)
  node: number; // longitude of ascending node Ω (deg)
  peri: number; // longitude of perihelion ϖ (deg)
  L0: number; // mean longitude at epoch (deg)
  period: number; // sidereal orbital period (years)
}

/** Solve Kepler's equation M = E − e·sin E for the eccentric anomaly E (rad). */
export function solveKepler(M: number, e: number): number {
  // Normalise M to [-π, π] for fast, stable convergence.
  let m = M % (2 * Math.PI);
  if (m > Math.PI) m -= 2 * Math.PI;
  if (m < -Math.PI) m += 2 * Math.PI;
  let E = e < 0.8 ? m : Math.PI * Math.sign(m || 1);
  for (let k = 0; k < 12; k++) {
    const dE = (E - e * Math.sin(E) - m) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Heliocentric position in AU (ecliptic frame) at time `tYears` years past the
 * J2000 epoch. Full elliptical orbit with inclination, node and periapsis.
 */
export function heliocentricAU(el: OrbitalElements, tYears: number): Vec3 {
  const n = 360 / el.period; // mean motion, deg/yr
  const M = (el.L0 + n * tYears - el.peri) * DEG;
  const E = solveKepler(M, el.e);

  // Position in the orbital plane (perifocal), AU.
  const xv = el.a * (Math.cos(E) - el.e);
  const yv = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);

  const w = (el.peri - el.node) * DEG; // argument of periapsis
  const O = el.node * DEG;
  const inc = el.i * DEG;

  const cosO = Math.cos(O), sinO = Math.sin(O);
  const cosw = Math.cos(w), sinw = Math.sin(w);
  const cosi = Math.cos(inc), sini = Math.sin(inc);

  // Rotate perifocal → ecliptic.
  const xe = (cosO * cosw - sinO * sinw * cosi) * xv + (-cosO * sinw - sinO * cosw * cosi) * yv;
  const ye = (sinO * cosw + cosO * sinw * cosi) * xv + (-sinO * sinw + cosO * cosw * cosi) * yv;
  const ze = sinw * sini * xv + cosw * sini * yv;

  return { x: xe, y: ye, z: ze };
}

/* ----------------------------- Scale mapping ----------------------------- */

// Distance: AU → scene units, PIECEWISE.
//  • Inside the heliosphere (≤ AU_SWITCH): logarithmic, so the huge span from a
//    moon to Neptune stays explorable.
//  • Beyond it: LINEAR in light-years, so interstellar distances are truly
//    proportional — which makes the whole solar system collapse to a dot once
//    you zoom out to a light-journey of many light-years (as it should).
const DIST_C = 40;
const DIST_A0 = 0.1;
const AU_PER_LY = 63241.077;
const AU_SWITCH = 130; // just past the heliopause (~122 AU)
const R_SS = DIST_C * Math.log10(1 + AU_SWITCH / DIST_A0); // scene radius of the solar system (~124)
const LY_SWITCH = AU_SWITCH / AU_PER_LY;
const LY_UNIT = 60; // scene units per light-year in interstellar space

export function scaleDistanceAU(au: number): number {
  if (au <= AU_SWITCH) return DIST_C * Math.log10(1 + au / DIST_A0);
  const ly = au / AU_PER_LY;
  return R_SS + (ly - LY_SWITCH) * LY_UNIT;
}

// Body radius: km → scene units, log-compressed (Sun stays largest, small moons
// stay visible when zoomed in).
const SIZE_C = 1.45;
const SIZE_K0 = 200;
export function scaleRadiusKm(km: number): number {
  return Math.max(0.05, SIZE_C * Math.log10(1 + km / SIZE_K0));
}

/** Map an ecliptic-AU vector to a log-scaled three.js position (Y up). */
export function toScenePosition(au: Vec3): [number, number, number] {
  const r = Math.sqrt(au.x * au.x + au.y * au.y + au.z * au.z);
  if (r < 1e-9) return [0, 0, 0];
  const sr = scaleDistanceAU(r);
  const k = sr / r;
  // ecliptic (x, y, z_out) → three (x, z_out=up, y)
  return [au.x * k, au.z * k, au.y * k];
}

/** Sample a full orbit path as log-scaled three.js points for drawing the ring. */
export function orbitPath(el: OrbitalElements, segments = 256): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const w = (el.peri - el.node) * DEG;
  const O = el.node * DEG;
  const inc = el.i * DEG;
  const cosO = Math.cos(O), sinO = Math.sin(O);
  const cosw = Math.cos(w), sinw = Math.sin(w);
  const cosi = Math.cos(inc), sini = Math.sin(inc);
  for (let s = 0; s <= segments; s++) {
    const E = (s / segments) * 2 * Math.PI;
    const xv = el.a * (Math.cos(E) - el.e);
    const yv = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
    const xe = (cosO * cosw - sinO * sinw * cosi) * xv + (-cosO * sinw - sinO * cosw * cosi) * yv;
    const ye = (sinO * cosw + cosO * sinw * cosi) * xv + (-sinO * sinw + cosO * cosw * cosi) * yv;
    const ze = sinw * sini * xv + cosw * sini * yv;
    pts.push(toScenePosition({ x: xe, y: ye, z: ze }));
  }
  return pts;
}
