#!/usr/bin/env node
/**
 * Fetch confirmed exoplanets from NASA Exoplanet Archive (pscomppars) for featured host stars.
 * Run: node scripts/fetch-exoplanets.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/data/exoplanetCatalog.json");
const TAP = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";

const FEATURED = [
  "Proxima Centauri", "Alpha Centauri", "Barnard's Star", "Wolf 359", "Lalande 21185",
  "Sirius", "Luyten 726-8", "Ross 154", "Ross 248", "Epsilon Eridani", "Lacaille 9352",
  "Ross 128", "61 Cygni", "Procyon", "Tau Ceti", "Luyten's Star", "Teegarden's Star",
  "Kapteyn's Star", "Wolf 1061", "Gliese 876", "40 Eridani", "Altair", "Gliese 581",
  "Vega", "Fomalhaut", "Pollux", "Arcturus", "Zeta Reticuli", "Capella", "Aldebaran",
  "TRAPPIST-1", "Epsilon Indi", "LHS 1140", "55 Cancri", "Castor", "Regulus", "Spica",
  "Bellatrix", "Mintaka", "Alnilam", "Alnitak", "Canopus", "Polaris", "Betelgeuse",
  "Antares", "Rigel", "Deneb",
];

const HOST_ALIASES = {
  "proxima cen": "Proxima Centauri",
  "gj 876": "Gliese 876",
  "hd 33793": "Barnard's Star",
  "gj 273": "Luyten's Star",
  "gj 581": "Gliese 581",
  "eps eri": "Epsilon Eridani",
  "40 eri a": "40 Eridani",
  "eps indi a": "Epsilon Indi",
  "55 cnc": "55 Cancri",
  "lacaille 9352": "Lacaille 9352",
};

function norm(s) {
  return s.toLowerCase().replace(/[''`]/g, "").replace(/\s+/g, " ").trim();
}

const featuredNorm = new Map(FEATURED.map((n) => [norm(n), n]));

function resolveHost(archiveHost) {
  const n = norm(archiveHost);
  if (featuredNorm.has(n)) return featuredNorm.get(n);
  if (HOST_ALIASES[n]) return HOST_ALIASES[n];
  for (const [key, display] of featuredNorm) {
    if (n.startsWith(key) || key.startsWith(n)) return display;
  }
  return null;
}

async function tapQuery(sql) {
  const url = `${TAP}?query=${encodeURIComponent(sql)}&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TAP ${res.status}: ${await res.text()}`);
  return res.json();
}

const rows = await tapQuery(
  "select hostname,pl_name,pl_orbsmax,pl_orbper,pl_rade,discoverymethod from pscomppars where pl_orbper is not null",
);

const planets = [];
const seen = new Set();

for (const row of rows) {
  const host = resolveHost(row.hostname);
  if (!host) continue;
  const key = `${host}|${row.pl_name}`;
  if (seen.has(key)) continue;
  seen.add(key);
  planets.push({
    host,
    name: row.pl_name,
    aAU: row.pl_orbsmax != null ? Number(row.pl_orbsmax) : 0.05,
    periodDays: Number(row.pl_orbper),
    radiusEarth: row.pl_rade != null ? Number(row.pl_rade) : 1,
    discoveryMethod: row.discoverymethod ?? "unknown",
  });
}

planets.sort((a, b) => a.host.localeCompare(b.host) || a.periodDays - b.periodDays);

const countRows = await tapQuery("select count(*) as n from pscomppars");
const galaxyTotal = Number(countRows[0]?.n ?? planets.length);

const catalog = {
  fetchedAt: new Date().toISOString().slice(0, 10),
  source: "NASA Exoplanet Archive (pscomppars)",
  sourceUrl: "https://exoplanetarchive.ipac.caltech.edu/",
  galaxyTotal,
  planets,
};

writeFileSync(OUT, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Wrote ${planets.length} featured-host planets (galaxy total ${galaxyTotal}) → ${OUT}`);