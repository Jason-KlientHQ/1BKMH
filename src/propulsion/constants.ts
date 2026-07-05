import { AU_KM, C_KMS, KM_PER_LY, SEC_PER_YEAR } from "@/lib/constants";

export const G0 = 9.806_65; // m/s²
export const C_MS = C_KMS * 1000;
export const LY_M = KM_PER_LY * 1000;
export const AU_M = AU_KM * 1000;
export const SEC_PER_DAY = 86_400;

/** Solar luminosity (W). */
export const L_SUN = 3.828e26;

/** Typical maximum gravity-assist boosts (m/s), heliocentric frame. */
export const JUPITER_ASSIST_MS = 9_200;
export const SATURN_ASSIST_MS = 4_800;

/** Earth orbital speed around the Sun (m/s). */
export const EARTH_ORBIT_MS = 29_780;

export function lyToMeters(ly: number): number {
  return ly * LY_M;
}

export function yearsToSeconds(years: number): number {
  return years * SEC_PER_YEAR;
}

export function secondsToYears(seconds: number): number {
  return seconds / SEC_PER_YEAR;
}

export function msToKms(ms: number): number {
  return ms / 1000;
}