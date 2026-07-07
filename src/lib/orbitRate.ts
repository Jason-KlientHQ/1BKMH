/** Must match SolarSystem BASE_YEARS_PER_SEC. */
export const SIM_YEARS_PER_SEC = 0.08;

export interface CinematicOrbitConfig {
  minSec: number;
  maxSec: number;
  logMinDays: number;
  logMaxDays: number;
}

export const MOON_CINEMATIC: CinematicOrbitConfig = {
  minSec: 12,
  maxSec: 52,
  logMinDays: 1.3,
  logMaxDays: 80,
};

export const EXO_CINEMATIC: CinematicOrbitConfig = {
  minSec: 14,
  maxSec: 54,
  logMinDays: 3,
  logMaxDays: 3000,
};

/**
 * Orbital angular rate (rad per sim-year) for moons, exoplanets, etc.
 * Cinematic: maps period to a watchable 12–54 s orbit at 1× sim speed.
 * True: real sidereal period in simulation years (same clock as planets).
 */
export function siderealOrbitRateRadPerYear(
  periodDays: number,
  truePeriods: boolean,
  cinematic: CinematicOrbitConfig = MOON_CINEMATIC,
): number {
  const absDays = Math.abs(periodDays);
  const dir = periodDays < 0 ? -1 : 1;

  if (truePeriods) {
    const periodYears = absDays / 365.25;
    return ((2 * Math.PI) / periodYears) * dir;
  }

  const norm = Math.min(
    Math.max(
      (Math.log(absDays) - Math.log(cinematic.logMinDays)) /
        (Math.log(cinematic.logMaxDays) - Math.log(cinematic.logMinDays)),
      0,
    ),
    1,
  );
  const displaySec = cinematic.minSec + norm * (cinematic.maxSec - cinematic.minSec);
  return ((2 * Math.PI) / (SIM_YEARS_PER_SEC * displaySec)) * dir;
}