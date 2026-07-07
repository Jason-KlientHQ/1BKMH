import { describe, it, expect } from "vitest";
import { computeOrbitalEpoch, yearsSinceJ2000 } from "@/lib/simEpoch";
import { heliocentricAU } from "@/lib/orbital";
import { PLANETS } from "@/data/solarSystem";

describe("simEpoch", () => {
  it("computes years since J2000 for a calendar date", () => {
    expect(yearsSinceJ2000("2000-01-01")).toBeCloseTo(0, 1);
    expect(yearsSinceJ2000("1990-06-15")).toBeLessThan(0);
    expect(yearsSinceJ2000("2020-01-01")).toBeCloseTo(20, 0.5);
  });

  it("ties orbital epoch to birth date + life age", () => {
    const birth = "1990-01-01";
    const age = 30;
    const epoch = computeOrbitalEpoch({
      birthDate: birth,
      lifeYears: age,
      scrubYears: null,
      clockYears: 26.5,
      clockAnchor: 26.5,
    });
    expect(epoch).toBeCloseTo(yearsSinceJ2000(birth) + age, 2);
  });

  it("produces different Jupiter positions for different life ages", () => {
    const birth = "1985-03-20";
    const young = computeOrbitalEpoch({
      birthDate: birth,
      lifeYears: 10,
      scrubYears: 10,
      clockYears: 26.5,
      clockAnchor: 26.5,
    });
    const older = computeOrbitalEpoch({
      birthDate: birth,
      lifeYears: 40,
      scrubYears: 40,
      clockYears: 26.5,
      clockAnchor: 26.5,
    });
    const jupiter = PLANETS.find((p) => p.name === "Jupiter")!;
    const pYoung = heliocentricAU(jupiter, young);
    const pOlder = heliocentricAU(jupiter, older);
    const dist = Math.hypot(pYoung.x - pOlder.x, pYoung.y - pOlder.y, pYoung.z - pOlder.z);
    expect(dist).toBeGreaterThan(0.5);
  });
});