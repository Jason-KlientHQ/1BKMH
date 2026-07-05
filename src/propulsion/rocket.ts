import { G0 } from "@/propulsion/constants";

export interface RocketBurnResult {
  deltaVMs: number;
  deltaVKms: number;
  fuelUsedKg: number;
  burnTimeSeconds: number;
  wetMassKg: number;
  dryMassKg: number;
}

/** Tsiolkovsky rocket equation — total Δv from a single burn. */
export function rocketDeltaV(ispSeconds: number, wetMassKg: number, dryMassKg: number): number {
  if (wetMassKg <= dryMassKg || dryMassKg <= 0) return 0;
  return ispSeconds * G0 * Math.log(wetMassKg / dryMassKg);
}

/** Fuel consumed to deliver a target Δv (iterative single-stage). */
export function rocketBurn(
  dryMassKg: number,
  fuelMassKg: number,
  ispSeconds: number,
  thrustN: number,
  useFraction = 1,
): RocketBurnResult {
  const fuelUsed = fuelMassKg * Math.min(1, Math.max(0, useFraction));
  const wet = dryMassKg + fuelUsed;
  const dv = rocketDeltaV(ispSeconds, wet, dryMassKg);
  const burnTime = thrustN > 0 ? (dv * wet) / thrustN : 0;

  return {
    deltaVMs: dv,
    deltaVKms: dv / 1000,
    fuelUsedKg: fuelUsed,
    burnTimeSeconds: burnTime,
    wetMassKg: wet,
    dryMassKg,
  };
}