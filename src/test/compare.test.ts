import { describe, it, expect } from "vitest";
import { compareModes } from "@/mission/compare";
import { findNavStar } from "@/mission/stars";
import { DEFAULT_VESSEL } from "@/mission/types";

describe("mode comparison", () => {
  it("sorts modes by ascending ETA", () => {
    const star = findNavStar("Proxima Centauri")!;
    const rows = compareModes(star, DEFAULT_VESSEL, "sun", "nuclear");
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].etaYears).toBeGreaterThanOrEqual(rows[i - 1].etaYears);
    }
    const light = rows.find((r) => r.mode === "light_speed")!;
    const nuclear = rows.find((r) => r.mode === "nuclear")!;
    expect(light.etaYears).toBeLessThan(nuclear.etaYears);
  });

  it("marks the active mode", () => {
    const star = findNavStar("Sirius")!;
    const rows = compareModes(star, DEFAULT_VESSEL, "sun", "solar_sail");
    expect(rows.filter((r) => r.isActive)).toHaveLength(1);
    expect(rows.find((r) => r.isActive)?.mode).toBe("solar_sail");
  });
});