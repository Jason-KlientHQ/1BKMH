import { describe, it, expect } from "vitest";
import { heliocentricAU, orbitPath, scaleDistanceAU, solveKepler, toScenePosition } from "@/lib/orbital";
import { PLANETS } from "@/data/solarSystem";

describe("solveKepler", () => {
  it("solves circular orbits exactly", () => {
    expect(solveKepler(1.2, 0)).toBeCloseTo(1.2, 8);
  });

  it("converges for Earth-like eccentricity", () => {
    const E = solveKepler(0.5, 0.01671);
    expect(E - 0.01671 * Math.sin(E)).toBeCloseTo(0.5, 8);
  });
});

describe("heliocentricAU", () => {
  it("places Earth near 1 AU at epoch", () => {
    const earth = PLANETS.find((p) => p.name === "Earth")!;
    const pos = heliocentricAU(earth, 0);
    const r = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
    expect(r).toBeCloseTo(1, 1);
  });

  it("gives inner planets higher mean motion than outer ones", () => {
    const mercury = PLANETS.find((p) => p.name === "Mercury")!;
    const neptune = PLANETS.find((p) => p.name === "Neptune")!;
    expect(360 / mercury.period).toBeGreaterThan(360 / neptune.period);
  });
});

describe("scale mapping", () => {
  it("compresses AU distances monotonically", () => {
    expect(scaleDistanceAU(1)).toBeLessThan(scaleDistanceAU(10));
    expect(scaleDistanceAU(10)).toBeLessThan(scaleDistanceAU(100));
  });

  it("maps heliocentric vectors to scene coordinates", () => {
    const [x, y, z] = toScenePosition({ x: 1, y: 0, z: 0 });
    expect(x).toBeGreaterThan(0);
    expect(y).toBe(0);
    expect(z).toBe(0);
  });

  it("samples closed orbit paths", () => {
    const earth = PLANETS.find((p) => p.name === "Earth")!;
    const path = orbitPath(earth, 64);
    expect(path).toHaveLength(65);
    const first = path[0];
    const last = path[path.length - 1];
    expect(Math.hypot(first[0] - last[0], first[1] - last[1], first[2] - last[2])).toBeLessThan(0.01);
  });
});