export type MissionOrigin = "sun" | "earth";

export type PropulsionMode =
  | "gravity_assist"
  | "light_speed"
  | "sublight"
  | "nuclear"
  | "solar_sail"
  | "alcubierre";

export interface VesselConfig {
  dryMassKg: number;
  fuelMassKg: number;
  ispSeconds: number;
  thrustN: number;
  sailAreaM2: number;
  /** Fraction of c for sublight mode (0.1 = 10% c). */
  sublightFraction: number;
  /** Speculative warp factor for Alcubierre mode. */
  warpFactor: number;
}

export const DEFAULT_VESSEL: VesselConfig = {
  dryMassKg: 1000,
  fuelMassKg: 5000,
  ispSeconds: 900,
  thrustN: 100_000,
  sailAreaM2: 10_000,
  sublightFraction: 0.1,
  warpFactor: 2,
};

export interface MissionState {
  origin: MissionOrigin;
  destination: string | null;
  mode: PropulsionMode;
  vessel: VesselConfig;
}

export interface MissionLeg {
  label: string;
  detail: string;
  deltaVKms?: number;
  durationYears?: number;
}

export interface MissionResult {
  distanceLy: number;
  etaYears: number;
  etaLabel: string;
  etaDetail: string;
  deltaVKms: number | null;
  fuelUsedKg: number | null;
  cruiseSpeedKms: number | null;
  legs: MissionLeg[];
  feasible: boolean;
  speculative: boolean;
  warnings: string[];
}

export const PROPULSION_MODES: {
  id: PropulsionMode;
  label: string;
  speculative?: boolean;
  desc: string;
}[] = [
  { id: "gravity_assist", label: "Gravitational assist", desc: "Flybys to steal momentum from planets" },
  { id: "light_speed", label: "Light speed", desc: "The cosmic speed limit — 1 ly per year" },
  { id: "sublight", label: "Sublight", speculative: true, desc: "Constant fraction of c (hypothetical)" },
  { id: "nuclear", label: "Nuclear propulsion", desc: "High-ISP rocket burns" },
  { id: "solar_sail", label: "Solar sail", desc: "Radiation pressure from sunlight" },
  { id: "alcubierre", label: "Alcubierre warp", speculative: true, desc: "Speculative warp bubble (theoretical)" },
];

export const VESSEL_PRESETS: { label: string; vessel: Partial<VesselConfig> }[] = [
  { label: "Voyager-scale", vessel: { dryMassKg: 721 } },
  { label: "Crew capsule", vessel: { dryMassKg: 4200, fuelMassKg: 8000 } },
  { label: "Cargo hauler", vessel: { dryMassKg: 50_000, fuelMassKg: 200_000 } },
];