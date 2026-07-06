import { Component, Suspense, useMemo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { NASA_GLTF } from "@/data/nasaModels";

/** Preload NASA assets once the bundle loads (inside Canvas context). */
export function preloadNasaModels() {
  Object.values(NASA_GLTF).forEach((url) => useGLTF.preload(url));
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