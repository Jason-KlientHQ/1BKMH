import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { findNavStar } from "@/mission/stars";
import { buildMissionPath, interpolatePath, pathLineSegments } from "@/mission/path";
import type { MissionResult } from "@/mission/types";
import type { PropulsionMode } from "@/mission/types";

interface MissionFlightProps {
  destination: string | null;
  missionResult: MissionResult | null;
  mode: PropulsionMode;
  tripProgress: number;
  missionFlying: boolean;
  simYears: number;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
}

/** Multi-segment route + vessel marker + chase camera. */
export const MissionFlight = ({
  destination,
  missionResult,
  mode,
  tripProgress,
  missionFlying,
  simYears,
  controlsRef,
}: MissionFlightProps) => {
  const destStar = destination ? findNavStar(destination) : undefined;
  const path = useMemo(() => {
    if (!destStar || !missionResult) return null;
    return buildMissionPath(missionResult, destStar, mode, simYears);
  }, [destStar, missionResult, mode, simYears]);

  const linePoints = useMemo(() => (path ? pathLineSegments(path) : []), [path]);
  const vesselPos = useMemo(
    () => (path ? interpolatePath(path, tripProgress) : null),
    [path, tripProgress],
  );

  if (!path || !vesselPos) return null;

  return (
    <>
      <Line points={linePoints} color="#2fe0c0" lineWidth={2.5} transparent opacity={0.65} depthWrite={false} />
      <Line points={linePoints} color="#ffd166" lineWidth={1} transparent opacity={0.2} depthWrite={false} />
      <VesselMarker position={vesselPos} />
      <MissionChaseCamera
        path={path}
        tripProgress={tripProgress}
        active={missionFlying}
        controlsRef={controlsRef}
      />
    </>
  );
};

const VesselMarker = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.15;
    ref.current.scale.setScalar(s);
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <octahedronGeometry args={[3.5, 0]} />
        <meshBasicMaterial color="#ffd166" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[8, 16, 16]} />
        <meshBasicMaterial color="#2fe0c0" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <pointLight color="#2fe0c0" intensity={2} distance={80} />
    </group>
  );
};

const MissionChaseCamera = ({
  path,
  tripProgress,
  active,
  controlsRef,
}: {
  path: ReturnType<typeof buildMissionPath>;
  tripProgress: number;
  active: boolean;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
}) => {
  const { camera } = useThree();
  const smooth = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!active) return;
    const controls = controlsRef.current;
    const pos = new THREE.Vector3(...interpolatePath(path, tripProgress));
    const ahead = new THREE.Vector3(...interpolatePath(path, Math.min(1, tripProgress + 0.03)));
    const dir = ahead.clone().sub(pos);
    if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
    dir.normalize();

    const camGoal = pos.clone().sub(dir.multiplyScalar(28)).add(new THREE.Vector3(0, 10, 0));
    smooth.current.lerp(camGoal, 0.06);
    target.current.lerp(ahead, 0.08);

    camera.position.copy(smooth.current);
    if (controls) {
      controls.target.copy(target.current);
      controls.update();
    } else {
      camera.lookAt(target.current);
    }
  });

  return null;
};