import { PLANETS, MOONS, NEARBY_STARS, COMETS, BLACK_HOLES, EXOPLANETS, ROADSTER, SPACECRAFT, EXOTIC_OBJECTS } from "@/data/solarSystem";
import { STAR_CATALOG } from "@/data/starCatalog";

import { SEC_PER_AU, SEC_PER_LY } from "@/lib/constants"; // derived from c = 1,079,252,848.8 km/h
import { resolveMassSolar } from "@/stellar/physics";

/* ----------------------------- source links ------------------------------ */
// Sources: Grokipedia (primary) → NASA. Wikipedia is not used.
const slug = (n: string) => n.replace(/ /g, "_").replace(/'/g, "%27");
export const grokipediaUrl = (n: string) => `https://grokipedia.com/page/${slug(n)}`;
export const nasaUrl = (n: string) => `https://science.nasa.gov/?search=${encodeURIComponent(n)}`;

export interface BodyDetail {
  name: string;
  type: string;
  blurb: string;
  stats: { label: string; value: string }[];
  lightSeconds: number; // one-way light-travel time from the Sun (0 = the Sun)
  links: { grokipedia: string; nasa: string };
}

/** "Your light arrived on ___" — the moment the person's light reached a body. */
export function formatArrival(birthISO: string, lightSeconds: number): string | null {
  if (!birthISO) return null;
  const birth = new Date(birthISO);
  if (isNaN(birth.getTime())) return null;
  if (lightSeconds <= 0) return "Your light begins its journey here.";

  const arrival = new Date(birth.getTime() + lightSeconds * 1000);
  const now = new Date();

  if (lightSeconds < 86400) {
    const mins = lightSeconds / 60;
    const rel = mins < 90 ? `${Math.round(mins)} minute${Math.round(mins) === 1 ? "" : "s"}` : `${(mins / 60).toFixed(1)} hours`;
    return `Your light reached here ${rel} after you were born.`;
  }
  const dateStr = arrival.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  if (arrival <= now) return `Your light arrived here on ${dateStr}.`;
  const yrs = (arrival.getTime() - now.getTime()) / (SEC_PER_LY * 1000);
  return `Your light reaches here on ${dateStr} — ${Math.round(yrs).toLocaleString("en-US")} years from now.`;
}

/** The (past) calendar year the light reached a body, for historical anchoring. */
export function arrivalYear(birthISO: string, lightSeconds: number): number | null {
  if (!birthISO || lightSeconds < 86400) return null; // only star-scale arrivals
  const birth = new Date(birthISO);
  if (isNaN(birth.getTime())) return null;
  const arrival = new Date(birth.getTime() + lightSeconds * 1000);
  if (arrival > new Date()) return null;
  return arrival.getFullYear();
}

// Short, curated blurbs (facts sourced Grokipedia-first, verified against NASA).
const BLURBS: Record<string, string> = {
  Sun: "The star at the heart of the solar system — a G-type main-sequence star holding 99.8% of the system's mass. Its light takes about 8 minutes to reach Earth.",
  Mercury: "The smallest planet and closest to the Sun, nearly airless, with temperatures swinging from 430°C by day to -180°C at night.",
  Venus: "Earth's scorching twin — a runaway greenhouse under thick sulfuric-acid clouds, hot enough (465°C) to melt lead.",
  Earth: "The only known world with life and liquid-water oceans, wrapped in a nitrogen-oxygen atmosphere and shielded by a magnetic field.",
  Mars: "The rusty red planet — home to Olympus Mons, the tallest volcano in the solar system, and traces of ancient rivers and lakes.",
  Jupiter: "The giant of the solar system — more massive than all other planets combined, wrapped in storm bands and the centuries-old Great Red Spot.",
  Saturn: "The ringed jewel — a gas giant circled by billions of icy particles forming the most spectacular ring system in the solar system.",
  Uranus: "An ice giant tipped on its side, rolling around the Sun at a 98° tilt beneath a pale blue-green methane haze.",
  Neptune: "The farthest planet — a deep-blue ice giant with the fastest winds in the solar system, topping 2,000 km/h.",
  Ceres: "The largest object in the asteroid belt and the closest dwarf planet — an icy-rocky world that may hide a briny subsurface ocean.",
  Pluto: "The most famous dwarf planet — a small icy world with a heart-shaped nitrogen glacier and five moons, reclassified in 2006.",
  Haumea: "An egg-shaped dwarf planet spinning once every ~4 hours, stretched by its rotation, with a ring and two moons.",
  Makemake: "A bright, reddish dwarf planet in the Kuiper Belt — one of the largest worlds beyond Neptune.",
  Eris: "A distant, massive dwarf planet just smaller than Pluto; its 2005 discovery triggered Pluto's demotion.",
  Moon: "Earth's only natural satellite and the only world beyond Earth humans have walked on. Its gravity drives the ocean tides.",
  Io: "Jupiter's innermost large moon and the most volcanically active body known, resurfaced by hundreds of erupting volcanoes.",
  Europa: "A Galilean moon with a smooth icy crust hiding a global saltwater ocean — a prime place to search for life.",
  Ganymede: "The largest moon in the solar system, bigger than Mercury, and the only moon with its own magnetic field.",
  Callisto: "Jupiter's outermost Galilean moon — one of the most heavily cratered objects known, a relic of the early solar system.",
  Enceladus: "A tiny, brilliant-white moon of Saturn that jets water and ice from a subsurface ocean through south-pole cracks.",
  Rhea: "Saturn's second-largest moon — a heavily cratered ball of ice and rock.",
  Titan: "Saturn's largest moon and the only one with a thick atmosphere — a hazy world with rivers, lakes and seas of liquid methane.",
  Iapetus: "Saturn's two-toned moon: one hemisphere dark as coal, the other bright as snow, wrapped by a strange equatorial ridge.",
  Titania: "The largest moon of Uranus — an icy world scarred by enormous canyons and fault valleys.",
  Oberon: "The outermost large moon of Uranus — an ancient, cratered surface tinted with dark reddish material.",
  Triton: "Neptune's largest moon — it orbits backwards and erupts nitrogen geysers, likely a captured Kuiper Belt world.",
  Charon: "Pluto's giant moon, half Pluto's size, locked face-to-face so the two forever show each other the same side.",
};

const planetType = (kind: string, radiusKm: number) => {
  if (kind === "dwarf") return "Dwarf planet";
  return radiusKm > 20000 ? "Giant planet" : "Terrestrial planet";
};

const fmtKm = (km: number) => `${km.toLocaleString("en-US")} km`;

export function getBodyInfo(name: string): BodyDetail | null {
  const links = { grokipedia: grokipediaUrl(name), nasa: nasaUrl(name) };

  if (name === "Sun") {
    return {
      name,
      type: "G2V main-sequence star",
      blurb: BLURBS.Sun,
      stats: [
        { label: "Radius", value: "696,000 km" },
        { label: "Surface", value: "~5,500°C" },
        { label: "Age", value: "4.6 billion yr" },
      ],
      lightSeconds: 0,
      links,
    };
  }

  const p = PLANETS.find((b) => b.name === name);
  if (p) {
    return {
      name,
      type: planetType(p.kind, p.radiusKm),
      blurb: BLURBS[name] ?? "",
      stats: [
        { label: "Radius", value: fmtKm(p.radiusKm) },
        { label: "From Sun", value: `${p.a.toFixed(2)} AU` },
        { label: "Year", value: p.period < 1 ? `${(p.period * 365).toFixed(0)} days` : `${p.period.toFixed(1)} yr` },
      ],
      lightSeconds: p.a * SEC_PER_AU,
      links,
    };
  }

  const m = MOONS.find((b) => b.name === name);
  if (m) {
    const parent = PLANETS.find((b) => b.name === m.parent);
    return {
      name,
      type: `Moon of ${m.parent}`,
      blurb: BLURBS[name] ?? "",
      stats: [
        { label: "Radius", value: fmtKm(m.radiusKm) },
        { label: "Orbit", value: `${Math.abs(m.periodDays).toFixed(1)} days${m.periodDays < 0 ? " (retro)" : ""}` },
        { label: "Parent", value: m.parent },
      ],
      lightSeconds: (parent?.a ?? 1) * SEC_PER_AU,
      links,
    };
  }

  const s = NEARBY_STARS.find((b) => b.name === name);
  if (s) {
    const mass = resolveMassSolar(name, s.radiusSolar, s.spectral);
    return {
      name,
      type: s.spectral,
      blurb: s.desc,
      stats: [
        { label: "Distance", value: `${s.distance} ly` },
        { label: "Radius", value: `${s.radiusSolar.toFixed(2)} R☉` },
        { label: "Mass", value: `${mass.toFixed(2)} M☉` },
      ],
      lightSeconds: s.distance * SEC_PER_LY,
      links,
    };
  }

  if (name === ROADSTER.name) {
    return {
      name,
      type: "Spacecraft · Tesla Roadster",
      blurb: ROADSTER.desc,
      stats: [
        { label: "Launched", value: "Feb 2018" },
        { label: "Orbit", value: `${ROADSTER.period.toFixed(2)} yr` },
        { label: "Driver", value: "Starman" },
      ],
      lightSeconds: ROADSTER.a * SEC_PER_AU,
      links,
    };
  }

  const sc = SPACECRAFT.find((b) => b.name === name);
  if (sc) {
    const stats =
      sc.orbit === "earth"
        ? [
            { label: "Orbit", value: "Earth (LEO)" },
            { label: "Altitude", value: `~${sc.altKm} km` },
            { label: "Type", value: sc.kind },
          ]
        : [
            { label: "From Sun", value: `${sc.distanceAU! < 2 ? sc.distanceAU!.toFixed(2) : Math.round(sc.distanceAU!).toLocaleString("en-US")} AU` },
            { label: "Type", value: sc.kind },
            { label: "Light-time", value: sc.distanceAU! < 100 ? `${(sc.distanceAU! * 8.317).toFixed(0)} min` : `${(sc.distanceAU! * 8.317 / 60).toFixed(1)} hr` },
          ];
    const earthAU = PLANETS.find((b) => b.name === "Earth")!.a;
    return {
      name,
      type: sc.kind,
      blurb: sc.desc,
      stats,
      lightSeconds: (sc.orbit === "earth" ? earthAU : sc.distanceAU!) * SEC_PER_AU,
      links,
    };
  }

  const ex = EXOTIC_OBJECTS.find((b) => b.name === name);
  if (ex) {
    return {
      name,
      type: ex.typeLabel,
      blurb: ex.desc,
      stats: ex.stats,
      lightSeconds: ex.distance * SEC_PER_LY,
      links,
    };
  }

  const c = COMETS.find((b) => b.name === name);
  if (c) {
    return {
      name,
      type: "Comet",
      blurb: c.desc,
      stats: [
        { label: "Orbit", value: `${c.period.toFixed(1)} yr` },
        { label: "Nucleus", value: `~${c.radiusKm} km` },
        { label: "Eccentric", value: c.e.toFixed(2) },
      ],
      lightSeconds: c.a * SEC_PER_AU,
      links,
    };
  }

  const bh = BLACK_HOLES.find((b) => b.name === name);
  if (bh) {
    return {
      name,
      type: bh.kind,
      blurb: bh.desc,
      stats: [
        { label: "Mass", value: `${bh.massSolar} M☉` },
        { label: "Distance", value: `${bh.distance.toLocaleString("en-US")} ly` },
        { label: "Light-time", value: `${bh.distance.toLocaleString("en-US")} yr` },
      ],
      lightSeconds: bh.distance * SEC_PER_LY,
      links,
    };
  }

  const cat = STAR_CATALOG.find((b) => b.name === name);
  if (cat) {
    const isGiant = cat.r >= 10;
    const mass = resolveMassSolar(cat.name, cat.r, cat.spect);
    const kind = /^(HD|HIP|Gliese)/.test(cat.name) ? "Catalog star" : "Star";
    const sizeNote = cat.r >= 100 ? " (supergiant)" : cat.r >= 10 ? " (giant)" : "";
    return {
      name,
      type: (cat.spect !== "—" ? `${kind} · ${cat.spect}` : kind) + sizeNote,
      blurb: `${isGiant ? `A ${cat.r >= 100 ? "supergiant" : "giant"} star` : "A star"} roughly ${cat.ly} light-years from the Sun${cat.spect !== "—" ? `, spectral type ${cat.spect}` : ""}${isGiant ? ` — about ${cat.r.toLocaleString("en-US")}× the Sun's radius` : ""}.`,
      stats: [
        { label: "Distance", value: `${cat.ly} ly` },
        { label: "Radius", value: `~${cat.r.toLocaleString("en-US")} R☉` },
        { label: "Mass", value: `~${mass.toFixed(2)} M☉` },
      ],
      lightSeconds: cat.ly * SEC_PER_LY,
      links,
    };
  }

  const e = EXOPLANETS.find((b) => b.name === name);
  if (e) {
    const host = NEARBY_STARS.find((b) => b.name === e.host);
    return {
      name,
      type: `Exoplanet · orbits ${e.host}`,
      blurb: e.desc,
      stats: [
        { label: "Size", value: `${e.radiusEarth} R⊕` },
        { label: "Orbit", value: `${e.periodDays.toFixed(1)} days` },
        { label: "Host", value: e.host },
      ],
      lightSeconds: (host?.distance ?? 0) * SEC_PER_LY,
      links,
    };
  }

  return null;
}
