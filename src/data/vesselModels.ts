/** Kenney Space Kit (CC0) + NASA glTF assets under public/models — see CREDITS.txt in each folder. */
export const VESSEL_MODEL_BASE = "/models/vessels";

export const VESSEL_GLTF = {
  "constitution-cruiser": `${VESSEL_MODEL_BASE}/constitution-cruiser.glb`,
  "falcon-freighter": `${VESSEL_MODEL_BASE}/falcon-freighter.glb`,
  "discovery-monolith": `${VESSEL_MODEL_BASE}/discovery-monolith.glb`,
  "x-wing-fighter": `${VESSEL_MODEL_BASE}/x-wing-fighter.glb`,
  "serenity-freighter": `${VESSEL_MODEL_BASE}/serenity-freighter.glb`,
  "normandy-frigate": `${VESSEL_MODEL_BASE}/normandy-frigate.glb`,
  "borg-cube": `${VESSEL_MODEL_BASE}/borg-cube.glb`,
  "battlestar-carrier": `${VESSEL_MODEL_BASE}/battlestar-carrier.glb`,
  "imperial-sphere": `${VESSEL_MODEL_BASE}/imperial-sphere.glb`,
} as const;

export const VESSEL_MODEL_CREDITS = [
  {
    pack: "Kenney Space Kit 2.0",
    license: "CC0 1.0 (public domain)",
    url: "https://kenney.nl/assets/space-kit",
    note: "Sci-fi hull meshes are inspired-by silhouettes — not franchise replicas.",
  },
] as const;