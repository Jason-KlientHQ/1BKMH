import { describe, it, expect } from "vitest";
import { SECONDS_PER_ORBIT } from "@/lib/constants";
import {
  buildShareQuery,
  computeLightJourney,
  nextStar,
  parseBirthdayParam,
  parseLeapParam,
  starsReached,
} from "@/lib/lightJourney";

const STARS = [
  { name: "Proxima Centauri", distance: 4.25 },
  { name: "Sirius", distance: 8.58 },
  { name: "Vega", distance: 25.05 },
];

describe("computeLightJourney", () => {
  const referenceNow = new Date("2020-01-01T12:00:00Z");

  it("returns null for empty or future birthdays", () => {
    expect(computeLightJourney("", true, referenceNow)).toBeNull();
    expect(computeLightJourney("2030-01-01", true, referenceNow)).toBeNull();
  });

  it("maps one Julian year of age to one light-year", () => {
    const birthMs = new Date("2019-06-15").getTime();
    const exactYearLater = new Date(birthMs + 365.25 * 86400 * 1000);
    const r = computeLightJourney("2019-06-15", true, exactYearLater);
    expect(r).not.toBeNull();
    expect(r!.years).toBeCloseTo(1, 6);
    expect(r!.lightYears).toBeCloseTo(1, 6);
  });

  it("uses 365-day years when leap accounting is off", () => {
    const leap = computeLightJourney("2019-01-01", true, referenceNow)!;
    const flat = computeLightJourney("2019-01-01", false, referenceNow)!;
    expect(flat.years).toBeGreaterThan(leap.years);
  });

  it("derives orbital laps from SECONDS_PER_ORBIT", () => {
    const birthMs = new Date("2019-06-15").getTime();
    const exactYearLater = new Date(birthMs + 365.25 * 86400 * 1000);
    const r = computeLightJourney("2019-06-15", true, exactYearLater)!;
    const ageSeconds = 365.25 * 86400;
    expect(r.totalOrbits).toBeCloseTo(ageSeconds / SECONDS_PER_ORBIT, 4);
    expect(r.orbitsPerYear).toBeCloseTo((365.25 * 86400) / SECONDS_PER_ORBIT, 4);
  });
});

describe("URL helpers", () => {
  it("validates birthday params", () => {
    expect(parseBirthdayParam("1990-06-15")).toBe("1990-06-15");
    expect(parseBirthdayParam("90-06-15")).toBeNull();
    expect(parseBirthdayParam(null)).toBeNull();
  });

  it("parses leap flag", () => {
    expect(parseLeapParam(null)).toBe(true);
    expect(parseLeapParam("1")).toBe(true);
    expect(parseLeapParam("0")).toBe(false);
    expect(parseLeapParam("false")).toBe(false);
  });

  it("builds share query with optional leap=0", () => {
    expect(buildShareQuery("1990-01-01", true)).toBe("?b=1990-01-01");
    expect(buildShareQuery("1990-01-01", false)).toBe("?b=1990-01-01&leap=0");
  });
});

describe("star reach", () => {
  it("filters reached stars and finds the next target", () => {
    const reached = starsReached(STARS, 10);
    expect(reached.map((s) => s.name)).toEqual(["Proxima Centauri", "Sirius"]);
    expect(nextStar(STARS, 10)?.name).toBe("Vega");
  });

  it("returns none reached inside the solar neighbourhood", () => {
    expect(starsReached(STARS, 2)).toHaveLength(0);
    expect(nextStar(STARS, 2)?.name).toBe("Proxima Centauri");
  });
});