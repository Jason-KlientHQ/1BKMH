import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { findNavStar } from "@/mission/stars";
import { buildMissionPath, originScenePos, originDisplayLabel } from "@/mission/path";
import type { MissionOrigin, MissionResult, PropulsionMode } from "@/mission/types";

/** Preview route A → B before flight starts (same path builder as MissionFlight). */
export const MissionRoute = ({
  destination,
  missionResult,
  missionOrigin,
  missionMode,
  simYears,
}: {
  destination: string | null;
  missionResult: MissionResult | null;
  missionOrigin: MissionOrigin;
  missionMode: PropulsionMode;
  simYears: number;
}) => {
  const destStar = destination ? findNavStar(destination) : undefined;
  const path = useMemo(() => {
    if (!destStar || !missionResult) return null;
    return buildMissionPath(missionResult, destStar, missionMode, simYears, missionOrigin);
  }, [destStar, missionResult, missionMode, simYears, missionOrigin]);

  const destMarkerRef = useRef<THREE.Mesh>(null);
  const originMarkerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 2.5) * 0.08;
    if (destMarkerRef.current) destMarkerRef.current.scale.setScalar(pulse);
    if (originMarkerRef.current) originMarkerRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.06);
  });

  if (!path || path.length < 2) return null;

  const linePoints = path.map((p) => p.position);
  const originPos = originScenePos(missionOrigin, simYears);
  const destPos = path[path.length - 1].position;

  return (
    <group>
      <Line points={linePoints} color="#2fe0c0" lineWidth={2} transparent opacity={0.55} depthWrite={false} />
      <Line points={linePoints} color="#ffd166" lineWidth={1} transparent opacity={0.25} depthWrite={false} />
      <mesh ref={originMarkerRef} position={originPos}>
        <sphereGeometry args={[missionOrigin === "earth" ? 4 : 5, 20, 20]} />
        <meshBasicMaterial color="#ffd166" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <mesh ref={destMarkerRef} position={destPos}>
        <sphereGeometry args={[6, 24, 24]} />
        <meshBasicMaterial color="#2fe0c0" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh position={destPos} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10, 14, 48]} />
        <meshBasicMaterial color="#2fe0c0" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};