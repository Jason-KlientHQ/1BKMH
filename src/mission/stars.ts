import { STAR_CATALOG } from "@/data/starCatalog";
import { NEARBY_STARS } from "@/data/solarSystem";

export interface NavStar {
  name: string;
  distanceLy: number;
  unitDir: [number, number, number];
  color: string;
  spectral: string;
  featured: boolean;
}

const featured = NEARBY_STARS.map((s) => ({
  name: s.name,
  distanceLy: s.distance,
  unitDir: s.dir as [number, number, number],
  color: s.color,
  spectral: s.spectral,
  featured: true,
}));

const featuredNames = new Set(featured.map((s) => s.name.toLowerCase()));

const catalog = STAR_CATALOG.filter((s) => !featuredNames.has(s.name.toLowerCase())).map((s) => ({
  name: s.name,
  distanceLy: s.ly,
  unitDir: s.pos as [number, number, number],
  color: s.color,
  spectral: s.spect,
  featured: false,
}));

/** Unified navigation index — featured stars first, then catalog. */
export const NAV_STARS: NavStar[] = [...featured, ...catalog];

const BY_NAME = new Map(NAV_STARS.map((s) => [s.name.toLowerCase(), s]));

export function findNavStar(name: string): NavStar | undefined {
  return BY_NAME.get(name.toLowerCase());
}

export function isNavStar(name: string): boolean {
  return BY_NAME.has(name.toLowerCase());
}

export function searchNavStars(query: string, limit = 12): NavStar[] {
  const q = query.trim().toLowerCase();
  if (!q) return NAV_STARS.filter((s) => s.featured).slice(0, limit);

  const scored = NAV_STARS.map((s) => {
    const n = s.name.toLowerCase();
    let score = 0;
    if (n === q) score = 100;
    else if (n.startsWith(q)) score = 80;
    else if (n.includes(q)) score = 60;
    else if (s.spectral.toLowerCase().includes(q)) score = 30;
    if (s.featured) score += 5;
    return { s, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.s.distanceLy - b.s.distanceLy);

  return scored.slice(0, limit).map((x) => x.s);
}