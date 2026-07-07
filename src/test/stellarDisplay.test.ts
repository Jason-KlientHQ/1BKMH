import { describe, it, expect } from "vitest";
import {
  catalogBaseSize,
  catalogDisplayScale,
  featuredDisplayScale,
  stellarDisplayScale,
} from "@/lib/stellarDisplay";

describe("stellarDisplayScale", () => {
  const cam = { x: 0, y: 200, z: 800 };
  const near: [number, number, number] = [0, 0, 900];
  const far: [number, number, number] = [0, 0, 28000];

  it("leaves size unchanged when the camera is close", () => {
    expect(stellarDisplayScale(40, cam, near)).toBe(40);
  });

  it("boosts size when the camera is far from the star", () => {
    const boosted = stellarDisplayScale(40, cam, far);
    expect(boosted).toBeGreaterThan(40);
    expect(boosted).toBeLessThanOrEqual(40 * 12);
  });

  it("boosts supergiants more than dwarfs at map distance", () => {
    const dwarf = featuredDisplayScale(12, 0.2, cam, far);
    const giant = featuredDisplayScale(180, 268, cam, far);
    expect(giant).toBeGreaterThan(dwarf * 2);
  });
});

describe("catalogBaseSize", () => {
  it("raises the floor for bright catalog stars", () => {
    expect(catalogBaseSize(3, 1.5)).toBeGreaterThanOrEqual(14);
    expect(catalogBaseSize(3, 5)).toBeGreaterThanOrEqual(8);
    expect(catalogBaseSize(3, 11)).toBeGreaterThanOrEqual(6);
  });

  it("applies extra zoom boost to bright catalog stars", () => {
    const cam = { x: 0, y: 0, z: 0 };
    const pos: [number, number, number] = [0, 0, 15000];
    const faint = catalogDisplayScale(6, 11, cam, pos);
    const bright = catalogDisplayScale(14, 1.2, cam, pos);
    expect(bright).toBeGreaterThan(faint);
  });
});