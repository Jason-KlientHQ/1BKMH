import { starScenePosition, type Vec3 } from "@/astrometry/positions";
import { PLANETS } from "@/data/solarSystem";
import type { NavStar } from "@/mission/stars";
import type { MissionLeg, MissionResult, PropulsionMode } from "@/mission/types";
import { heliocentricAU, toScenePosition } from "@/lib/orbital";

export interface MissionPathPoint {
  position: Vec3;
  label: string;
  /** Cumulative trip timeline fraction (0–1). */
  tEnd: number;
}

function lerp3(a: Vec3, b: Vec3, k: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

function planetScenePos(name: string, years: number): Vec3 {
  const p = PLANETS.find((b) => b.name === name);
  if (!p) return [0, 0, 0];
  return toScenePosition(heliocentricAU(p, years));
}

/** Map mission legs to 3D waypoints for the flight visualiser. */
export function buildMissionPath(
  result: MissionResult,
  dest: NavStar,
  mode: PropulsionMode,
  simYears = 0,
): MissionPathPoint[] {
  const origin: Vec3 = [0, 0, 0];
  const destPos = starScenePosition(dest.distanceLy, dest.unitDir);
  const total = Math.max(result.etaYears, 1e-9);

  const legPosition = (leg: MissionLeg, cum: number): Vec3 => {
    if (mode === "gravity_assist") {
      if (leg.label.includes("Jupiter")) return planetScenePos("Jupiter", simYears);
      if (leg.label.includes("Saturn")) return planetScenePos("Saturn", simYears);
      if (leg.label.includes("Earth") || leg.label.includes("Solar")) return origin;
      if (leg.label.includes("Coast")) return destPos;
      return lerp3(planetScenePos("Saturn", simYears), destPos, 0.35);
    }
    return lerp3(origin, destPos, cum);
  };

  const points: MissionPathPoint[] = [{ position: origin, label: "Origin", tEnd: 0 }];
  let cum = 0;

  for (const leg of result.legs) {
    cum = Math.min(1, cum + (leg.durationYears ?? 0) / total);
    points.push({ position: legPosition(leg, cum), label: leg.label, tEnd: cum });
  }

  if (points[points.length - 1].tEnd < 1) {
    points.push({ position: destPos, label: dest.name, tEnd: 1 });
  }

  return points;
}

export function interpolatePath(points: MissionPathPoint[], t: number): Vec3 {
  const clamped = Math.min(1, Math.max(0, t));
  if (clamped <= points[0].tEnd) return points[0].position;

  for (let i = 1; i < points.length; i++) {
    if (clamped <= points[i].tEnd) {
      const t0 = points[i - 1].tEnd;
      const t1 = points[i].tEnd;
      const k = t1 > t0 ? (clamped - t0) / (t1 - t0) : 1;
      return lerp3(points[i - 1].position, points[i].position, k);
    }
  }

  return points[points.length - 1].position;
}

export function pathLineSegments(points: MissionPathPoint[]): Vec3[] {
  const uniq: MissionPathPoint[] = [];
  for (const p of points) {
    if (!uniq.length || p.tEnd > uniq[uniq.length - 1].tEnd) uniq.push(p);
  }
  return uniq.map((p) => p.position);
}

export interface LegProgress {
  leg: MissionLeg;
  index: number;
  /** Progress within the current leg (0–1). */
  legT: number;
}

export function legAtProgress(result: MissionResult, progress: number): LegProgress {
  const legs = result.legs;
  if (!legs.length) {
    return { leg: { label: "En route", detail: "" }, index: 0, legT: progress };
  }

  const total = Math.max(result.etaYears, 1e-9);
  const elapsed = progress * total;
  let acc = 0;

  for (let i = 0; i < legs.length; i++) {
    const dur = legs[i].durationYears ?? 0;
    if (elapsed <= acc + dur || i === legs.length - 1) {
      const legT = dur > 0 ? Math.min(1, (elapsed - acc) / dur) : 1;
      return { leg: legs[i], index: i, legT };
    }
    acc += dur;
  }

  return { leg: legs[legs.length - 1], index: legs.length - 1, legT: 1 };
}

export function fuelRemainingKg(result: MissionResult, progress: number): number | null {
  if (result.fuelUsedKg == null) return null;
  const { leg } = legAtProgress(result, progress);
  const isBurn = /burn|nuclear/i.test(leg.label);
  if (!isBurn) return result.fuelUsedKg;
  const { legT } = legAtProgress(result, progress);
  return result.fuelUsedKg * (1 - legT);
}

export function etaRemainingLabel(result: MissionResult, progress: number): string {
  const remaining = result.etaYears * (1 - progress);
  if (remaining < 1 / 365.25) return `${(remaining * 365.25 * 24).toFixed(0)} h left`;
  if (remaining < 1) return `${(remaining * 365.25).toFixed(0)} d left`;
  if (remaining < 1000) return `${remaining.toFixed(1)} yr left`;
  return `${(remaining / 1000).toFixed(1)}k yr left`;
}