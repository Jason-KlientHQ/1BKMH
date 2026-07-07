#!/usr/bin/env node
/**
 * Download NASA / USGov glTF assets into public/models/nasa/.
 * Run: node scripts/fetch-nasa-models.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public/models/nasa");
const roadsterDir = join(root, "public/models/roadster");

const NASA = [
  ["mercury.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/m/Mercury_1_4878.glb"],
  ["venus.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/v/Venus_1_12103.glb"],
  ["uranus.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/u/Uranus_1_51118.glb"],
  ["neptune.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/n/Neptune_1_49528.glb"],
  ["pluto.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/p/l/Pluto_1_2374.glb"],
  ["ceres.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/c/Ceres_1_1000.glb"],
  ["haumea.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/h/Haumea_1_1000.glb"],
  ["makemake.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/m/Makemake_1_1430.glb"],
  ["eris.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/e/Eris_1_2326.glb"],
  ["charon.glb", "https://science.nasa.gov/wp-content/uploads/2023/09/Charon_1_2.glb"],
  ["rhea.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/r/Rhea_1_1529.glb"],
  ["iapetus.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/i/Iapetus_1_1471.glb"],
  ["titania.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/t/Titania_1_1577.glb"],
  ["oberon.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/o/Oberon_1_1523.glb"],
  ["triton.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/t/Triton_1_2707.glb"],
  ["pioneer.glb", "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/pioneer-10/Pioneer%2010.glb"],
  ["cassini.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/c/Cassini.glb"],
  ["osiris-rex.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/o/Osiris_Rex.glb"],
  ["juno.glb", "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/j/Juno.glb"],
  ["dawn.glb", "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Dawn/Dawn.glb"],
];

/** CC0 sports car (Quaternius via Poly Pizza) — styled as Starman's Roadster in-app. */
const ROADSTER = [
  [
    "roadster.glb",
    "https://static.poly.pizza/34db1344-31cc-49ac-bc46-c055f68e39ca.glb",
    "https://poly.pizza/m/1mkmFkAz5v",
  ],
];

async function fetchBinary(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function downloadSet(entries, dir) {
  await mkdir(dir, { recursive: true });
  for (const [file, url] of entries) {
    const dest = join(dir, file);
    process.stdout.write(`  ${file} ... `);
    try {
      const buf = await fetchBinary(url);
      await writeFile(dest, buf);
      console.log(`${(buf.length / 1024).toFixed(0)} KB`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      process.exitCode = 1;
    }
  }
}

console.log("NASA models → public/models/nasa/");
await downloadSet(NASA, outDir);

console.log("Roadster → public/models/roadster/");
await downloadSet(
  ROADSTER.map(([f, u]) => [f, u]),
  roadsterDir,
);

if (!process.exitCode) console.log("Done.");