import { describe, it, expect } from "vitest";
import { NEARBY_STARS } from "@/data/solarSystem";
import { featuredStarRender } from "@/stellar/helpers";
import { estimateMassSolar, resolveMassSolar } from "@/stellar/physics";
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
});