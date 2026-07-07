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
  io: `${NASA_MODEL_BASE}/io.glb`,
  europa: `${NASA_MODEL_BASE}/europa.glb`,
  ganymede: `${NASA_MODEL_BASE}/ganymede.glb`,
  callisto: `${NASA_MODEL_BASE}/callisto.glb`,
  titan: `${NASA_MODEL_BASE}/titan.glb`,
  enceladus: `${NASA_MODEL_BASE}/enceladus.glb`,
  newHorizons: `${NASA_MODEL_BASE}/new-horizons.glb`,
  parker: `${NASA_MODEL_BASE}/parker.glb`,
} as const;

/** Heavy moon meshes — preload when moons become visible, not at scene boot. */
export const NASA_MOON_GLTF = [
  NASA_GLTF.io,
  NASA_GLTF.europa,
  NASA_GLTF.ganymede,
  NASA_GLTF.callisto,
  NASA_GLTF.titan,
  NASA_GLTF.enceladus,
  NASA_GLTF.moon,
] as const;

export const NASA_MODEL_CREDITS = [
  { file: "hubble.glb", source: "NASA 3D Resources — Hubble Space Telescope (A)", url: "https://github.com/nasa/NASA-3D-Resources" },
  { file: "jwst.glb", source: "NASA 3D Resources — James Webb Space Telescope (A)", url: "https://github.com/nasa/NASA-3D-Resources" },
  { file: "iss.glb", source: "NASA 3D Resources — International Space Station (ISS) (A)", url: "https://github.com/nasa/NASA-3D-Resources" },
  { file: "voyager.glb", source: "NASA 3D Resources — Voyager Probe (A)", url: "https://github.com/nasa/NASA-3D-Resources" },
  { file: "saturn.glb", source: "NASA Science — Saturn 3D Model", url: "https://science.nasa.gov/resource/saturn-3d-model/" },
  { file: "earth.glb", source: "NASA Science — Earth 3D Model", url: "https://science.nasa.gov/resource/earth-3d-model/" },
  { file: "moon.glb", source: "NASA Science — Moon 3D Model", url: "https://science.nasa.gov/resource/moon-3d-model/" },
  { file: "mars.glb", source: "NASA Science — Planet Mars 3D Model", url: "https://science.nasa.gov/resource/planet-mars-3d-model/" },
  { file: "jupiter.glb", source: "NASA Science — Jupiter 3D Model", url: "https://science.nasa.gov/resource/jupiter-3d-model/" },
  { file: "io.glb", source: "NASA Science — Io 3D Model", url: "https://science.nasa.gov/resource/io-3d-model/" },
  { file: "europa.glb", source: "NASA Science — Europa 3D Model", url: "https://science.nasa.gov/resource/europa-3d-model/" },
  { file: "ganymede.glb", source: "NASA Science — Ganymede 3D Model", url: "https://science.nasa.gov/resource/ganymede-3d-model/" },
  { file: "callisto.glb", source: "NASA Science — Callisto 3D Model", url: "https://science.nasa.gov/resource/callisto-3d-model/" },
  { file: "titan.glb", source: "NASA Science — Titan 3D Model", url: "https://science.nasa.gov/resource/titan-3d-model/" },
  { file: "enceladus.glb", source: "NASA Science — Enceladus 3D Model", url: "https://science.nasa.gov/resource/enceladus-3d-model/" },
  { file: "new-horizons.glb", source: "NASA Science — New Horizons 3D Model", url: "https://science.nasa.gov/resource/new-horizons-3d-model/" },
  { file: "parker.glb", source: "NASA Science — Parker Solar Probe 3D Model", url: "https://science.nasa.gov/resource/parker-solar-probe-3d-model/" },
] as const;

export const SPACECRAFT_MODEL_URL: Partial<Record<string, string>> = {
  "Hubble Space Telescope": NASA_GLTF.hubble,
  "James Webb Space Telescope": NASA_GLTF.jwst,
  "International Space Station": NASA_GLTF.iss,
  "Voyager 1": NASA_GLTF.voyager,
  "Voyager 2": NASA_GLTF.voyager,
  "New Horizons": NASA_GLTF.newHorizons,
  "Parker Solar Probe": NASA_GLTF.parker,
};

/** Optional Euler rotation (rad) after NASA mesh normalization. */
export const SPACECRAFT_MODEL_ROTATION: Partial<Record<string, [number, number, number]>> = {
  "Hubble Space Telescope": [0, 0, Math.PI / 2],
  "James Webb Space Telescope": [0.35, 0.6, 0.15],
  "Voyager 1": [0.35, 0, 0],
  "Voyager 2": [0.35, Math.PI, 0],
  "New Horizons": [0.2, Math.PI / 2, 0],
  "Parker Solar Probe": [0.15, 0, 0],
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
  Io: NASA_GLTF.io,
  Europa: NASA_GLTF.europa,
  Ganymede: NASA_GLTF.ganymede,
  Callisto: NASA_GLTF.callisto,
  Titan: NASA_GLTF.titan,
  Enceladus: NASA_GLTF.enceladus,
};

export const PLANET_MODEL_ROTATION: Partial<Record<string, [number, number, number]>> = {
  Saturn: [(26.73 * Math.PI) / 180, 0, 0],
};

export const MOON_MODEL_ROTATION: Partial<Record<string, [number, number, number]>> = {};