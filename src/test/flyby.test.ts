import { describe, it, expect } from "vitest";
import { distanceToLine, flybyArc, transferArc } from "@/mission/flyby";

describe("flyby arcs", () => {
  it("bends around a planet instead of cutting straight through", () => {
    const from: [number, number, number] = [0, 0, 0];
    const planet: [number, number, number] = [50, 0, 0];
    const to: [number, number, number] = [80, 0, 40];
    const arc = flybyArc(from, planet, to, 24, 8);

    expect(arc.length).toBeGreaterThan(10);

    const mid = arc[Math.floor(arc.length / 2)];
    const chordDist = distanceToLine(mid, from, to);
    expect(chordDist).toBeGreaterThan(2);

    const closest = arc.reduce((best, p) => {
      const d = Math.hypot(p[0] - planet[0], p[1] - planet[1], p[2] - planet[2]);
      return d < best ? d : best;
    }, Infinity);
    expect(closest).toBeGreaterThan(4);
    expect(closest).toBeLessThan(20);
  });

  it("samples transfer arcs with more than two points", () => {
    const pts = transferArc([0, 0, 0], [100, 0, 50], 12);
    expect(pts.length).toBe(12);
    expect(pts[0]).toEqual([0, 0, 0]);
    expect(pts[pts.length - 1]).toEqual([100, 0, 50]);
  });
});