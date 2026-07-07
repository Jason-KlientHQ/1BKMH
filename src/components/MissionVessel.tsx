import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GltfWithFallback } from "@/components/GltfModel";
import { findHullPreset, type VesselHullId } from "@/data/vesselPresets";

interface MissionVesselProps {
  position: [number, number, number];
  heading: [number, number, number];
  hullId: VesselHullId;
}

/** Mission craft aligned to route tangent — glTF when available, else styled procedural hull. */
export const MissionVessel = ({ position, heading, hullId }: MissionVesselProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const preset = findHullPreset(hullId);
  const lookAt = useMemo(() => new THREE.Vector3(...heading), [heading]);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.position.set(...position);
    g.lookAt(lookAt);
  });

  const fallback = <ProceduralHull id={hullId} engineColor={preset.engineColor} />;

  return (
    <group ref={groupRef}>
      {preset.gltfUrl ? (
        <GltfWithFallback
          url={preset.gltfUrl}
          targetSize={preset.targetSize}
          rotation={preset.rotation}
          fallback={fallback}
        />
      ) : (
        fallback
      )}
      <pointLight color={preset.engineColor} intensity={1.8} distance={60} position={[0, 0, -preset.targetSize * 0.4]} />
    </group>
  );
};

const ProceduralHull = ({ id, engineColor }: { id: VesselHullId; engineColor: string }) => {
  switch (id) {
    case "constitution-cruiser":
      return (
        <group>
          <mesh position={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.35, 0.55, 2.2, 12]} />
            <meshStandardMaterial color="#d8e4f0" metalness={0.55} roughness={0.35} />
          </mesh>
          {([-1, 1] as const).map((s) => (
            <mesh key={s} position={[s * 1.1, 0, -0.2]} rotation={[0, 0, s * 0.4]}>
              <boxGeometry args={[0.08, 1.4, 0.5]} />
              <meshStandardMaterial color="#9ab0c4" metalness={0.6} roughness={0.3} />
            </mesh>
          ))}
          <EngineGlow color={engineColor} />
        </group>
      );
    case "falcon-freighter":
      return (
        <group>
          <mesh>
            <sphereGeometry args={[0.9, 16, 12]} />
            <meshStandardMaterial color="#8a8f98" metalness={0.65} roughness={0.45} />
          </mesh>
          <mesh position={[-0.9, 0.2, 0]}>
            <boxGeometry args={[0.5, 0.15, 0.35]} />
            <meshStandardMaterial color="#4a4f58" metalness={0.5} roughness={0.5} />
          </mesh>
          <EngineGlow color={engineColor} />
        </group>
      );
    case "discovery-monolith":
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.5, 0.5, 3.2]} />
            <meshStandardMaterial color="#e8edf2" metalness={0.75} roughness={0.2} />
          </mesh>
          <EngineGlow color={engineColor} />
        </group>
      );
    case "x-wing-fighter":
      return (
        <group>
          <mesh>
            <coneGeometry args={[0.35, 1.6, 4]} />
            <meshStandardMaterial color="#c5cdd6" metalness={0.5} roughness={0.4} />
          </mesh>
          {([0, Math.PI / 2] as const).map((r, i) => (
            <mesh key={i} rotation={[0, r, 0]}>
              <boxGeometry args={[2.4, 0.04, 0.5]} />
              <meshStandardMaterial color="#9aa3ad" metalness={0.45} roughness={0.45} />
            </mesh>
          ))}
          <EngineGlow color={engineColor} />
        </group>
      );
    case "serenity-freighter":
      return (
        <group>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.45, 0.55, 2.8, 10]} />
            <meshStandardMaterial color="#9a7d5a" metalness={0.4} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.7, 0.08, 0.4]} />
            <meshStandardMaterial color="#5c4a38" metalness={0.35} roughness={0.5} />
          </mesh>
          <EngineGlow color={engineColor} />
        </group>
      );
    case "normandy-frigate":
      return (
        <group>
          <mesh position={[0, 0, 0.4]}>
            <coneGeometry args={[0.5, 2.4, 3]} />
            <meshStandardMaterial color="#6a8a9a" metalness={0.55} roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.15, -0.8]}>
            <boxGeometry args={[1.2, 0.2, 0.8]} />
            <meshStandardMaterial color="#3d5560" metalness={0.5} roughness={0.4} />
          </mesh>
          <EngineGlow color={engineColor} />
        </group>
      );
    case "borg-cube":
      return (
        <group>
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#2a3d34" metalness={0.7} roughness={0.35} emissive="#1a4030" emissiveIntensity={0.2} />
          </mesh>
          <EngineGlow color={engineColor} />
        </group>
      );
    case "battlestar-carrier":
      return (
        <group>
          <mesh>
            <boxGeometry args={[3.2, 0.5, 1.2]} />
            <meshStandardMaterial color="#7a8490" metalness={0.5} roughness={0.45} />
          </mesh>
          {([-1, 1] as const).map((s) => (
            <mesh key={s} position={[s * 1.4, 0.35, 0]}>
              <boxGeometry args={[0.8, 0.12, 0.6]} />
              <meshStandardMaterial color="#5a6470" metalness={0.45} roughness={0.5} />
            </mesh>
          ))}
          <EngineGlow color={engineColor} />
        </group>
      );
    case "imperial-sphere":
      return (
        <group>
          <mesh>
            <sphereGeometry args={[1.2, 24, 24]} />
            <meshStandardMaterial color="#6a7580" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.35, 0.12, 8, 32]} />
            <meshStandardMaterial color="#8a949e" metalness={0.55} roughness={0.35} />
          </mesh>
          <EngineGlow color={engineColor} />
        </group>
      );
    default:
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.5, 0.5, 0.8]} />
            <meshStandardMaterial color="#b0b8c4" metalness={0.5} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0, 0.55]}>
            <cylinderGeometry args={[0.45, 0.45, 0.06, 20]} />
            <meshStandardMaterial color="#c5b89a" metalness={0.65} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          <EngineGlow color={engineColor} />
        </group>
      );
  }
};

const EngineGlow = ({ color }: { color: string }) => (
  <mesh position={[0, 0, -1.1]}>
    <sphereGeometry args={[0.25, 12, 12]} />
    <meshBasicMaterial color={color} transparent opacity={0.55} toneMapped={false} />
  </mesh>
);