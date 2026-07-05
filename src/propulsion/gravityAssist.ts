import {
  EARTH_ORBIT_MS,
  JUPITER_ASSIST_MS,
  SATURN_ASSIST_MS,
  lyToMeters,
  secondsToYears,
} from "@/propulsion/constants";
import { rocketBurn } from "@/propulsion/rocket";
import type { MissionLeg, MissionOrigin, VesselConfig } from "@/mission/types";

export interface GravityAssistResult {
  cruiseSpeedMs: number;
  cruiseSpeedKms: number;
  coastSeconds: number;
  coastYears: number;
  legs: MissionLeg[];
  deltaVKms: number;
  fuelUsedKg: number;
  burnSeconds: number;
}

/**
 * Patched-conics approximation: Earth departure → Jupiter flyby → Saturn flyby
 * → optional nuclear burn → coast to destination.
 */
export function gravityAssistTrip(
  distanceLy: number,
  origin: MissionOrigin,
  vessel: VesselConfig,
): GravityAssistResult {
  const rocket = rocketBurn(vessel.dryMassKg, vessel.fuelMassKg, vessel.ispSeconds, vessel.thrustN, 0.6);

  const legs: MissionLeg[] = [];

  if (origin === "earth") {
    legs.push({
      label: "Earth departure",
      detail: "Launch to heliocentric trajectory",
      durationYears: 0.01,
    });
  } else {
    legs.push({
      label: "Solar departure",
      detail: "Begin from heliocentric frame near the Sun",
      durationYears: 0.001,
    });
  }

  legs.push({
    label: "Jupiter gravity assist",
    detail: `Flyby boost ≈ +${(JUPITER_ASSIST_MS / 1000).toFixed(1)} km/s`,
    deltaVKms: JUPITER_ASSIST_MS / 1000,
    durationYears: 1.5,
  });

  legs.push({
    label: "Saturn gravity assist",
    detail: `Flyby boost ≈ +${(SATURN_ASSIST_MS / 1000).toFixed(1)} km/s`,
    deltaVKms: SATURN_ASSIST_MS / 1000,
    durationYears: 3.5,
  });

  const baseV = origin === "earth" ? EARTH_ORBIT_MS : 0;
  const cruiseMs = baseV + JUPITER_ASSIST_MS + SATURN_ASSIST_MS + rocket.deltaVMs;

  if (rocket.deltaVMs > 0) {
    legs.push({
      label: "Nuclear burn",
      detail: `${rocket.deltaVKms.toFixed(1)} km/s from ${(rocket.fuelUsedKg / 1000).toFixed(1)} t propellant`,
      deltaVKms: rocket.deltaVKms,
      durationYears: secondsToYears(rocket.burnTimeSeconds),
    });
  }

  const distanceM = lyToMeters(distanceLy);
  const coastSeconds = distanceM / Math.max(cruiseMs, 1);
  const coastYears = secondsToYears(coastSeconds);

  legs.push({
    label: "Coast to destination",
    detail: `Ballistic cruise at ${(cruiseMs / 1000).toFixed(1)} km/s`,
    durationYears: coastYears,
  });

  return {
    cruiseSpeedMs: cruiseMs,
    cruiseSpeedKms: cruiseMs / 1000,
    coastSeconds,
    coastYears,
    legs,
    deltaVKms: JUPITER_ASSIST_MS / 1000 + SATURN_ASSIST_MS / 1000 + rocket.deltaVKms,
    fuelUsedKg: rocket.fuelUsedKg,
    burnSeconds: rocket.burnTimeSeconds,
  };
}