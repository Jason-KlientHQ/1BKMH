/** NASA / USGov 3D assets vendored under public/models/nasa — see NASA media usage guidelines. */
export const NASA_MODEL_BASE = "/models/nasa";

export const NASA_GLTF = {
  hubble: `${NASA_MODEL_BASE}/hubble.glb`,
  jwst: `${NASA_MODEL_BASE}/jwst.glb`,
  iss: `${NASA_MODEL_BASE}/iss.glb`,
  voyager: `${NASA_MODEL_BASE}/voyager.glb`,
  saturn: `${NASA_MODEL_BASE}/saturn.glb`,
  earth: `${NASA_MODEL_BASE}/earth.glb`,
  moon: `${NASA_MODEL_BASE}/moon.glb`,
  mars: `${NASA_MODEL_BASE}/mars.glb`,
  jupiter: `${NASA_MODEL_BASE}/jupiter.glb`,
} as const;

export const NASA_MODEL_CREDITS = [
  {
    file: "hubble.glb",
    source: "NASA 3D Resources — Hubble Space Telescope (A)",
    url: "https://github.com/nasa/NASA-3D-Resources",
  },
  {
    file: "jwst.glb",
    source: "NASA 3D Resources — James Webb Space Telescope (A)",
    url: "https://github.com/nasa/NASA-3D-Resources",
  },
  {
    file: "iss.glb",
    source: "NASA 3D Resources — International Space Station (ISS) (A)",
    url: "https://github.com/nasa/NASA-3D-Resources",
  },
  {
    file: "voyager.glb",
    source: "NASA 3D Resources — Voyager Probe (A)",
    url: "https://github.com/nasa/NASA-3D-Resources",
  },
  {
    file: "saturn.glb",
    source: "NASA Science — Saturn 3D Model",
    url: "https://science.nasa.gov/resource/saturn-3d-model/",
  },
  {
    file: "earth.glb",
    source: "NASA Science — Earth 3D Model",
    url: "https://science.nasa.gov/resource/earth-3d-model/",
  },
  {
    file: "moon.glb",
    source: "NASA Science — Moon 3D Model",
    url: "https://science.nasa.gov/resource/moon-3d-model/",
  },
  {
    file: "mars.glb",
    source: "NASA Science — Planet Mars 3D Model",
    url: "https://science.nasa.gov/resource/planet-mars-3d-model/",
  },
  {
    file: "jupiter.glb",
    source: "NASA Science — Jupiter 3D Model",
    url: "https://science.nasa.gov/resource/jupiter-3d-model/",
  },
] as const;

export const SPACECRAFT_MODEL_URL: Partial<Record<string, string>> = {
  "Hubble Space Telescope": NASA_GLTF.hubble,
  "James Webb Space Telescope": NASA_GLTF.jwst,
  "International Space Station": NASA_GLTF.iss,
  "Voyager 1": NASA_GLTF.voyager,
  "Voyager 2": NASA_GLTF.voyager,
};

/** Optional Euler rotation (rad) after NASA mesh normalization. */
export const SPACECRAFT_MODEL_ROTATION: Partial<Record<string, [number, number, number]>> = {
  "Hubble Space Telescope": [0, 0, Math.PI / 2],
  "James Webb Space Telescope": [0.35, 0.6, 0.15],
  "Voyager 1": [0.35, 0, 0],
  "Voyager 2": [0.35, Math.PI, 0],
};

/** Planet photosphere glTF (procedural sphere fallback when missing). */
export const PLANET_MODEL_URL: Partial<Record<string, string>> = {
  Earth: NASA_GLTF.earth,
  Mars: NASA_GLTF.mars,
  Jupiter: NASA_GLTF.jupiter,
  Saturn: NASA_GLTF.saturn,
};

/** Moon mesh glTF keyed by moon name. */
export const MOON_MODEL_URL: Partial<Record<string, string>> = {
  Moon: NASA_GLTF.moon,
};

export const PLANET_MODEL_ROTATION: Partial<Record<string, [number, number, number]>> = {
  Saturn: [(26.73 * Math.PI) / 180, 0, 0],
};

export const MOON_MODEL_ROTATION: Partial<Record<string, [number, number, number]>> = {};