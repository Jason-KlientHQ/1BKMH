import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Spacecraft } from "@/data/solarSystem";

/** Route each spacecraft to a recognizable procedural mesh. */
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

  const s = scale;
  const body = (() => {
    switch (craft.name) {
      case "Hubble Space Telescope":
        return <HubbleModel scale={s} color={craft.color} />;
      case "James Webb Space Telescope":
        return <JWSTModel scale={s} color={craft.color} />;
      case "International Space Station":
        return <ISSModel scale={s} color={craft.color} />;
      case "Voyager 1":
      case "Voyager 2":
        return <VoyagerModel scale={s} color={craft.color} />;
      case "Parker Solar Probe":
        return <ParkerModel scale={s} color={craft.color} />;
      default:
        return <ProbeModel scale={s} color={craft.color} />;
    }
  })();

  return <group ref={ref}>{body}</group>;
};

const HubbleModel = ({ scale, color }: { scale: number; color: string }) => (
  <group scale={scale}>
    {/* main tube */}
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.22, 0.28, 1.6, 16]} />
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.35} />
    </mesh>
    {/* aperture ring */}
    <mesh position={[0.88, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.32, 0.05, 10, 24]} />
      <meshStandardMaterial color="#8fa3b8" metalness={0.7} roughness={0.25} />
    </mesh>
    {/* solar panels */}
    {([-1, 1] as const).map((side) => (
      <group key={side} position={[0, side * 0.95, 0]}>
        <mesh>
          <boxGeometry args={[1.1, 0.04, 0.55]} />
          <meshStandardMaterial color="#1e3a5f" metalness={0.4} roughness={0.5} emissive="#0a1a30" emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[0, side * 0.06, 0]}>
          <boxGeometry args={[1.0, 0.02, 0.48]} />
          <meshStandardMaterial color="#2a4a7a" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>
    ))}
    {/* high-gain antenna */}
    <mesh position={[-0.75, 0, 0.35]} rotation={[0.4, 0.2, 0]}>
      <cylinderGeometry args={[0.02, 0.18, 0.35, 12]} />
      <meshStandardMaterial color="#b8c4d0" metalness={0.6} roughness={0.3} />
    </mesh>
  </group>
);

const JWSTModel = ({ scale, color }: { scale: number; color: string }) => (
  <group scale={scale} rotation={[0.35, 0.6, 0.15]}>
    {/* sunshield — layered kite */}
    {([0, 0.12, 0.24] as const).map((z, i) => (
      <mesh key={z} position={[0, 0, z]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[2.2 - i * 0.15, 1.4 - i * 0.1, 0.03]} />
        <meshStandardMaterial
          color={i === 0 ? "#e8dfd0" : "#c9b89a"}
          metalness={0.15}
          roughness={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>
    ))}
    {/* primary mirror — gold hexagon */}
    <mesh position={[0, 0, 0.55]} rotation={[0.55, 0, 0]}>
      <cylinderGeometry args={[0.55, 0.55, 0.06, 6]} />
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} emissive={color} emissiveIntensity={0.12} />
    </mesh>
    {/* secondary mirror strut */}
    <mesh position={[0, 0.35, 0.72]} rotation={[0.55, 0, 0]}>
      <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
    </mesh>
    <mesh position={[0, 0.5, 0.78]}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
    </mesh>
    {/* instrument package */}
    <mesh position={[0.35, -0.2, 0.38]} rotation={[0.4, -0.3, 0]}>
      <boxGeometry args={[0.35, 0.25, 0.2]} />
      <meshStandardMaterial color="#6a5a40" metalness={0.5} roughness={0.45} />
    </mesh>
  </group>
);

const ISSModel = ({ scale, color }: { scale: number; color: string }) => (
  <group scale={scale}>
    {/* central truss */}
    <mesh>
      <boxGeometry args={[2.2, 0.12, 0.12]} />
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.4} />
    </mesh>
    {/* modules */}
    {([-0.55, 0, 0.65] as const).map((x) => (
      <mesh key={x} position={[x, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.45, 12]} />
        <meshStandardMaterial color="#d4dae3" metalness={0.45} roughness={0.5} />
      </mesh>
    ))}
    {/* solar wings */}
    {([-1, 1] as const).map((side) => (
      <group key={side} position={[side * 1.05, 0, 0]}>
        <mesh rotation={[0, 0, side * 0.08]}>
          <boxGeometry args={[0.9, 0.03, 0.5]} />
          <meshStandardMaterial color="#1a3358" metalness={0.35} roughness={0.45} emissive="#0c1a30" emissiveIntensity={0.2} />
        </mesh>
      </group>
    ))}
    {/* radiators */}
    <mesh position={[0.3, 0.18, 0]}>
      <boxGeometry args={[0.5, 0.02, 0.25]} />
      <meshStandardMaterial color="#9aa8b8" metalness={0.5} roughness={0.35} />
    </mesh>
  </group>
);

const VoyagerModel = ({ scale, color }: { scale: number; color: string }) => (
  <group scale={scale}>
    <mesh>
      <boxGeometry args={[0.35, 0.35, 0.5]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.45} />
    </mesh>
    {/* high-gain dish */}
    <mesh position={[0, 0, 0.42]} rotation={[0.35, 0, 0]}>
      <cylinderGeometry args={[0.42, 0.42, 0.06, 24]} />
      <meshStandardMaterial color="#c5b89a" metalness={0.65} roughness={0.3} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 0, 0.48]} rotation={[0.35, 0, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
      <meshStandardMaterial color="#8a7d68" metalness={0.7} roughness={0.25} />
    </mesh>
    {/* boom + RTG */}
    <mesh position={[-0.55, 0, -0.1]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
      <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
    </mesh>
    <mesh position={[-1.0, 0, -0.1]}>
      <boxGeometry args={[0.22, 0.28, 0.22]} />
      <meshStandardMaterial color="#6a6a6a" metalness={0.55} roughness={0.5} />
    </mesh>
  </group>
);

const ParkerModel = ({ scale, color }: { scale: number; color: string }) => (
  <group scale={scale}>
    <mesh>
      <cylinderGeometry args={[0.2, 0.28, 0.7, 12]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} emissive={color} emissiveIntensity={0.15} />
    </mesh>
    {/* heat shield */}
    <mesh position={[0, 0, 0.45]}>
      <cylinderGeometry args={[0.45, 0.45, 0.12, 20]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0, 0.52]}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshStandardMaterial color="#ffaa55" emissive="#ff8833" emissiveIntensity={0.4} />
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
    {([-1, 1] as const).map((side) => (
      <mesh key={side} position={[side * 0.55, 0, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.3]} />
        <meshStandardMaterial color="#2a3d5c" metalness={0.35} roughness={0.5} />
      </mesh>
    ))}
  </group>
);