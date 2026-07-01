import type { OrbitalElements } from "@/lib/orbital";

export interface Body extends OrbitalElements {
  name: string;
  radiusKm: number;
  color: string;
  emissive?: string;
  kind: "planet" | "dwarf";
  ring?: { inner: number; outer: number; color: string }; // for Saturn etc. (km)
}

export interface Moon {
  name: string;
  parent: string;
  aKm: number; // semi-major axis around parent (km)
  periodDays: number; // negative = retrograde
  radiusKm: number;
  inclDeg: number;
  color: string;
}

/**
 * Planets + dwarf planets — J2000 mean orbital elements.
 * a (AU), e, i (deg, to ecliptic), node Ω (deg), peri ϖ (deg), L0 mean long (deg),
 * period (sidereal years), radius (equatorial km).
 */
export const PLANETS: Body[] = [
  { name: "Mercury", kind: "planet", a: 0.38710, e: 0.20563, i: 7.005, node: 48.331, peri: 77.456, L0: 252.251, period: 0.2408, radiusKm: 2440, color: "#a9a29b" },
  { name: "Venus", kind: "planet", a: 0.72333, e: 0.00677, i: 3.395, node: 76.680, peri: 131.533, L0: 181.979, period: 0.6152, radiusKm: 6052, color: "#d8b67a" },
  { name: "Earth", kind: "planet", a: 1.00000, e: 0.01671, i: 0.0, node: 0.0, peri: 102.937, L0: 100.464, period: 1.0, radiusKm: 6371, color: "#3a7bd5", emissive: "#0a2a55" },
  { name: "Mars", kind: "planet", a: 1.52371, e: 0.09339, i: 1.850, node: 49.558, peri: 336.041, L0: 355.453, period: 1.8808, radiusKm: 3390, color: "#c1440e" },
  { name: "Jupiter", kind: "planet", a: 5.20288, e: 0.04839, i: 1.304, node: 100.464, peri: 14.331, L0: 34.351, period: 11.862, radiusKm: 69911, color: "#d8a878" },
  { name: "Saturn", kind: "planet", a: 9.53667, e: 0.05386, i: 2.486, node: 113.665, peri: 93.057, L0: 50.078, period: 29.457, radiusKm: 58232, color: "#e3c98f", ring: { inner: 74500, outer: 136780, color: "#cdbb92" } },
  { name: "Uranus", kind: "planet", a: 19.18916, e: 0.04726, i: 0.773, node: 74.006, peri: 173.005, L0: 314.055, period: 84.011, radiusKm: 25362, color: "#9fdce3" },
  { name: "Neptune", kind: "planet", a: 30.06992, e: 0.00859, i: 1.770, node: 131.784, peri: 48.124, L0: 304.349, period: 164.79, radiusKm: 24622, color: "#3f64cc", emissive: "#16306e" },
  // Dwarf planets
  { name: "Ceres", kind: "dwarf", a: 2.7665, e: 0.0758, i: 10.594, node: 80.305, peri: 153.000, L0: 95.989, period: 4.604, radiusKm: 473, color: "#9a948c" },
  { name: "Pluto", kind: "dwarf", a: 39.4821, e: 0.2488, i: 17.16, node: 110.299, peri: 224.069, L0: 238.929, period: 247.94, radiusKm: 1188, color: "#c8a98a" },
  { name: "Haumea", kind: "dwarf", a: 43.13, e: 0.195, i: 28.19, node: 122.103, peri: 240.20, L0: 209.0, period: 283.8, radiusKm: 816, color: "#d9d2c7" },
  { name: "Makemake", kind: "dwarf", a: 45.79, e: 0.159, i: 28.98, node: 79.62, peri: 294.83, L0: 165.5, period: 309.9, radiusKm: 715, color: "#b08968" },
  { name: "Eris", kind: "dwarf", a: 67.78, e: 0.4407, i: 44.04, node: 35.95, peri: 151.43, L0: 204.16, period: 559.07, radiusKm: 1163, color: "#cfcfc4" },
];

/** Major moons (the ones you'd actually see). a in km, period in days. */
export const MOONS: Moon[] = [
  { name: "Moon", parent: "Earth", aKm: 384400, periodDays: 27.322, radiusKm: 1737, inclDeg: 5.145, color: "#bdbdbd" },
  // Jupiter — the Galileans
  { name: "Io", parent: "Jupiter", aKm: 421700, periodDays: 1.769, radiusKm: 1821, inclDeg: 0.05, color: "#e8d96a" },
  { name: "Europa", parent: "Jupiter", aKm: 671034, periodDays: 3.551, radiusKm: 1561, inclDeg: 0.47, color: "#cdb7a0" },
  { name: "Ganymede", parent: "Jupiter", aKm: 1070412, periodDays: 7.155, radiusKm: 2634, inclDeg: 0.20, color: "#9b8e7d" },
  { name: "Callisto", parent: "Jupiter", aKm: 1882709, periodDays: 16.689, radiusKm: 2410, inclDeg: 0.19, color: "#6e655a" },
  // Saturn
  { name: "Enceladus", parent: "Saturn", aKm: 238040, periodDays: 1.370, radiusKm: 252, inclDeg: 0.02, color: "#f2f2ef" },
  { name: "Rhea", parent: "Saturn", aKm: 527108, periodDays: 4.518, radiusKm: 764, inclDeg: 0.35, color: "#ccc6bd" },
  { name: "Titan", parent: "Saturn", aKm: 1221870, periodDays: 15.945, radiusKm: 2575, inclDeg: 0.33, color: "#d9a441" },
  { name: "Iapetus", parent: "Saturn", aKm: 3560820, periodDays: 79.32, radiusKm: 735, inclDeg: 15.47, color: "#8a7a63" },
  // Uranus
  { name: "Titania", parent: "Uranus", aKm: 435910, periodDays: 8.706, radiusKm: 789, inclDeg: 0.34, color: "#b9c7c9" },
  { name: "Oberon", parent: "Uranus", aKm: 583520, periodDays: 13.463, radiusKm: 761, inclDeg: 0.07, color: "#a6b2b4" },
  // Neptune (Triton orbits retrograde → negative period)
  { name: "Triton", parent: "Neptune", aKm: 354759, periodDays: -5.877, radiusKm: 1353, inclDeg: 157.0, color: "#cdd6d9" },
  // Pluto
  { name: "Charon", parent: "Pluto", aKm: 19591, periodDays: 6.387, radiusKm: 606, inclDeg: 0.0, color: "#b3a596" },
];

/* ---------------------------------- Comets -------------------------------- */
export interface Comet extends OrbitalElements {
  name: string;
  radiusKm: number;
  color: string;
  desc: string;
}
export const COMETS: Comet[] = [
  { name: "Halley's Comet", a: 17.834, e: 0.96714, i: 162.26, node: 58.42, peri: 169.75, L0: 223, period: 75.32, radiusKm: 5.5, color: "#bfe6ff", desc: "The most famous comet — visible from Earth roughly every 76 years. Last seen 1986, returns 2061." },
  { name: "Comet Encke", a: 2.215, e: 0.8483, i: 11.78, node: 334.57, peri: 186.5, L0: 100, period: 3.3, radiusKm: 2.4, color: "#cfeeff", desc: "The comet with the shortest known orbital period — it laps the inner solar system every 3.3 years." },
];

/* ---------------------------- Starman's Roadster -------------------------- */
// Elon Musk's Tesla Roadster, launched on the first Falcon Heavy (Feb 6 2018)
// into a heliocentric orbit. Real orbital elements (JPL, object -143205);
// L0 is approximate since it post-dates the J2000 epoch our solver assumes.
export interface Roadster extends OrbitalElements {
  name: string;
  desc: string;
}
export const ROADSTER: Roadster = {
  name: "Starman's Roadster",
  a: 1.3254,
  e: 0.2557,
  i: 1.0774,
  node: 316.99,
  peri: 134.61,
  L0: 200,
  period: 1.5255,
  desc: "Elon Musk's cherry-red Tesla Roadster, launched on the first Falcon Heavy in February 2018 with a spacesuited mannequin, 'Starman', at the wheel. It now loops the Sun on an elliptical orbit that reaches beyond Mars.",
};

/* ------------------------------ Spacecraft -------------------------------- */
export interface Spacecraft {
  name: string;
  kind: string;
  desc: string;
  orbit: "earth" | "sun";
  altKm?: number; // Earth-orbiters: altitude above Earth
  distanceAU?: number; // heliocentric markers: current distance from the Sun
  dir?: [number, number, number]; // heliocentric markers: outbound direction
  color: string;
}
export const SPACECRAFT: Spacecraft[] = [
  { name: "International Space Station", kind: "Space station", orbit: "earth", altKm: 417, color: "#e2e8f0", desc: "The largest crewed structure in space — a football-field-sized laboratory orbiting Earth every 90 minutes since 1998." },
  { name: "Hubble Space Telescope", kind: "Space telescope", orbit: "earth", altKm: 535, color: "#c9d2dc", desc: "In low Earth orbit since 1990, Hubble has taken some of the most iconic images of the universe." },
  { name: "James Webb Space Telescope", kind: "Space telescope", orbit: "sun", distanceAU: 1.01, dir: [-0.62, 0.12, 0.78], color: "#e8c169", desc: "The largest space telescope, parked at the Sun-Earth L2 point ~1.5 million km beyond Earth, seeing the universe in infrared." },
  { name: "Parker Solar Probe", kind: "Solar probe", orbit: "sun", distanceAU: 0.3, dir: [0.68, 0.16, -0.72], color: "#ffcf8f", desc: "The fastest object ever built, diving repeatedly through the Sun's corona to 'touch' our star." },
  { name: "New Horizons", kind: "Deep-space probe", orbit: "sun", distanceAU: 60, dir: [0.5, -0.55, 0.67], color: "#c7c0b0", desc: "Flew past Pluto in 2015 and a Kuiper Belt object in 2019; now heading into deep space." },
  { name: "Pioneer 10", kind: "Deep-space probe", orbit: "sun", distanceAU: 135, dir: [0.9, -0.1, -0.42], color: "#b8ad92", desc: "The first probe to cross the asteroid belt and fly by Jupiter; carrying a plaque for any who find it." },
  { name: "Voyager 2", kind: "Interstellar probe", orbit: "sun", distanceAU: 139, dir: [-0.2, -0.7, 0.68], color: "#cbb68f", desc: "The only spacecraft to visit all four giant planets; now in interstellar space, still calling home." },
  { name: "Voyager 1", kind: "Interstellar probe", orbit: "sun", distanceAU: 166, dir: [0.3, 0.85, 0.43], color: "#d8c39a", desc: "The most distant human-made object — beyond the heliosphere in interstellar space, carrying the Golden Record." },
];

/* ---------------------------- Exotic objects ------------------------------ */
export type ExoticKind = "neutron" | "pulsar" | "magnetar" | "quasar";
export interface ExoticObject {
  name: string;
  kind: ExoticKind;
  typeLabel: string;
  distance: number; // ly (real)
  sceneDistance: number; // ly used for placement (capped so it's reachable)
  dir: [number, number, number];
  color: string;
  desc: string;
  stats: { label: string; value: string }[];
}
export const EXOTIC_OBJECTS: ExoticObject[] = [
  { name: "RX J1856.5-3754", kind: "neutron", typeLabel: "Neutron star", distance: 400, sceneDistance: 400, dir: [0.55, -0.4, 0.73], color: "#cfe4ff",
    desc: "The closest known neutron star — a city-sized ball of matter so dense a teaspoon would weigh billions of tonnes.",
    stats: [{ label: "Distance", value: "~400 ly" }, { label: "Diameter", value: "~20 km" }, { label: "Density", value: "~10^17 kg/m³" }] },
  { name: "Vela Pulsar", kind: "pulsar", typeLabel: "Pulsar", distance: 960, sceneDistance: 960, dir: [-0.5, -0.62, 0.6], color: "#9ad0ff",
    desc: "A spinning neutron star sweeping lighthouse beams past Earth ~11 times a second — the leftover core of a supernova.",
    stats: [{ label: "Distance", value: "~960 ly" }, { label: "Spin", value: "~11 / sec" }, { label: "Type", value: "Pulsar" }] },
  { name: "Crab Pulsar", kind: "pulsar", typeLabel: "Pulsar", distance: 6500, sceneDistance: 6500, dir: [0.7, 0.3, -0.65], color: "#a8c8ff",
    desc: "The heart of the Crab Nebula — a pulsar born from a supernova seen on Earth in the year 1054, spinning 30 times a second.",
    stats: [{ label: "Distance", value: "~6,500 ly" }, { label: "Spin", value: "~30 / sec" }, { label: "Born", value: "SN 1054" }] },
  { name: "SGR 1806-20", kind: "magnetar", typeLabel: "Magnetar", distance: 42000, sceneDistance: 12000, dir: [-0.35, 0.5, 0.79], color: "#ff9bf0",
    desc: "A magnetar with the strongest magnetic field known — a 2004 flare briefly outshone everything in the galaxy in gamma rays. (Placed near the map's edge; truly ~42,000 ly away.)",
    stats: [{ label: "Distance", value: "~42,000 ly" }, { label: "Field", value: "~10^11 tesla" }, { label: "Type", value: "Magnetar" }] },
  { name: "3C 273 (Quasar)", kind: "quasar", typeLabel: "Quasar", distance: 2443000000, sceneDistance: 20000, dir: [0.2, 0.95, 0.24], color: "#bcd0ff",
    desc: "The first quasar identified — a supermassive black hole devouring matter and blazing brighter than a trillion Suns. (Shown near the map's edge; its real distance, 2.4 billion ly, is far beyond this scene.)",
    stats: [{ label: "Distance", value: "~2.4 billion ly" }, { label: "Power", value: "> 1 trillion Suns" }, { label: "Type", value: "Quasar (AGN)" }] },
];

/* ------------------------------- Black holes ------------------------------ */
export interface BlackHole {
  name: string;
  distance: number; // ly from the Sun
  dir: [number, number, number];
  massSolar: number;
  kind: string;
  desc: string;
}
export const BLACK_HOLES: BlackHole[] = [
  { name: "Gaia BH1", distance: 1560, dir: [0.4, 0.86, -0.31], massSolar: 9.6, kind: "Dormant stellar black hole", desc: "The nearest known black hole to the Sun, circled by a Sun-like star that gave it away." },
  { name: "Gaia BH3", distance: 1926, dir: [-0.62, 0.5, 0.6], massSolar: 33, kind: "Stellar-mass black hole", desc: "The most massive stellar black hole found in the Milky Way, revealed in 2024." },
  { name: "Cygnus X-1", distance: 7000, dir: [0.72, -0.28, 0.63], massSolar: 21, kind: "X-ray binary black hole", desc: "A black hole tearing gas from a blue-giant companion — one of the first ever discovered." },
];

/* -------------------------------- Exoplanets ------------------------------ */
export interface Exoplanet {
  name: string;
  host: string; // host star name (must match a NEARBY_STARS name)
  aAU: number; // orbital distance from host (AU)
  periodDays: number;
  radiusEarth: number;
  color: string;
  desc: string;
}
export const EXOPLANETS: Exoplanet[] = [
  { name: "Proxima b", host: "Proxima Centauri", aAU: 0.0485, periodDays: 11.19, radiusEarth: 1.1, color: "#8fae7a", desc: "A temperate, roughly Earth-mass world in Proxima's habitable zone — the closest exoplanet to us." },
  { name: "Barnard b", host: "Barnard's Star", aAU: 0.0229, periodDays: 3.15, radiusEarth: 0.7, color: "#b08a6a", desc: "A sub-Earth confirmed in 2024, baking close to its red-dwarf sun." },
  { name: "Ross 128 b", host: "Ross 128", aAU: 0.0496, periodDays: 9.87, radiusEarth: 1.1, color: "#9a8f7a", desc: "A temperate Earth-mass planet orbiting a quiet, flare-free red dwarf." },
  { name: "Lalande 21185 b", host: "Lalande 21185", aAU: 0.079, periodDays: 12.95, radiusEarth: 2.7, color: "#c0a080", desc: "A hot super-Earth around one of the nearest red dwarfs." },
  { name: "Tau Ceti e", host: "Tau Ceti", aAU: 0.538, periodDays: 162.9, radiusEarth: 1.8, color: "#8aa0b0", desc: "A super-Earth near the inner edge of a Sun-like star's habitable zone." },
  { name: "Epsilon Eridani b", host: "Epsilon Eridani", aAU: 3.5, periodDays: 2691, radiusEarth: 11, color: "#d0b58a", desc: "A Jupiter-like gas giant around a young, nearby star." },
  { name: "40 Eridani b", host: "40 Eridani", aAU: 0.224, periodDays: 42.4, radiusEarth: 2.4, color: "#c99a6a", desc: "A super-Earth candidate — famous as the fictional home of Star Trek's Mr. Spock." },
  { name: "Gliese 876 b", host: "Gliese 876", aAU: 0.208, periodDays: 61.1, radiusEarth: 12, color: "#c8a878", desc: "A gas giant locked in a resonant chain of orbits around a red dwarf." },
];

/* Belts & outer structure — AU radii. */
export const ASTEROID_BELT = { inner: 2.1, outer: 3.3, count: 1800, thickness: 0.18 };
export const KUIPER_BELT = { inner: 30, outer: 50, count: 2600, thickness: 1.6 };

/** Heliosphere shells (AU). Termination shock, then heliopause. */
export const HELIOSPHERE = { terminationShock: 94, heliopause: 122 };

/** Oort cloud — a near-spherical shell (AU). */
export const OORT_CLOUD = { inner: 2000, outer: 100000, count: 4000 };

/* ------------------------------ Nearby stars ------------------------------ */
export const AU_PER_LY = 63241.077;

export interface StarPOI {
  name: string;
  distance: number; // light-years from the Sun
  dir: [number, number, number]; // direction vector (un-normalised) for placement
  desc: string;
  spectral: string; // spectral type
  color: string; // photospheric colour by spectral class
  radiusSolar: number; // stellar radius in solar radii (R☉)
  lum: number; // relative brightness weight (0..1) for glow intensity
}

/** The Sun's stellar neighbourhood — real named stars, each clickable, placed on
 *  the same distance scale with real spectral colours and radii. Red dwarfs are
 *  small and red-orange; A-type stars (Sirius, Vega, Altair) are blue-white; K
 *  giants (Arcturus, Aldebaran, Pollux) are orange and large. */
export const NEARBY_STARS: StarPOI[] = [
  { name: "Proxima Centauri", distance: 4.25, dir: [3.8, 1.2, -0.5], spectral: "M5.5V red dwarf", color: "#ff6a3d", radiusSolar: 0.154, lum: 0.05, desc: "The closest known star to the Sun, a faint flaring red dwarf." },
  { name: "Alpha Centauri", distance: 4.37, dir: [4.0, 0.9, -0.7], spectral: "G2V + K1V", color: "#fff1cf", radiusSolar: 1.22, lum: 0.85, desc: "The nearest bright star system — a Sun-like pair with Proxima." },
  { name: "Barnard's Star", distance: 5.96, dir: [-4.1, -3.5, 2.1], spectral: "M4V red dwarf", color: "#ff7a45", radiusSolar: 0.196, lum: 0.06, desc: "A red dwarf with the fastest apparent motion across our sky." },
  { name: "Wolf 359", distance: 7.86, dir: [2.5, 6.8, 1.9], spectral: "M6V red dwarf", color: "#ff5a33", radiusSolar: 0.16, lum: 0.04, desc: "A dim, faint red dwarf in the constellation Leo." },
  { name: "Lalande 21185", distance: 8.31, dir: [-2.2, 7.8, -3.0], spectral: "M2V red dwarf", color: "#ff8548", radiusSolar: 0.39, lum: 0.08, desc: "One of the nearest and brightest red dwarfs, with confirmed planets." },
  { name: "Sirius", distance: 8.58, dir: [-7.2, 2.9, -3.4], spectral: "A1V blue-white", color: "#aec6ff", radiusSolar: 1.71, lum: 1.0, desc: "The brightest star in Earth's night sky, a hot blue-white star." },
  { name: "Luyten 726-8", distance: 8.73, dir: [6.4, -5.1, -4.2], spectral: "M6V binary", color: "#ff5f38", radiusSolar: 0.14, lum: 0.03, desc: "A famous flare-star binary, also known as UV Ceti." },
  { name: "Ross 154", distance: 9.69, dir: [-6.0, -6.6, 3.6], spectral: "M3.5V red dwarf", color: "#ff6f42", radiusSolar: 0.24, lum: 0.05, desc: "A young, frequently flaring red dwarf in Sagittarius." },
  { name: "Ross 248", distance: 10.3, dir: [3.1, -3.0, 9.3], spectral: "M5V red dwarf", color: "#ff5f39", radiusSolar: 0.16, lum: 0.03, desc: "In ~36,000 years it will become the closest star to the Sun." },
  { name: "Epsilon Eridani", distance: 10.52, dir: [8.1, -4.2, 3.7], spectral: "K2V orange dwarf", color: "#ffbd73", radiusSolar: 0.735, lum: 0.35, desc: "A young orange star with a debris disk and a known planet." },
  { name: "Lacaille 9352", distance: 10.74, dir: [9.2, 4.0, -3.4], spectral: "M0.5V red dwarf", color: "#ff9a54", radiusSolar: 0.47, lum: 0.11, desc: "A high proper-motion red dwarf with two known planets." },
  { name: "Ross 128", distance: 11.0, dir: [-8.4, 5.2, 4.1], spectral: "M4V red dwarf", color: "#ff6238", radiusSolar: 0.2, lum: 0.04, desc: "A quiet red dwarf hosting the temperate planet Ross 128 b." },
  { name: "61 Cygni", distance: 11.4, dir: [-9.5, -3.8, 5.2], spectral: "K5V + K7V", color: "#ffab5e", radiusSolar: 0.665, lum: 0.28, desc: "The first star to have its distance measured by parallax." },
  { name: "Procyon", distance: 11.46, dir: [5.3, 9.1, -4.8], spectral: "F5IV-V yellow-white", color: "#fff6e6", radiusSolar: 2.05, lum: 0.92, desc: "The brightest star in Canis Minor, with a white-dwarf companion." },
  { name: "Tau Ceti", distance: 11.9, dir: [1.5, -9.7, -6.2], spectral: "G8V yellow", color: "#ffe7ad", radiusSolar: 0.793, lum: 0.55, desc: "A nearby Sun-like star with several candidate planets." },
  { name: "Luyten's Star", distance: 12.36, dir: [10.8, -2.1, 5.6], spectral: "M3.5V red dwarf", color: "#ff7a45", radiusSolar: 0.35, lum: 0.06, desc: "A red dwarf whose habitable zone holds the planet GJ 273 b." },
  { name: "Teegarden's Star", distance: 12.5, dir: [-4.4, 10.9, -4.5], spectral: "M7V red dwarf", color: "#ff5530", radiusSolar: 0.12, lum: 0.02, desc: "One of the smallest known stars, with two Earth-mass planets." },
  { name: "Kapteyn's Star", distance: 12.83, dir: [7.7, -8.5, -4.4], spectral: "M1V subdwarf", color: "#ff8a4e", radiusSolar: 0.29, lum: 0.07, desc: "A fast halo star, likely stolen from a disrupted dwarf galaxy." },
  { name: "Wolf 1061", distance: 13.8, dir: [-11.5, -4.6, 6.3], spectral: "M3V red dwarf", color: "#ff6d40", radiusSolar: 0.31, lum: 0.05, desc: "A red dwarf with a planet in its habitable zone." },
  { name: "Gliese 876", distance: 15.2, dir: [12.6, 6.9, -6.0], spectral: "M4V red dwarf", color: "#ff734a", radiusSolar: 0.37, lum: 0.05, desc: "A red dwarf orbited by four planets, including gas giants." },
  { name: "40 Eridani", distance: 16.45, dir: [15.8, -6.3, 4.9], spectral: "K0.5V orange", color: "#ffca8a", radiusSolar: 0.812, lum: 0.45, desc: "A triple system — the fictional home of Star Trek's Vulcan." },
  { name: "Altair", distance: 16.73, dir: [-13.0, 9.4, -7.2], spectral: "A7V blue-white", color: "#b8ccff", radiusSolar: 1.79, lum: 0.95, desc: "A brilliant white star spinning so fast it bulges at its equator." },
  { name: "Gliese 581", distance: 20.4, dir: [17.2, -9.0, 8.6], spectral: "M3V red dwarf", color: "#ff6d40", radiusSolar: 0.3, lum: 0.05, desc: "A red dwarf famous for its much-studied multi-planet system." },
  { name: "Vega", distance: 25.05, dir: [18.4, 12.7, -8.9], spectral: "A0V blue-white", color: "#a9c4ff", radiusSolar: 2.36, lum: 1.0, desc: "A brilliant blue-white star, once the northern pole star." },
  { name: "Fomalhaut", distance: 25.13, dir: [-14.2, 19.3, 7.1], spectral: "A3V blue-white", color: "#bcd0ff", radiusSolar: 1.842, lum: 0.95, desc: "A young blue-white star ringed by a vast dusty debris disk." },
  { name: "Pollux", distance: 33.78, dir: [-24.0, -14.0, 12.0], spectral: "K0III orange giant", color: "#ffb264", radiusSolar: 8.8, lum: 0.85, desc: "The nearest giant star and the brightest in Gemini, with a planet." },
  { name: "Arcturus", distance: 36.7, dir: [26.0, 18.5, -13.0], spectral: "K1.5III orange giant", color: "#ff9e4a", radiusSolar: 25.4, lum: 1.0, desc: "An aging orange giant — the brightest star in the northern sky." },
  { name: "Zeta Reticuli", distance: 39.3, dir: [39.2, -15.4, 22.1], spectral: "G2V + G1V", color: "#fff1cf", radiusSolar: 0.99, lum: 0.7, desc: "A Sun-like binary pair, famous in UFO folklore." },
  { name: "Capella", distance: 42.9, dir: [-30.0, 22.0, 16.0], spectral: "G-type giants", color: "#fff0c2", radiusSolar: 8.0, lum: 0.95, desc: "A pair of yellow giants shining together as one brilliant star." },
  { name: "Aldebaran", distance: 65.3, dir: [48.0, -26.0, 20.0], spectral: "K5III orange giant", color: "#ff8f43", radiusSolar: 45.0, lum: 1.0, desc: "The fiery orange eye of Taurus — a giant far larger than the Sun." },
];
