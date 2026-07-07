import { describe, it, expect } from "vitest";
import { NEARBY_STARS } from "@/data/solarSystem";
import { featuredStarRender } from "@/stellar/helpers";
import {
  estimateMassSolar,
  parallaxMas,
  resolveMassSolar,
  stellarLifeStage,
} from "@/stellar/physics";
import { stellarRenderRadius } from "@/stellar/render";

describe("estimateMassSolar", () => {
  it("returns small mass for red dwarfs", () => {
    expect(estimateMassSolar(0.15, "M5V")).toBeLessThan(0.2);
  });

  it("returns larger mass for giants than radius alone suggests", () => {
    const dwarf = estimateMassSolar(0.2, "M4V");
    const giant = estimateMassSolar(25, "K1.5III");
    expect(giant).toBeGreaterThan(dwarf);
  });
});

describe("resolveMassSolar", () => {
  it("uses curated mass for featured stars", () => {
    expect(resolveMassSolar("Sirius", 1.71, "A1V")).toBeCloseTo(2.06, 2);
  });

  it("uses curated mass for newly featured bright stars", () => {
    expect(resolveMassSolar("Betelgeuse", 268, "M2Ib")).toBeCloseTo(16, 0);
    expect(resolveMassSolar("Rigel", 78, "B8Ia")).toBeCloseTo(21, 0);
  });
});

describe("parallaxMas", () => {
  it("returns larger parallax for nearer stars", () => {
    expect(parallaxMas(4.25)).toBeGreaterThan(parallaxMas(500));
  });

  it("matches the 3261.56/d_ly relation", () => {
    expect(parallaxMas(10)).toBeCloseTo(326.156, 2);
  });
});

describe("stellarLifeStage", () => {
  it("classifies red supergiants", () => {
    expect(stellarLifeStage("M2Ib", 268)).toBe("Red supergiant");
    expect(stellarLifeStage("M1Ib", 295)).toBe("Red supergiant");
  });

  it("classifies blue supergiants", () => {
    expect(stellarLifeStage("B8Ia", 78)).toBe("Blue supergiant");
    expect(stellarLifeStage("A2Ia", 203)).toBe("Blue supergiant");
  });

  it("classifies main-sequence dwarfs", () => {
    expect(stellarLifeStage("M5.5V", 0.15)).toBe("Main sequence");
    expect(stellarLifeStage("A1V", 1.71)).toBe("Main sequence");
  });
});

describe("stellarRenderRadius", () => {
  it("renders giants much larger than red dwarfs", () => {
    const proxima = stellarRenderRadius({
      radiusSolar: 0.154,
      massSolar: 0.12,
      luminositySolar: 0.0001,
    });
    const arcturus = stellarRenderRadius({
      radiusSolar: 25.4,
      massSolar: 1.08,
      luminositySolar: 100,
    });
    const aldebaran = stellarRenderRadius({
      radiusSolar: 45,
      massSolar: 1.16,
      luminositySolar: 150,
    });

    expect(arcturus).toBeGreaterThan(proxima * 3);
    expect(aldebaran).toBeGreaterThan(arcturus);
  });

  it("orders featured stars by radius consistently", () => {
    const sirius = featuredStarRender(NEARBY_STARS.find((s) => s.name === "Sirius")!)!;
    const proxima = featuredStarRender(NEARBY_STARS.find((s) => s.name === "Proxima Centauri")!)!;
    const arcturus = featuredStarRender(NEARBY_STARS.find((s) => s.name === "Arcturus")!)!;

    expect(sirius.size).toBeGreaterThan(proxima.size);
    expect(arcturus.size).toBeGreaterThan(sirius.size);
  });

  it("renders supergiants much larger than red giants after cap raise", () => {
    const arcturus = featuredStarRender(NEARBY_STARS.find((s) => s.name === "Arcturus")!)!;
    const betelgeuse = featuredStarRender(NEARBY_STARS.find((s) => s.name === "Betelgeuse")!)!;
    const rigel = featuredStarRender(NEARBY_STARS.find((s) => s.name === "Rigel")!)!;

    expect(betelgeuse.size).toBeGreaterThan(arcturus.size * 1.8);
    expect(betelgeuse.size).toBeGreaterThan(rigel.size);
    expect(betelgeuse.size).toBeLessThanOrEqual(260);
  });
});