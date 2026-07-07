import { describe, expect, it } from "vitest";
import { EXOPLANETS, NEARBY_STARS } from "@/data/solarSystem";
import {
  EXOPLANET_CATALOG,
  archivePlanetsForHost,
  confirmedPlanetCount,
} from "@/data/exoplanetCatalog";
import { resolveFeaturedHost } from "@/lib/exoplanetHosts";

describe("exoplanet catalog", () => {
  it("loads archive snapshot with galaxy total", () => {
    expect(EXOPLANET_CATALOG.planets.length).toBeGreaterThan(30);
    expect(EXOPLANET_CATALOG.galaxyTotal).toBeGreaterThan(5000);
  });

  it("resolves known archive host aliases to featured stars", () => {
    expect(resolveFeaturedHost("Proxima Cen")).toBe("Proxima Centauri");
    expect(resolveFeaturedHost("TRAPPIST-1")).toBe("TRAPPIST-1");
    expect(resolveFeaturedHost("55 Cnc")).toBe("55 Cancri");
  });

  it("maps archive planets only to featured hosts", () => {
    const hosts = new Set(NEARBY_STARS.map((s) => s.name));
    for (const p of EXOPLANET_CATALOG.planets) {
      expect(hosts.has(p.host)).toBe(true);
    }
  });

  it("dedupes archive planets already covered by curated Tier A", () => {
    const trappistArchive = archivePlanetsForHost("TRAPPIST-1");
    const trappistCurated = EXOPLANETS.filter((e) => e.host === "TRAPPIST-1");
    expect(trappistCurated.length).toBe(7);
    expect(trappistArchive.length).toBe(0);
  });

  it("reports confirmed counts for planet hosts", () => {
    expect(confirmedPlanetCount("TRAPPIST-1")).toBeGreaterThanOrEqual(7);
    expect(confirmedPlanetCount("Proxima Centauri")).toBeGreaterThanOrEqual(2);
  });
});