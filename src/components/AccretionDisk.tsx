import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AccuracyMode } from "@/lib/accuracyMode";
import { decorativeOpacity } from "@/lib/glowStyle";

const diskVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vLocalPos;
  void main() {
    vUv = uv;
    vLocalPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const diskFragment = /* glsl */ `
  uniform float uTime;
  uniform float uInner;
  uniform float uOuter;
  uniform float uOpacity;
  uniform vec3 uHot;
  uniform vec3 uCool;
  varying vec2 vUv;
  varying vec3 vLocalPos;

  void main() {
    float r = length(vLocalPos.xy);
    float t = smoothstep(uInner, uOuter, r) * (1.0 - smoothstep(uOuter * 0.92, uOuter, r));
    float ang = atan(vLocalPos.y, vLocalPos.x);
    float doppler = 0.72 + 0.28 * sin(ang + uTime * 0.35);
    float hot = pow(1.0 - smoothstep(uInner, uOuter * 0.55, r), 1.6);
    vec3 col = mix(uCool, uHot, hot) * doppler;
    float alpha = t * uOpacity * (0.35 + 0.65 * hot);
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

export interface AccretionDiskProps {
  innerRadius: number;
  outerRadius: number;
  /** Scene scale of the event-horizon shadow (0 = no shadow mesh). */
  shadowRadius?: number;
  hotColor?: string;
  coolColor?: string;
  opacity?: number;
  accuracyMode: AccuracyMode;
  /** Euler tilt (rad). */
  tilt?: [number, number, number];
  spinRate?: number;
  segments?: number;
}

/**
 * Shader accretion disk with Doppler-brightened flow and inner shadow sphere.
 * Shared by stellar black holes, Sgr A*, and quasar landmarks.
 */
export const AccretionDisk = ({
  innerRadius,
  outerRadius,
  shadowRadius = 0,
  hotColor = "#ffd080",
  coolColor = "#ff6a20",
  opacity = 0.75,
  accuracyMode,
  tilt = [Math.PI / 2.35, 0.4, 0],
  spinRate = 0.12,
  segments = 80,
}: AccretionDiskProps) => {
  const diskRef = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uInner: { value: innerRadius },
        uOuter: { value: outerRadius },
        uOpacity: { value: decorativeOpacity(opacity, accuracyMode) },
        uHot: { value: new THREE.Color(hotColor) },
        uCool: { value: new THREE.Color(coolColor) },
      },
      vertexShader: diskVertex,
      fragmentShader: diskFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    return m;
  }, [innerRadius, outerRadius, hotColor, coolColor, opacity, accuracyMode]);

  useFrame((_, dt) => {
    if (diskRef.current) diskRef.current.rotation.z += dt * spinRate;
    mat.uniforms.uTime.value += dt;
  });

  return (
    <group rotation={tilt}>
      {shadowRadius > 0 && (
        <mesh>
          <sphereGeometry args={[shadowRadius, 32, 32]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      )}
      <mesh ref={diskRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[innerRadius, outerRadius, segments]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {shadowRadius > 0 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[shadowRadius * 1.08, shadowRadius * 1.22, 48]} />
          <meshBasicMaterial
            color="#ffcc88"
            transparent
            opacity={decorativeOpacity(0.22, accuracyMode)}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};

/** Scale disk radii from black-hole mass (solar masses). */
export function blackHoleDiskRadii(massSolar: number): { shadow: number; inner: number; outer: number } {
  const scale = Math.cbrt(massSolar / 10);
  const shadow = 14 * scale;
  return { shadow, inner: shadow * 1.35, outer: shadow * 4.8 };
}

/** Scene-scale radii for supermassive black holes (Sgr A*, quasars). */
export function supermassiveDiskRadii(core = 22): { shadow: number; inner: number; outer: number } {
  return { shadow: core * 0.55, inner: core * 0.85, outer: core * 3.8 };
}

/** Tilted multi-ring galaxy silhouette (Andromeda, Magellanic clouds). */
export const GalaxySilhouette = ({
  core,
  color,
  accuracyMode,
  tilt = [Math.PI / 2.75, 0.45, 0.2] as [number, number, number],
}: {
  core: number;
  color: string;
  accuracyMode: AccuracyMode;
  tilt?: [number, number, number];
}) => (
  <group rotation={tilt}>
    <mesh>
      <sphereGeometry args={[core * 0.32, 20, 14]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
    {[1.5, 2.6, 4.0].map((mult, i) => (
      <mesh key={mult} rotation={[Math.PI / 2, 0, i * 0.55]}>
        <ringGeometry args={[core * mult * 0.82, core * mult, 72]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={decorativeOpacity(0.2 - i * 0.05, accuracyMode)}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    ))}
  </group>
);