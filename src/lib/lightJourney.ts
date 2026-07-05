import { SECONDS_PER_ORBIT } from "@/lib/constants";

export interface LightJourneyResult {
  years: number;
  orbitsPerYear: number;
  totalOrbits: number;
  lightYears: number;
}

export interface StarDistance {
  name: string;
  distance: number;
}

const BIRTHDAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Compute age-based light journey from an ISO date string (YYYY-MM-DD). */
export function computeLightJourney(
  birthStr: string,
  leap: boolean,
  now: Date = new Date(),
): LightJourneyResult | null {
  if (!birthStr) return null;
  const birth = new Date(birthStr);
  if (Number.isNaN(birth.getTime()) || birth > now) return null;

  const ageSeconds = (now.getTime() - birth.getTime()) / 1000;
  const daysPerYear = leap ? 365.25 : 365;
  const secPerYear = daysPerYear * 86400;
  const years = ageSeconds / secPerYear;
  const orbitsPerYear = secPerYear / SECONDS_PER_ORBIT;
  const totalOrbits = ageSeconds / SECONDS_PER_ORBIT;

  return { years, orbitsPerYear, totalOrbits, lightYears: years };
}

export function parseBirthdayParam(value: string | null): string | null {
  return value && BIRTHDAY_RE.test(value) ? value : null;
}

/** Parse leap-year flag from URL (`leap=0` / `leap=false` → off). Default: on. */
export function parseLeapParam(value: string | null): boolean {
  if (value === null) return true;
  return value !== "0" && value !== "false";
}

/** Build a shareable query string for the current journey. */
export function buildShareQuery(bday: string, useLeap: boolean): string {
  const params = new URLSearchParams({ b: bday });
  if (!useLeap) params.set("leap", "0");
  return `?${params.toString()}`;
}

export function starsReached<T extends StarDistance>(stars: T[], lightYears: number): T[] {
  return stars.filter((s) => s.distance <= lightYears);
}

export function nextStar<T extends StarDistance>(stars: T[], lightYears: number): T | undefined {
  return stars.find((s) => s.distance > lightYears);
}