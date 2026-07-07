import { describe, expect, it } from "vitest";
import { moonMeshSceneRadius, moonParentSceneRatio } from "@/lib/moonScale";

describe("moon proportional scale", () => {
  it("keeps Moon/Earth near physical ratio in educational mode", () => {
    const ratio = moonParentSceneRatio(6371, 1737, "educational");
    const physical = 1737 / 6371;
    expect(ratio).toBeCloseTo(physical, 1);
  });

  it("does not inflate Ganymede to ~36% of Jupiter (old bug was ~9× physical)", () => {
    const ratio = moonParentSceneRatio(69911, 2634, "educational");
    const physical = 2634 / 69911;
    expect(ratio).toBeLessThan(physical * 2);
    expect(ratio).toBeCloseTo(physical, 1);
  });

  it("applies modest cinematic boost over educational", () => {
    const edu = moonMeshSceneRadius(6371, 1737, "educational");
    const cine = moonMeshSceneRadius(6371, 1737, "cinematic");
    expect(cine).toBeGreaterThan(edu);
    expect(cine / edu).toBeCloseTo(1.35, 2);
  });
});