/** NASA / USGov 3D assets vendored under public/models/nasa — see NASA media usage guidelines. */
export const NASA_MODEL_BASE = "/models/nasa";

export const NASA_GLTF = {
  hubble: `${NASA_MODEL_BASE}/hubble.glb`,
  jwst: `${NASA_MODEL_BASE}/jwst.glb`,
  iss: `${NASA_MODEL_BASE}/iss.glb`,
  voyager: `${NASA_MODEL_BASE}/voyager.glb`,
  saturn: `${NASA_MODEL_BASE}/saturn.glb`,
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