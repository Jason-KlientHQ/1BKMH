import { describe, it, expect } from "vitest";
import { buildMissionPath, interpolatePath, legAtProgress } from "@/mission/path";
import { computeMission } from "@/mission/compute";
import { findNavStar } from "@/mission/stars";
import { DEFAULT_VESSEL } from "@/mission/types";

describe("mission path", () => {
  it("interpolates along a straight route", () => {
    const star = findNavStar("Proxima Centauri")!;
    const result = computeMission(star, "light_speed", DEFAULT_VESSEL, "sun")!;
    const path = buildMissionPath(result, star, "light_speed", 0);
    const start = interpolatePath(path, 0);
    const end = interpolatePath(path, 1);
    expect(start).toEqual([0, 0, 0]);
    expect(Math.hypot(end[0], end[1], end[2])).toBeGreaterThan(100);
  });

  it("places Jupiter on gravity-assist path", () => {
    const star = findNavStar("Sirius")!;
    const result = computeMission(star, "gravity_assist", DEFAULT_VESSEL, "earth")!;
    const path = buildMissionPath(result, star, "gravity_assist", 0);
    const jupiterLeg = path.find((p) => p.label.includes("Jupiter"));
    expect(jupiterLeg).toBeDefined();
    expect(Math.hypot(jupiterLeg!.position[0], jupiterLeg!.position[1], jupiterLeg!.position[2])).toBeGreaterThan(10);
  });

  it("resolves current leg from progress", () => {
    const star = findNavStar("Proxima Centauri")!;
    const result = computeMission(star, "nuclear", DEFAULT_VESSEL, "sun")!;
    const early = legAtProgress(result, 0.01);
    const late = legAtProgress(result, 0.99);
    expect(early.index).toBeLessThanOrEqual(late.index);
  });
});