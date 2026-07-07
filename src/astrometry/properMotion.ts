import { resolveProperMotion } from "@/data/properMotion";
import {
  raDecToUnitVector,
  starScenePosition,
  unitDirection,
  type Vec3,
} from "@/astrometry/positions";
import { computeOrbitalEpoch, DEFAULT_CLOCK_ANCHOR, type EpochInput } from "@/lib/simEpoch";

const DEG = Math.PI / 180;
const MAS_TO_DEG = 1 / (3600 * 1000);

/** Convert a unit direction to equatorial RA (hours) and Dec (degrees). */
export function unitDirToRaDec(dir: Vec3): { raHours: number; decDeg: number } {
  const [x, y, z] = unitDirection(dir);
  const decRad = Math.asin(Math.max(-1, Math.min(1, y)));
  const raRad = Math.atan2(z, x);
  return {
    raHours: raRad / DEG / 15,
    decDeg: decRad / DEG,
  };
}

/**
 * Apply proper motion (mas/yr) for `yearsFromJ2000` years to a J2000 direction.
 * Returns a new unit direction.
 */
export function applyProperMotion(
  baseDir: Vec3,
  pmRaMas: number,
  pmDecMas: number,
  yearsFromJ2000: number,
): Vec3 {
  if (!yearsFromJ2000 || (pmRaMas === 0 && pmDecMas === 0)) {
    return unitDirection(baseDir);
  }

  const { raHours, decDeg } = unitDirToRaDec(baseDir);
  const decRad = decDeg * DEG;
  const cosDec = Math.cos(decRad);
  const dRaHours =
    ((pmRaMas / Math.max(Math.abs(cosDec), 1e-4)) * yearsFromJ2000 * MAS_TO_DEG) / 15;
  const dDecDeg = pmDecMas * yearsFromJ2000 * MAS_TO_DEG;

  return raDecToUnitVector(raHours + dRaHours, decDeg + dDecDeg);
}

/** Star unit direction at astronomical epoch `yearsFromJ2000` (J2000.0 = 0). */
export function starUnitDirAtEpoch(baseDir: Vec3, name: string, yearsFromJ2000: number): Vec3 {
  const pm = resolveProperMotion(name);
  if (!pm) return unitDirection(baseDir);
  return applyProperMotion(baseDir, pm.ra, pm.dec, yearsFromJ2000);
}

/**
 * Years since J2000.0 for stellar proper motion.
 * Aligned with heliocentric orbital epoch (birth-tied when available).
 */
export function starEpochYears(
  clockYears: number,
  scrubYears: number | null,
  lifeYears: number,
  birthDate?: string,
  clockAnchor = DEFAULT_CLOCK_ANCHOR,
): number {
  const input: EpochInput = { birthDate, lifeYears, scrubYears, clockYears, clockAnchor };
  return computeOrbitalEpoch(input);
}

/** Log-scaled scene position with proper motion at `yearsFromJ2000`. */
export function starScenePositionAtEpoch(
  distanceLy: number,
  baseDir: Vec3,
  name: string,
  yearsFromJ2000: number,
): Vec3 {
  const dir = starUnitDirAtEpoch(baseDir, name, yearsFromJ2000);
  return starScenePosition(distanceLy, dir);
}