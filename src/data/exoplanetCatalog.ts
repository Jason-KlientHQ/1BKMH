import catalog from "@/data/exoplanetCatalog.json";
import { EXOPLANETS } from "@/data/solarSystem";

export interface ArchiveExoplanet {
  host: string;
  name: string;
  aAU: number;
  periodDays: number;
  radiusEarth: number;
  discoveryMethod: string;
}

export interface ExoplanetCatalog {
  fetchedAt: string;
  source: string;
  sourceUrl: string;
  galaxyTotal: number;
  planets: ArchiveExoplanet[];
}

export const EXOPLANET_CATALOG = catalog as ExoplanetCatalog;

/** Same world, different archive vs curated labels — match by host + period. */
function isCuratedDuplicate(archive: ArchiveExoplanet): boolean {
  return EXOPLANETS.some(
    (c) =>
      c.host === archive.host &&
      c.periodDays > 0 &&
      Math.abs(c.periodDays - archive.periodDays) / c.periodDays < 0.1,
  );
}

/** Archive planets for a host, excluding Tier-A curated worlds (rendered separately). */
export function archivePlanetsForHost(host: string): ArchiveExoplanet[] {
  return EXOPLANET_CATALOG.planets.filter((p) => p.host === host && !isCuratedDuplicate(p));
}

export function confirmedPlanetCount(host: string): number {
  return EXOPLANET_CATALOG.planets.filter((p) => p.host === host).length;
}

export function exoplanetDisplayNote(host: string, visibleCount: number): string | null {
  const total = confirmedPlanetCount(host);
  if (total <= 0) return null;
  if (visibleCount >= total) {
    return `${total} confirmed exoplanet${total === 1 ? "" : "s"} (NASA Exoplanet Archive).`;
  }
  return `Showing ${visibleCount} of ${total} confirmed exoplanets (NASA Exoplanet Archive).`;
}