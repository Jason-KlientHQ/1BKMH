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
  mercury: `${NASA_MODEL_BASE}/mercury.glb`,
  venus: `${NASA_MODEL_BASE}/venus.glb`,
  uranus: `${NASA_MODEL_BASE}/uranus.glb`,
  neptune: `${NASA_MODEL_BASE}/neptune.glb`,
  pluto: `${NASA_MODEL_BASE}/pluto.glb`,
  ceres: `${NASA_MODEL_BASE}/ceres.glb`,
  haumea: `${NASA_MODEL_BASE}/haumea.glb`,
  makemake: `${NASA_MODEL_BASE}/makemake.glb`,
  eris: `${NASA_MODEL_BASE}/eris.glb`,
  io: `${NASA_MODEL_BASE}/io.glb`,
  europa: `${NASA_MODEL_BASE}/europa.glb`,
  ganymede: `${NASA_MODEL_BASE}/ganymede.glb`,
  callisto: `${NASA_MODEL_BASE}/callisto.glb`,
  titan: `${NASA_MODEL_BASE}/titan.glb`,
  enceladus: `${NASA_MODEL_BASE}/enceladus.glb`,
  charon: `${NASA_MODEL_BASE}/charon.glb`,
  rhea: `${NASA_MODEL_BASE}/rhea.glb`,
  iapetus: `${NASA_MODEL_BASE}/iapetus.glb`,
  titania: `${NASA_MODEL_BASE}/titania.glb`,
  oberon: `${NASA_MODEL_BASE}/oberon.glb`,
  triton: `${NASA_MODEL_BASE}/triton.glb`,
  newHorizons: `${NASA_MODEL_BASE}/new-horizons.glb`,
  parker: `${NASA_MODEL_BASE}/parker.glb`,
  pioneer: `${NASA_MODEL_BASE}/pioneer.glb`,
  cassini: `${NASA_MODEL_BASE}/cassini.glb`,
  osirisRex: `${NASA_MODEL_BASE}/osiris-rex.glb`,
  juno: `${NASA_MODEL_BASE}/juno.glb`,
  dawn: `${NASA_MODEL_BASE}/dawn.glb`,
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
  NASA_GLTF.charon,
  NASA_GLTF.rhea,
  NASA_GLTF.iapetus,
  NASA_GLTF.titania,
  NASA_GLTF.oberon,
  NASA_GLTF.triton,
] as const;

/** Dwarf-planet meshes — lazy preload when minor bodies are shown. */
export const NASA_DWARF_GLTF = [
  NASA_GLTF.ceres,
  NASA_GLTF.pluto,
  NASA_GLTF.haumea,
  NASA_GLTF.makemake,
  NASA_GLTF.eris,
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
  { file: "mercury.glb", source: "NASA Science — Mercury 3D Model", url: "https://science.nasa.gov/resource/mercury-3d-model/" },
  { file: "venus.glb", source: "NASA Science — Venus 3D Model", url: "https://science.nasa.gov/resource/venus-3d-model/" },
  { file: "uranus.glb", source: "NASA Science — Uranus 3D Model", url: "https://science.nasa.gov/resource/uranus-3d-model/" },
  { file: "neptune.glb", source: "NASA Science — Neptune 3D Model", url: "https://science.nasa.gov/resource/neptune-3d-model/" },
  { file: "pluto.glb", source: "NASA Science — Pluto 3D Model", url: "https://science.nasa.gov/resource/pluto-3d-model/" },
  { file: "ceres.glb", source: "NASA Science — Ceres 3D Model", url: "https://science.nasa.gov/resource/ceres-3d-model/" },
  { file: "haumea.glb", source: "NASA Science — Haumea 3D Model", url: "https://science.nasa.gov/resource/haumea-3d-model/" },
  { file: "makemake.glb", source: "NASA Science — Makemake 3D Model", url: "https://science.nasa.gov/resource/makemake-3d-model/" },
  { file: "eris.glb", source: "NASA Science — Eris 3D Model", url: "https://science.nasa.gov/resource/eris-3d-model/" },
  { file: "io.glb", source: "NASA Science — Io 3D Model", url: "https://science.nasa.gov/resource/io-3d-model/" },
  { file: "europa.glb", source: "NASA Science — Europa 3D Model", url: "https://science.nasa.gov/resource/europa-3d-model/" },
  { file: "ganymede.glb", source: "NASA Science — Ganymede 3D Model", url: "https://science.nasa.gov/resource/ganymede-3d-model/" },
  { file: "callisto.glb", source: "NASA Science — Callisto 3D Model", url: "https://science.nasa.gov/resource/callisto-3d-model/" },
  { file: "titan.glb", source: "NASA Science — Titan 3D Model", url: "https://science.nasa.gov/resource/titan-3d-model/" },
  { file: "enceladus.glb", source: "NASA Science — Enceladus 3D Model", url: "https://science.nasa.gov/resource/enceladus-3d-model/" },
  { file: "charon.glb", source: "NASA Science — Charon 3D Model", url: "https://science.nasa.gov/resource/charon-3d-model/" },
  { file: "rhea.glb", source: "NASA Science — Rhea 3D Model", url: "https://science.nasa.gov/resource/rhea-3d-model/" },
  { file: "iapetus.glb", source: "NASA Science — Iapetus 3D Model", url: "https://science.nasa.gov/resource/iapetus-3d-model/" },
  { file: "titania.glb", source: "NASA Science — Titania 3D Model", url: "https://science.nasa.gov/resource/titania-3d-model/" },
  { file: "oberon.glb", source: "NASA Science — Oberon 3D Model", url: "https://science.nasa.gov/resource/oberon-3d-model/" },
  { file: "triton.glb", source: "NASA Science — Triton 3D Model", url: "https://science.nasa.gov/resource/triton-3d-model/" },
  { file: "new-horizons.glb", source: "NASA Science — New Horizons 3D Model", url: "https://science.nasa.gov/resource/new-horizons-3d-model/" },
  { file: "parker.glb", source: "NASA Science — Parker Solar Probe 3D Model", url: "https://science.nasa.gov/resource/parker-solar-probe-3d-model/" },
  { file: "pioneer.glb", source: "NASA 3D Resources — Pioneer 10", url: "https://science.nasa.gov/3d-resources/pioneer/" },
  { file: "cassini.glb", source: "NASA Science — Cassini 3D Model", url: "https://science.nasa.gov/resource/cassini-3d-model/" },
  { file: "osiris-rex.glb", source: "NASA Science — OSIRIS-REx 3D Model", url: "https://science.nasa.gov/resource/osiris-rex-3d-model/" },
  { file: "juno.glb", source: "NASA Science — Juno 3D Model", url: "https://science.nasa.gov/resource/juno-3d-model/" },
  { file: "dawn.glb", source: "NASA 3D Resources — Dawn", url: "https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Dawn" },
] as const;

export const SPACECRAFT_MODEL_URL: Partial<Record<string, string>> = {
  "Hubble Space Telescope": NASA_GLTF.hubble,
  "James Webb Space Telescope": NASA_GLTF.jwst,
  "International Space Station": NASA_GLTF.iss,
  "Voyager 1": NASA_GLTF.voyager,
  "Voyager 2": NASA_GLTF.voyager,
  "New Horizons": NASA_GLTF.newHorizons,
  "Parker Solar Probe": NASA_GLTF.parker,
  "Pioneer 10": NASA_GLTF.pioneer,
  Cassini: NASA_GLTF.cassini,
  "OSIRIS-REx": NASA_GLTF.osirisRex,
  Juno: NASA_GLTF.juno,
  Dawn: NASA_GLTF.dawn,
};

/** Optional Euler rotation (rad) after NASA mesh normalization. */
export const SPACECRAFT_MODEL_ROTATION: Partial<Record<string, [number, number, number]>> = {
  "Hubble Space Telescope": [0, 0, Math.PI / 2],
  "James Webb Space Telescope": [0.35, 0.6, 0.15],
  "Voyager 1": [0.35, 0, 0],
  "Voyager 2": [0.35, Math.PI, 0],
  "New Horizons": [0.2, Math.PI / 2, 0],
  "Parker Solar Probe": [0.15, 0, 0],
  "Pioneer 10": [0.25, Math.PI / 4, 0],
  Cassini: [0.1, Math.PI / 3, 0],
  "OSIRIS-REx": [0.15, 0, 0.2],
  Juno: [0.2, 0, 0],
  Dawn: [0.1, Math.PI / 6, 0],
};

/** Planet photosphere glTF (procedural sphere fallback when missing). */
export const PLANET_MODEL_URL: Partial<Record<string, string>> = {
  Mercury: NASA_GLTF.mercury,
  Venus: NASA_GLTF.venus,
  Earth: NASA_GLTF.earth,
  Mars: NASA_GLTF.mars,
  Jupiter: NASA_GLTF.jupiter,
  Saturn: NASA_GLTF.saturn,
  Uranus: NASA_GLTF.uranus,
  Neptune: NASA_GLTF.neptune,
  Ceres: NASA_GLTF.ceres,
  Pluto: NASA_GLTF.pluto,
  Haumea: NASA_GLTF.haumea,
  Makemake: NASA_GLTF.makemake,
  Eris: NASA_GLTF.eris,
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
  Charon: NASA_GLTF.charon,
  Rhea: NASA_GLTF.rhea,
  Iapetus: NASA_GLTF.iapetus,
  Titania: NASA_GLTF.titania,
  Oberon: NASA_GLTF.oberon,
  Triton: NASA_GLTF.triton,
};

export const PLANET_MODEL_ROTATION: Partial<Record<string, [number, number, number]>> = {
  Saturn: [(26.73 * Math.PI) / 180, 0, 0],
  Uranus: [(97.77 * Math.PI) / 180, 0, 0],
};

export const MOON_MODEL_ROTATION: Partial<Record<string, [number, number, number]>> = {};