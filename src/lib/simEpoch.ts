/** J2000.0 epoch — Jan 1, 2000 12:00 TT (approximate). */
export const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
export const MS_PER_YEAR = 365.25 * 86400 * 1000;

/** Default sim-clock anchor when no birth date is set (~2026.5). */
export const DEFAULT_CLOCK_ANCHOR = 26.5;

/** Years since J2000.0 for an ISO calendar date. */
export function yearsSinceJ2000(isoDate: string): number {
  const d = new Date(`${isoDate}T12:00:00`);
  if (isNaN(d.getTime())) return DEFAULT_CLOCK_ANCHOR;
  return (d.getTime() - J2000_MS) / MS_PER_YEAR;
}

export interface EpochInput {
  birthDate?: string;
  lifeYears: number;
  scrubYears: number | null;
  clockYears: number;
  clockAnchor: number;
}

/**
 * Astronomical epoch (years past J2000) for heliocentric orbits and proper motion.
 * With a birth date: positions match the sky at birth + life age + play offset.
 * Without: legacy clock anchor + scrub delta.
 */
export function computeOrbitalEpoch(input: EpochInput): number {
  const { birthDate, lifeYears, scrubYears, clockYears, clockAnchor } = input;
  const playDelta = clockYears - clockAnchor;
  const age = scrubYears ?? lifeYears;

  if (birthDate) {
    return yearsSinceJ2000(birthDate) + age + playDelta;
  }

  const lifeDelta = scrubYears != null ? scrubYears - lifeYears : 0;
  return clockAnchor + playDelta + lifeDelta;
}