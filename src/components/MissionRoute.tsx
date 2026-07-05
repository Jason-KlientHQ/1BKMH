import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { starScenePosition } from "@/astrometry/positions";
import { findNavStar } from "@/mission/stars";

/** Straight-line route from the Sun to the mission destination. */
export const MissionRoute = ({ destination }: { destination: string | null }) => {
  const end = useMemo(() => {
    if (!destination) return null;
    const star = findNavStar(destination);
    if (!star) return null;
    return starScenePosition(star.distanceLy, star.unitDir);
  }, [destination]);

  const markerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!markerRef.current) return;
    const t = clock.getElapsedTime();
    markerRef.current.scale.setScalar(1 + Math.sin(t * 2.5) * 0.08);
  });

  if (!end) return null;

  const origin: [number, number, number] = [0, 0, 0];
  const points = [origin, end];

  return (
    <group>
      <Line
        points={points}
        color="#2fe0c0"
        lineWidth={2}
        transparent
        opacity={0.55}
        depthWrite={false}
      />
      <Line
        points={points}
        color="#ffd166"
        lineWidth={1}
        transparent
        opacity={0.25}
        depthWrite={false}
      />
      <mesh ref={markerRef} position={end}>
        <sphereGeometry args={[6, 24, 24]} />
        <meshBasicMaterial color="#2fe0c0" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh position={end} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10, 14, 48]} />
        <meshBasicMaterial color="#2fe0c0" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};