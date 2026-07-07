import type { AccuracyMode } from "@/lib/accuracyMode";

/** Cinematic decorative halos run at this fraction of legacy opacity. */
const CINEMATIC_OPACITY = 0.65;

/** Decorative shells (star corona, planet haze) — off in educational mode. */
export function showDecorativeGlow(mode: AccuracyMode): boolean {
  return mode === "cinematic";
}

export function decorativeOpacity(base: number, mode: AccuracyMode): number {
  if (mode === "educational") return 0;
  return base * CINEMATIC_OPACITY;
}

/** Luminosity-driven star shell opacity (after stellarGlowOpacity). */
export function starLuminosityGlowOpacity(computed: number, mode: AccuracyMode): number {
  if (mode === "educational") return 0;
  return computed * 0.72;
}

/** Soft shell radius as a multiple of photosphere size (was 1.7). */
export function starGlowShellRadiusFactor(mode: AccuracyMode): number {
  return mode === "educational" ? 0 : 1.45;
}

/** Progress / navigation halos — always visible, slightly subdued. */
export function stateGlowOpacity(base: number, _mode: AccuracyMode): number {
  return base * 0.78;
}

export const SUN_CORONA_SCALE = 1.35;
export const SUN_CORONA_OPACITY = 0.11;

export const LIGHT_REACHED_GLOW = { scale: 2.1, opacity: 0.12 } as const;
export const MISSION_DEST_GLOW = { scale: 2.5, opacity: 0.17 } as const;