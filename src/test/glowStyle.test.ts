import { describe, expect, it } from "vitest";
import {
  decorativeOpacity,
  showDecorativeGlow,
  starGlowShellRadiusFactor,
  starLuminosityGlowOpacity,
  stateGlowOpacity,
} from "@/lib/glowStyle";

describe("glowStyle", () => {
  it("hides decorative glow in educational mode", () => {
    expect(showDecorativeGlow("educational")).toBe(false);
    expect(decorativeOpacity(0.2, "educational")).toBe(0);
    expect(starLuminosityGlowOpacity(0.3, "educational")).toBe(0);
    expect(starGlowShellRadiusFactor("educational")).toBe(0);
  });

  it("softens cinematic decorative glow", () => {
    expect(decorativeOpacity(0.2, "cinematic")).toBeCloseTo(0.13, 2);
    expect(starLuminosityGlowOpacity(0.3, "cinematic")).toBeCloseTo(0.216, 2);
    expect(starGlowShellRadiusFactor("cinematic")).toBe(1.45);
  });

  it("keeps state glow visible but reduced", () => {
    expect(stateGlowOpacity(0.16, "cinematic")).toBeCloseTo(0.1248, 3);
    expect(stateGlowOpacity(0.16, "educational")).toBeCloseTo(0.1248, 3);
  });
});