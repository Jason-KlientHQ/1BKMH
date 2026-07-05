import { describe, it, expect } from "vitest";
import { EXOPLANETS, NEARBY_STARS } from "@/data/solarSystem";

describe("exoplanets", () => {
  it("has expanded catalog with TRAPPIST-1 system", () => {
    const trappist = EXOPLANETS.filter((e) => e.host === "TRAPPIST-1");
    expect(trappist.length).toBe(7);
  });

  it("only references featured host stars", () => {
    const hosts = new Set(NEARBY_STARS.map((s) => s.name));
    for (const exo of EXOPLANETS) {
      expect(hosts.has(exo.host)).toBe(true);
    }
  });

  it("includes new featured stars for planet hosts", () => {
    const names = new Set(NEARBY_STARS.map((s) => s.name));
    expect(names.has("TRAPPIST-1")).toBe(true);
    expect(names.has("Epsilon Indi")).toBe(true);
    expect(names.has("LHS 1140")).toBe(true);
  });
});