import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { OrbitControls, Html, Line, Stars } from "@react-three/drei";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ExploreMenu } from "@/components/ExploreMenu";
import * as THREE from "three";
import { X, Maximize2, Minimize2, Radio, Compass, Navigation, Info, GraduationCap } from "lucide-react";
import { computeOrbitalEpoch, DEFAULT_CLOCK_ANCHOR } from "@/lib/simEpoch";
import { earthCraftScenePosition } from "@/lib/earthOrbit";
import {
  ACCURACY_MODE_LABEL,
  resolveTrueMoonPeriods,
  type AccuracyMode,
} from "@/lib/accuracyMode";
import {
  decorativeOpacity,
  LIGHT_REACHED_GLOW,
  MISSION_DEST_GLOW,
  showDecorativeGlow,
  stateGlowOpacity,
  starGlowShellRadiusFactor,
  starLuminosityGlowOpacity,
  SUN_CORONA_OPACITY,
  SUN_CORONA_SCALE,
} from "@/lib/glowStyle";
import { bodyAccuracyBadges, globalAccuracyBadges } from "@/lib/accuracyBadges";
import {
  EXO_CINEMATIC,
  MOON_CINEMATIC,
  siderealOrbitRateRadPerYear,
} from "@/lib/orbitRate";
import { catalogDisplayScale, featuredDisplayScale } from "@/lib/stellarDisplay";
import { getBodyInfo, formatArrival, arrivalYear } from "@/data/bodyInfo";
import { eventForYear } from "@/data/worldEvents";
import {
  heliocentricAU,
  J2000_OBLIQUITY_RAD,
  toScenePosition,
  scaleRadiusKm,
  scaleDistanceAU,
  orbitPath,
} from "@/lib/orbital";
import {
  PLANETS,
  MOONS,
  ASTEROID_BELT,
  KUIPER_BELT,
  HELIOSPHERE,
  OORT_CLOUD,
  NEARBY_STARS,
  COMETS,
  BLACK_HOLES,
  EXOPLANETS,
  ROADSTER,
  SPACECRAFT,
  EXOTIC_OBJECTS,
  COSMIC_LANDMARKS,
  LOCAL_BUBBLE,
  AU_PER_LY,
  type Body,
  type Moon,
  type StarPOI,
  type Comet,
  type Exoplanet,
  type Spacecraft,
  type ExoticObject,
  type CosmicLandmark,
} from "@/data/solarSystem";
import { STAR_CATALOG } from "@/data/starCatalog";
import { starScenePositionAtEpoch } from "@/astrometry/properMotion";
import { AccretionDisk, blackHoleDiskRadii, GalaxySilhouette, supermassiveDiskRadii } from "@/components/AccretionDisk";
import { GltfWithFallback, preloadNasaModels, preloadNasaMoonModels, preloadVesselModels } from "@/components/GltfModel";
import { SpacecraftModel } from "@/components/SpacecraftModels";
import { MOON_MODEL_ROTATION, MOON_MODEL_URL, NASA_GLTF, PLANET_MODEL_ROTATION, PLANET_MODEL_URL } from "@/data/nasaModels";
import { moonMeshSceneRadius, moonOrbitSceneRadius } from "@/lib/moonScale";
import { catalogStarRender, featuredStarRender } from "@/stellar/helpers";
import { stellarFrameDistance } from "@/stellar/render";
import { isNavStar } from "@/mission/stars";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useSceneQuality, type SceneQuality } from "@/hooks/useSceneQuality";
import { PULSAR_PERIOD_SEC, QUASAR_DISK_PERIOD_DAYS, rotationPeriodDays } from "@/data/stellarRotation";
import { pulsarSpinRateRadPerSec, spinRateRadPerSec } from "@/lib/stellarRotation";
import { ExoplanetInstances } from "@/components/ExoplanetInstances";
import { archivePlanetsForHost, confirmedPlanetCount } from "@/data/exoplanetCatalog";
import { MissionRoute } from "@/components/MissionRoute";
import { MissionFlight } from "@/components/MissionFlight";
import { DEFAULT_VESSEL, type MissionOrigin, type MissionResult, type PropulsionMode, type VesselConfig } from "@/mission/types";

interface SimClock {
  years: number;
  anchor: number;
  orbitalYears: number;
  playDeltaYears: number;
  speed: number;
  paused: boolean;
  camDist: number;
}

const BASE_YEARS_PER_SEC = 0.08; // calmer default (Earth ~12.5s/orbit at 1×)
const CAMERA_FOV = 55;
const HALF_FOV = (CAMERA_FOV * Math.PI) / 180 / 2;
const MAX_ZOOM = 30_000; // covers the largest light sphere + the nearest stars

// Distance needed to FIT a sphere of the given scene radius fully in view.
const frameDistanceFor = (reach: number) =>
  Math.min((reach / Math.sin(HALF_FOV)) * 1.15, MAX_ZOOM * 0.95);

// Live scene position of any focusable body (Sun / planet / star), so the
// camera can fly to it and keep tracking it as it orbits.
const starScenePos = (s: StarPOI, epochYears: number): THREE.Vector3 =>
  new THREE.Vector3(...starScenePositionAtEpoch(s.distance, s.dir, s.name, epochYears));

const bodyScenePos = (
  name: string,
  orbitalYears: number,
  playDeltaYears = 0,
  trueLeoPeriods = false,
): THREE.Vector3 => {
  if (name === "__light__" || name === "Sun") return new THREE.Vector3(0, 0, 0);
  const p = PLANETS.find((b) => b.name === name);
  if (p) {
    const [x, y, z] = toScenePosition(heliocentricAU(p, orbitalYears));
    return new THREE.Vector3(x, y, z);
  }
  const c = COMETS.find((b) => b.name === name);
  if (c) {
    const [x, y, z] = toScenePosition(heliocentricAU(c, orbitalYears));
    return new THREE.Vector3(x, y, z);
  }
  if (name === ROADSTER.name) {
    const [x, y, z] = toScenePosition(heliocentricAU(ROADSTER, orbitalYears));
    return new THREE.Vector3(x, y, z);
  }
  const s = NEARBY_STARS.find((b) => b.name === name);
  if (s) return starScenePos(s, orbitalYears);
  const bh = BLACK_HOLES.find((b) => b.name === name);
  if (bh) return new THREE.Vector3(...bh.dir).normalize().multiplyScalar(scaleDistanceAU(bh.distance * AU_PER_LY));
  const landmark = COSMIC_LANDMARKS.find((b) => b.name === name);
  if (landmark) {
    return new THREE.Vector3(...landmark.dir).normalize().multiplyScalar(scaleDistanceAU(landmark.sceneDistanceLy * AU_PER_LY));
  }
  const e = EXOPLANETS.find((b) => b.name === name);
  if (e) {
    const host = NEARBY_STARS.find((b) => b.name === e.host);
    if (host) return starScenePos(host, orbitalYears);
  }
  const cat = STAR_CATALOG.find((b) => b.name === name);
  if (cat) return new THREE.Vector3(...starScenePositionAtEpoch(cat.ly, cat.pos, cat.name, orbitalYears));
  const sc = SPACECRAFT.find((b) => b.name === name);
  if (sc) {
    if (sc.orbit === "earth") {
      const earthCrafts = SPACECRAFT.filter((x) => x.orbit === "earth");
      const idx = earthCrafts.findIndex((x) => x.name === name);
      const [x, y, z] = earthCraftScenePosition(
        sc,
        Math.max(0, idx),
        orbitalYears,
        playDeltaYears,
        trueLeoPeriods,
      );
      return new THREE.Vector3(x, y, z);
    }
    return new THREE.Vector3(...(sc.dir ?? [1, 0, 0])).normalize().multiplyScalar(scaleDistanceAU(sc.distanceAU ?? 1));
  }
  const ex = EXOTIC_OBJECTS.find((b) => b.name === name);
  if (ex) return new THREE.Vector3(...ex.dir).normalize().multiplyScalar(scaleDistanceAU(ex.sceneDistance * AU_PER_LY));
  return new THREE.Vector3(0, 0, 0);
};

// How far back to sit when focusing a body — sized to its render radius.
const bodyFrameDist = (name: string, reach: number): number => {
  if (name === "__light__") return frameDistanceFor(reach > 0 ? scaleDistanceAU(reach * AU_PER_LY) : 200);
  if (name === "Sun") return 80;
  const p = PLANETS.find((b) => b.name === name);
  if (p) return Math.max(scaleRadiusKm(p.radiusKm) * 7, 6);
  if (COMETS.some((b) => b.name === name)) return 7;
  if (name === ROADSTER.name) return 6;
  const s = NEARBY_STARS.find((b) => b.name === name);
  if (s) return stellarFrameDistance(featuredStarRender(s).size, true);
  if (BLACK_HOLES.some((b) => b.name === name)) return 120;
  const catStar = STAR_CATALOG.find((b) => b.name === name);
  if (catStar) return stellarFrameDistance(catalogStarRender(catStar).size);
  if (COSMIC_LANDMARKS.some((b) => b.name === name)) return 180;
  if (SPACECRAFT.some((b) => b.name === name)) return 6;
  if (EXOTIC_OBJECTS.some((b) => b.name === name)) return 90;
  return 80;
};

const tmp = new THREE.Vector3();
const UP_Z = new THREE.Vector3(0, 0, 1);

/* ------------------- animated star-surface plasma shader ------------------ */
const STAR_VERT = `
  varying vec3 vPos;
  void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const STAR_FRAG = `
  uniform float uTime; uniform vec3 uColor; varying vec3 vPos;
  float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float noise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z); }
  float fbm(vec3 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }
  void main(){
    vec3 p = normalize(vPos);
    float n = fbm(p*4.0 + vec3(0.0, uTime*0.12, uTime*0.05));
    float n2 = fbm(p*9.0 - vec3(uTime*0.08));
    float t = clamp(n*0.75 + n2*0.5, 0.0, 1.0);
    vec3 hot = uColor*1.7 + vec3(0.12);
    vec3 cool = uColor*0.45;
    vec3 col = mix(cool, hot, t) * (0.8 + 0.35*n2);
    gl_FragColor = vec4(col, 1.0);
  }
`;
const StarSurface = ({
  color,
  size,
  segments = 40,
  spinRate = 0,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  color: string;
  size: number;
  segments?: number;
  /** Radians per second — physical rotation of the photosphere. */
  spinRate?: number;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: () => void;
}) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const spinRef = useRef<THREE.Group>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } }),
    [color]
  );
  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += dt;
    if (spinRef.current && spinRate > 0) spinRef.current.rotation.y += dt * spinRate;
  });
  return (
    <group ref={spinRef}>
      <mesh onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <sphereGeometry args={[size, segments, segments]} />
        <shaderMaterial ref={matRef} vertexShader={STAR_VERT} fragmentShader={STAR_FRAG} uniforms={uniforms} toneMapped={false} />
      </mesh>
    </group>
  );
};

const REDUCED_MOTION = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;



/* --------------------------- the time integrator -------------------------- */
const TimeKeeper = ({
  clock,
  onZoom,
  birthDate,
  lifeYears,
  scrubYears,
}: {
  clock: React.MutableRefObject<SimClock>;
  onZoom: (near: boolean) => void;
  birthDate: string;
  lifeYears: number;
  scrubYears: number | null;
}) => {
  const { camera, controls } = useThree() as {
    camera: THREE.PerspectiveCamera;
    controls: OrbitControlsImpl | null;
  };
  const nearRef = useRef(false);
  useFrame((_, delta) => {
    const c = clock.current;
    if (!c.paused) c.years += delta * BASE_YEARS_PER_SEC * c.speed;
    c.playDeltaYears = c.years - c.anchor;
    c.orbitalYears = computeOrbitalEpoch({
      birthDate,
      lifeYears,
      scrubYears,
      clockYears: c.years,
      clockAnchor: c.anchor,
    });
    const target = controls?.target ?? tmp.set(0, 0, 0);
    const d = camera.position.distanceTo(target as THREE.Vector3);
    c.camDist = d;

    // Dynamic near/far scaled to the current zoom — good depth precision from
    // a moon to the nearest stars WITHOUT logarithmicDepthBuffer (which makes
    // geometry vanish on some Mac/ANGLE GPUs).
    if (camera.isPerspectiveCamera) {
      const near = Math.max(d * 0.0008, 0.01);
      const far = d * 20 + 20_000;
      if (Math.abs(camera.near - near) / near > 0.05 || Math.abs(camera.far - far) / far > 0.05) {
        camera.near = near;
        camera.far = far;
        camera.updateProjectionMatrix();
      }
    }

    const near = d < 34;
    if (near !== nearRef.current) {
      nearRef.current = near;
      onZoom(near);
    }
  });
  return null;
};

/* --------------------------------- the Sun -------------------------------- */
const Sun = ({ onFocus, accuracyMode }: { onFocus: (name: string) => void; accuracyMode: AccuracyMode }) => {
  const r = scaleRadiusKm(696000);
  const sunSpin = spinRateRadPerSec(rotationPeriodDays("Sun").days, accuracyMode);
  return (
    <group>
      <StarSurface
        color="#ffb43a"
        size={r}
        segments={64}
        spinRate={sunSpin}
        onClick={(e) => { e.stopPropagation(); onFocus("Sun"); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      />
      {showDecorativeGlow(accuracyMode) && (
        <mesh>
          <sphereGeometry args={[r * SUN_CORONA_SCALE, 32, 32]} />
          <meshBasicMaterial color="#ff9b21" transparent opacity={SUN_CORONA_OPACITY} depthWrite={false} />
        </mesh>
      )}
      <pointLight position={[0, 0, 0]} intensity={3.2} distance={0} decay={0} color="#fff2cc" />
      <Html position={[0, r + 1.5, 0]} center distanceFactor={60} className="ss-label">
        <button
          onClick={() => onFocus("Sun")}
          className="ss-name ss-sun"
          style={{ pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0 }}
        >
          Sun
        </button>
      </Html>
    </group>
  );
};

/** Saturn's ring plane is tilted ~26.73° to its orbital plane — stable, not wobbling. */
const SATURN_RING_TILT = (26.73 * Math.PI) / 180;

preloadNasaModels();
preloadVesselModels();

/** Begin loading moon glTF assets once the user zooms in for moons. */
const MoonModelPreloader = ({ active }: { active: boolean }) => {
  useEffect(() => {
    if (active) preloadNasaMoonModels();
  }, [active]);
  return null;
};

const SaturnProcedural = ({
  r,
  body,
  ringInner,
  ringMid,
  ringOuter,
  oblate,
  pickHandlers,
}: {
  r: number;
  body: Body;
  ringInner: number;
  ringMid: number;
  ringOuter: number;
  oblate: [number, number, number];
  pickHandlers: object;
}) => (
  <>
    {body.ring && (
      <group rotation={[SATURN_RING_TILT, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ringInner, ringMid, 64]} />
          <meshBasicMaterial color={body.ring!.color} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ringMid + 0.08, ringOuter, 64]} />
          <meshBasicMaterial color={body.ring!.color} transparent opacity={0.42} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    )}
    <group scale={oblate}>
      <mesh {...pickHandlers}>
        <sphereGeometry args={[r, 32, 32]} />
        <meshStandardMaterial color={body.color} roughness={0.75} metalness={0.05} />
      </mesh>
      <mesh scale={[1.001, 1.001, 1.001]}>
        <sphereGeometry args={[r, 32, 32]} />
        <meshStandardMaterial color="#d4bc8a" transparent opacity={0.18} roughness={1} depthWrite={false} />
      </mesh>
    </group>
  </>
);

const planetOblateness = (name: string): [number, number, number] => {
  if (name === "Jupiter" || name === "Saturn") return [1, 0.91, 1];
  if (name === "Uranus" || name === "Neptune") return [1, 0.96, 1];
  return [1, 1, 1];
};

const PlanetProcedural = ({
  r,
  body,
  oblate,
  pickHandlers,
  accuracyMode,
}: {
  r: number;
  body: Body;
  oblate: [number, number, number];
  pickHandlers: object;
  accuracyMode: AccuracyMode;
}) => (
  <group scale={oblate}>
    <mesh {...pickHandlers}>
      <sphereGeometry args={[r, 32, 32]} />
      <meshStandardMaterial
        color={body.color}
        emissive={body.emissive ?? "#000000"}
        emissiveIntensity={body.emissive ? 0.5 : 0}
        roughness={body.name === "Jupiter" || body.name === "Saturn" ? 0.75 : 0.85}
        metalness={body.name === "Mercury" || body.name === "Venus" ? 0.12 : 0.05}
      />
    </mesh>
    {body.name === "Earth" && showDecorativeGlow(accuracyMode) && (
      <mesh scale={[1.03, 1.03, 1.03]}>
        <sphereGeometry args={[r, 24, 24]} />
        <meshBasicMaterial color="#6eb5ff" transparent opacity={decorativeOpacity(0.14, accuracyMode)} depthWrite={false} />
      </mesh>
    )}
    {body.name === "Jupiter" && showDecorativeGlow(accuracyMode) && (
      <mesh scale={[1.001, 1.001, 1.001]}>
        <sphereGeometry args={[r, 32, 32]} />
        <meshStandardMaterial color="#c49560" transparent opacity={decorativeOpacity(0.18, accuracyMode)} roughness={1} depthWrite={false} />
      </mesh>
    )}
  </group>
);

/* -------------------------------- a Planet -------------------------------- */
const Planet = ({
  body,
  clock,
  showMinor,
  onFocus,
  accuracyMode,
}: {
  body: Body;
  clock: React.MutableRefObject<SimClock>;
  showMinor: boolean;
  onFocus: (name: string) => void;
  accuracyMode: AccuracyMode;
}) => {
  const orbitRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const dropRef = useRef<THREE.Mesh>(null);
  const path = useMemo(() => orbitPath(body), [body]);
  const r = scaleRadiusKm(body.radiusKm);
  const isDwarf = body.kind === "dwarf";
  const oblate = planetOblateness(body.name);
  const ringInner = body.ring ? scaleRadiusKm(body.ring.inner) : 0;
  const ringOuter = body.ring ? scaleRadiusKm(body.ring.outer) : 0;
  const ringMid = body.ring ? scaleRadiusKm(100_000) : 0;

  useFrame(() => {
    if (!orbitRef.current) return;
    const au = heliocentricAU(body, clock.current.orbitalYears);
    const [x, y, z] = toScenePosition(au);
    orbitRef.current.position.set(x, y, z);
    if (spinRef.current) spinRef.current.rotation.y += 0.008;
    if (dropRef.current) dropRef.current.position.set(x, 0, z);
  });

  const modelUrl = PLANET_MODEL_URL[body.name];
  const modelRotation = PLANET_MODEL_ROTATION[body.name];
  const showLabel = !isDwarf || showMinor;
  const pickHandlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onFocus(body.name);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      document.body.style.cursor = "auto";
    },
  };

  return (
    <group>
      <Line points={path} color={isDwarf ? "#4a5170" : "#39507f"} lineWidth={1} transparent opacity={isDwarf ? 0.25 : 0.4} />
      <mesh ref={dropRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r * 0.4, r * 0.4 + 0.06, 20]} />
        <meshBasicMaterial color={body.color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      <group ref={orbitRef}>
        {body.name === "Saturn" ? (
          <group>
            <GltfWithFallback
              url={NASA_GLTF.saturn}
              targetSize={r * 2.5}
              rotation={[SATURN_RING_TILT, 0, 0]}
              fallback={
                <SaturnProcedural
                  r={r}
                  body={body}
                  ringInner={ringInner}
                  ringMid={ringMid}
                  ringOuter={ringOuter}
                  oblate={oblate}
                  pickHandlers={pickHandlers}
                />
              }
            />
            <mesh {...pickHandlers} visible={false}>
              <sphereGeometry args={[r * 1.35, 12, 12]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>
        ) : (
          <>
            {body.ring && (
              <group rotation={[SATURN_RING_TILT, 0, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[ringInner, ringMid, 64]} />
                  <meshBasicMaterial color={body.ring.color} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[ringMid + 0.08, ringOuter, 64]} />
                  <meshBasicMaterial color={body.ring.color} transparent opacity={0.42} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
              </group>
            )}

            <group ref={spinRef}>
              {modelUrl ? (
                <>
                  <GltfWithFallback
                    url={modelUrl}
                    targetSize={r * 2}
                    rotation={modelRotation}
                    fallback={
                      <PlanetProcedural
                        r={r}
                        body={body}
                        oblate={oblate}
                        pickHandlers={pickHandlers}
                        accuracyMode={accuracyMode}
                      />
                    }
                  />
                  <mesh {...pickHandlers} visible={false}>
                    <sphereGeometry args={[r * 1.15, 12, 12]} />
                    <meshBasicMaterial transparent opacity={0} />
                  </mesh>
                </>
              ) : (
                <PlanetProcedural
                  r={r}
                  body={body}
                  oblate={oblate}
                  pickHandlers={pickHandlers}
                  accuracyMode={accuracyMode}
                />
              )}
            </group>
          </>
        )}

        {showLabel && (
          <Html position={[0, r + 0.7, 0]} center distanceFactor={50} className="ss-label">
            <button
              onClick={() => onFocus(body.name)}
              className={`ss-name ${isDwarf ? "ss-dwarf" : ""}`}
              style={{ pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0 }}
              title={`Fly to ${body.name}`}
            >
              {body.name}
            </button>
          </Html>
        )}
      </group>
    </group>
  );
};

/* --------------------------------- a Moon --------------------------------- */
const MoonBody = ({
  moon,
  parent,
  clock,
  show,
  trueMoonPeriods,
  accuracyMode,
  onFocus,
}: {
  moon: Moon;
  parent: Body;
  clock: React.MutableRefObject<SimClock>;
  show: boolean;
  trueMoonPeriods: boolean;
  accuracyMode: AccuracyMode;
  onFocus: (name: string) => void;
}) => {
  const ref = useRef<THREE.Group>(null);
  const localR = moonOrbitSceneRadius(parent.radiusKm, moon.aKm);
  const r = moonMeshSceneRadius(parent.radiusKm, moon.radiusKm, accuracyMode);
  const incl = (moon.inclDeg * Math.PI) / 180;

  const rate = useMemo(
    () => siderealOrbitRateRadPerYear(moon.periodDays, trueMoonPeriods, MOON_CINEMATIC),
    [moon.periodDays, trueMoonPeriods],
  );

  useFrame(() => {
    if (!ref.current || !show) return;
    const au = heliocentricAU(parent, clock.current.orbitalYears);
    const [px, py, pz] = toScenePosition(au);
    const ang = clock.current.orbitalYears * rate;
    const lx = Math.cos(ang) * localR;
    const lz = Math.sin(ang) * localR * Math.cos(incl);
    const ly = Math.sin(ang) * localR * Math.sin(incl);
    ref.current.position.set(px + lx, py + ly, pz + lz);
  });

  const moonUrl = MOON_MODEL_URL[moon.name];
  const moonRotation = MOON_MODEL_ROTATION[moon.name];
  const moonPick = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onFocus(moon.name);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      document.body.style.cursor = "auto";
    },
  };
  const moonFallback = (
    <mesh {...moonPick}>
      <sphereGeometry args={[r, 28, 28]} />
      <meshStandardMaterial color={moon.color} roughness={0.9} />
    </mesh>
  );

  if (!show) return null;
  return (
    <group ref={ref}>
      {moonUrl ? (
        <>
          <GltfWithFallback url={moonUrl} targetSize={r * 2} rotation={moonRotation} fallback={moonFallback} />
          <mesh {...moonPick} visible={false}>
            <sphereGeometry args={[r * 1.2, 12, 12]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </>
      ) : (
        moonFallback
      )}
      <Html position={[0, r + 0.35, 0]} center distanceFactor={26} className="ss-label">
        <button
          onClick={() => onFocus(moon.name)}
          className="ss-name ss-moon"
          style={{ pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0 }}
        >
          {moon.name}
        </button>
      </Html>
    </group>
  );
};

/* --------------------------------- a Comet -------------------------------- */
const CometBody = ({
  comet,
  clock,
  onFocus,
  accuracyMode,
}: {
  comet: Comet;
  clock: React.MutableRefObject<SimClock>;
  onFocus: (name: string) => void;
  accuracyMode: AccuracyMode;
}) => {
  const nucleusRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const path = useMemo(() => orbitPath(comet), [comet]);
  const posV = useMemo(() => new THREE.Vector3(), []);
  const dirV = useMemo(() => new THREE.Vector3(), []);
  const r = Math.max(0.4, scaleRadiusKm(comet.radiusKm));
  const tailLen = 12;

  useFrame(() => {
    const au = heliocentricAU(comet, clock.current.orbitalYears);
    const [x, y, z] = toScenePosition(au);
    posV.set(x, y, z);
    nucleusRef.current?.position.copy(posV);
    if (tailRef.current) {
      tailRef.current.position.copy(posV);
      dirV.copy(posV).normalize(); // tail streams away from the Sun (origin)
      tailRef.current.quaternion.setFromUnitVectors(UP_Z, dirV);
    }
  });

  return (
    <group>
      <Line points={path} color="#7fd8ff" lineWidth={1} transparent opacity={0.28} dashed dashSize={1.2} gapSize={1.2} />
      <group ref={nucleusRef}>
        <mesh
          onClick={(e) => { e.stopPropagation(); onFocus(comet.name); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        >
          <sphereGeometry args={[r, 24, 24]} />
          <meshBasicMaterial color={comet.color} />
        </mesh>
        {showDecorativeGlow(accuracyMode) && (
          <mesh>
            <sphereGeometry args={[r * 2.1, 20, 20]} />
            <meshBasicMaterial color={comet.color} transparent opacity={decorativeOpacity(0.22, accuracyMode)} depthWrite={false} />
          </mesh>
        )}
        <Html position={[0, r * 3 + 0.8, 0]} center distanceFactor={45} className="ss-label">
          <button onClick={() => onFocus(comet.name)} className="ss-name" style={{ color: "#bfe6ff", pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
            {comet.name}
          </button>
        </Html>
      </group>
      {showDecorativeGlow(accuracyMode) && (
        <group ref={tailRef}>
          <mesh position={[0, 0, tailLen / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[r * 1.6, tailLen, 14, 1, true]} />
            <meshBasicMaterial color="#9fe4ff" transparent opacity={decorativeOpacity(0.12, accuracyMode)} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      )}
    </group>
  );
};

/* ---------------------------- Starman's Roadster -------------------------- */
const RoadsterBody = ({
  clock,
  onFocus,
}: {
  clock: React.MutableRefObject<SimClock>;
  onFocus: (name: string) => void;
}) => {
  const ref = useRef<THREE.Group>(null);
  const carRef = useRef<THREE.Group>(null);
  const path = useMemo(() => orbitPath(ROADSTER), []);
  const RED = "#c81e1e";
  const wheels: [number, number][] = [[0.72, 0.5], [0.72, -0.5], [-0.72, 0.5], [-0.72, -0.5]];

  useFrame((_, dt) => {
    const au = heliocentricAU(ROADSTER, clock.current.orbitalYears);
    const [x, y, z] = toScenePosition(au);
    ref.current?.position.set(x, y, z);
    if (carRef.current) {
      carRef.current.rotation.y += dt * 0.5; // tumbling in space
      carRef.current.rotation.x += dt * 0.18;
    }
  });

  return (
    <group>
      <Line points={path} color="#ff5a5a" lineWidth={1} transparent opacity={0.35} dashed dashSize={1.2} gapSize={1} />
      <group ref={ref}>
        <group
          ref={carRef}
          scale={0.9}
          onClick={(e) => { e.stopPropagation(); onFocus(ROADSTER.name); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        >
          {/* main body */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[2.4, 0.32, 1.0]} />
            <meshStandardMaterial color={RED} metalness={0.6} roughness={0.32} />
          </mesh>
          {/* tapered nose */}
          <mesh position={[1.05, -0.02, 0]}>
            <boxGeometry args={[0.7, 0.2, 0.86]} />
            <meshStandardMaterial color={RED} metalness={0.6} roughness={0.32} />
          </mesh>
          {/* rear deck */}
          <mesh position={[-0.95, 0.06, 0]}>
            <boxGeometry args={[0.7, 0.26, 0.94]} />
            <meshStandardMaterial color={RED} metalness={0.6} roughness={0.32} />
          </mesh>
          {/* underbody */}
          <mesh position={[0, -0.16, 0]}>
            <boxGeometry args={[2.3, 0.16, 1.06]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
          </mesh>
          {/* open cockpit well */}
          <mesh position={[-0.1, 0.16, 0]}>
            <boxGeometry args={[0.9, 0.12, 0.72]} />
            <meshStandardMaterial color="#2a2320" roughness={0.8} />
          </mesh>
          {/* windshield */}
          <mesh position={[0.4, 0.3, 0]} rotation={[0, 0, 0.7]}>
            <boxGeometry args={[0.04, 0.34, 0.82]} />
            <meshStandardMaterial color="#bfe6ff" transparent opacity={0.4} metalness={0.2} roughness={0.1} />
          </mesh>
          {/* wheels */}
          {wheels.map(([wx, wz], i) => (
            <group key={i} position={[wx, -0.16, wz]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.27, 0.27, 0.16, 22]} />
                <meshStandardMaterial color="#141414" roughness={0.6} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.18, 16]} />
                <meshStandardMaterial color="#8a8f96" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>
          ))}
          {/* Starman in the driver's seat */}
          <group position={[-0.1, 0.34, -0.18]}>
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.12, 18, 18]} />
              <meshStandardMaterial color="#f2f2f2" roughness={0.5} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.2, 0.28, 0.2]} />
              <meshStandardMaterial color="#eaeaea" roughness={0.6} />
            </mesh>
            {/* arm resting on the door */}
            <mesh position={[0.02, -0.02, 0.22]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.08, 0.24, 0.08]} />
              <meshStandardMaterial color="#eaeaea" roughness={0.6} />
            </mesh>
          </group>
        </group>
        <Html position={[0, 1.15, 0]} center distanceFactor={40} className="ss-label">
          <button onClick={() => onFocus(ROADSTER.name)} className="ss-name" style={{ color: "#ff8a8a", pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
            {ROADSTER.name}
          </button>
        </Html>
      </group>
    </group>
  );
};

/* ------------------------------- a Black hole ----------------------------- */
const BlackHoleBody = ({
  bh,
  onFocus,
  accuracyMode,
}: {
  bh: (typeof BLACK_HOLES)[number];
  onFocus: (name: string) => void;
  accuracyMode: AccuracyMode;
}) => {
  const p = useMemo(
    () => new THREE.Vector3(...bh.dir).normalize().multiplyScalar(scaleDistanceAU(bh.distance * AU_PER_LY)),
    [bh.dir, bh.distance],
  );
  const disk = useMemo(() => blackHoleDiskRadii(bh.massSolar), [bh.massSolar]);
  const pickHandlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onFocus(bh.name); },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; },
    onPointerOut: () => { document.body.style.cursor = "auto"; },
  };
  return (
    <group position={p.toArray()}>
      <AccretionDisk
        innerRadius={disk.inner}
        outerRadius={disk.outer}
        shadowRadius={disk.shadow}
        accuracyMode={accuracyMode}
        hotColor="#ffd080"
        coolColor="#ff6020"
        opacity={accuracyMode === "educational" ? 0.62 : 0.78}
        tilt={[Math.PI / 2.4, 0.55, 0.15]}
      />
      <mesh {...pickHandlers} visible={false}>
        <sphereGeometry args={[disk.outer * 1.05, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <Html position={[0, disk.outer + 22, 0]} center distanceFactor={260} className="ss-label">
        <button onClick={() => onFocus(bh.name)} className="ss-name" style={{ color: "#ffbe8f", pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
          {bh.name}
        </button>
      </Html>
    </group>
  );
};

/* ------------------------ an exoplanet orbiting a star -------------------- */
const ExoPlanetBody = ({
  exo,
  starSize,
  clock,
  show,
  truePeriods,
  onFocus,
  accuracyMode,
}: {
  exo: Exoplanet;
  starSize: number;
  clock: React.MutableRefObject<SimClock>;
  show: boolean;
  truePeriods: boolean;
  onFocus: (name: string) => void;
  accuracyMode: AccuracyMode;
}) => {
  const ref = useRef<THREE.Group>(null);
  const localR = starSize * 1.35 + 3 + 5 * Math.log10(1 + exo.aAU / 0.02);
  const r = 0.6 + 0.35 * Math.cbrt(exo.radiusEarth);
  const rate = useMemo(
    () => siderealOrbitRateRadPerYear(exo.periodDays, truePeriods, EXO_CINEMATIC),
    [exo.periodDays, truePeriods],
  );

  useFrame(() => {
    if (!ref.current || !show) return;
    const ang = clock.current.orbitalYears * rate;
    ref.current.position.set(Math.cos(ang) * localR, Math.sin(ang) * localR * 0.12, Math.sin(ang) * localR);
  });

  const isHabitable = exo.radiusEarth >= 0.8 && exo.radiusEarth <= 1.6 && exo.aAU >= 0.03 && exo.aAU <= 0.7;

  if (!show) return null;
  return (
    <group>
      <Line points={circlePoints(localR, 48)} color="#8aa0c0" lineWidth={1} transparent opacity={0.25} />
      <group ref={ref}>
        <mesh
          onClick={(e) => { e.stopPropagation(); onFocus(exo.name); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
          scale={exo.radiusEarth > 6 ? [1, 0.94, 1] : [1, 1, 1]}
        >
          <sphereGeometry args={[r, 28, 28]} />
          <meshStandardMaterial
            color={exo.color}
            emissive={isHabitable ? "#3a6a4a" : exo.color}
            emissiveIntensity={isHabitable ? 0.28 : 0.14}
            roughness={exo.radiusEarth > 6 ? 0.7 : 0.88}
            metalness={exo.radiusEarth > 6 ? 0.08 : 0.02}
          />
        </mesh>
        {isHabitable && showDecorativeGlow(accuracyMode) && (
          <mesh scale={[1.06, 1.06, 1.06]}>
            <sphereGeometry args={[r, 20, 20]} />
            <meshBasicMaterial color="#7ec8e8" transparent opacity={decorativeOpacity(0.12, accuracyMode)} depthWrite={false} />
          </mesh>
        )}
        <Html position={[0, r + 0.9, 0]} center distanceFactor={26} className="ss-label">
          <button onClick={() => onFocus(exo.name)} className="ss-name ss-moon" style={{ pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
            {exo.name}
          </button>
        </Html>
      </group>
    </group>
  );
};

const circlePoints = (radius: number, seg: number): [number, number, number][] => {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
  }
  return pts;
};

/* ------------------------- spacecraft (heliocentric) ---------------------- */
const SunSpacecraft = ({ craft, onFocus }: { craft: Spacecraft; onFocus: (name: string) => void }) => {
  const p = useMemo(
    () => new THREE.Vector3(...(craft.dir ?? [1, 0, 0])).normalize().multiplyScalar(scaleDistanceAU(craft.distanceAU ?? 1)),
    [craft.dir, craft.distanceAU],
  );
  const modelScale = craft.kind.includes("telescope") ? 1.8 : 1.2;
  return (
    <group>
      <Line points={[[0, 0, 0], p.toArray()]} color={craft.color} lineWidth={1} transparent opacity={0.1} />
      <group position={p.toArray()}>
        <group
          onClick={(e) => { e.stopPropagation(); onFocus(craft.name); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        >
          <SpacecraftModel craft={craft} scale={modelScale} slowSpin />
        </group>
        <mesh>
          <sphereGeometry args={[modelScale * 2.2, 12, 12]} />
          <meshBasicMaterial color={craft.color} transparent opacity={0.1} depthWrite={false} />
        </mesh>
        <Html position={[0, modelScale * 3.2, 0]} center distanceFactor={90} className="ss-label">
          <button onClick={() => onFocus(craft.name)} className="ss-name" style={{ color: craft.color, pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
            {craft.name === "James Webb Space Telescope" ? "Webb" : craft.name}
          </button>
        </Html>
      </group>
    </group>
  );
};

/* ---------------------- Earth satellites (ISS / Hubble) ------------------- */
const EarthSatellites = ({
  clock,
  show,
  trueLeoPeriods,
  onFocus,
}: {
  clock: React.MutableRefObject<SimClock>;
  show: boolean;
  trueLeoPeriods: boolean;
  onFocus: (name: string) => void;
}) => {
  const list = useMemo(() => SPACECRAFT.filter((s) => s.orbit === "earth"), []);
  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame(() => {
    if (!show) return;
    const { orbitalYears, playDeltaYears } = clock.current;
    list.forEach((s, i) => {
      const g = refs.current[i];
      if (!g) return;
      const [x, y, z] = earthCraftScenePosition(s, i, orbitalYears, playDeltaYears, trueLeoPeriods);
      g.position.set(x, y, z);
      g.rotation.y = playDeltaYears * (0.4 + i * 0.15);
    });
  });

  if (!show) return null;
  return (
    <>
      {list.map((s, i) => (
        <group key={s.name} ref={(el) => (refs.current[i] = el)}>
          <group
            onClick={(e) => { e.stopPropagation(); onFocus(s.name); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
            onPointerOut={() => { document.body.style.cursor = "auto"; }}
          >
            <SpacecraftModel craft={s} scale={s.kind.includes("telescope") ? 0.55 : 0.5} />
          </group>
          <Html position={[0, 0.75, 0]} center distanceFactor={22} className="ss-label">
            <button onClick={() => onFocus(s.name)} className="ss-name ss-moon" style={{ pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
              {s.name === "International Space Station" ? "ISS" : "Hubble"}
            </button>
          </Html>
        </group>
      ))}
    </>
  );
};

/* ----------------------------- exotic objects ----------------------------- */
const ExoticBody = ({
  obj,
  onFocus,
  accuracyMode,
}: {
  obj: ExoticObject;
  onFocus: (name: string) => void;
  accuracyMode: AccuracyMode;
}) => {
  const beamRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const p = useMemo(() => new THREE.Vector3(...obj.dir).normalize().multiplyScalar(scaleDistanceAU(obj.sceneDistance * AU_PER_LY)), [obj.dir, obj.sceneDistance]);
  const core = obj.kind === "quasar" ? 16 : obj.kind === "neutron" ? 4 : 6;
  const pulsarRate = PULSAR_PERIOD_SEC[obj.name] ? pulsarSpinRateRadPerSec(PULSAR_PERIOD_SEC[obj.name]) : 0;
  const quasarDiskRate = spinRateRadPerSec(QUASAR_DISK_PERIOD_DAYS, accuracyMode);
  useFrame((_, dt) => {
    if (obj.kind === "pulsar") {
      if (beamRef.current && pulsarRate > 0) beamRef.current.rotation.y += dt * pulsarRate;
      if (coreRef.current && pulsarRate > 0) coreRef.current.rotation.y += dt * pulsarRate;
    }

  });
  return (
    <group position={p.toArray()}>
      <mesh
        ref={coreRef}
        onClick={(e) => { e.stopPropagation(); onFocus(obj.name); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        <sphereGeometry args={[core, 28, 28]} />
        <meshBasicMaterial color={obj.color} toneMapped={false} />
      </mesh>
      {showDecorativeGlow(accuracyMode) && (
        <mesh>
          <sphereGeometry args={[core * 2.2, 20, 20]} />
          <meshBasicMaterial color={obj.color} transparent opacity={decorativeOpacity(0.22, accuracyMode)} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {obj.kind === "pulsar" && (
        <group ref={beamRef} rotation={[0.5, 0, 0.3]}>
          {[1, -1].map((s) => (
            <mesh key={s} position={[0, s * core * 5, 0]} rotation={[s > 0 ? 0 : Math.PI, 0, 0]}>
              <coneGeometry args={[core * 1.6, core * 9, 20, 1, true]} />
              <meshBasicMaterial color="#cfe6ff" transparent opacity={decorativeOpacity(0.16, accuracyMode)} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          ))}
        </group>
      )}

      {obj.kind === "quasar" && (
        <group rotation={[0.3, 0, 0.2]}>
          {[1, -1].map((s) => (
            <mesh key={s} position={[0, s * core * 7, 0]} rotation={[s > 0 ? 0 : Math.PI, 0, 0]}>
              <coneGeometry args={[core * 1.3, core * 14, 22, 1, true]} />
              <meshBasicMaterial color="#9fd0ff" transparent opacity={decorativeOpacity(0.15, accuracyMode)} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          ))}
          <group>
            <AccretionDisk
              innerRadius={core * 1.2}
              outerRadius={core * 4.2}
              shadowRadius={core * 0.65}
              hotColor="#fff0c8"
              coolColor="#6eb5ff"
              opacity={0.85}
              accuracyMode={accuracyMode}
              tilt={[0, 0, 0]}
              spinRate={quasarDiskRate * 2}
            />
          </group>
        </group>
      )}

      {obj.kind === "magnetar" &&
        [0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, (i * Math.PI) / 3]}>
            <torusGeometry args={[core * 2.3, core * 0.12, 8, 44]} />
            <meshBasicMaterial color="#ff9bf0" transparent opacity={decorativeOpacity(0.28, accuracyMode)} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}

      <Html position={[0, core * 3 + 3, 0]} center distanceFactor={obj.kind === "quasar" ? 320 : 230} className="ss-label">
        <button onClick={() => onFocus(obj.name)} className="ss-name" style={{ color: obj.color, pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
          {obj.name} · {obj.typeLabel}
        </button>
      </Html>
    </group>
  );
};

/* --------------------- catalog stars (the real ~300) ---------------------- */
// Rendered as a single InstancedMesh for performance; hover shows one label,
// click opens the detail panel. Featured stars are excluded to avoid dupes.
const CatalogStars = ({
  onFocus,
  clock,
  scrubYears,
  lightYears,
  sceneQuality,
  accuracyMode,
}: {
  onFocus: (name: string) => void;
  clock: React.MutableRefObject<SimClock>;
  scrubYears: number | null;
  lightYears: number;
  sceneQuality: SceneQuality;
  accuracyMode: AccuracyMode;
}) => {
  const { camera } = useThree();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const hoverGroupRef = useRef<THREE.Group>(null);
  const spinAngles = useRef<number[]>([]);
  const list = useMemo(() => {
    const featured = new Set(NEARBY_STARS.map((s) => s.name.toLowerCase()));
    return STAR_CATALOG.filter((s) => {
      if (featured.has(s.name.toLowerCase())) return false;
      if (sceneQuality.catalogMagLimit != null && s.mag > sceneQuality.catalogMagLimit) return false;
      return true;
    });
  }, [sceneQuality.catalogMagLimit]);
  const sizes = useMemo(() => list.map((s) => catalogStarRender(s).size), [list]);
  const spinRates = useMemo(
    () =>
      list.map((s) => {
        const { days } = rotationPeriodDays(s.name, s.spect);
        return spinRateRadPerSec(days, accuracyMode);
      }),
    [list, accuracyMode],
  );
  const [hover, setHover] = useState(-1);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const col = new THREE.Color();
    list.forEach((s, i) => mesh.setColorAt(i, col.set(s.color)));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [list]);

  useFrame((_, dt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const epoch = clock.current.orbitalYears;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    if (spinAngles.current.length !== list.length) spinAngles.current = list.map(() => 0);
    list.forEach((s, i) => {
      spinAngles.current[i] += dt * spinRates[i];
      const [px, py, pz] = starScenePositionAtEpoch(s.ly, s.pos, s.name, epoch);
      const display = catalogDisplayScale(sizes[i], s.mag, camera.position, [px, py, pz]);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), spinAngles.current[i]);
      scale.set(display, display, display);
      pos.set(px, py, pz);
      m.compose(pos, q, scale);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;

    if (hover >= 0 && hoverGroupRef.current) {
      const s = list[hover];
      const [px, py, pz] = starScenePositionAtEpoch(s.ly, s.pos, s.name, epoch);
      hoverGroupRef.current.position.set(px, py, pz);
    }
  });

  const hoverStar = hover >= 0 ? list[hover] : null;

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, list.length]}
        onClick={(e) => { e.stopPropagation(); if (e.instanceId != null) onFocus(list[e.instanceId].name); }}
        onPointerMove={(e) => { e.stopPropagation(); if (e.instanceId != null) { setHover(e.instanceId); document.body.style.cursor = "pointer"; } }}
        onPointerOut={() => { setHover(-1); document.body.style.cursor = "auto"; }}
      >
        <sphereGeometry args={[1, sceneQuality.catalogSphereSegments, sceneQuality.catalogSphereSegments]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {hoverStar && (
        <group ref={hoverGroupRef}>
          <Html center distanceFactor={200} className="ss-label">
            <span className="ss-name ss-star" style={{ color: hoverStar.color }}>{hoverStar.name} · {hoverStar.ly} ly</span>
          </Html>
        </group>
      )}
    </>
  );
};

/* ------------------------------ nearby stars ------------------------------ */
const NearbyStars = ({
  lightYears,
  onFocus,
  clock,
  scrubYears,
  showMinor,
  showExoSystems,
  focusName,
  destinationName,
  trueMoonPeriods,
  accuracyMode,
}: {
  lightYears: number;
  scrubYears: number | null;
  onFocus: (name: string) => void;
  clock: React.MutableRefObject<SimClock>;
  showMinor: boolean;
  showExoSystems: boolean;
  focusName: string | null;
  destinationName: string | null;
  trueMoonPeriods: boolean;
  accuracyMode: AccuracyMode;
}) => {
  const placed = useMemo(
    () =>
      NEARBY_STARS.map((s) => {
        const render = featuredStarRender(s);
        const { days } = rotationPeriodDays(s.name, s.spectral);
        const spin = spinRateRadPerSec(days, accuracyMode);
        return { star: s, size: render.size, glow: render.glow, spin };
      }),
    [accuracyMode]
  );
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const { camera } = useThree();

  useFrame((_, dt) => {
    const epoch = clock.current.orbitalYears;
    placed.forEach(({ star, size, spin }, i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      const [px, py, pz] = starScenePositionAtEpoch(star.distance, star.dir, star.name, epoch);
      g.position.set(px, py, pz);
      const display = featuredDisplayScale(size, star.radiusSolar, camera.position, [px, py, pz]);
      g.scale.setScalar(display / size);
      if (spin > 0) g.rotation.y += dt * spin;
    });
  });

  return (
    <group>
      {placed.map(({ star, size, glow }, i) => {
        const reached = star.distance <= lightYears;
        const isDest = destinationName === star.name;
        const shellFactor = starGlowShellRadiusFactor(accuracyMode);
        const shellOpacity = starLuminosityGlowOpacity(glow, accuracyMode);
        return (
          <group key={star.name} ref={(el) => { groupRefs.current[i] = el; }}>
            {/* animated plasma photosphere (unlit — stars emit their own light) */}
            <StarSurface
              color={star.color}
              size={size}
              segments={36}
              spinRate={0}
              onClick={(e) => { e.stopPropagation(); onFocus(star.name); }}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
              onPointerOut={() => { document.body.style.cursor = "auto"; }}
            />
            {shellFactor > 0 && shellOpacity > 0 && (
              <mesh>
                <sphereGeometry args={[size * shellFactor, 20, 20]} />
                <meshBasicMaterial color={star.color} transparent opacity={shellOpacity} depthWrite={false} />
              </mesh>
            )}
            {reached && (
              <mesh>
                <sphereGeometry args={[size * LIGHT_REACHED_GLOW.scale, 20, 20]} />
                <meshBasicMaterial color="#ffd166" transparent opacity={stateGlowOpacity(LIGHT_REACHED_GLOW.opacity, accuracyMode)} depthWrite={false} />
              </mesh>
            )}
            {isDest && (
              <mesh>
                <sphereGeometry args={[size * MISSION_DEST_GLOW.scale, 24, 24]} />
                <meshBasicMaterial color="#2fe0c0" transparent opacity={stateGlowOpacity(MISSION_DEST_GLOW.opacity, accuracyMode)} depthWrite={false} />
              </mesh>
            )}
            {/* leader line from the star up to its name tag */}
            <Line
              points={[[0, size * 1.05, 0], [0, size * 3.4, 0]]}
              color={reached ? "#ffd166" : star.color}
              lineWidth={1}
              transparent
              opacity={0.55}
            />
            <Html position={[0, size * 3.4, 0]} center distanceFactor={150} className="ss-label">
              <button
                onClick={() => onFocus(star.name)}
                title={`${star.spectral} · ${star.distance} ly — click for details`}
                className="ss-name ss-star"
                style={{ color: reached ? "#ffd166" : star.color, pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0 }}
              >
                {star.name} · {star.distance} ly
              </button>
            </Html>
            {/* Tier A curated exoplanets + Tier B archive instances */}
            {(showMinor || focusName === star.name) && showExoSystems && (
              <>
                {EXOPLANETS.filter((e) => e.host === star.name).map((e) => (
                  <ExoPlanetBody
                    key={e.name}
                    exo={e}
                    starSize={size}
                    clock={clock}
                    show
                    truePeriods={trueMoonPeriods}
                    onFocus={onFocus}
                    accuracyMode={accuracyMode}
                  />
                ))}
                <ExoplanetInstances
                  host={star.name}
                  starSize={size}
                  planets={archivePlanetsForHost(star.name)}
                  clock={clock}
                  show
                  truePeriods={trueMoonPeriods}
                />
              </>
            )}
          </group>
        );
      })}
    </group>
  );
};

/* --------------------------- the birthday light --------------------------- */
const LightSphere = ({
  lightYears,
  animating,
  onDone,
}: {
  lightYears: number;
  animating: boolean;
  onDone: () => void;
}) => {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  const target = scaleDistanceAU(lightYears * AU_PER_LY);
  const DURATION = 4;

  useFrame((state) => {
    if (!ref.current) return;
    if (animating) {
      if (start.current === null) start.current = state.clock.getElapsedTime();
      const t = Math.min((state.clock.getElapsedTime() - start.current) / DURATION, 1);
      const e = 1 - Math.pow(1 - t, 3);
      ref.current.scale.setScalar(Math.max(e * target, 0.001));
      if (t >= 1) {
        start.current = null;
        onDone();
      }
    } else {
      ref.current.scale.setScalar(target);
    }
  });

  if (lightYears <= 0) return null;
  return (
    <group ref={ref}>
      {/* glowing boundary */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#37f0cf" transparent opacity={0.18} wireframe />
      </mesh>
      {/* faint volume so the bubble reads as a sphere */}
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#2fe0c0" transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

/* ---------------------------- camera director ----------------------------- */
/** Flies the camera to focus any body (Sun / planet / star / the light-sphere)
 *  when `goal.token` changes, then keeps the target locked on it — tracking
 *  moving planets so you can orbit and zoom around the focused body. Runs each
 *  transition ONCE per token so it never fights manual zoom afterwards. */
const CameraDirector = ({
  goal,
  reach,
  clock,
  trueLeoPeriods,
  controlsRef,
}: {
  goal: { name: string; token: number } | null;
  reach: number;
  clock: React.MutableRefObject<SimClock>;
  trueLeoPeriods: boolean;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
}) => {
  const { camera } = useThree();
  const st = useRef({
    token: -1,
    phase: "idle" as "idle" | "fly" | "track",
    t0: null as number | null,
    from: new THREE.Vector3(),
    fromT: new THREE.Vector3(),
    dist: 0,
    name: "",
    prev: new THREE.Vector3(),
  });

  useFrame((state) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const s = st.current;

    if (goal && goal.token !== s.token) {
      s.token = goal.token;
      s.name = goal.name;
      s.phase = "fly";
      s.t0 = null;
      s.from.copy(camera.position);
      s.fromT.copy(controls.target);
      s.dist = bodyFrameDist(goal.name, reach);
    }
    if (s.phase === "idle") return;

    const targetNow = bodyScenePos(
      s.name,
      clock.current.orbitalYears,
      clock.current.playDeltaYears,
      trueLeoPeriods,
    );

    if (s.phase === "fly") {
      if (s.t0 === null) s.t0 = state.clock.getElapsedTime();
      const k = Math.min((state.clock.getElapsedTime() - s.t0) / 1.9, 1);
      const e = 1 - Math.pow(1 - k, 3);
      controls.target.copy(s.fromT).lerp(targetNow, e);
      const dir = s.from.clone().sub(s.fromT);
      if (dir.lengthSq() < 1e-6) dir.set(0.6, 0.45, 0.6);
      dir.normalize();
      const camGoal = targetNow.clone().add(dir.multiplyScalar(s.dist));
      camera.position.lerpVectors(s.from, camGoal, e);
      controls.update();
      if (k >= 1) {
        s.phase = "track";
        s.prev.copy(targetNow);
      }
    } else if (s.phase === "track") {
      // Follow the (possibly orbiting) body: shift camera + target by its motion,
      // preserving whatever orbit/zoom the user has applied around it.
      const delta = targetNow.clone().sub(s.prev);
      if (delta.lengthSq() > 1e-12) {
        controls.target.add(delta);
        camera.position.add(delta);
        s.prev.copy(targetNow);
        controls.update();
      }
    }
  });
  return null;
};

/* ----------------------------- flythrough cam ----------------------------- */
const FlythroughCamera = ({
  active,
  radius,
  controlsRef,
}: {
  active: boolean;
  radius: number;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
}) => {
  const { camera } = useThree();
  const angle = useRef(0);
  useFrame((_, delta) => {
    if (!active) return;
    angle.current += delta * 0.25;
    const r = Math.max(radius * 2.4, 120);
    camera.position.set(
      Math.cos(angle.current) * r,
      Math.sin(angle.current * 0.5) * r * 0.35 + 20,
      Math.sin(angle.current) * r
    );
    camera.lookAt(0, 0, 0);
    controlsRef.current?.update?.();
  });
  return null;
};

/* ------------------------------- particle belt ----------------------------- */
const Belt = ({
  inner,
  outer,
  count,
  thickness,
  color,
  size,
  meanPeriodYears,
  clock,
}: {
  inner: number;
  outer: number;
  count: number;
  thickness: number;
  color: string;
  size: number;
  meanPeriodYears: number;
  clock: React.MutableRefObject<SimClock>;
}) => {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const au = inner + Math.random() * (outer - inner);
      const ang = Math.random() * Math.PI * 2;
      const sr = scaleDistanceAU(au);
      const yJitter = (Math.random() - 0.5) * scaleDistanceAU(thickness + 0.0001) * 0.4;
      arr[i * 3] = Math.cos(ang) * sr;
      arr[i * 3 + 1] = yJitter;
      arr[i * 3 + 2] = Math.sin(ang) * sr;
    }
    return arr;
  }, [inner, outer, count, thickness]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y = (clock.current.orbitalYears / meanPeriodYears) * 2 * Math.PI;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
};

/* ------------------------------ Oort cloud shell --------------------------- */
const OortCloud = () => {
  const positions = useMemo(() => {
    const arr = new Float32Array(OORT_CLOUD.count * 3);
    for (let i = 0; i < OORT_CLOUD.count; i++) {
      const au = OORT_CLOUD.inner + Math.random() * (OORT_CLOUD.outer - OORT_CLOUD.inner);
      const sr = scaleDistanceAU(au);
      const u = Math.random() * 2 - 1;
      const phi = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      arr[i * 3] = sr * s * Math.cos(phi);
      arr[i * 3 + 1] = sr * u;
      arr[i * 3 + 2] = sr * s * Math.sin(phi);
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#9fb4d8" size={0.5} sizeAttenuation transparent opacity={0.4} />
    </points>
  );
};

/* ------------------------------ heliosphere shells ------------------------- */
const Heliosphere = () => {
  const ts = scaleDistanceAU(HELIOSPHERE.terminationShock);
  const hp = scaleDistanceAU(HELIOSPHERE.heliopause);
  return (
    <group>
      <mesh scale={[1, 0.92, 1.12]}>
        <sphereGeometry args={[hp, 48, 48]} />
        <meshBasicMaterial color="#4aa3c8" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[ts, 48, 48]} />
        <meshBasicMaterial color="#6ab8d8" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
      <Html position={[0, hp * 0.72, 0]} center distanceFactor={140} className="ss-label">
        <span className="ss-name ss-helio">Heliopause</span>
      </Html>
    </group>
  );
};

/** Schematic Local Bubble — low-density interstellar cavity (not to measured scale). */
const LocalBubble = () => {
  const r = scaleDistanceAU(LOCAL_BUBBLE.radiusLy * AU_PER_LY);
  return (
    <group>
      <mesh scale={[1.05, 0.88, 1.18]}>
        <sphereGeometry args={[r, 40, 40]} />
        <meshBasicMaterial color="#8b6fd4" transparent opacity={0.018} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <Html position={[0, r * 0.55, r * 0.35]} center distanceFactor={280} className="ss-label">
        <span className="ss-name ss-helio" style={{ opacity: 0.7 }}>Local Bubble (schematic)</span>
      </Html>
    </group>
  );
};

const CosmicLandmarkBody = ({
  landmark,
  onFocus,
  accuracyMode,
}: {
  landmark: CosmicLandmark;
  onFocus: (name: string) => void;
  accuracyMode: AccuracyMode;
}) => {
  const p = useMemo(
    () => new THREE.Vector3(...landmark.dir).normalize().multiplyScalar(scaleDistanceAU(landmark.sceneDistanceLy * AU_PER_LY)),
    [landmark]
  );
  const core = landmark.kind === "galactic_center" ? 22 : landmark.kind === "galaxy" ? 28 : 18;
  const smDisk = useMemo(() => supermassiveDiskRadii(core), [core]);
  const pickHandlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onFocus(landmark.name); },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; },
    onPointerOut: () => { document.body.style.cursor = "auto"; },
  };
  return (
    <group position={p.toArray()}>
      {landmark.kind === "galactic_center" ? (
        <AccretionDisk
          innerRadius={smDisk.inner}
          outerRadius={smDisk.outer}
          shadowRadius={smDisk.shadow}
          hotColor="#ffe8b0"
          coolColor="#ff8040"
          opacity={0.8}
          accuracyMode={accuracyMode}
          tilt={[Math.PI / 2.15, 0.35, 0.45]}
          spinRate={0.08}
        />
      ) : landmark.kind === "galaxy" ? (
        <GalaxySilhouette core={core} color={landmark.color} accuracyMode={accuracyMode} />
      ) : (
        <>
          <mesh>
            <sphereGeometry args={[core, 32, 32]} />
            <meshBasicMaterial color={landmark.color} toneMapped={false} />
          </mesh>
          {showDecorativeGlow(accuracyMode) && (
            <mesh>
              <sphereGeometry args={[core * 2.3, 24, 24]} />
              <meshBasicMaterial color={landmark.color} transparent opacity={decorativeOpacity(0.14, accuracyMode)} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          )}
        </>
      )}
      <mesh {...pickHandlers} visible={false}>
        <sphereGeometry args={[core * (landmark.kind === "galaxy" ? 5 : 4), 12, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <Html position={[0, core * 3.5, 0]} center distanceFactor={360} className="ss-label">
        <button
          onClick={() => onFocus(landmark.name)}
          className="ss-name"
          style={{ color: landmark.color, pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0 }}
        >
          {landmark.name}
        </button>
      </Html>
    </group>
  );
};

/** Celestial-equator grid tilted to the J2000 ecliptic plane (matches planet orbits). */
const EclipticGrid = () => (
  <group rotation={[-J2000_OBLIQUITY_RAD, 0, 0]}>
    <gridHelper args={[scaleDistanceAU(200) * 2, 48, "#1c2546", "#141b35"]} />
  </group>
);


/* --------------------------------- the scene ------------------------------- */
const Scene = ({
  clock,
  showMinor,
  setShowMinor,
  birthDate,
  lightYears,
  scrubYears,
  displayLY,
  trueMoonPeriods,
  animatingLight,
  setAnimatingLight,
  flying,
  controlsRef,
  goal,
  onFocus,
  focusName,
  destination,
  missionResult,
  tripProgress,
  missionFlying,
  missionMode,
  missionOrigin,
  missionVessel,
  accuracyMode,
  isMobile,
  sceneQuality,
  missionHudActive,
  showExoSystems,
}: {
  clock: React.MutableRefObject<SimClock>;
  showMinor: boolean;
  showExoSystems: boolean;
  setShowMinor: (v: boolean) => void;
  birthDate: string;
  lightYears: number;
  scrubYears: number | null;
  displayLY: number;
  trueMoonPeriods: boolean;
  isMobile: boolean;
  sceneQuality: SceneQuality;
  missionHudActive: boolean;
  animatingLight: boolean;
  setAnimatingLight: (v: boolean) => void;
  flying: boolean;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  goal: { name: string; token: number } | null;
  onFocus: (name: string) => void;
  focusName: string | null;
  destination: string | null;
  missionResult: MissionResult | null;
  tripProgress: number;
  missionFlying: boolean;
  missionMode: PropulsionMode;
  missionOrigin: MissionOrigin;
  missionVessel: VesselConfig;
  accuracyMode: AccuracyMode;
}) => (
  <>
    <ambientLight intensity={0.25} />
    {/* layered, denser, faintly-coloured starfield — more wonder */}
    <Stars radius={4000} depth={600} count={sceneQuality.backgroundStarCounts[0]} factor={9} saturation={0.4} fade speed={REDUCED_MOTION ? 0 : 0.2} />
    <Stars radius={9000} depth={200} count={sceneQuality.backgroundStarCounts[1]} factor={22} saturation={0.6} fade speed={REDUCED_MOTION ? 0 : 0.1} />
    <TimeKeeper clock={clock} onZoom={setShowMinor} birthDate={birthDate} lifeYears={lightYears} scrubYears={scrubYears} />

    <MoonModelPreloader active={showMinor} />
    <EclipticGrid />
    <Sun onFocus={onFocus} accuracyMode={accuracyMode} />

    {PLANETS.map((p) => (
      <Planet key={p.name} body={p} clock={clock} showMinor={showMinor} onFocus={onFocus} accuracyMode={accuracyMode} />
    ))}

    {MOONS.map((m) => {
      const parent = PLANETS.find((p) => p.name === m.parent)!;
      return (
        <MoonBody
          key={m.name}
          moon={m}
          parent={parent}
          clock={clock}
          show={showMinor}
          trueMoonPeriods={trueMoonPeriods}
          accuracyMode={accuracyMode}
          onFocus={onFocus}
        />
      );
    })}

    {COMETS.map((c) => (
      <CometBody key={c.name} comet={c} clock={clock} onFocus={onFocus} accuracyMode={accuracyMode} />
    ))}
    <RoadsterBody clock={clock} onFocus={onFocus} />
    {SPACECRAFT.filter((s) => s.orbit === "sun").map((s) => (
      <SunSpacecraft key={s.name} craft={s} onFocus={onFocus} />
    ))}
    <EarthSatellites clock={clock} show={showMinor} trueLeoPeriods={trueMoonPeriods} onFocus={onFocus} />
    {EXOTIC_OBJECTS.map((o) => (
      <ExoticBody key={o.name} obj={o} onFocus={onFocus} accuracyMode={accuracyMode} />
    ))}
    {COSMIC_LANDMARKS.map((l) => (
      <CosmicLandmarkBody key={l.name} landmark={l} onFocus={onFocus} accuracyMode={accuracyMode} />
    ))}

    <Belt {...ASTEROID_BELT} color="#8c8170" size={0.18} meanPeriodYears={4.6} clock={clock} />
    <Belt {...KUIPER_BELT} color="#7f93b8" size={0.22} meanPeriodYears={285} clock={clock} />
    <Heliosphere />
    <LocalBubble />
    <OortCloud />

    {missionResult && destination ? (
      <MissionFlight
        destination={destination}
        missionResult={missionResult}
        mode={missionMode}
        missionOrigin={missionOrigin}
        vessel={missionVessel}
        tripProgress={tripProgress}
        missionFlying={missionFlying}
        simYears={clock.current.orbitalYears}
        controlsRef={controlsRef}
      />
    ) : (
      <MissionRoute
        destination={destination}
        missionResult={missionResult}
        missionOrigin={missionOrigin}
        missionMode={missionMode}
        simYears={clock.current.orbitalYears}
      />
    )}
    <CatalogStars
      onFocus={onFocus}
      clock={clock}
      scrubYears={scrubYears}
      lightYears={lightYears}
      sceneQuality={sceneQuality}
      accuracyMode={accuracyMode}
    />
    <NearbyStars
      lightYears={displayLY}
      scrubYears={scrubYears}
      onFocus={onFocus}
      clock={clock}
      showMinor={showMinor}
      showExoSystems={showExoSystems}
      focusName={focusName}
      destinationName={destination}
      trueMoonPeriods={trueMoonPeriods}
      accuracyMode={accuracyMode}
    />

    {BLACK_HOLES.map((bh) => (
      <BlackHoleBody key={bh.name} bh={bh} onFocus={onFocus} accuracyMode={accuracyMode} />
    ))}
    <LightSphere lightYears={displayLY} animating={animatingLight} onDone={() => setAnimatingLight(false)} />

    <FlythroughCamera active={flying && !missionFlying} radius={lightYears > 0 ? scaleDistanceAU(lightYears * AU_PER_LY) : 120} controlsRef={controlsRef} />
    <CameraDirector goal={goal} reach={lightYears} clock={clock} trueLeoPeriods={trueMoonPeriods} controlsRef={controlsRef} />
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan
      zoomToCursor={!isMobile}
      screenSpacePanning
      enableDamping
      dampingFactor={0.09}
      enabled={!flying && !missionFlying}
      minDistance={0.4}
      maxDistance={MAX_ZOOM}
      zoomSpeed={isMobile ? 0.85 : 0.55}
      panSpeed={isMobile ? 0.65 : 1.0}
      rotateSpeed={isMobile ? 0.45 : 0.55}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
    />
  </>
);

export interface SolarSystemHandle {
  expandLight: () => void;
  flythrough: () => void;
  exportPNG: () => void;
  focusDestination: (name: string) => void;
}

interface SolarSystemProps {
  lightYears?: number;
  birthDate?: string;
  destination?: string | null;
  accuracyMode?: AccuracyMode;
  onAccuracyModeChange?: (mode: AccuracyMode) => void;
  trueOrbitsManual?: boolean;
  onTrueOrbitsChange?: (value: boolean) => void;
  onDestinationSelect?: (name: string) => void;
  onSetMissionDestination?: (name: string) => void;
  missionResult?: MissionResult | null;
  tripProgress?: number;
  missionFlying?: boolean;
  missionMode?: PropulsionMode;
  missionOrigin?: MissionOrigin;
  missionVessel?: VesselConfig;
}

/* ------------------------------- the wrapper ------------------------------ */
export const SolarSystem = forwardRef<SolarSystemHandle, SolarSystemProps>(
  (
    {
      lightYears = 0,
      birthDate = "",
      destination = null,
      accuracyMode = "cinematic",
      onAccuracyModeChange,
      trueOrbitsManual = false,
      onTrueOrbitsChange,
      onDestinationSelect,
      onSetMissionDestination,
      missionResult = null,
      tripProgress = 0,
      missionFlying = false,
      missionMode = "sublight",
      missionOrigin = "sun",
      missionVessel = DEFAULT_VESSEL,
    },
    ref,
  ) => {
    const clock = useRef<SimClock>({
      years: DEFAULT_CLOCK_ANCHOR,
      anchor: DEFAULT_CLOCK_ANCHOR,
      orbitalYears: DEFAULT_CLOCK_ANCHOR,
      playDeltaYears: 0,
      speed: 0.1,
      paused: false,
      camDist: 80,
    });
    const controlsRef = useRef<OrbitControlsImpl | null>(null);
    const glRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const camRef = useRef<THREE.Camera | null>(null);

    const [showMinor, setShowMinor] = useState(false);
    const [showExoSystems, setShowExoSystems] = useState(true);
    const [speed, setSpeed] = useState(0.1);
    const [scrubYears, setScrubYears] = useState<number | null>(null); // timeline scrubber
    const isMobile = useIsMobile();
    const sceneQuality = useSceneQuality();
    const missionHudActive = !!(missionResult && destination);
    const [paused, setPaused] = useState(false);
    const [animatingLight, setAnimatingLight] = useState(false);
    const [flying, setFlying] = useState(false);
    const [goal, setGoal] = useState<{ name: string; token: number } | null>(null);
    const [focusName, setFocusName] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [isFs, setIsFs] = useState(false);
    const [exploreOpen, setExploreOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const goalToken = useRef(0);

    const trueMoonPeriods = resolveTrueMoonPeriods(accuracyMode, trueOrbitsManual);
    const detailBadges = selected ? bodyAccuracyBadges(selected, { trueMoonPeriods }) : [];
    const hudBadges = globalAccuracyBadges(accuracyMode);

    useLayoutEffect(() => {
      const c = clock.current;
      c.playDeltaYears = c.years - c.anchor;
      c.orbitalYears = computeOrbitalEpoch({
        birthDate,
        lifeYears: lightYears,
        scrubYears,
        clockYears: c.years,
        clockAnchor: c.anchor,
      });
    }, [birthDate, lightYears, scrubYears]);

    // Fly the camera to focus a body (Sun / planet / star / light).
    const focus = (name: string) => {
      setFlying(false);
      goalToken.current += 1;
      setGoal({ name, token: goalToken.current });
      setFocusName(name === "__light__" || name === "Sun" ? null : name);
    };

    // Click a body → open its detail panel (+ fly to it, unless it's a moon or
    // exoplanet, where you're already up close and a camera jump would jar).
    const onPick = (name: string) => {
      setSelected(name);
      if (isNavStar(name)) onDestinationSelect?.(name);
      const local = MOONS.some((m) => m.name === name) || EXOPLANETS.some((e) => e.name === name);
      if (!local) focus(name);
    };

    const toggleFullscreen = () => {
      const el = containerRef.current;
      if (!el) return;
      if (!document.fullscreenElement) el.requestFullscreen?.();
      else document.exitFullscreen?.();
    };
    useEffect(() => {
      const onChange = () => setIsFs(!!document.fullscreenElement);
      document.addEventListener("fullscreenchange", onChange);
      return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    const detail = selected ? getBodyInfo(selected) : null;
    // Timeline scrubber overrides the shown reach; camera framing still uses the full value.
    const displayLY = scrubYears ?? lightYears;

    // "Your star" — the farthest real star the light has reached.
    const yourStar = useMemo(() => {
      if (lightYears <= 0) return null;
      const all = [
        ...NEARBY_STARS.map((s) => ({ name: s.name, ly: s.distance })),
        ...STAR_CATALOG.map((s) => ({ name: s.name, ly: s.ly })),
      ].filter((s) => s.ly <= lightYears);
      if (!all.length) return null;
      return all.reduce((a, b) => (b.ly > a.ly ? b : a));
    }, [lightYears]);

    // When a new light-years value lands (after calculate), pull the camera back
    // to frame the full reach and grow the light. Runs post-commit — no race.
    useEffect(() => {
      if (lightYears > 0) {
        focus("__light__");
        setAnimatingLight(true);
      }
    }, [lightYears]);

    const exportPNG = () => {
      const gl = glRef.current, scene = sceneRef.current, cam = camRef.current;
      if (!gl || !scene || !cam) return;
      gl.render(scene, cam);
      const a = document.createElement("a");
      a.href = gl.domElement.toDataURL("image/png");
      a.download = "light_journey.png";
      a.click();
    };

    useImperativeHandle(ref, () => ({
      expandLight: () => {
        focus("__light__");
        setAnimatingLight(true);
      },
      flythrough: () => setFlying((v) => !v),
      exportPNG,
      focusDestination: (name: string) => {
        if (isNavStar(name)) onDestinationSelect?.(name);
        focus(name);
      },
    }));

    const setSpeedVal = (v: number) => {
      clock.current.speed = v;
      setSpeed(v);
    };
    const togglePause = () => {
      clock.current.paused = !clock.current.paused;
      setPaused(clock.current.paused);
    };

    return (
      <div ref={containerRef} className="relative h-full w-full touch-none overflow-hidden bg-[#04050c]">
        <Canvas
          camera={{ position: [70, 46, 70], fov: isMobile ? 60 : CAMERA_FOV, near: 0.02, far: 60_000 }}
          dpr={[1, sceneQuality.dprMax]}
          gl={{ preserveDrawingBuffer: true }}
          onCreated={({ gl, scene, camera }) => {
            glRef.current = gl;
            sceneRef.current = scene;
            camRef.current = camera;
          }}
        >
          <color attach="background" args={["#04050c"]} />
          <Scene
            clock={clock}
            showMinor={showMinor}
            showExoSystems={showExoSystems}
            setShowMinor={setShowMinor}
            birthDate={birthDate}
            lightYears={lightYears}
            scrubYears={scrubYears}
            displayLY={displayLY}
            trueMoonPeriods={trueMoonPeriods}
            animatingLight={animatingLight}
            setAnimatingLight={setAnimatingLight}
            flying={flying}
            controlsRef={controlsRef}
            goal={goal}
            onFocus={onPick}
            focusName={focusName}
            destination={destination}
            missionResult={missionResult}
            tripProgress={tripProgress}
            missionFlying={missionFlying}
            missionMode={missionMode}
            missionOrigin={missionOrigin}
            missionVessel={missionVessel}
            accuracyMode={accuracyMode}
            isMobile={isMobile}
            sceneQuality={sceneQuality}
            missionHudActive={missionHudActive}
          />
        </Canvas>

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3 md:p-4">
          <div className="pointer-events-auto flex min-h-11 items-center gap-2 self-stretch rounded-full glass px-3 py-2 md:self-auto">
            <button onClick={togglePause} className="rounded-full px-3 py-1 text-xs font-medium text-foreground/90 transition-colors hover:text-primary">
              {paused ? "Play" : "Pause"}
            </button>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Speed</span>
            <input
              type="range"
              min={0.1}
              max={40}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeedVal(parseFloat(e.target.value))}
              className="h-1 min-w-0 flex-1 cursor-pointer accent-primary md:w-24 md:flex-none"
            />
            <span className="font-mono-num tnum w-10 shrink-0 text-xs text-primary">{speed.toFixed(1)}×</span>
          </div>

          <div className="pointer-events-auto flex min-h-11 items-center gap-1.5 overflow-x-auto rounded-full glass px-2 py-2 md:gap-2 md:px-2.5">
            <button
              onClick={toggleFullscreen}
              title={isFs ? "Exit full screen" : "Full screen"}
              className="flex items-center rounded-full px-2 py-1 text-foreground/90 transition-colors hover:text-primary"
            >
              {isFs ? <Minimize2 className="h-4 w-4" strokeWidth={1.5} /> : <Maximize2 className="h-4 w-4" strokeWidth={1.5} />}
            </button>
            <button
              onClick={() => setExploreOpen((v) => !v)}
              title="Jump to a destination"
              data-testid="explore-trigger"
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-foreground/90 transition-colors hover:text-primary"
            >
              <Compass className="h-4 w-4" strokeWidth={1.5} />
              Explore
            </button>
            <button
              type="button"
              onClick={() =>
                onAccuracyModeChange?.(accuracyMode === "educational" ? "cinematic" : "educational")
              }
              title={`Accuracy: ${ACCURACY_MODE_LABEL[accuracyMode]}`}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                accuracyMode === "educational"
                  ? "bg-primary/15 text-primary"
                  : "text-foreground/90 hover:text-primary"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">{ACCURACY_MODE_LABEL[accuracyMode]}</span>
            </button>
            {accuracyMode === "cinematic" && (
              <button
                type="button"
                onClick={() => onTrueOrbitsChange?.(!trueOrbitsManual)}
                title={trueOrbitsManual ? "Moons & exoplanets: true periods" : "Moons & exoplanets: cinematic"}
                className={`hidden rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors sm:inline-block ${
                  trueOrbitsManual ? "bg-beam/15 text-beam" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {trueOrbitsManual ? "True orbits" : "Cinematic orbits"}
              </button>
            )}
            {focusName && (
              <button
                onClick={() => {
                  focus("Sun");
                  setSelected(null);
                }}
                className="rounded-full px-3 py-1 text-xs font-medium text-foreground/90 transition-colors hover:text-primary"
              >
                ← Sun
              </button>
            )}
            {lightYears > 0 && (
              <>
                <button
                  onClick={() => {
                    focus("__light__");
                    setAnimatingLight(true);
                  }}
                  className="rounded-full px-3 py-1 text-xs font-medium text-beam transition-colors hover:text-beam/80"
                >
                  Zoom to my light
                </button>
                <button onClick={() => setFlying((v) => !v)} className="hidden rounded-full px-3 py-1 text-xs font-medium text-foreground/90 transition-colors hover:text-primary sm:inline-block">
                  {flying ? "Stop" : "Flythrough"}
                </button>
                <button onClick={exportPNG} title="Save frame as PNG" className="hidden rounded-full px-3 py-1 text-xs font-medium text-foreground/90 transition-colors hover:text-primary sm:inline-block">
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        {/* Timeline scrubber — drag across your life; watch the light expand/retract */}
        {lightYears > 0 && (
          <div
            className={`pointer-events-auto absolute left-1/2 z-20 w-[min(30rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl glass px-3 py-2.5 md:px-4 ${
              missionHudActive
                ? "bottom-[calc(11.5rem+env(safe-area-inset-bottom,0px))] md:bottom-[4.75rem]"
                : "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-[4.75rem]"
            }`}
          >
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-muted-foreground">Your light through the years</span>
              <span className="font-mono-num tnum shrink-0 text-beam">{displayLY.toFixed(1)} ly · age {Math.round(scrubYears ?? lightYears)}</span>
            </div>
            <p className="mb-1.5 hidden text-center text-[10px] text-muted-foreground/70 sm:block">
              Scrubbing also nudges star positions (proper motion). Run the sim to watch planets and stars drift together.
            </p>
            <input
              type="range"
              min={0}
              max={lightYears}
              step={0.1}
              value={scrubYears ?? lightYears}
              onChange={(e) => { const v = parseFloat(e.target.value); setScrubYears(v >= lightYears - 0.05 ? null : v); }}
              className="h-1 w-full cursor-pointer accent-beam"
            />
            {yourStar && (
              <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
                {displayLY >= yourStar.ly ? (
                  <>
                    Farthest star reached:{" "}
                    <button onClick={() => onPick(yourStar.name)} className="font-medium text-primary hover:underline">{yourStar.name}</button>{" "}
                    ({yourStar.ly} ly)
                  </>
                ) : (
                  <>Your light is {displayLY.toFixed(1)} ly out, still reaching…</>
                )}
              </p>
            )}
          </div>
        )}

        {/* Detail panel (on click) replaces the info chip; falls back to hints. */}
        {detail ? (
          <div
            className={`pointer-events-auto absolute left-3 right-3 top-auto max-h-[min(38dvh,20rem)] w-auto overflow-y-auto rounded-2xl glass p-4 md:left-4 md:right-auto md:top-4 md:max-h-none md:w-[min(20rem,calc(100%-2rem))] md:overflow-visible md:bottom-auto ${
              missionHudActive
                ? "bottom-[calc(12rem+env(safe-area-inset-bottom,0px))] md:bottom-auto"
                : "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">{detail.name}</h3>
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary/80">{detail.type}</p>
                {detailBadges.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {detailBadges.map((b) => (
                      <span
                        key={b.label}
                        title={b.title}
                        className="inline-flex items-center gap-0.5 rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-muted-foreground"
                      >
                        <Info className="h-2.5 w-2.5" strokeWidth={1.5} />
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground transition-colors hover:text-foreground" title="Close">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            {birthDate && formatArrival(birthDate, detail.lightSeconds) && (
              <div className="mt-2.5 rounded-lg border border-beam/20 bg-beam/[0.06] px-2.5 py-2">
                <div className="flex items-start gap-2">
                  <Radio className="mt-0.5 h-3.5 w-3.5 shrink-0 text-beam" strokeWidth={1.5} />
                  <p className="text-[11px] font-medium leading-snug text-beam">{formatArrival(birthDate, detail.lightSeconds)}</p>
                </div>
                {(() => {
                  const yr = arrivalYear(birthDate, detail.lightSeconds);
                  const ev = yr ? eventForYear(yr) : null;
                  return ev ? (
                    <p className="mt-1.5 border-t border-beam/15 pt-1.5 text-[11px] leading-snug text-muted-foreground">
                      That year ({yr}), {ev}.
                    </p>
                  ) : null;
                })()}
                {detail.lightTravelNote && (
                  <p className="mt-1.5 border-t border-beam/15 pt-1.5 text-[10px] leading-snug text-muted-foreground">
                    {detail.lightTravelNote}
                  </p>
                )}
              </div>
            )}
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{detail.blurb}</p>
            {detail.scienceNote && (
              <p className="mt-2 text-[10px] leading-snug text-muted-foreground/80">{detail.scienceNote}</p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {detail.stats.map((s) => (
                <div key={s.label} className="rounded-lg bg-white/[0.03] px-2 py-1.5">
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="font-mono-num tnum text-xs text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
            {NEARBY_STARS.some((s) => s.name === detail.name) && confirmedPlanetCount(detail.name) > 0 && (
              <button
                type="button"
                onClick={() => setShowExoSystems((v) => !v)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-medium text-foreground/90 transition-colors hover:bg-white/[0.08]"
              >
                {showExoSystems ? "Hide system planets" : "Show system planets"}
              </button>
            )}
            {isNavStar(detail.name) && onSetMissionDestination && (
              <button
                type="button"
                onClick={() => onSetMissionDestination(detail.name)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-beam/30 bg-beam/[0.08] py-2 text-xs font-semibold text-beam transition-colors hover:bg-beam/[0.14]"
              >
                <Navigation className="h-3.5 w-3.5" strokeWidth={2} />
                Set as mission destination
              </button>
            )}
            <div className="mt-3 flex items-center gap-3 border-t border-white/5 pt-3 text-[11px]">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">More</span>
              <a href={detail.links.grokipedia} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Grokipedia ↗</a>
              <a href={detail.links.nasa} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">NASA</a>
            </div>
          </div>
        ) : (
          <div className="pointer-events-none absolute left-3 top-[calc(7.5rem+env(safe-area-inset-top,0px))] max-w-[11rem] rounded-xl glass px-3 py-2 text-[10px] leading-snug text-muted-foreground md:left-4 md:top-4 md:max-w-[13rem] md:text-[11px]">
            {focusName ? (
              <span>
                Focused on <span className="font-medium text-foreground">{focusName}</span>.
                {isMobile ? " Pinch to zoom · tap for details." : " Drag to orbit · scroll to zoom · click any body for details."}
              </span>
            ) : (
              <span>
                {isMobile
                  ? "Pinch to zoom · one finger to orbit · tap any body for details."
                  : "Real orbits · the light sphere is a one-way travel metaphor. Click any body for details, or scroll to zoom."}
              </span>
            )}
          </div>
        )}
        <div className="pointer-events-none absolute right-3 top-[calc(7.5rem+env(safe-area-inset-top,0px))] hidden flex-col items-end gap-1.5 sm:flex md:right-4 md:top-4">
          <span className="rounded-full glass px-3 py-1.5 text-[11px] text-muted-foreground">
            {showMinor ? "moons + dwarfs visible" : "zoom in for moons & dwarfs"}
          </span>
          {hudBadges.map((b) => (
            <span
              key={b.label}
              title={b.title}
              className="max-w-[14rem] rounded-full glass px-2.5 py-1 text-[10px] text-muted-foreground/80"
            >
              {b.label}
            </span>
          ))}
        </div>

        <ExploreMenu
          open={exploreOpen}
          isMobile={isMobile}
          onClose={() => setExploreOpen(false)}
          onPick={onPick}
        />
      </div>
    );
  }
);

SolarSystem.displayName = "SolarSystem";
