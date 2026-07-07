import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { MissionVessel } from "@/components/MissionVessel";
import { findNavStar } from "@/mission/stars";
import { buildMissionPath, interpolatePath, pathLineSegments } from "@/mission/path";
import type { MissionOrigin, MissionResult, PropulsionMode, VesselConfig } from "@/mission/types";

interface MissionFlightProps {
  destination: string | null;
  missionResult: MissionResult | null;
  mode: PropulsionMode;
  missionOrigin: MissionOrigin;
  vessel: VesselConfig;
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
  missionOrigin,
  vessel,
  tripProgress,
  missionFlying,
  simYears,
  controlsRef,
}: MissionFlightProps) => {
  const destStar = destination ? findNavStar(destination) : undefined;
  const path = useMemo(() => {
    if (!destStar || !missionResult) return null;
    return buildMissionPath(missionResult, destStar, mode, simYears, missionOrigin);
  }, [destStar, missionResult, mode, simYears, missionOrigin]);

  const linePoints = useMemo(() => (path ? pathLineSegments(path) : []), [path]);
  const vesselPos = useMemo(
    () => (path ? interpolatePath(path, tripProgress) : null),
    [path, tripProgress],
  );
  const vesselHeading = useMemo(() => {
    if (!path) return [0, 0, 1] as [number, number, number];
    const ahead = interpolatePath(path, Math.min(1, tripProgress + 0.02));
    if (!vesselPos) return ahead;
    const dx = ahead[0] - vesselPos[0];
    const dy = ahead[1] - vesselPos[1];
    const dz = ahead[2] - vesselPos[2];
    const len = Math.hypot(dx, dy, dz) || 1;
    return [vesselPos[0] + dx / len, vesselPos[1] + dy / len, vesselPos[2] + dz / len] as [number, number, number];
  }, [path, tripProgress, vesselPos]);

  if (!path || !vesselPos) return null;

  return (
    <>
      <Line points={linePoints} color="#2fe0c0" lineWidth={2.5} transparent opacity={0.65} depthWrite={false} />
      <Line points={linePoints} color="#ffd166" lineWidth={1} transparent opacity={0.2} depthWrite={false} />
      <VesselTrail path={path} tripProgress={tripProgress} missionFlying={missionFlying} destination={destination} />
      <MissionVessel position={vesselPos} heading={vesselHeading} hullId={vessel.hullId} />
      <MissionChaseCamera
        path={path}
        tripProgress={tripProgress}
        active={missionFlying}
        controlsRef={controlsRef}
      />
    </>
  );
};

const TRAIL_LEN = 48;
const TRAIL_MIN_STEP = 0.8;

const VesselTrail = ({
  path,
  tripProgress,
  missionFlying,
  destination,
}: {
  path: NonNullable<ReturnType<typeof buildMissionPath>>;
  tripProgress: number;
  missionFlying: boolean;
  destination: string | null;
}) => {
  const [trailPoints, setTrailPoints] = useState<[number, number, number][]>([]);
  const trailRef = useRef<[number, number, number][]>([]);
  const lastT = useRef(-1);

  useEffect(() => {
    trailRef.current = [];
    lastT.current = -1;
    setTrailPoints([]);
  }, [destination]);

  useFrame(() => {
    if (tripProgress === lastT.current) return;
    const pos = interpolatePath(path, tripProgress);
    const trail = trailRef.current;
    const prev = trail[0];
    if (!prev || Math.hypot(pos[0] - prev[0], pos[1] - prev[1], pos[2] - prev[2]) >= TRAIL_MIN_STEP) {
      trail.unshift(pos);
      if (trail.length > TRAIL_LEN) trail.length = TRAIL_LEN;
      setTrailPoints([...trail]);
    }
    lastT.current = tripProgress;
  });

  if (trailPoints.length < 2) return null;

  return (
    <Line
      points={trailPoints}
      color="#ffd166"
      lineWidth={1.5}
      transparent
      opacity={0.45}
      depthWrite={false}
    />
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