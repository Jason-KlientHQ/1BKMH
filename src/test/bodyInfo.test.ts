import { describe, expect, it } from "vitest";
import { getBodyInfo } from "@/data/bodyInfo";

describe("body info rotation stats", () => {
  it("shows measured Sun rotation", () => {
    const sun = getBodyInfo("Sun");
    const rot = sun?.stats.find((s) => s.label === "Rotation");
    expect(rot?.value).toBe("25.1 d · measured");
  });

  it("shows rotation for nearby stars", () => {
    const sirius = getBodyInfo("Sirius");
    const rot = sirius?.stats.find((s) => s.label === "Rotation");
    expect(rot?.value).toContain("d · measured");
  });

  it("shows pulsar spin for Crab Pulsar", () => {
    const crab = getBodyInfo("Crab Pulsar");
    const rot = crab?.stats.find((s) => s.label === "Rotation");
    expect(rot?.value).toBe("33 ms · measured");
  });
});