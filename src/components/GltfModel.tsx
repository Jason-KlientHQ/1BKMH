import { Component, Suspense, useMemo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { NASA_GLTF, NASA_MOON_GLTF } from "@/data/nasaModels";
import { VESSEL_GLTF } from "@/data/vesselModels";

/** Boot-time NASA assets (planets + in-view spacecraft) — moons load lazily. */
const NASA_BOOT_GLTF = [
  NASA_GLTF.hubble,
  NASA_GLTF.jwst,
  NASA_GLTF.iss,
  NASA_GLTF.voyager,
  NASA_GLTF.saturn,
  NASA_GLTF.earth,
  NASA_GLTF.mars,
  NASA_GLTF.jupiter,
  NASA_GLTF.newHorizons,
  NASA_GLTF.parker,
] as const;

/** Preload core NASA assets once the bundle loads (inside Canvas context). */
export function preloadNasaModels() {
  NASA_BOOT_GLTF.forEach((url) => useGLTF.preload(url));
}

let moonPreloadStarted = false;

/** Lazy-load heavy moon meshes when the user zooms in for moons. */
export function preloadNasaMoonModels() {
  if (moonPreloadStarted) return;
  moonPreloadStarted = true;
  NASA_MOON_GLTF.forEach((url) => useGLTF.preload(url));
}

/** Preload mission hull glTF assets (Kenney + NASA Voyager). */
export function preloadVesselModels() {
  Object.values(VESSEL_GLTF).forEach((url) => useGLTF.preload(url));
  useGLTF.preload(NASA_GLTF.voyager);
}

function normalizeObject(object: THREE.Object3D, targetSize: number): THREE.Object3D {
  const clone = object.clone(true);
  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6);

  clone.position.sub(center);
  clone.scale.setScalar(targetSize / maxDim);
  clone.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    }
  });
  return clone;
}

function NormalizedGltf({
  url,
  targetSize,
  rotation,
}: {
  url: string;
  targetSize: number;
  rotation?: [number, number, number];
}) {
  const { scene } = useGLTF(url);
  const object = useMemo(() => normalizeObject(scene, targetSize), [scene, targetSize]);

  return (
    <group rotation={rotation}>
      <primitive object={object} />
    </group>
  );
}

class GltfErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

/** Load a glTF with auto-scaling; render procedural fallback if fetch/parse fails. */
export const GltfWithFallback = ({
  url,
  targetSize,
  fallback,
  rotation,
}: {
  url: string;
  targetSize: number;
  fallback: ReactNode;
  rotation?: [number, number, number];
}) => (
  <GltfErrorBoundary fallback={fallback}>
    <Suspense fallback={fallback}>
      <NormalizedGltf url={url} targetSize={targetSize} rotation={rotation} />
    </Suspense>
  </GltfErrorBoundary>
);