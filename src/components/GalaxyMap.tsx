import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import { useMemo } from "react";

export interface StarPOI {
  name: string;
  distance: number;
  pos: [number, number, number];
}

export const STARS: StarPOI[] = [
  { name: "Proxima Centauri", distance: 4.25, pos: [3.8, 1.2, -0.5] },
  { name: "Barnard's Star", distance: 5.96, pos: [-4.1, -3.5, 2.1] },
  { name: "Wolf 359", distance: 7.86, pos: [2.5, 6.8, 1.9] },
  { name: "Sirius", distance: 8.58, pos: [-7.2, 2.9, -3.4] },
  { name: "Epsilon Eridani", distance: 10.52, pos: [8.1, -4.2, 3.7] },
  { name: "61 Cygni", distance: 11.4, pos: [-9.5, -3.8, 5.2] },
  { name: "Procyon", distance: 11.46, pos: [5.3, 9.1, -4.8] },
  { name: "Vega", distance: 25.05, pos: [18.4, 12.7, -8.9] },
  { name: "Fomalhaut", distance: 25.13, pos: [-14.2, 19.3, 7.1] },
];

const Star = ({ star, reached }: { star: StarPOI; reached: boolean }) => (
  <group position={star.pos}>
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial
        color={reached ? "#ffd166" : "#ffffff"}
        emissive={reached ? "#ffae00" : "#88aaff"}
        emissiveIntensity={reached ? 1.2 : 0.4}
      />
    </mesh>
    <Html distanceFactor={20} position={[0, 1, 0]} center>
      <div
        className="pointer-events-none whitespace-nowrap text-[10px] font-medium"
        style={{ color: reached ? "#ffd166" : "#9ad7ff", textShadow: "0 0 4px #000" }}
      >
        {star.name} · {star.distance} ly
      </div>
    </Html>
  </group>
);

export const GalaxyMap = ({ lightYears }: { lightYears: number }) => {
  // Light-sphere radius capped so it stays visible in scene
  const sphereRadius = Math.min(lightYears, 30);

  const reachedSet = useMemo(
    () => new Set(STARS.filter((s) => s.distance <= lightYears).map((s) => s.name)),
    [lightYears]
  );

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-lg border border-border bg-black">
      <Canvas camera={{ position: [25, 18, 30], fov: 55 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#ffcc66" distance={100} />
        <Stars radius={80} depth={50} count={2000} factor={3} fade speed={1} />

        {/* Sun */}
        <mesh>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial color="#ffcc33" emissive="#ff9900" emissiveIntensity={2} />
        </mesh>

        {/* Light sphere — how far light traveled */}
        {sphereRadius > 0.1 && (
          <mesh>
            <sphereGeometry args={[sphereRadius, 32, 32]} />
            <meshBasicMaterial color="#00ffcc" transparent opacity={0.08} wireframe />
          </mesh>
        )}

        {STARS.map((s) => (
          <Star key={s.name} star={s} reached={reachedSet.has(s.name)} />
        ))}

        <OrbitControls enablePan={false} minDistance={5} maxDistance={120} />
      </Canvas>
    </div>
  );
};
