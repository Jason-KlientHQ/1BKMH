import { describe, it, expect } from "vitest";
import { computeMission, missionPreview } from "@/mission/preview";
import { findNavStar, isNavStar, searchNavStars } from "@/mission/stars";
import { buildAppShareQuery, parseAppUrl, parseMissionParams } from "@/mission/url";
import { DEFAULT_VESSEL } from "@/mission/types";

describe("nav stars", () => {
  it("finds featured stars by name", () => {
    expect(findNavStar("Sirius")?.distanceLy).toBeCloseTo(8.58, 1);
    expect(isNavStar("Sirius")).toBe(true);
    expect(isNavStar("Sun")).toBe(false);
  });

  it("searches by prefix", () => {
    const hits = searchNavStars("Prox");
    expect(hits[0]?.name).toBe("Proxima Centauri");
  });
});

describe("mission URL", () => {
  it("round-trips destination and mode", () => {
    const params = new URLSearchParams("dest=Proxima%20Centauri&mode=light_speed&mass=500");
    const mission = parseMissionParams(params);
    expect(mission.destination).toBe("Proxima Centauri");
    expect(mission.mode).toBe("light_speed");
    expect(mission.vessel.dryMassKg).toBe(500);

    const q = buildAppShareQuery({
      bday: "1990-01-01",
      useLeap: true,
      mission,
    });
    expect(q).toContain("b=1990-01-01");
    expect(q).toContain("dest=Proxima");
    expect(q).toContain("mode=light_speed");
    expect(q).toContain("mass=500");
  });

  it("round-trips true orbits flag in URL", () => {
    const q = buildAppShareQuery({
      bday: "1990-01-01",
      mission: { origin: "sun", destination: null, mode: "sublight", vessel: { ...DEFAULT_VESSEL } },
      trueOrbits: true,
    });
    const parsed = parseAppUrl(new URLSearchParams(q.slice(1)));
    expect(parsed.trueOrbits).toBe(true);
  });

  it("round-trips educational accuracy mode in URL", () => {
    const q = buildAppShareQuery({
      bday: "1990-01-01",
      mission: { origin: "sun", destination: null, mode: "sublight", vessel: { ...DEFAULT_VESSEL } },
      accuracy: "educational",
    });
    const parsed = parseAppUrl(new URLSearchParams(q.slice(1)));
    expect(parsed.accuracy).toBe("educational");
  });

  it("omits default params from share URL", () => {
    const q = buildAppShareQuery({
      mission: { origin: "sun", destination: null, mode: "sublight", vessel: { ...DEFAULT_VESSEL } },
    });
    expect(q).toBe("");
  });

  it("includes fly=1 when sharing an in-flight mission", () => {
    const q = buildAppShareQuery({
      mission: {
        origin: "sun",
        destination: "Sirius",
        mode: "light_speed",
        vessel: { ...DEFAULT_VESSEL },
      },
      fly: true,
    });
    expect(q).toContain("fly=1");
    expect(q).toContain("dest=Sirius");
  });
});

describe("mission preview", () => {
  it("estimates light-speed ETA as distance in years", () => {
    const star = findNavStar("Sirius")!;
    const p = missionPreview(star, "light_speed", DEFAULT_VESSEL)!;
    expect(p.etaLabel).toContain("year");
    expect(p.ready).toBe(true);
  });

  it("computes nuclear mode with full profile", () => {
    const star = findNavStar("Proxima Centauri")!;
    const r = computeMission(star, "nuclear", DEFAULT_VESSEL)!;
    expect(r.etaYears).toBeGreaterThan(1000);
    expect(r.deltaVKms).toBeGreaterThan(0);
  });
});