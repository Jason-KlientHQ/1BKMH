import { describe, it, expect } from "vitest";
import { PLANETS } from "@/data/solarSystem";
import { buildMissionPath, interpolatePath, legAtProgress } from "@/mission/path";
import { distanceToLine } from "@/mission/flyby";
import { computeMission } from "@/mission/compute";
import { findNavStar } from "@/mission/stars";
import { DEFAULT_VESSEL } from "@/mission/types";
import { heliocentricAU, toScenePosition } from "@/lib/orbital";

describe("mission path", () => {
  it("interpolates along a straight route", () => {
    const star = findNavStar("Proxima Centauri")!;
    const result = computeMission(star, "light_speed", DEFAULT_VESSEL, "sun")!;
    const path = buildMissionPath(result, star, "light_speed", 0);
    const start = interpolatePath(path, 0);
    const end = interpolatePath(path, 1);
    expect(start).toEqual([0, 0, 0]);
    expect(Math.hypot(end[0], end[1], end[2])).toBeGreaterThan(100);
  });

  it("builds dense curved gravity-assist path with flyby arcs", () => {
    const star = findNavStar("Sirius")!;
    const result = computeMission(star, "gravity_assist", DEFAULT_VESSEL, "earth")!;
    const path = buildMissionPath(result, star, "gravity_assist", 0, "earth");

    expect(path.length).toBeGreaterThan(40);

    const jupiter = PLANETS.find((p) => p.name === "Jupiter")!;
    const jupiterPos = toScenePosition(heliocentricAU(jupiter, 0));

    const jupiterLegEnd = path.find((p) => p.label.includes("Jupiter"))!;
    const jupiterLegStartIdx = path.findIndex((p) => /Earth|Solar/i.test(p.label));
    const jupiterSamples = path.slice(jupiterLegStartIdx + 1, path.indexOf(jupiterLegEnd) + 1);

    const mid = jupiterSamples[Math.floor(jupiterSamples.length / 2)]?.position;
    expect(mid).toBeDefined();
    expect(distanceToLine(mid!, path[0].position, jupiterLegEnd.position)).toBeGreaterThan(1.5);

    const nearPlanet = jupiterSamples.some((p) => {
      const d = Math.hypot(
        p.position[0] - jupiterPos[0],
        p.position[1] - jupiterPos[1],
        p.position[2] - jupiterPos[2],
      );
      return d > 6 && d < 25;
    });
    expect(nearPlanet).toBe(true);
  });

  it("starts earth-origin straight routes at Earth, not the Sun", () => {
    const star = findNavStar("Proxima Centauri")!;
    const result = computeMission(star, "nuclear", DEFAULT_VESSEL, "earth")!;
    const path = buildMissionPath(result, star, "nuclear", 0, "earth");
    const start = interpolatePath(path, 0);
    const earth = toScenePosition(heliocentricAU(PLANETS.find((p) => p.name === "Earth")!, 0));
    expect(Math.hypot(start[0] - earth[0], start[1] - earth[1], start[2] - earth[2])).toBeLessThan(0.01);
    expect(path[0].label).toBe("Earth");
  });

  it("resolves current leg from progress", () => {
    const star = findNavStar("Proxima Centauri")!;
    const result = computeMission(star, "nuclear", DEFAULT_VESSEL, "sun")!;
    const early = legAtProgress(result, 0.01);
    const late = legAtProgress(result, 0.99);
    expect(early.index).toBeLessThanOrEqual(late.index);
  });
});