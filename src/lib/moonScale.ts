import type { AccuracyMode } from "@/lib/accuracyMode";
import { scaleRadiusKm } from "@/lib/orbital";

/** Minimum moon mesh radius for picking (scene units). */
const MOON_CLICK_FLOOR = 0.04;

/** Cinematic mode nudges moons slightly above strict ratio for readability. */
const CINEMATIC_BOOST = 1.35;

/** Scene orbit radius for a moon (log-compressed distance — separate from mesh scale). */
export function moonOrbitSceneRadius(parentRadiusKm: number, moonOrbitKm: number): number {
  return scaleRadiusKm(parentRadiusKm) + 0.5 + 0.85 * Math.log10(1 + moonOrbitKm / 50_000);
}

/**
 * Moon mesh radius in scene units — linear ratio to parent photosphere.
 * Educational: strict; cinematic: small boost above physical proportion.
 */
export function moonMeshSceneRadius(
  parentRadiusKm: number,
  moonRadiusKm: number,
  mode: AccuracyMode,
): number {
  const parentScene = scaleRadiusKm(parentRadiusKm);
  const ratio = moonRadiusKm / parentRadiusKm;
  let r = parentScene * ratio;
  if (mode === "cinematic") r *= CINEMATIC_BOOST;
  return Math.max(MOON_CLICK_FLOOR, r);
}

/** Scene radius ratio moon/parent for tests. */
export function moonParentSceneRatio(
  parentRadiusKm: number,
  moonRadiusKm: number,
  mode: AccuracyMode,
): number {
  const parentScene = scaleRadiusKm(parentRadiusKm);
  if (parentScene <= 0) return 0;
  return moonMeshSceneRadius(parentRadiusKm, moonRadiusKm, mode) / parentScene;
}