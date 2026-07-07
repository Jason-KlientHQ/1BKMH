import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EXO_CINEMATIC, siderealOrbitRateRadPerYear } from "@/lib/orbitRate";
import type { ArchiveExoplanet } from "@/data/exoplanetCatalog";

const MAX_INSTANCES_PER_HOST = 50;

/** Log-compressed orbit radius around a featured star (scene units). */
function exoOrbitRadius(starSize: number, aAU: number): number {
  return starSize * 1.35 + 3 + 5 * Math.log10(1 + aAU / 0.02);
}

function exoMeshRadius(radiusEarth: number): number {
  return 0.35 + 0.2 * Math.cbrt(Math.max(radiusEarth, 0.3));
}

/**
 * Instanced archive exoplanets (Tier B) — small dots, no labels.
 * Tier-A curated worlds stay as labeled ExoPlanetBody meshes.
 */
export const ExoplanetInstances = ({
  host,
  starSize,
  planets,
  clock,
  show,
  truePeriods,
}: {
  host: string;
  starSize: number;
  planets: ArchiveExoplanet[];
  clock: MutableRefObject<{ orbitalYears: number }>;
  show: boolean;
  truePeriods: boolean;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const list = useMemo(() => planets.slice(0, MAX_INSTANCES_PER_HOST), [planets]);
  const meta = useMemo(
    () =>
      list.map((p) => ({
        localR: exoOrbitRadius(starSize, p.aAU),
        r: exoMeshRadius(p.radiusEarth),
        rate: siderealOrbitRateRadPerYear(p.periodDays, truePeriods, EXO_CINEMATIC),
        color: p.radiusEarth >= 6 ? "#a8b8c8" : p.radiusEarth <= 1.2 ? "#8fae7a" : "#9aa8b8",
      })),
    [list, starSize, truePeriods],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || list.length === 0) return;
    const col = new THREE.Color();
    meta.forEach((m, i) => mesh.setColorAt(i, col.set(m.color)));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [list, meta]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || !show || list.length === 0) return;
    const angBase = clock.current.orbitalYears;
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const q = new THREE.Quaternion();
    list.forEach((_, i) => {
      const { localR, r, rate } = meta[i];
      const ang = angBase * rate + (i / list.length) * Math.PI * 2;
      pos.set(Math.cos(ang) * localR, Math.sin(ang) * localR * 0.12, Math.sin(ang) * localR);
      scale.set(r, r, r);
      q.identity();
      m.compose(pos, q, scale);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (!show || list.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, list.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial roughness={0.9} metalness={0.02} emissive="#334455" emissiveIntensity={0.2} />
    </instancedMesh>
  );
};