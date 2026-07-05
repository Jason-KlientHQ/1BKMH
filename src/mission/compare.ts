import { computeMission } from "@/mission/compute";
import type { NavStar } from "@/mission/stars";
import { PROPULSION_MODES, type MissionOrigin, type PropulsionMode, type VesselConfig } from "@/mission/types";

export interface ModeComparisonRow {
  mode: PropulsionMode;
  label: string;
  etaLabel: string;
  etaYears: number;
  cruiseSpeedKms: number | null;
  feasible: boolean;
  speculative: boolean;
  isActive: boolean;
}

/** Compute ETA for every propulsion mode, sorted fastest-first. */
export function compareModes(
  dest: NavStar,
  vessel: VesselConfig,
  origin: MissionOrigin,
  activeMode: PropulsionMode,
): ModeComparisonRow[] {
  return PROPULSION_MODES.map((m) => {
    const r = computeMission(dest, m.id, vessel, origin)!;
    return {
      mode: m.id,
      label: m.label,
      etaLabel: r.etaLabel,
      etaYears: r.etaYears,
      cruiseSpeedKms: r.cruiseSpeedKms,
      feasible: r.feasible,
      speculative: r.speculative ?? !!m.speculative,
      isActive: m.id === activeMode,
    };
  }).sort((a, b) => a.etaYears - b.etaYears);
}