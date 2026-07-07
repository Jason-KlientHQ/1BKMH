import { describe, it, expect } from "vitest";
import { COSMIC_LANDMARKS } from "@/data/solarSystem";
import { getBodyInfo } from "@/data/bodyInfo";

describe("COSMIC_LANDMARKS", () => {
  it("includes major galactic anchors", () => {
    const names = COSMIC_LANDMARKS.map((l) => l.name);
    expect(names).toContain("Andromeda Galaxy (M31)");
    expect(names).toContain("Galactic Center (Sgr A*)");
    expect(names).toContain("Large Magellanic Cloud");
  });

  it("compresses scene distance below true distance", () => {
    for (const l of COSMIC_LANDMARKS) {
      expect(l.sceneDistanceLy).toBeLessThan(l.distanceLy);
    }
  });

  it("exposes detail panels with honest distances", () => {
    const m31 = getBodyInfo("Andromeda Galaxy (M31)");
    expect(m31?.stats.some((s) => s.value.includes("million"))).toBe(true);
    expect(m31?.scienceNote).toMatch(/not simulated/i);
  });
});