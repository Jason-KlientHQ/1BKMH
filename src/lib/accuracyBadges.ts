import { MOONS, SPACECRAFT, COMETS, PLANETS, EXOPLANETS } from "@/data/solarSystem";
import { NEARBY_STARS } from "@/data/solarSystem";
import { isNavStar } from "@/mission/stars";

export interface AccuracyBadge {
  label: string;
  title: string;
}

export function globalAccuracyBadges(mode: "cinematic" | "educational"): AccuracyBadge[] {
  const badges: AccuracyBadge[] = [
    {
      label: "Light sphere: metaphor",
      title: "The expanding sphere marks one-way light travel since your birthday — not a physical wave.",
    },
  ];
  if (mode === "educational") {
    badges.push({
      label: "Educational mode",
      title: "True moon and exoplanet periods, birth-tied epoch, and proper-motion mission paths are enabled.",
    });
  }
  return badges;
}

export function bodyAccuracyBadges(
  name: string,
  opts: { trueMoonPeriods: boolean },
): AccuracyBadge[] {
  if (name === "Sun") {
    return [{ label: "Static", title: "The Sun is fixed at the origin." }];
  }

  if (PLANETS.some((p) => p.name === name) || COMETS.some((c) => c.name === name)) {
    return [
      {
        label: "Keplerian (J2000)",
        title: "Position from J2000 mean orbital elements via Kepler's equation.",
      },
    ];
  }

  if (MOONS.some((m) => m.name === name)) {
    return opts.trueMoonPeriods
      ? [
          {
            label: "True period",
            title: "Moon orbit uses the real sidereal period in simulation years.",
          },
        ]
      : [
          {
            label: "Moon: cinematic",
            title: "Orbital period is compressed for watchability; order and direction are preserved.",
          },
        ];
  }

  if (EXOPLANETS.some((e) => e.name === name)) {
    return opts.trueMoonPeriods
      ? [
          {
            label: "True period",
            title: "Exoplanet orbit uses the catalog sidereal period in simulation years.",
          },
        ]
      : [
          {
            label: "Exoplanet: cinematic",
            title: "Orbital period is compressed for watchability; inner worlds move faster than outer ones.",
          },
        ];
  }

  if (SPACECRAFT.some((s) => s.name === name)) {
    const sc = SPACECRAFT.find((s) => s.name === name)!;
    if (sc.orbit === "earth") {
      return [
        {
          label: "LEO model",
          title: "Circular low-Earth orbit with real inclination and Kepler III period.",
        },
      ];
    }
    return [{ label: "Schematic position", title: "Heliocentric marker — approximate direction and distance." }];
  }

  if (name === "Asteroid belt" || name === "Kuiper belt") {
    return [{ label: "Belt: illustrative", title: "Particles rotate as a group — not individual orbits." }];
  }

  if (isNavStar(name) || NEARBY_STARS.some((s) => s.name === name)) {
    return [
      {
        label: "Proper motion",
        title: "Star direction drifts with measured annual proper motion (Gaia/Hipparcos).",
      },
    ];
  }

  return [];
}