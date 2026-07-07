import { describe, expect, it } from "vitest";
import { blackHoleDiskRadii, supermassiveDiskRadii } from "@/components/AccretionDisk";

describe("accretion disk scale helpers", () => {
  it("scales stellar black hole disks with mass", () => {
    const small = blackHoleDiskRadii(9.6);
    const large = blackHoleDiskRadii(33);
    expect(large.shadow).toBeGreaterThan(small.shadow);
    expect(large.outer).toBeGreaterThan(small.outer);
  });

  it("keeps inner radius outside shadow for stellar holes", () => {
    const d = blackHoleDiskRadii(21);
    expect(d.inner).toBeGreaterThan(d.shadow);
    expect(d.outer).toBeGreaterThan(d.inner);
  });

  it("returns supermassive disk radii for Sgr A* scale", () => {
    const d = supermassiveDiskRadii(22);
    expect(d.shadow).toBeCloseTo(12.1, 0);
    expect(d.outer).toBeGreaterThan(d.inner);
  });
});