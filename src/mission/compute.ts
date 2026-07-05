import type { NavStar } from "@/mission/stars";
import type { MissionLeg, MissionOrigin, MissionResult, PropulsionMode, VesselConfig } from "@/mission/types";
import { PROPULSION_MODES } from "@/mission/types";
import { gravityAssistTrip } from "@/propulsion/gravityAssist";
import { lyToMeters, secondsToYears } from "@/propulsion/constants";
import { rocketBurn } from "@/propulsion/rocket";
import { solarSailTrip } from "@/propulsion/solarSail";
import { C_KMS } from "@/lib/constants";

export function formatDuration(years: number): string {
  if (!Number.isFinite(years) || years < 0) return "—";
  if (years < 1 / 365.25) return `${(years * 365.25 * 24).toFixed(0)} hours`;
  if (years < 1) return `${(years * 365.25).toFixed(0)} days`;
  if (years < 1000) return `${years.toFixed(1)} years`;
  if (years < 1_000_000) return `${(years / 1000).toFixed(1)} thousand years`;
  return `${(years / 1_000_000).toFixed(2)} million years`;
}

function result(
  distanceLy: number,
  etaYears: number,
  etaDetail: string,
  opts: Partial<MissionResult> & { speculative?: boolean },
): MissionResult {
  const warnings = opts.warnings ?? [];
  const feasible = opts.feasible ?? (Number.isFinite(etaYears) && etaYears < 1e8);
  if (!feasible && !warnings.length) warnings.push("Trip exceeds practical time limits for this propulsion.");

  return {
    distanceLy,
    etaYears,
    etaLabel: formatDuration(etaYears),
    etaDetail,
    deltaVKms: opts.deltaVKms ?? null,
    fuelUsedKg: opts.fuelUsedKg ?? null,
    cruiseSpeedKms: opts.cruiseSpeedKms ?? null,
    legs: opts.legs ?? [],
    feasible,
    speculative: opts.speculative ?? false,
    warnings,
  };
}

function nuclearTrip(distanceLy: number, vessel: VesselConfig): MissionResult {
  const burn = rocketBurn(vessel.dryMassKg, vessel.fuelMassKg, vessel.ispSeconds, vessel.thrustN);
  const cruiseMs = burn.deltaVMs;
  const cruiseKms = burn.deltaVKms;

  const distanceM = lyToMeters(distanceLy);
  const coastSeconds = cruiseMs > 0 ? distanceM / cruiseMs : Infinity;
  const coastYears = secondsToYears(coastSeconds);
  const burnYears = secondsToYears(burn.burnTimeSeconds);
  const etaYears = burnYears + coastYears;

  const warnings: string[] = [];
  if (cruiseKms < 1) warnings.push("Achievable cruise speed is below 1 km/s — interstellar trip impractical.");
  if (cruiseKms < 3000 && distanceLy > 0.1) warnings.push("Δv far below what's needed for rapid interstellar travel.");

  const legs: MissionLeg[] = [
    {
      label: "Nuclear burn",
      detail: `${cruiseKms.toFixed(1)} km/s Δv using ${(burn.fuelUsedKg / 1000).toFixed(2)} t propellant`,
      deltaVKms: cruiseKms,
      durationYears: burnYears,
    },
    {
      label: "Coast",
      detail: `Ballistic cruise at ${cruiseKms.toFixed(1)} km/s`,
      durationYears: coastYears,
    },
  ];

  return result(distanceLy, etaYears, `Nuclear thermal: Isp ${vessel.ispSeconds} s, thrust ${(vessel.thrustN / 1000).toFixed(0)} kN`, {
    deltaVKms: cruiseKms,
    fuelUsedKg: burn.fuelUsedKg,
    cruiseSpeedKms: cruiseKms,
    legs,
    warnings,
    feasible: Number.isFinite(etaYears) && etaYears < 1e7,
  });
}

export function computeMission(
  dest: NavStar | undefined,
  mode: PropulsionMode,
  vessel: VesselConfig,
  origin: MissionOrigin = "sun",
): MissionResult | null {
  if (!dest) return null;

  const distanceLy = dest.distanceLy;
  const meta = PROPULSION_MODES.find((m) => m.id === mode)!;

  switch (mode) {
    case "light_speed":
      return result(distanceLy, distanceLy, "At c, one light-year per year (physical upper bound)", {
        cruiseSpeedKms: C_KMS,
        legs: [{ label: "Direct", detail: "Straight-line at the speed of light", durationYears: distanceLy }],
      });

    case "sublight": {
      const f = Math.max(vessel.sublightFraction, 0.001);
      const years = distanceLy / f;
      return result(distanceLy, years, `Constant ${(f * 100).toFixed(1)}% c cruise (hypothetical)`, {
        cruiseSpeedKms: C_KMS * f,
        speculative: true,
        legs: [{ label: "Sublight cruise", detail: `Maintain ${(f * 100).toFixed(1)}% c`, durationYears: years }],
      });
    }

    case "alcubierre": {
      const w = Math.max(vessel.warpFactor, 0.1);
      const years = distanceLy / w;
      return result(distanceLy, years, `Warp factor ${w.toFixed(1)}× effective speed (speculative)`, {
        cruiseSpeedKms: C_KMS * w,
        speculative: true,
        legs: [{ label: "Warp transit", detail: `Alcubierre-style bubble at ×${w.toFixed(1)}`, durationYears: years }],
      });
    }

    case "nuclear":
      return nuclearTrip(distanceLy, vessel);

    case "solar_sail": {
      const startAu = origin === "earth" ? 1 : 0.05;
      const sail = solarSailTrip(distanceLy, vessel.sailAreaM2, vessel.dryMassKg, startAu);
      const warnings: string[] = [];
      if (sail.tripYears > 10_000) warnings.push("Sail trip exceeds 10,000 years at this sail area / mass.");

      return result(
        distanceLy,
        sail.tripYears,
        `Radiation pressure sail: ${vessel.sailAreaM2.toLocaleString("en-US")} m², ${vessel.dryMassKg.toLocaleString("en-US")} kg`,
        {
          cruiseSpeedKms: sail.arrivalSpeedKms,
          legs: [
            { label: "Solar sail acceleration", detail: `Peak thrust ${(sail.peakAccelerationMs2 * 1000).toFixed(2)} mm/s² at perihelion`, durationYears: sail.tripYears * 0.15 },
            { label: "Coast & deceleration", detail: `Arrival speed ${sail.arrivalSpeedKms.toFixed(1)} km/s`, durationYears: sail.tripYears * 0.85 },
          ],
          warnings,
          feasible: sail.tripYears < 1e6,
        },
      );
    }

    case "gravity_assist": {
      const ga = gravityAssistTrip(distanceLy, origin, vessel);
      const transferYears = ga.legs.slice(0, -1).reduce((s, l) => s + (l.durationYears ?? 0), 0);
      const etaYears = transferYears + ga.coastYears;

      const warnings: string[] = [];
      if (ga.cruiseSpeedKms < 30) warnings.push("Post-assist speed is low — coast phase dominates trip time.");
      if (etaYears > 100_000) warnings.push("Trip time exceeds 100,000 years even with assists.");

      return result(
        distanceLy,
        etaYears,
        "Jupiter + Saturn gravity assists, with optional nuclear burn",
        {
          deltaVKms: ga.deltaVKms,
          fuelUsedKg: ga.fuelUsedKg,
          cruiseSpeedKms: ga.cruiseSpeedKms,
          legs: ga.legs,
          warnings,
          feasible: etaYears < 1e7,
        },
      );
    }

    default:
      return result(distanceLy, 0, meta.label, { feasible: false, warnings: ["Unknown propulsion mode."] });
  }
}

/** @deprecated Use computeMission — kept for type compatibility during migration. */
export type MissionPreview = Pick<
  MissionResult,
  "distanceLy" | "etaLabel" | "etaDetail" | "speculative" | "feasible"
> & { ready: boolean };

export function missionPreview(
  dest: NavStar | undefined,
  mode: PropulsionMode,
  vessel: VesselConfig,
  origin: MissionOrigin = "sun",
): MissionPreview | null {
  const r = computeMission(dest, mode, vessel, origin);
  if (!r) return null;
  return {
    distanceLy: r.distanceLy,
    etaLabel: r.etaLabel,
    etaDetail: r.etaDetail,
    speculative: r.speculative,
    ready: true,
    feasible: r.feasible,
  };
}