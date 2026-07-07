import { describe, it, expect } from "vitest";
import { NEARBY_STARS } from "@/data/solarSystem";
import { STAR_CATALOG } from "@/data/starCatalog";
import { findNavStar } from "@/mission/stars";

const FAMOUS_BRIGHT = [
  "Betelgeuse",
  "Antares",
  "Rigel",
  "Deneb",
  "Canopus",
  "Polaris",
  "Bellatrix",
  "Mintaka",
  "Alnilam",
  "Alnitak",
] as const;

describe("featured bright stars", () => {
  it("includes all famous bright stars in NEARBY_STARS", () => {
    const names = new Set(NEARBY_STARS.map((s) => s.name));
    for (const star of FAMOUS_BRIGHT) {
      expect(names.has(star), `missing featured star: ${star}`).toBe(true);
    }
  });

  it("excludes promoted stars from the catalog instanced mesh", () => {
    const featured = new Set(NEARBY_STARS.map((s) => s.name.toLowerCase()));
    for (const star of FAMOUS_BRIGHT) {
      const inCatalog = STAR_CATALOG.some((s) => s.name.toLowerCase() === star.toLowerCase());
      if (inCatalog) {
        expect(featured.has(star.toLowerCase())).toBe(true);
      }
    }
  });

  it("registers each star in mission navigation", () => {
    for (const star of FAMOUS_BRIGHT) {
      const nav = findNavStar(star);
      expect(nav?.name).toBe(star);
      expect(nav?.featured).toBe(true);
    }
  });
});