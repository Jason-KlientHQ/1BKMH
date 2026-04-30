import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export interface StarPOI {
  name: string;
  distance: number;
  pos: [number, number, number];
  url: string;
  desc: string;
}

const wiki = (n: string) =>
  `https://en.wikipedia.org/wiki/${n.replace(/ /g, "_").replace(/'/g, "%27")}`;

export const STARS: StarPOI[] = [
  { name: "Proxima Centauri", distance: 4.25, pos: [3.8, 1.2, -0.5], url: wiki("Proxima Centauri"), desc: "Closest known star to the Sun" },
  { name: "Barnard's Star", distance: 5.96, pos: [-4.1, -3.5, 2.1], url: wiki("Barnard's Star"), desc: "Fast-moving red dwarf" },
  { name: "Wolf 359", distance: 7.86, pos: [2.5, 6.8, 1.9], url: wiki("Wolf 359"), desc: "Dim red dwarf in Leo" },
  { name: "Sirius", distance: 8.58, pos: [-7.2, 2.9, -3.4], url: wiki("Sirius"), desc: "Brightest star in Earth's night sky" },
  { name: "Epsilon Eridani", distance: 10.52, pos: [8.1, -4.2, 3.7], url: wiki("Epsilon Eridani"), desc: "Young star with a planetary system" },
  { name: "61 Cygni", distance: 11.4, pos: [-9.5, -3.8, 5.2], url: wiki("61 Cygni"), desc: "First star to have its parallax measured" },
  { name: "Procyon", distance: 11.46, pos: [5.3, 9.1, -4.8], url: wiki("Procyon"), desc: "Brightest star in Canis Minor" },
  { name: "Vega", distance: 25.05, pos: [18.4, 12.7, -8.9], url: wiki("Vega"), desc: "Fifth-brightest star in the night sky" },
  { name: "Fomalhaut", distance: 25.13, pos: [-14.2, 19.3, 7.1], url: wiki("Fomalhaut"), desc: "Bright star with a debris disk" },
  { name: "40 Eridani", distance: 16.45, pos: [15.8, -6.3, 4.9], url: wiki("40 Eridani"), desc: "Triple star system, fictional home of Vulcan" },
  { name: "Zeta Reticuli", distance: 39.3, pos: [39.2, -15.4, 22.1], url: wiki("Zeta Reticuli"), desc: "Binary star pair famous in UFO lore" },
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
      <a
        href={star.url}
        target="_blank"
        rel="noopener noreferrer"
        className="whitespace-nowrap text-[10px] font-medium underline-offset-2 hover:underline"
        style={{ color: reached ? "#ffd166" : "#9ad7ff", textShadow: "0 0 4px #000" }}
      >
        {star.name} · {star.distance} ly
      </a>
    </Html>
  </group>
);

const AnimatedLightSphere = ({
  target,
  animating,
  onDone,
}: {
  target: number;
  animating: boolean;
  onDone: () => void;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  const start = useRef<number | null>(null);
  const DURATION = 4; // seconds

  useFrame((state) => {
    if (!ref.current) return;
    if (animating) {
      if (start.current === null) start.current = state.clock.getElapsedTime();
      const t = Math.min((state.clock.getElapsedTime() - start.current!) / DURATION, 1);
      ref.current.scale.setScalar(t * target);
      if (t >= 1) {
        start.current = null;
        onDone();
      }
    } else {
      ref.current.scale.setScalar(target);
    }
  });

  if (target <= 0.1) return null;
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#00ffcc" transparent opacity={0.12} wireframe />
    </mesh>
  );
};

const FlythroughCamera = ({
  active,
  radius,
  controlsRef,
}: {
  active: boolean;
  radius: number;
  controlsRef: React.MutableRefObject<any>;
}) => {
  const { camera } = useThree();
  const angle = useRef(0);
  useFrame((_, delta) => {
    if (!active) return;
    angle.current += delta * 0.4;
    const r = Math.max(radius * 1.4, 25);
    camera.position.set(
      Math.cos(angle.current) * r,
      Math.sin(angle.current * 0.5) * r * 0.4 + 10,
      Math.sin(angle.current) * r
    );
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) controlsRef.current.update?.();
  });
  return null;
};

export interface GalaxyMapHandle {
  exportPNG: () => void;
  animate: () => void;
  flythrough: () => void;
}

interface GalaxyMapProps {
  lightYears: number;
}

export const GalaxyMap = forwardRef<GalaxyMapHandle, GalaxyMapProps>(({ lightYears }, ref) => {
  const sphereRadius = Math.min(lightYears, 30);
  const [animating, setAnimating] = useState(false);
  const [flying, setFlying] = useState(false);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const controlsRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    animate: () => setAnimating(true),
    flythrough: () => setFlying((v) => !v),
    exportPNG: () => {
      const gl = glRef.current;
      const scene = sceneRef.current;
      const cam = cameraRef.current;
      if (!gl || !scene || !cam) return;
      gl.render(scene, cam);
      const url = gl.domElement.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "light_journey.png";
      a.click();
    },
  }));

  const reachedSet = useMemo(
    () => new Set(STARS.filter((s) => s.distance <= lightYears).map((s) => s.name)),
    [lightYears]
  );

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-lg border border-border bg-black">
      <Canvas
        camera={{ position: [25, 18, 30], fov: 55 }}
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl, scene, camera }) => {
          glRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#ffcc66" distance={100} />
        <Stars radius={80} depth={50} count={2000} factor={3} fade speed={1} />

        <mesh>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial color="#ffcc33" emissive="#ff9900" emissiveIntensity={2} />
        </mesh>

        <AnimatedLightSphere
          target={sphereRadius}
          animating={animating}
          onDone={() => setAnimating(false)}
        />

        {STARS.map((s) => (
          <Star key={s.name} star={s} reached={reachedSet.has(s.name)} />
        ))}

        <FlythroughCamera active={flying} radius={sphereRadius} controlsRef={controlsRef} />
        <OrbitControls ref={controlsRef} enablePan={false} minDistance={5} maxDistance={120} enabled={!flying} />
      </Canvas>
    </div>
  );
});

GalaxyMap.displayName = "GalaxyMap";
