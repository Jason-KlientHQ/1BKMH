import { describe, it, expect } from "vitest";
import {
  EXO_CINEMATIC,
  MOON_CINEMATIC,
  SIM_YEARS_PER_SEC,
  siderealOrbitRateRadPerYear,
} from "@/lib/orbitRate";

describe("siderealOrbitRateRadPerYear", () => {
  it("true mode uses catalog period in simulation years", () => {
    const rate = siderealOrbitRateRadPerYear(11.19, true, EXO_CINEMATIC);
    const periodYears = 11.19 / 365.25;
    expect(rate).toBeCloseTo((2 * Math.PI) / periodYears, 6);
  });

  it("cinematic exoplanet orbit takes ~14–54 s at 1×", () => {
    const inner = siderealOrbitRateRadPerYear(4, false, EXO_CINEMATIC);
    const outer = siderealOrbitRateRadPerYear(2000, false, EXO_CINEMATIC);
    const innerSec = (2 * Math.PI) / (inner * SIM_YEARS_PER_SEC);
    const outerSec = (2 * Math.PI) / (outer * SIM_YEARS_PER_SEC);
    expect(innerSec).toBeGreaterThan(12);
    expect(innerSec).toBeLessThan(20);
    expect(outerSec).toBeGreaterThan(45);
    expect(outerSec).toBeLessThan(60);
  });

  it("cinematic moon rate is slower than true for the Moon", () => {
    const cinematic = siderealOrbitRateRadPerYear(27.322, false, MOON_CINEMATIC);
    const trueRate = siderealOrbitRateRadPerYear(27.322, true, MOON_CINEMATIC);
    expect(cinematic).toBeLessThan(trueRate);
  });
});