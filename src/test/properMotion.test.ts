import { describe, it, expect } from "vitest";
import {
  applyProperMotion,
  starEpochYears,
  starUnitDirAtEpoch,
  unitDirToRaDec,
} from "@/astrometry/properMotion";
import { angularSeparation } from "@/astrometry/positions";
import { resolveProperMotion } from "@/data/properMotion";

describe("starEpochYears", () => {
  it("adds life-scrub offset to clock years", () => {
    expect(starEpochYears(30, 20, 40)).toBe(10);
    expect(starEpochYears(30, null, 40)).toBe(30);
  });
});

describe("applyProperMotion", () => {
  it("leaves direction unchanged at epoch zero", () => {
    const base: [number, number, number] = [0, 0, 1];
    const out = applyProperMotion(base, 5000, 8000, 0);
    expect(out[0]).toBeCloseTo(0, 5);
    expect(out[2]).toBeCloseTo(1, 5);
  });

  it("moves Barnard's Star significantly over a century", () => {
    const barnard = resolveProperMotion("Barnard's Star")!;
    const base: [number, number, number] = [-0.0095, 0.0818, -0.9966];
    const now = starUnitDirAtEpoch(base, "Barnard's Star", 0);
    const later = starUnitDirAtEpoch(base, "Barnard's Star", 100);
    const sep = angularSeparation(now, later);
    expect(sep).toBeGreaterThan(0.001);
  });
});

describe("unitDirToRaDec", () => {
  it("round-trips the north pole", () => {
    const { raHours, decDeg } = unitDirToRaDec([0, 1, 0]);
    expect(decDeg).toBeCloseTo(90, 3);
    expect(raHours).toBeGreaterThanOrEqual(0);
    expect(raHours).toBeLessThan(24);
  });
});