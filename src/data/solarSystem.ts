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
  inclDeg?: number; // Earth-orbiters: orbital inclination
  distanceAU?: number; // heliocentric markers: current distance from the Sun
  dir?: [number, number, number]; // heliocentric markers: outbound direction
  color: string;
}
export const SPACECRAFT: Spacecraft[] = [
  { name: "International Space Station", kind: "Space station", orbit: "earth", altKm: 417, inclDeg: 51.64, color: "#e2e8f0", desc: "The largest crewed structure in space — a football-field-sized laboratory orbiting Earth every 90 minutes since 1998." },
  { name: "Hubble Space Telescope", kind: "Space telescope", orbit: "earth", altKm: 535, inclDeg: 28.47, color: "#c9d2dc", desc: "In low Earth orbit since 1990, Hubble has taken some of the most iconic images of the universe." },
  { name: "James Webb Space Telescope", kind: "Space telescope", orbit: "sun", distanceAU: 1.01, dir: [-0.62, 0.12, 0.78], color: "#e8c169", desc: "The largest space telescope, parked at the Sun-Earth L2 point ~1.5 million km beyond Earth, seeing the universe in infrared." },
  { name: "Parker Solar Probe", kind: "Solar probe", orbit: "sun", distanceAU: 0.3, dir: [0.68, 0.16, -0.72], color: "#ffcf8f", desc: "The fastest object ever built, diving repeatedly through the Sun's corona to 'touch' our star." },
  { name: "New Horizons", kind: "Deep-space probe", orbit: "sun", distanceAU: 60, dir: [0.5, -0.55, 0.67], color: "#c7c0b0", desc: "Flew past Pluto in 2015 and a Kuiper Belt object in 2019; now heading into deep space." },
  { name: "Pioneer 10", kind: "Deep-space probe", orbit: "sun", distanceAU: 135, dir: [0.9, -0.1, -0.42], color: "#b8ad92", desc: "The first probe to cross the asteroid belt and fly by Jupiter; carrying a plaque for any who find it." },
  { name: "Voyager 2", kind: "Interstellar probe", orbit: "sun", distanceAU: 139, dir: [-0.2, -0.7, 0.68], color: "#cbb68f", desc: "The only spacecraft to visit all four giant planets; now in interstellar space, still calling home." },
  { name: "Voyager 1", kind: "Interstellar probe", orbit: "sun", distanceAU: 166, dir: [0.3, 0.85, 0.43], color: "#d8c39a", desc: "The most distant human-made object — beyond the heliosphere in interstellar space, carrying the Golden Record." },
  { name: "Cassini", kind: "Saturn orbiter", orbit: "sun", distanceAU: 9.5, dir: [0.55, 0.2, 0.81], color: "#c5c0b0", desc: "NASA's Cassini spacecraft spent 13 years touring Saturn, its rings, and moons before a deliberate plunge into the planet in 2017." },
  { name: "OSIRIS-REx", kind: "Sample-return probe", orbit: "sun", distanceAU: 1.1, dir: [-0.4, 0.15, 0.9], color: "#b8b0a0", desc: "The first U.S. mission to collect an asteroid sample — it delivered pieces of Bennu to Earth in 2023 and is now headed toward asteroid Apophis." },
  { name: "Juno", kind: "Jupiter orbiter", orbit: "sun", distanceAU: 5.2, dir: [0.72, 0.1, 0.69], color: "#d4cbb8", desc: "In polar orbit around Jupiter since 2016, Juno peers beneath the giant planet's clouds to map its gravity, magnetic field, and auroras." },
  { name: "Dawn", kind: "Asteroid orbiter", orbit: "sun", distanceAU: 2.8, dir: [-0.6, 0.35, 0.72], color: "#a8a090", desc: "The first spacecraft to orbit two extraterrestrial bodies — Vesta and dwarf planet Ceres — using ion propulsion." },
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

/* --------------------------- cosmic landmarks ------------------------------- */
export interface CosmicLandmark {
  name: string;
  kind: "galaxy" | "galactic_center" | "satellite_galaxy";
  typeLabel: string;
  distanceLy: number;
  /** Compressed scene placement (ly) — navigable edge of the map. */
  sceneDistanceLy: number;
  dir: [number, number, number];
  color: string;
  desc: string;
  stats: { label: string; value: string }[];
}

export const COSMIC_LANDMARKS: CosmicLandmark[] = [
  {
    name: "Andromeda Galaxy (M31)",
    kind: "galaxy",
    typeLabel: "Spiral galaxy",
    distanceLy: 2_540_000,
    sceneDistanceLy: 18_000,
    dir: [0.739, 0.66, 0.139],
    color: "#c8d4ff",
    desc: "Our nearest major galactic neighbour — a spiral galaxy on a collision course with the Milky Way in about 4 billion years. (Placed near the map edge; true distance ~2.5 million ly.)",
    stats: [
      { label: "Distance", value: "~2.54 million ly" },
      { label: "Diameter", value: "~220,000 ly" },
      { label: "Type", value: "Spiral galaxy" },
    ],
  },
  {
    name: "Triangulum Galaxy (M33)",
    kind: "galaxy",
    typeLabel: "Spiral galaxy",
    distanceLy: 2_730_000,
    sceneDistanceLy: 19_000,
    dir: [0.789, 0.51, 0.342],
    color: "#b8c8ff",
    desc: "The third-largest galaxy in our Local Group — a face-on spiral smaller than Andromeda but rich with star-forming regions. (Compressed to the map edge for navigation.)",
    stats: [
      { label: "Distance", value: "~2.73 million ly" },
      { label: "Diameter", value: "~60,000 ly" },
      { label: "Type", value: "Spiral galaxy" },
    ],
  },
  {
    name: "Large Magellanic Cloud",
    kind: "satellite_galaxy",
    typeLabel: "Dwarf galaxy",
    distanceLy: 163_000,
    sceneDistanceLy: 14_000,
    dir: [0.055, -0.938, 0.342],
    color: "#d0dcff",
    desc: "A dwarf galaxy orbiting the Milky Way — home to the Tarantula Nebula and the supernova SN 1987A. Visible from the southern hemisphere.",
    stats: [
      { label: "Distance", value: "~163,000 ly" },
      { label: "Diameter", value: "~14,000 ly" },
      { label: "Type", value: "Satellite galaxy" },
    ],
  },
  {
    name: "Small Magellanic Cloud",
    kind: "satellite_galaxy",
    typeLabel: "Dwarf galaxy",
    distanceLy: 200_000,
    sceneDistanceLy: 15_000,
    dir: [0.288, -0.955, 0.067],
    color: "#c4d0ff",
    desc: "A smaller companion galaxy to the Milky Way — tidally interacting with the LMC and slowly being torn apart by our galaxy's gravity.",
    stats: [
      { label: "Distance", value: "~200,000 ly" },
      { label: "Diameter", value: "~7,000 ly" },
      { label: "Type", value: "Satellite galaxy" },
    ],
  },
  {
    name: "Galactic Center (Sgr A*)",
    kind: "galactic_center",
    typeLabel: "Galactic center",
    distanceLy: 26_000,
    sceneDistanceLy: 12_000,
    dir: [-0.055, -0.485, -0.873],
    color: "#ffcf8f",
    desc: "The heart of the Milky Way — a supermassive black hole four million times the Sun's mass, hidden behind thick lanes of dust in Sagittarius.",
    stats: [
      { label: "Distance", value: "~26,000 ly" },
      { label: "Black hole", value: "~4.1 million M☉" },
      { label: "Location", value: "Sagittarius A*" },
    ],
  },
];

/** Schematic Local Bubble — low-density cavity around the Sun (~200–300 ly). */
export const LOCAL_BUBBLE = {
  radiusLy: 250,
  desc: "A low-density cavity in the interstellar medium, likely carved by ancient supernovae. The Sun sits inside it.",
};

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
  { name: "Proxima c", host: "Proxima Centauri", aAU: 1.49, periodDays: 1928, radiusEarth: 7, color: "#a8b8c8", desc: "A cold super-Earth or mini-Neptune on a wide orbit around Proxima Centauri." },
  { name: "Barnard b", host: "Barnard's Star", aAU: 0.0229, periodDays: 3.15, radiusEarth: 0.7, color: "#b08a6a", desc: "A sub-Earth confirmed in 2024, baking close to its red-dwarf sun." },
  { name: "Ross 128 b", host: "Ross 128", aAU: 0.0496, periodDays: 9.87, radiusEarth: 1.1, color: "#9a8f7a", desc: "A temperate Earth-mass planet orbiting a quiet, flare-free red dwarf." },
  { name: "Lalande 21185 b", host: "Lalande 21185", aAU: 0.079, periodDays: 12.95, radiusEarth: 2.7, color: "#c0a080", desc: "A hot super-Earth around one of the nearest red dwarfs." },
  { name: "Epsilon Indi Ab", host: "Epsilon Indi", aAU: 11.6, periodDays: 14_520, radiusEarth: 4.5, color: "#9ab0c0", desc: "A gas giant on a wide, Jupiter-like orbit around a bright orange dwarf." },
  { name: "Tau Ceti e", host: "Tau Ceti", aAU: 0.538, periodDays: 162.9, radiusEarth: 1.8, color: "#8aa0b0", desc: "A super-Earth near the inner edge of a Sun-like star's habitable zone." },
  { name: "Epsilon Eridani b", host: "Epsilon Eridani", aAU: 3.5, periodDays: 2691, radiusEarth: 11, color: "#d0b58a", desc: "A Jupiter-like gas giant around a young, nearby star." },
  { name: "40 Eridani b", host: "40 Eridani", aAU: 0.224, periodDays: 42.4, radiusEarth: 2.4, color: "#c99a6a", desc: "A super-Earth candidate — famous as the fictional home of Star Trek's Mr. Spock." },
  { name: "Gliese 876 b", host: "Gliese 876", aAU: 0.208, periodDays: 61.1, radiusEarth: 12, color: "#c8a878", desc: "A gas giant locked in a resonant chain of orbits around a red dwarf." },
  { name: "Gliese 876 c", host: "Gliese 876", aAU: 0.13, periodDays: 30.0, radiusEarth: 2.5, color: "#b89070", desc: "A warm super-Earth in the inner system of Gliese 876." },
  { name: "Gliese 876 d", host: "Gliese 876", aAU: 0.021, periodDays: 1.94, radiusEarth: 1.5, color: "#c4a080", desc: "A small inner planet in the Gliese 876 resonant system." },
  { name: "Teegarden b", host: "Teegarden's Star", aAU: 0.025, periodDays: 4.91, radiusEarth: 1.05, color: "#8aae7a", desc: "An Earth-mass world in the habitable zone of a tiny, cool red dwarf." },
  { name: "Teegarden c", host: "Teegarden's Star", aAU: 0.044, periodDays: 11.41, radiusEarth: 1.11, color: "#7a9e72", desc: "A second temperate planet around Teegarden's Star." },
  { name: "GJ 273 b", host: "Luyten's Star", aAU: 0.091, periodDays: 18.65, radiusEarth: 2.9, color: "#88a080", desc: "A super-Earth in the habitable zone — a target of the Sónar message." },
  { name: "Wolf 1061 b", host: "Wolf 1061", aAU: 0.035, periodDays: 4.89, radiusEarth: 1.4, color: "#b88868", desc: "A hot rocky planet close to its red-dwarf host." },
  { name: "Wolf 1061 c", host: "Wolf 1061", aAU: 0.089, periodDays: 17.87, radiusEarth: 1.6, color: "#8faa78", desc: "A potentially habitable super-Earth in the Wolf 1061 system." },
  { name: "Wolf 1061 d", host: "Wolf 1061", aAU: 0.47, periodDays: 217, radiusEarth: 2.2, color: "#98a8b0", desc: "A cooler outer super-Earth beyond the habitable zone." },
  { name: "Gliese 581 c", host: "Gliese 581", aAU: 0.073, periodDays: 12.9, radiusEarth: 1.9, color: "#c09070", desc: "One of the first rocky exoplanets found in a star's habitable zone." },
  { name: "Gliese 581 d", host: "Gliese 581", aAU: 0.22, periodDays: 66.8, radiusEarth: 2.2, color: "#88a078", desc: "A super-Earth on the outer edge of the habitable zone." },
  { name: "Gliese 581 e", host: "Gliese 581", aAU: 0.028, periodDays: 3.15, radiusEarth: 1.7, color: "#b08060", desc: "A small, hot inner planet in the Gliese 581 system." },
  { name: "TRAPPIST-1 b", host: "TRAPPIST-1", aAU: 0.011, periodDays: 1.51, radiusEarth: 1.09, color: "#b87858", desc: "The innermost of seven Earth-sized worlds around TRAPPIST-1." },
  { name: "TRAPPIST-1 c", host: "TRAPPIST-1", aAU: 0.016, periodDays: 2.42, radiusEarth: 1.06, color: "#c08860", desc: "A hot rocky planet in the TRAPPIST-1 compact system." },
  { name: "TRAPPIST-1 d", host: "TRAPPIST-1", aAU: 0.022, periodDays: 4.05, radiusEarth: 0.77, color: "#8a9870", desc: "A small planet that may hold water in the habitable zone." },
  { name: "TRAPPIST-1 e", host: "TRAPPIST-1", aAU: 0.029, periodDays: 6.1, radiusEarth: 0.92, color: "#7ea878", desc: "Considered the most Earth-like of the TRAPPIST-1 planets." },
  { name: "TRAPPIST-1 f", host: "TRAPPIST-1", aAU: 0.037, periodDays: 9.21, radiusEarth: 1.04, color: "#88b080", desc: "A temperate Earth-sized world in the habitable zone." },
  { name: "TRAPPIST-1 g", host: "TRAPPIST-1", aAU: 0.045, periodDays: 12.35, radiusEarth: 1.13, color: "#90a888", desc: "An outer habitable-zone planet in the TRAPPIST-1 system." },
  { name: "TRAPPIST-1 h", host: "TRAPPIST-1", aAU: 0.063, periodDays: 20.0, radiusEarth: 0.75, color: "#a0b0b8", desc: "The outermost known planet — a cold, Mars-sized world." },
  { name: "LHS 1140 b", host: "LHS 1140", aAU: 0.087, periodDays: 24.7, radiusEarth: 1.7, color: "#7a9a88", desc: "A dense super-Earth that may retain an atmosphere." },
  { name: "55 Cancri e", host: "55 Cancri", aAU: 0.0156, periodDays: 0.74, radiusEarth: 1.9, color: "#d89060", desc: "A lava-world super-Earth skimming its star in less than a day." },
  { name: "Kapteyn b", host: "Kapteyn's Star", aAU: 0.168, periodDays: 48.6, radiusEarth: 1.5, color: "#8a9878", desc: "A potentially habitable super-Earth around an ancient halo star." },
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
  { name: "TRAPPIST-1", distance: 40.66, dir: [32.0, -18.0, 14.0], spectral: "M8V ultra-cool dwarf", color: "#ff5530", radiusSolar: 0.12, lum: 0.02, desc: "An ultra-cool red dwarf hosting seven Earth-sized planets — three in the habitable zone." },
  { name: "Epsilon Indi", distance: 11.87, dir: [9.8, 4.5, -4.2], spectral: "K5V orange dwarf", color: "#ffca8a", radiusSolar: 0.76, lum: 0.22, desc: "A bright orange dwarf with a wide-orbit brown-dwarf companion and a known gas giant." },
  { name: "LHS 1140", distance: 40.7, dir: [-28.0, 26.0, 12.0], spectral: "M4.5V red dwarf", color: "#ff6a40", radiusSolar: 0.21, lum: 0.04, desc: "A quiet red dwarf with a dense, potentially habitable super-Earth." },
  { name: "55 Cancri", distance: 41.0, dir: [28.0, -28.0, 12.0], spectral: "G8V yellow dwarf", color: "#ffe8b8", radiusSolar: 0.96, lum: 0.6, desc: "A Sun-like star with five planets, including the famous lava-world 55 Cancri e." },
  { name: "Castor", distance: 51.0, dir: [38.0, 22.0, -18.0], spectral: "A1V + binary", color: "#c8d8ff", radiusSolar: 2.4, lum: 0.9, desc: "A sextuple star system — one of the brightest stars in Gemini." },
  { name: "Regulus", distance: 79.3, dir: [55.0, -42.0, 28.0], spectral: "B8IV blue-white", color: "#b0c8ff", radiusSolar: 3.5, lum: 0.95, desc: "The heart of Leo — a fast-spinning blue-white star distorted into an egg shape." },
  { name: "Spica", distance: 250.0, dir: [180.0, -120.0, 80.0], spectral: "B1III blue giant", color: "#a8c0ff", radiusSolar: 7.4, lum: 1.0, desc: "A brilliant blue giant binary — the brightest star in Virgo." },
  { name: "Bellatrix", distance: 252.44, dir: [0.1506, 0.1106, 0.9824], spectral: "B2III blue giant", color: "#b0c1ff", radiusSolar: 5.61, lum: 0.95, desc: "Orion's western shoulder — a hot blue giant that helped define the Hunter's unmistakable shape." },
  { name: "Mintaka", distance: 691, dir: [0.1219, -0.0052, 0.9925], spectral: "O9.5II blue giant", color: "#9ab0ff", radiusSolar: 16, lum: 1.0, desc: "The western star of Orion's Belt — a multiple system of luminous blue giants aligned in our sky." },
  { name: "Alnilam", distance: 1344, dir: [0.1036, -0.0209, 0.9944], spectral: "B0Ia blue supergiant", color: "#a0b8ff", radiusSolar: 42, lum: 1.0, desc: "The middle jewel of Orion's Belt — a young blue supergiant blazing with the fire of a star still in its prime." },
  { name: "Alnitak", distance: 736, dir: [0.0838, -0.0337, 0.9959], spectral: "O9.5Ib blue supergiant", color: "#9ab0ff", radiusSolar: 20, lum: 1.0, desc: "The eastern star of Orion's Belt — an O-type supergiant ionizing the gas of the Horsehead Nebula region." },
  { name: "Canopus", distance: 309.15, dir: [-0.0632, -0.7954, 0.6027], spectral: "F0Ib yellow-white supergiant", color: "#e3e8ff", radiusSolar: 55, lum: 1.0, desc: "The second-brightest star in the night sky — a brilliant F-type supergiant riding high in southern skies." },
  { name: "Polaris", distance: 432.57, dir: [0.0101, 0.9999, 0.0079], spectral: "F7Ib-II yellow supergiant", color: "#fff0df", radiusSolar: 49, lum: 0.9, desc: "The North Star — a pulsating yellow supergiant marking Earth's spin axis, with a history as a navigation beacon." },
  { name: "Betelgeuse", distance: 497.95, dir: [0.0209, 0.1289, 0.9914], spectral: "M2Ib red supergiant", color: "#ffa87d", radiusSolar: 268, lum: 1.0, desc: "A dying red supergiant on Orion's shoulder — vast enough to swallow Mars' orbit, and expected to explode as a supernova within the next 100,000 years." },
  { name: "Antares", distance: 553.75, dir: [-0.3448, -0.4451, -0.8264], spectral: "M1Ib red supergiant", color: "#ff8563", radiusSolar: 295, lum: 1.0, desc: "The rival of Mars — a crimson supergiant in Scorpius, one of the largest stars visible to the naked eye." },
  { name: "Rigel", distance: 860, dir: [0.195, -0.143, 0.970], spectral: "B8Ia blue supergiant", color: "#b8ccff", radiusSolar: 78, lum: 1.0, desc: "Orion's brilliant left foot — a blue supergiant that outshines our entire solar system despite sitting hundreds of light-years away." },
  { name: "Deneb", distance: 2615, dir: [0.456, 0.710, -0.536], spectral: "A2Ia blue supergiant", color: "#e8ecff", radiusSolar: 203, lum: 1.0, desc: "The tail of Cygnus the Swan — one of the most luminous stars known, a blue supergiant whose true distance was debated for decades." },
];
