import { describe, expect, it } from "vitest";
import { resolveSceneQuality } from "@/hooks/useSceneQuality";

describe("resolveSceneQuality", () => {
  it("uses high tier on desktop without save-data", () => {
    const q = resolveSceneQuality(false, false, false);
    expect(q.tier).toBe("high");
    expect(q.dprMax).toBe(2);
    expect(q.catalogMagLimit).toBeNull();
  });

  it("uses low tier on mobile", () => {
    const q = resolveSceneQuality(true, false, false);
    expect(q.tier).toBe("low");
    expect(q.dprMax).toBe(1);
    expect(q.catalogMagLimit).toBe(8);
    expect(q.backgroundStarCounts[0]).toBeLessThan(5000);
  });

  it("uses low tier when reduced motion is preferred", () => {
    expect(resolveSceneQuality(false, true, false).tier).toBe("low");
  });

  it("uses low tier when save-data is enabled", () => {
    expect(resolveSceneQuality(false, false, true).tier).toBe("low");
  });
});