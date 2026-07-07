import { useMemo } from "react";
import { useIsMobile, useMediaQuery } from "@/hooks/useMediaQuery";

export type SceneQualityTier = "high" | "low";

export interface SceneQuality {
  tier: SceneQualityTier;
  dprMax: number;
  backgroundStarCounts: [number, number];
  /** When set, only catalog stars at or below this apparent magnitude are instanced. */
  catalogMagLimit: number | null;
  catalogSphereSegments: number;
}

function networkSaveData(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !!conn?.saveData;
}

/** Pure resolver for tests — picks WebGL cost tier from device signals. */
export function resolveSceneQuality(
  isMobile: boolean,
  reducedMotion: boolean,
  saveData = false,
): SceneQuality {
  const low = isMobile || reducedMotion || saveData;
  if (low) {
    return {
      tier: "low",
      dprMax: 1,
      backgroundStarCounts: [2500, 1200],
      catalogMagLimit: 8,
      catalogSphereSegments: 12,
    };
  }
  return {
    tier: "high",
    dprMax: 2,
    backgroundStarCounts: [16000, 7000],
    catalogMagLimit: null,
    catalogSphereSegments: 24,
  };
}

/** Reactive scene quality — mobile, reduced motion, or save-data → lighter WebGL tier. */
export function useSceneQuality(): SceneQuality {
  const isMobile = useIsMobile();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const saveData = networkSaveData();
  return useMemo(
    () => resolveSceneQuality(isMobile, reducedMotion, saveData),
    [isMobile, reducedMotion, saveData],
  );
}