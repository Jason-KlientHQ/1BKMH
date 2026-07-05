import { describe, it, expect } from "vitest";
import {
  angularSeparation,
  heliocentricPositionLy,
  raDecToUnitVector,
  starScenePosition,
  unitDirection,
} from "@/astrometry/positions";

describe("unitDirection", () => {
  it("normalises to unit length", () => {
    const u = unitDirection([3, 4, 0]);
    expect(Math.hypot(u[0], u[1], u[2])).toBeCloseTo(1, 8);
  });
});

describe("raDecToUnitVector", () => {
  it("places the north pole at +Y", () => {
    const [x, y, z] = raDecToUnitVector(0, 90);
    expect(x).toBeCloseTo(0, 5);
    expect(y).toBeCloseTo(1, 5);
    expect(z).toBeCloseTo(0, 5);
  });
});

describe("heliocentricPositionLy", () => {
  it("scales unit direction by distance", () => {
    const p = heliocentricPositionLy(10, [1, 0, 0]);
    expect(p).toEqual([10, 0, 0]);
  });
});

describe("starScenePosition", () => {
  it("maps farther stars to larger scene radii", () => {
    const near = starScenePosition(5, [0, 0, 1]);
    const far = starScenePosition(50, [0, 0, 1]);
    expect(far[2]).toBeGreaterThan(near[2]);
  });
});

describe("angularSeparation", () => {
  it("returns zero for identical directions", () => {
    expect(angularSeparation([1, 0, 0], [1, 0, 0])).toBeCloseTo(0, 8);
  });

  it("returns π/2 for perpendicular directions", () => {
    expect(angularSeparation([1, 0, 0], [0, 1, 0])).toBeCloseTo(Math.PI / 2, 5);
  });
});