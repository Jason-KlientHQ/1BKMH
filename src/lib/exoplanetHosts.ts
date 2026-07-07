import { NEARBY_STARS } from "@/data/solarSystem";

/** Normalize archive / display host strings for fuzzy matching. */
export function normalizeHostName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Archive hostname → featured NEARBY_STARS display name. */
const HOST_ALIASES: Record<string, string> = {
  "proxima cen": "Proxima Centauri",
  "proxima centauri": "Proxima Centauri",
  "gj 876": "Gliese 876",
  "gliese 876": "Gliese 876",
  "hd 33793": "Barnard's Star",
  "barnards star": "Barnard's Star",
  "gj 273": "Luyten's Star",
  "luytens star": "Luyten's Star",
  "gj 273 b host": "Luyten's Star",
  "teegardens star": "Teegarden's Star",
  "kapteyns star": "Kapteyn's Star",
  "gj 581": "Gliese 581",
  "gliese 581": "Gliese 581",
  "eps eri": "Epsilon Eridani",
  "epsilon eridani": "Epsilon Eridani",
  "40 eri a": "40 Eridani",
  "40 eridani": "40 Eridani",
  "eps indi a": "Epsilon Indi",
  "epsilon indi": "Epsilon Indi",
  "55 cnc": "55 Cancri",
  "55 cancri": "55 Cancri",
  "lhs 1140": "LHS 1140",
  "lacaille 9352": "Lacaille 9352",
  "lalande 21185": "Lalande 21185",
  "ross 128": "Ross 128",
  "wolf 1061": "Wolf 1061",
  "tau ceti": "Tau Ceti",
  "trappist-1": "TRAPPIST-1",
};

const FEATURED_BY_NORM = new Map(
  NEARBY_STARS.map((s) => [normalizeHostName(s.name), s.name] as const),
);

/** Resolve an archive hostname to a featured star name, if known. */
export function resolveFeaturedHost(archiveHost: string): string | null {
  const norm = normalizeHostName(archiveHost);
  const direct = FEATURED_BY_NORM.get(norm);
  if (direct) return direct;
  const alias = HOST_ALIASES[norm];
  if (alias) return alias;
  for (const [key, display] of FEATURED_BY_NORM) {
    if (norm.startsWith(key) || key.startsWith(norm)) return display;
  }
  return null;
}

export const FEATURED_HOST_NAMES = NEARBY_STARS.map((s) => s.name);