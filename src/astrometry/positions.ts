import { AU_PER_LY } from "@/data/solarSystem";
import { scaleDistanceAU } from "@/lib/orbital";

export type Vec3 = [number, number, number];

const DEG = Math.PI / 180;

/** Normalise a direction tuple to unit length. */
export function unitDirection(dir: Vec3): Vec3 {
  const len = Math.hypot(dir[0], dir[1], dir[2]);
  if (len < 1e-12) return [0, 0, 1];
  return [dir[0] / len, dir[1] / len, dir[2] / len];
}

/**
 * Convert equatorial RA (hours) and Dec (degrees) to a unit vector.
 * Axes match the scene: x, y = north (dec), z.
 */
export function raDecToUnitVector(raHours: number, decDeg: number): Vec3 {
  const ra = raHours * 15 * DEG;
  const dec = decDeg * DEG;
  const cosDec = Math.cos(dec);
  return unitDirection([cosDec * Math.cos(ra), Math.sin(dec), cosDec * Math.sin(ra)]);
}

/** Heliocentric position in light-years along a unit direction. */
export function heliocentricPositionLy(distanceLy: number, unitDir: Vec3): Vec3 {
  const [ux, uy, uz] = unitDirection(unitDir);
  return [ux * distanceLy, uy * distanceLy, uz * distanceLy];
}

/**
 * Map a star at distanceLy along unitDir to log-scaled scene coordinates.
 * Uses the same piecewise scale as the solar system (AU inside, ly beyond).
 */
export function starScenePosition(distanceLy: number, unitDir: Vec3): Vec3 {
  const [ux, uy, uz] = unitDirection(unitDir);
  const sceneR = scaleDistanceAU(distanceLy * AU_PER_LY);
  return [ux * sceneR, uy * sceneR, uz * sceneR];
}

/** Angular separation between two unit directions (radians). */
export function angularSeparation(a: Vec3, b: Vec3): number {
  const [ax, ay, az] = unitDirection(a);
  const [bx, by, bz] = unitDirection(b);
  const dot = Math.min(1, Math.max(-1, ax * bx + ay * by + az * bz));
  return Math.acos(dot);
}