import { NASA_GLTF } from "@/data/nasaModels";
import type { PropulsionMode } from "@/mission/types";

export type VesselHullId =
  | "voyager-probe"
  | "constitution-cruiser"
  | "falcon-freighter"
  | "discovery-monolith"
  | "x-wing-fighter"
  | "serenity-freighter"
  | "normandy-frigate"
  | "borg-cube"
  | "battlestar-carrier"
  | "imperial-sphere";

export interface VesselHullPreset {
  id: VesselHullId;
  label: string;
  inspiredBy: string;
  gltfUrl?: string;
  targetSize: number;
  rotation?: [number, number, number];
  engineColor: string;
  defaultModes: PropulsionMode[];
}

export const VESSEL_HULLS: VesselHullPreset[] = [
  {
    id: "voyager-probe",
    label: "Deep-space probe",
    inspiredBy: "Voyager (NASA)",
    gltfUrl: NASA_GLTF.voyager,
    targetSize: 8,
    rotation: [0, Math.PI / 2, 0.2],
    engineColor: "#9ad0ff",
    defaultModes: ["gravity_assist", "light_speed", "nuclear"],
  },
  {
    id: "constitution-cruiser",
    label: "Constitution-class explorer",
    inspiredBy: "Star Trek",
    targetSize: 14,
    engineColor: "#2fe0c0",
    defaultModes: ["sublight", "gravity_assist"],
  },
  {
    id: "falcon-freighter",
    label: "Corellian freighter",
    inspiredBy: "Star Wars",
    targetSize: 10,
    engineColor: "#ffd166",
    defaultModes: ["nuclear", "gravity_assist"],
  },
  {
    id: "discovery-monolith",
    label: "Discovery-class vehicle",
    inspiredBy: "2001: A Space Odyssey",
    targetSize: 12,
    rotation: [0, 0, Math.PI / 2],
    engineColor: "#cfe4ff",
    defaultModes: ["sublight", "nuclear"],
  },
  {
    id: "x-wing-fighter",
    label: "Snub fighter",
    inspiredBy: "Star Wars",
    targetSize: 7,
    engineColor: "#ff6b6b",
    defaultModes: ["nuclear"],
  },
  {
    id: "serenity-freighter",
    label: "Firefly-class transport",
    inspiredBy: "Firefly",
    targetSize: 11,
    engineColor: "#c9a86c",
    defaultModes: ["gravity_assist", "nuclear"],
  },
  {
    id: "normandy-frigate",
    label: "Normandy-class frigate",
    inspiredBy: "Mass Effect",
    targetSize: 13,
    engineColor: "#7ee8d8",
    defaultModes: ["sublight", "nuclear"],
  },
  {
    id: "borg-cube",
    label: "Collective cube",
    inspiredBy: "Star Trek",
    targetSize: 16,
    engineColor: "#8cf0c0",
    defaultModes: ["alcubierre", "sublight"],
  },
  {
    id: "battlestar-carrier",
    label: "Colonial carrier",
    inspiredBy: "Battlestar Galactica",
    targetSize: 18,
    engineColor: "#a8c8ff",
    defaultModes: ["nuclear", "solar_sail"],
  },
  {
    id: "imperial-sphere",
    label: "Battle station (icon)",
    inspiredBy: "Star Wars",
    targetSize: 20,
    engineColor: "#9fd0ff",
    defaultModes: ["alcubierre"],
  },
];

export const DEFAULT_HULL_ID: VesselHullId = "voyager-probe";

export function findHullPreset(id: string | undefined): VesselHullPreset {
  return VESSEL_HULLS.find((h) => h.id === id) ?? VESSEL_HULLS[0];
}

export function defaultHullForMode(mode: PropulsionMode): VesselHullId {
  const match = VESSEL_HULLS.find((h) => h.defaultModes.includes(mode));
  return match?.id ?? DEFAULT_HULL_ID;
}