import { describe, it, expect } from "vitest";
import { SPACECRAFT } from "@/data/solarSystem";
import { earthCraftScenePosition, leoPeriodYears, leoElementsFor } from "@/lib/earthOrbit";

describe("earthOrbit", () => {
  it("assigns realistic inclinations to ISS and Hubble", () => {
    const iss = SPACECRAFT.find((s) => s.name === "International Space Station")!;
    const hubble = SPACECRAFT.find((s) => s.name === "Hubble Space Telescope")!;
    expect(leoElementsFor(iss, 0).inclDeg).toBeCloseTo(51.64, 1);
    expect(leoElementsFor(hubble, 1).inclDeg).toBeCloseTo(28.47, 1);
  });

  it("ISS LEO period is roughly 90 minutes", () => {
    const mins = leoPeriodYears(417) * 365.25 * 24 * 60;
    expect(mins).toBeGreaterThan(85);
    expect(mins).toBeLessThan(95);
  });

  it("returns distinct positions for ISS and Hubble", () => {
    const iss = SPACECRAFT.find((s) => s.name === "International Space Station")!;
    const hubble = SPACECRAFT.find((s) => s.name === "Hubble Space Telescope")!;
    const a = earthCraftScenePosition(iss, 0, 25);
    const b = earthCraftScenePosition(hubble, 1, 25);
    const dist = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    expect(dist).toBeGreaterThan(0.01);
  });
});