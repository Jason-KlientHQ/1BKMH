import type { AccuracyMode } from "@/lib/accuracyMode";

/** Radians per real second for mesh spin at 1× sim speed (visual, not sim-clock). */
export function spinRateRadPerSec(periodDays: number, accuracyMode: AccuracyMode): number {
  const periodSec = visualSpinPeriodSec(periodDays, accuracyMode);
  if (periodSec <= 0) return 0;
  return (2 * Math.PI) / periodSec;
}

/** Pulsar / magnetar spin from period in seconds. */
export function pulsarSpinRateRadPerSec(periodSec: number): number {
  if (periodSec <= 0) return 0;
  return (2 * Math.PI) / periodSec;
}

/**
 * Map physical rotation period to a watchable real-time spin duration.
 * Educational: ~1 real second per sim day (compressed for multi-year giants).
 */
export function visualSpinPeriodSec(periodDays: number, accuracyMode: AccuracyMode): number {
  const days = Math.max(periodDays, 1e-9);
  if (accuracyMode === "educational") {
    if (days < 365) return days;
    return days / 24;
  }
  const logD = Math.log10(days);
  return Math.min(120, Math.max(8, 8 + (logD + 1) * 14));
}