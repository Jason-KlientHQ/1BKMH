export type AccuracyMode = "cinematic" | "educational";

export function parseAccuracyParam(value: string | null): AccuracyMode {
  if (value === "edu" || value === "educational") return "educational";
  return "cinematic";
}

export function accuracyQueryValue(mode: AccuracyMode): string | null {
  return mode === "educational" ? "edu" : null;
}

/** Educational preset forces true moon periods; cinematic allows manual toggle. */
export function resolveTrueMoonPeriods(mode: AccuracyMode, manualTrueMoons: boolean): boolean {
  return mode === "educational" || manualTrueMoons;
}

export const ACCURACY_MODE_LABEL: Record<AccuracyMode, string> = {
  cinematic: "Cinematic",
  educational: "Educational",
};