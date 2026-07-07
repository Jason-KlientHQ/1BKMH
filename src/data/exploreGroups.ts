import {
  ROADSTER,
  SPACECRAFT,
  COMETS,
  EXOTIC_OBJECTS,
  COSMIC_LANDMARKS,
  BLACK_HOLES,
} from "@/data/solarSystem";

export interface ExploreGroup {
  label: string;
  items: string[];
}

/** Jump destinations for the Explore menu (far things you can't easily click). */
export const EXPLORE_GROUPS: ExploreGroup[] = [
  { label: "Spacecraft", items: [ROADSTER.name, ...SPACECRAFT.map((s) => s.name)] },
  { label: "Comets", items: COMETS.map((c) => c.name) },
  {
    label: "Bright stars",
    items: [
      "Sirius",
      "Vega",
      "Arcturus",
      "Aldebaran",
      "Betelgeuse",
      "Antares",
      "Rigel",
      "Deneb",
      "Canopus",
      "Polaris",
      "Bellatrix",
      "Mintaka",
      "Alnilam",
      "Alnitak",
    ],
  },
  { label: "Exotic objects", items: EXOTIC_OBJECTS.map((o) => o.name) },
  { label: "Beyond the neighborhood", items: COSMIC_LANDMARKS.map((l) => l.name) },
  { label: "Black holes", items: BLACK_HOLES.map((b) => b.name) },
];