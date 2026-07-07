import { describe, it, expect } from "vitest";
import { SPACECRAFT } from "@/data/solarSystem";
import {
  earthCraftScenePosition,
  leoOrbitRateRadPerSimYear,
  leoPeriodYears,
  leoElementsFor,
  leoSceneOffset,
} from "@/lib/earthOrbit";
import { scaleRadiusKm } from "@/lib/orbital";
import { PLANETS } from "@/data/solarSystem";

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

  it("cinematic LEO rate is slow enough to watch (not epoch-blurred)", () => {
    const rate = leoOrbitRateRadPerSimYear(417, false);
    // At 0.08 sim-yr/s, one orbit should take ~20–35 real seconds
    const secPerOrbit = (2 * Math.PI) / (rate * 0.08);
    expect(secPerOrbit).toBeGreaterThan(18);
    expect(secPerOrbit).toBeLessThan(40);
  });

  it("LEO phase uses play delta, not astronomical epoch", () => {
    const iss = SPACECRAFT.find((s) => s.name === "International Space Station")!;
    const earthR = scaleRadiusKm(PLANETS.find((p) => p.name === "Earth")!.radiusKm);
    const a = leoSceneOffset(iss, 0, 0, earthR);
    const b = leoSceneOffset(iss, 0, 1, earthR);
    const dist = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    // One sim-year of play should not complete thousands of orbits
    expect(dist).toBeLessThan(earthR * 3);
  });

  it("returns distinct positions for ISS and Hubble", () => {
    const iss = SPACECRAFT.find((s) => s.name === "International Space Station")!;
    const hubble = SPACECRAFT.find((s) => s.name === "Hubble Space Telescope")!;
    const a = earthCraftScenePosition(iss, 0, 25, 5);
    const b = earthCraftScenePosition(hubble, 1, 25, 5);
    const dist = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    expect(dist).toBeGreaterThan(0.01);
  });
});