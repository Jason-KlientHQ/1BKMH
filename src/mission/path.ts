import { starScenePositionAtEpoch, type Vec3 } from "@/astrometry/properMotion";
import { PLANETS } from "@/data/solarSystem";
import { flybyArc, transferArc } from "@/mission/flyby";
import type { NavStar } from "@/mission/stars";
import type { MissionLeg, MissionOrigin, MissionResult, PropulsionMode } from "@/mission/types";
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

export function originDisplayLabel(origin: MissionOrigin): string {
  return origin === "earth" ? "Earth" : "Sun";
}

/** Heliocentric scene position for mission departure. */
export function originScenePos(origin: MissionOrigin, simYears: number): Vec3 {
  return origin === "earth" ? planetScenePos("Earth", simYears) : [0, 0, 0];
}

/** Destination star position with proper motion at mission epoch. */
function destScenePos(dest: NavStar, simYears: number, tripYears = 0): Vec3 {
  return starScenePositionAtEpoch(dest.distanceLy, dest.unitDir, dest.name, simYears + tripYears);
}

function appendSamples(
  out: MissionPathPoint[],
  samples: Vec3[],
  label: string,
  tStart: number,
  tEnd: number,
  includeFirst: boolean,
) {
  const n = samples.length;
  if (n < 2) return;
  const start = includeFirst ? 0 : 1;
  for (let i = start; i < n; i++) {
    const frac = i / (n - 1);
    out.push({
      position: samples[i],
      label: i === n - 1 ? label : "",
      tEnd: tStart + (tEnd - tStart) * frac,
    });
  }
}

function buildGravityAssistPath(
  result: MissionResult,
  dest: NavStar,
  simYears: number,
  origin: MissionOrigin,
): MissionPathPoint[] {
  const total = Math.max(result.etaYears, 1e-9);
  const sun: Vec3 = [0, 0, 0];
  const earth = planetScenePos("Earth", simYears);
  const jupiter = planetScenePos("Jupiter", simYears);
  const saturn = planetScenePos("Saturn", simYears);
  const destPos = destScenePos(dest, simYears, result.etaYears);

  const start = origin === "earth" ? earth : sun;
  const points: MissionPathPoint[] = [{ position: start, label: originDisplayLabel(origin), tEnd: 0 }];
  let cursor = start;
  let cum = 0;

  for (const leg of result.legs) {
    const dur = leg.durationYears ?? 0;
    const tStart = cum;
    cum = Math.min(1, cum + dur / total);
    const label = leg.label;

    let samples: Vec3[] = [];
    const sampleCount = (n: number) => Math.max(8, Math.round(n * (dur / total) * 120));

    if (/Earth|Solar/i.test(label)) {
      samples = transferArc(cursor, jupiter, sampleCount(10));
    } else if (/Jupiter/i.test(label)) {
      samples = flybyArc(cursor, jupiter, saturn, sampleCount(28), 11);
    } else if (/Saturn/i.test(label)) {
      samples = flybyArc(cursor, saturn, destPos, sampleCount(28), 9);
    } else if (/Nuclear/i.test(label)) {
      const burnEnd = lerp3(cursor, saturn, 0.35);
      samples = transferArc(cursor, burnEnd, 6);
    } else if (/Coast/i.test(label)) {
      samples = transferArc(cursor, destPos, sampleCount(24));
    } else {
      samples = transferArc(cursor, destPos, 8);
    }

    appendSamples(points, samples, label, tStart, cum, false);
    if (samples.length) cursor = samples[samples.length - 1];
  }

  if (points[points.length - 1].tEnd < 1) {
    points.push({ position: destPos, label: dest.name, tEnd: 1 });
  }

  return points;
}

/** Map mission legs to 3D waypoints for the flight visualiser. */
export function buildMissionPath(
  result: MissionResult,
  dest: NavStar,
  mode: PropulsionMode,
  simYears = 0,
  origin: MissionOrigin = "sun",
): MissionPathPoint[] {
  if (mode === "gravity_assist") {
    return buildGravityAssistPath(result, dest, simYears, origin);
  }

  const originPos = originScenePos(origin, simYears);
  const total = Math.max(result.etaYears, 1e-9);
  const finalDest = destScenePos(dest, simYears, total);

  const points: MissionPathPoint[] = [{ position: originPos, label: originDisplayLabel(origin), tEnd: 0 }];
  let cum = 0;

  for (const leg of result.legs) {
    cum = Math.min(1, cum + (leg.durationYears ?? 0) / total);
    points.push({ position: lerp3(originPos, finalDest, cum), label: leg.label, tEnd: cum });
  }

  if (points[points.length - 1].tEnd < 1) {
    points.push({ position: finalDest, label: dest.name, tEnd: 1 });
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
  return points.map((p) => p.position);
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