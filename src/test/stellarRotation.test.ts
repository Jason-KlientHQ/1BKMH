import { describe, expect, it } from "vitest";
import {
  PULSAR_PERIOD_SEC,
  formatPulsarPeriod,
  formatRotationPeriod,
  rotationPeriodDays,
} from "@/data/stellarRotation";
import { pulsarSpinRateRadPerSec, spinRateRadPerSec } from "@/lib/stellarRotation";

describe("stellar rotation", () => {
  it("uses measured Sun period", () => {
    expect(rotationPeriodDays("Sun").days).toBeCloseTo(25.05);
    expect(rotationPeriodDays("Sun").source).toBe("measured");
  });

  it("estimates from spectral type when unnamed", () => {
    const m = rotationPeriodDays("Unknown Star", "M2V");
    expect(m.source).toBe("estimated");
    expect(m.days).toBeGreaterThan(10);
  });

  it("pulsar spin rate matches period", () => {
    const crab = PULSAR_PERIOD_SEC["Crab Pulsar"];
    const rate = pulsarSpinRateRadPerSec(crab);
    expect(rate).toBeCloseTo((2 * Math.PI) / crab, 1);
  });

  it("formats rotation period for detail panels", () => {
    expect(formatRotationPeriod(25.05, "measured")).toBe("25.1 d · measured");
    expect(formatRotationPeriod(60, "estimated")).toBe("~60 d · estimated from spectral type");
    expect(formatPulsarPeriod(0.033)).toBe("33 ms · measured");
  });

  it("educational Sun spin is slower than pulsar", () => {
    const sun = spinRateRadPerSec(25, "educational");
    const pulsar = pulsarSpinRateRadPerSec(0.033);
    expect(pulsar).toBeGreaterThan(sun * 100);
  });
});