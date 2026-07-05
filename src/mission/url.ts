import { findNavStar } from "@/mission/stars";
import {
  DEFAULT_VESSEL,
  type MissionOrigin,
  type MissionState,
  type PropulsionMode,
  type VesselConfig,
} from "@/mission/types";
import { parseBirthdayParam, parseLeapParam, buildShareQuery } from "@/lib/lightJourney";

const MODES: PropulsionMode[] = [
  "gravity_assist",
  "light_speed",
  "sublight",
  "nuclear",
  "solar_sail",
  "alcubierre",
];

const ORIGINS: MissionOrigin[] = ["sun", "earth"];

function parseMode(value: string | null): PropulsionMode {
  if (value && MODES.includes(value as PropulsionMode)) return value as PropulsionMode;
  return "sublight";
}

function parseOrigin(value: string | null): MissionOrigin {
  if (value && ORIGINS.includes(value as MissionOrigin)) return value as MissionOrigin;
  return "sun";
}

function num(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const n = parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function parseMissionParams(params: URLSearchParams): MissionState {
  const destRaw = params.get("dest");
  const dest = destRaw && findNavStar(destRaw) ? destRaw : null;

  const vessel: VesselConfig = {
    ...DEFAULT_VESSEL,
    dryMassKg: num(params.get("mass"), DEFAULT_VESSEL.dryMassKg),
    fuelMassKg: num(params.get("fuel"), DEFAULT_VESSEL.fuelMassKg),
    ispSeconds: num(params.get("isp"), DEFAULT_VESSEL.ispSeconds),
    thrustN: num(params.get("thrust"), DEFAULT_VESSEL.thrustN),
    sailAreaM2: num(params.get("sail"), DEFAULT_VESSEL.sailAreaM2),
    sublightFraction: num(params.get("sublight"), DEFAULT_VESSEL.sublightFraction),
    warpFactor: num(params.get("warp"), DEFAULT_VESSEL.warpFactor),
  };

  return {
    origin: parseOrigin(params.get("origin")),
    destination: dest,
    mode: parseMode(params.get("mode")),
    vessel,
  };
}

export interface AppUrlState {
  bday?: string;
  useLeap?: boolean;
  mission: MissionState;
}

export function buildAppShareQuery(state: AppUrlState): string {
  const parts: string[] = [];

  if (state.bday) {
    const birthday = buildShareQuery(state.bday, state.useLeap ?? true);
    parts.push(birthday.slice(1));
  }

  const m = state.mission;
  if (m.destination) parts.push(`dest=${encodeURIComponent(m.destination)}`);
  if (m.mode !== "sublight") parts.push(`mode=${m.mode}`);
  if (m.origin !== "sun") parts.push(`origin=${m.origin}`);

  const v = m.vessel;
  if (v.dryMassKg !== DEFAULT_VESSEL.dryMassKg) parts.push(`mass=${v.dryMassKg}`);
  if (v.fuelMassKg !== DEFAULT_VESSEL.fuelMassKg) parts.push(`fuel=${v.fuelMassKg}`);
  if (v.sublightFraction !== DEFAULT_VESSEL.sublightFraction) parts.push(`sublight=${v.sublightFraction}`);
  if (v.warpFactor !== DEFAULT_VESSEL.warpFactor) parts.push(`warp=${v.warpFactor}`);
  if (v.ispSeconds !== DEFAULT_VESSEL.ispSeconds) parts.push(`isp=${v.ispSeconds}`);
  if (v.thrustN !== DEFAULT_VESSEL.thrustN) parts.push(`thrust=${v.thrustN}`);
  if (v.sailAreaM2 !== DEFAULT_VESSEL.sailAreaM2) parts.push(`sail=${v.sailAreaM2}`);

  return parts.length ? `?${parts.join("&")}` : "";
}

export function parseAppUrl(params: URLSearchParams): {
  bday: string | null;
  leap: boolean;
  mission: MissionState;
} {
  return {
    bday: parseBirthdayParam(params.get("b")),
    leap: parseLeapParam(params.get("leap")),
    mission: parseMissionParams(params),
  };
}