import { AU_M, C_MS, L_SUN, lyToMeters, secondsToYears } from "@/propulsion/constants";

export interface SolarSailResult {
  tripSeconds: number;
  tripYears: number;
  peakAccelerationMs2: number;
  arrivalSpeedKms: number;
}

/**
 * Numerically integrate a perfect-reflector solar sail from the Sun outward.
 * a(r) = 2η × L☉ × A / (4π c r² m)
 */
export function solarSailTrip(
  distanceLy: number,
  sailAreaM2: number,
  massKg: number,
  startAu = 0.05,
  reflectivity = 0.9,
): SolarSailResult {
  const targetM = lyToMeters(distanceLy);
  let r = Math.max(startAu * AU_M, AU_M * 0.01);
  let v = 0;
  let t = 0;
  let peakA = 0;

  const dt = 3_600; // 1-hour steps
  const maxSeconds = 500 * 365.25 * 86_400; // 500 yr cap

  while (r < targetM && t < maxSeconds) {
    const flux = L_SUN / (4 * Math.PI * r * r);
    const a = (2 * reflectivity * flux * sailAreaM2) / (C_MS * massKg);
    peakA = Math.max(peakA, a);
    v += a * dt;
    r += v * dt;
    t += dt;
  }

  return {
    tripSeconds: t,
    tripYears: secondsToYears(t),
    peakAccelerationMs2: peakA,
    arrivalSpeedKms: v / 1000,
  };
}