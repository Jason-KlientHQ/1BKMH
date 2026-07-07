import { describe, expect, it } from "vitest";
import { MOONS, PLANETS, SPACECRAFT } from "@/data/solarSystem";
import {
  MOON_MODEL_URL,
  NASA_GLTF,
  PLANET_MODEL_URL,
  SPACECRAFT_MODEL_URL,
} from "@/data/nasaModels";

describe("nasa model coverage", () => {
  it("maps every planet and dwarf to a glTF", () => {
    for (const body of PLANETS) {
      expect(PLANET_MODEL_URL[body.name], body.name).toBeTruthy();
    }
  });

  it("maps every moon to a glTF", () => {
    for (const moon of MOONS) {
      expect(MOON_MODEL_URL[moon.name], moon.name).toBeTruthy();
    }
  });

  it("maps every spacecraft to a glTF", () => {
    for (const craft of SPACECRAFT) {
      expect(SPACECRAFT_MODEL_URL[craft.name], craft.name).toBeTruthy();
    }
  });

  it("uses vendored paths under /models/nasa", () => {
    const urls = Object.values(NASA_GLTF);
    expect(urls.every((u) => u.startsWith("/models/nasa/"))).toBe(true);
    expect(urls.length).toBeGreaterThanOrEqual(37);
  });
});