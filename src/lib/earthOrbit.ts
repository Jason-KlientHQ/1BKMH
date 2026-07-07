import { heliocentricAU, scaleRadiusKm, toScenePosition } from "@/lib/orbital";
import { PLANETS, type Spacecraft } from "@/data/solarSystem";

const EARTH_RADIUS_KM = 6371;
/** Earth gravitational parameter (km³/s²). */
const MU_EARTH = 3.986004418e5;
/** Must match SolarSystem BASE_YEARS_PER_SEC — sim years advanced per real second at 1×. */
const SIM_YEARS_PER_SEC = 0.08;

export interface LeoElements {
  altKm: number;
  inclDeg: number;
  raanDeg: number;
  phaseAtEpoch: number;
}

/** Approximate LEO elements for Earth-orbiting craft (inclination from NASA ops). */
export function leoElementsFor(craft: Spacecraft, index: number): LeoElements {
  if (craft.name === "International Space Station") {
    return { altKm: craft.altKm ?? 417, inclDeg: 51.64, raanDeg: 0, phaseAtEpoch: 0 };
  }
  if (craft.name === "Hubble Space Telescope") {
    return { altKm: craft.altKm ?? 535, inclDeg: 28.47, raanDeg: 45, phaseAtEpoch: 1.2 };
  }
  return {
    altKm: craft.altKm ?? 400,
    inclDeg: craft.inclDeg ?? 51.6,
    raanDeg: index * 30,
    phaseAtEpoch: index * 0.8,
  };
}

/** Sidereal orbital period (years) for a circular LEO at `altKm`. */
export function leoPeriodYears(altKm: number): number {
  const rKm = EARTH_RADIUS_KM + altKm;
  const periodSec = 2 * Math.PI * Math.sqrt(rKm ** 3 / MU_EARTH);
  return periodSec / (365.25 * 86400);
}

/** True LEO period in seconds (for labels / educational mode). */
export function leoPeriodSeconds(altKm: number): number {
  return leoPeriodYears(altKm) * 365.25 * 86400;
}

/**
 * LEO angular rate (rad per sim-year of play time).
 * Uses play delta only — not the birth-tied astronomical epoch.
 * Cinematic mode: ~24–32 s per orbit at 1×; educational: ~75–95 s.
 */
export function leoOrbitRateRadPerSimYear(altKm: number, truePeriods: boolean): number {
  const trueSec = leoPeriodSeconds(altKm);
  const displaySec = truePeriods
    ? Math.min(trueSec / 60, 120) // ~1.5 min for ISS at 1×
    : 22 + Math.log(1 + altKm / 400) * 5; // ~24 s ISS, ~27 s Hubble
  return (2 * Math.PI) / (SIM_YEARS_PER_SEC * displaySec);
}

/** Geocentric offset in scene units for a craft in LEO. */
export function leoSceneOffset(
  craft: Spacecraft,
  index: number,
  playDeltaYears: number,
  earthSceneRadius: number,
  trueLeoPeriods = false,
): [number, number, number] {
  const el = leoElementsFor(craft, index);
  const rate = leoOrbitRateRadPerSimYear(el.altKm, trueLeoPeriods);
  const ang = el.phaseAtEpoch + playDeltaYears * rate;

  const localR = earthSceneRadius * (1.06 + el.altKm / 2500);
  const incl = (el.inclDeg * Math.PI) / 180;
  const raan = (el.raanDeg * Math.PI) / 180;

  const xOrb = Math.cos(ang) * localR;
  const zOrb = Math.sin(ang) * localR;
  const yOrb = Math.sin(incl) * Math.sin(ang) * localR * 0.55;

  const x = xOrb * Math.cos(raan) - zOrb * Math.sin(raan);
  const z = xOrb * Math.sin(raan) + zOrb * Math.cos(raan);
  return [x, yOrb, z];
}

/** Heliocentric scene position for an Earth-orbiting spacecraft. */
export function earthCraftScenePosition(
  craft: Spacecraft,
  index: number,
  orbitalYears: number,
  playDeltaYears: number,
  trueLeoPeriods = false,
): [number, number, number] {
  const earth = PLANETS.find((p) => p.name === "Earth")!;
  const [ex, ey, ez] = toScenePosition(heliocentricAU(earth, orbitalYears));
  const earthSize = scaleRadiusKm(earth.radiusKm);
  const [ox, oy, oz] = leoSceneOffset(craft, index, playDeltaYears, earthSize, trueLeoPeriods);
  return [ex + ox, ey + oy, ez + oz];
}