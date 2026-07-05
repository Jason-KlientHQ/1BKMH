import { describe, it, expect } from "vitest";
import { rocketDeltaV, rocketBurn } from "@/propulsion/rocket";
import { solarSailTrip } from "@/propulsion/solarSail";
import { gravityAssistTrip } from "@/propulsion/gravityAssist";
import { computeMission } from "@/mission/compute";
import { findNavStar } from "@/mission/stars";
import { DEFAULT_VESSEL } from "@/mission/types";

describe("rocket equation", () => {
  it("computes Δv from mass ratio", () => {
    const dv = rocketDeltaV(900, 6000, 1000);
    expect(dv).toBeGreaterThan(10_000);
    expect(dv).toBeLessThan(20_000);
  });

  it("returns zero when no fuel", () => {
    expect(rocketDeltaV(900, 1000, 1000)).toBe(0);
  });

  it("computes burn time from thrust", () => {
    const burn = rocketBurn(1000, 5000, 900, 100_000);
    expect(burn.fuelUsedKg).toBe(5000);
    expect(burn.burnTimeSeconds).toBeGreaterThan(0);
  });
});

describe("solar sail", () => {
  it("accelerates faster with larger sails", () => {
    const small = solarSailTrip(0.05, 1000, 1000);
    const large = solarSailTrip(0.05, 50_000, 1000);
    expect(large.peakAccelerationMs2).toBeGreaterThan(small.peakAccelerationMs2);
    expect(large.arrivalSpeedKms).toBeGreaterThan(small.arrivalSpeedKms);
    expect(large.tripYears).toBeLessThan(small.tripYears);
  });
});

describe("gravity assist", () => {
  it("includes Jupiter and Saturn legs", () => {
    const ga = gravityAssistTrip(4.25, "earth", DEFAULT_VESSEL);
    expect(ga.legs.some((l) => l.label.includes("Jupiter"))).toBe(true);
    expect(ga.legs.some((l) => l.label.includes("Saturn"))).toBe(true);
    expect(ga.cruiseSpeedKms).toBeGreaterThan(40);
  });
});

describe("computeMission", () => {
  it("computes nuclear trip with warnings for low delta-v", () => {
    const star = findNavStar("Proxima Centauri")!;
    const r = computeMission(star, "nuclear", DEFAULT_VESSEL, "sun")!;
    expect(r.deltaVKms).toBeGreaterThan(0);
    expect(r.legs.length).toBeGreaterThanOrEqual(2);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it("computes gravity assist with multi-leg profile", () => {
    const star = findNavStar("Sirius")!;
    const r = computeMission(star, "gravity_assist", DEFAULT_VESSEL, "earth")!;
    expect(r.legs.length).toBeGreaterThanOrEqual(4);
    expect(r.deltaVKms).toBeGreaterThan(10);
  });

  it("solar sail returns finite ETA for Proxima", () => {
    const star = findNavStar("Proxima Centauri")!;
    const r = computeMission(star, "solar_sail", { ...DEFAULT_VESSEL, sailAreaM2: 100_000 }, "sun")!;
    expect(r.etaYears).toBeGreaterThan(0);
    expect(Number.isFinite(r.etaYears)).toBe(true);
  });
});