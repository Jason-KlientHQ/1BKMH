import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GltfWithFallback } from "@/components/GltfModel";
import { SPACECRAFT_MODEL_ROTATION, SPACECRAFT_MODEL_URL } from "@/data/nasaModels";
import type { Spacecraft } from "@/data/solarSystem";

/** Route each spacecraft to NASA glTF when available, else procedural mesh. */
export const SpacecraftModel = ({
  craft,
  scale = 1,
  slowSpin = false,
}: {
  craft: Spacecraft;
  scale?: number;
  slowSpin?: boolean;
}) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (slowSpin && ref.current) ref.current.rotation.y += dt * 0.35;
  });

  const url = SPACECRAFT_MODEL_URL[craft.name];
  const rotation = SPACECRAFT_MODEL_ROTATION[craft.name];
  const procedural = <ProceduralCraft craft={craft} scale={scale} />;

  return (
    <group ref={ref}>
      {url ? (
        <GltfWithFallback
          url={url}
          targetSize={scale}
          rotation={rotation}
          fallback={procedural}
        />
      ) : (
        procedural
      )}
    </group>
  );
};

const ProceduralCraft = ({ craft, scale }: { craft: Spacecraft; scale: number }) => {
  switch (craft.name) {
    case "Hubble Space Telescope":
      return <HubbleModel scale={scale} color={craft.color} />;
    case "James Webb Space Telescope":
      return <JWSTModel scale={scale} color={craft.color} />;
    case "International Space Station":
      return <ISSModel scale={scale} color={craft.color} />;
    case "Voyager 1":
    case "Voyager 2":
      return <VoyagerModel scale={scale} color={craft.color} />;
    case "Parker Solar Probe":
      return <ParkerModel scale={scale} color={craft.color} />;
    default:
      return <ProbeModel scale={scale} color={craft.color} />;
  }
};

const HubbleModel = ({ scale, color }: { scale: number; color: string }) => (
  <group scale={scale}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.22, 0.28, 1.6, 16]} />
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.35} />
    </mesh>
    <mesh position={[0.88, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.32, 0.05, 10, 24]} />
      <meshStandardMaterial color="#8fa3b8" metalness={0.7} roughness={0.25} />
    </mesh>
    {([-1, 1] as const).map((side) => (
      <group key={side} position={[0, side * 0.95, 0]}>
        <mesh>
          <boxGeometry args={[1.1, 0.04, 0.55]} />
          <meshStandardMaterial color="#1e3a5f" metalness={0.4} roughness={0.5} emissive="#0a1a30" emissiveIntensity={0.15} />
        </mesh>
      </group>
    ))}
  </group>
);

const JWSTModel = ({ scale, color }: { scale: number; color: string }) => (
  <group scale={scale} rotation={[0.35, 0.6, 0.15]}>
    <mesh>
      <boxGeometry args={[2.2, 1.4, 0.03]} />
      <meshStandardMaterial color="#e8dfd0" metalness={0.15} roughness={0.75} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0, 0.55]} rotation={[0.55, 0, 0]}>
      <cylinderGeometry args={[0.55, 0.55, 0.06, 6]} />
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} emissive={color} emissiveIntensity={0.12} />
    </mesh>
  </group>
);

const ISSModel = ({ scale, color }: { scale: number; color: string }) => (
  <group scale={scale}>
    <mesh>
      <boxGeometry args={[2.2, 0.12, 0.12]} />
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.4} />
    </mesh>
    {([-1, 1] as const).map((side) => (
      <mesh key={side} position={[side * 1.05, 0, 0]}>
        <boxGeometry args={[0.9, 0.03, 0.5]} />
        <meshStandardMaterial color="#1a3358" metalness={0.35} roughness={0.45} />
      </mesh>
    ))}
  </group>
);

const VoyagerModel = ({ scale, color }: { scale: number; color: string }) => (
  <group scale={scale}>
    <mesh>
      <boxGeometry args={[0.35, 0.35, 0.5]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.45} />
    </mesh>
    <mesh position={[0, 0, 0.42]} rotation={[0.35, 0, 0]}>
      <cylinderGeometry args={[0.42, 0.42, 0.06, 24]} />
      <meshStandardMaterial color="#c5b89a" metalness={0.65} roughness={0.3} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

const ParkerModel = ({ scale, color }: { scale: number; color: string }) => (
  <group scale={scale}>
    <mesh>
      <cylinderGeometry args={[0.2, 0.28, 0.7, 12]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} emissive={color} emissiveIntensity={0.15} />
    </mesh>
    <mesh position={[0, 0, 0.45]}>
      <cylinderGeometry args={[0.45, 0.45, 0.12, 20]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
    </mesh>
  </group>
);

const ProbeModel = ({ scale, color }: { scale: number; color: string }) => (
  <group scale={scale}>
    <mesh>
      <boxGeometry args={[0.4, 0.4, 0.55]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.45} />
    </mesh>
    <mesh position={[0, 0, 0.38]}>
      <cylinderGeometry args={[0.22, 0.22, 0.05, 16]} />
      <meshStandardMaterial color="#b0a890" metalness={0.6} roughness={0.35} />
    </mesh>
  </group>
);