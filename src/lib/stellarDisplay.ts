/** Zoom-aware display sizing so distant stars stay visible on the map. */

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export interface DisplayScaleOptions {
  /** Target fraction of camera–star distance used as minimum screen size. */
  minFraction?: number;
  maxBoost?: number;
}

/**
 * Boost render radius when the camera is far away so angular size stays readable.
 * When the camera is close (focused on a star), returns `baseSize` unchanged.
 */
export function stellarDisplayScale(
  baseSize: number,
  camera: Vec3Like,
  starPos: [number, number, number],
  options: DisplayScaleOptions = {},
): number {
  const minFraction = options.minFraction ?? 0.006;
  const maxBoost = options.maxBoost ?? 12;
  const dx = camera.x - starPos[0];
  const dy = camera.y - starPos[1];
  const dz = camera.z - starPos[2];
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
  const target = dist * minFraction;
  return Math.min(baseSize * maxBoost, Math.max(baseSize, target));
}

/** Stronger map boost for supergiants (Betelgeuse, Deneb, Rigel). */
export function featuredDisplayScale(
  baseSize: number,
  radiusSolar: number,
  camera: Vec3Like,
  starPos: [number, number, number],
): number {
  const minFraction = radiusSolar >= 50 ? 0.011 : radiusSolar >= 10 ? 0.008 : 0.006;
  const maxBoost = radiusSolar >= 50 ? 18 : 12;
  return stellarDisplayScale(baseSize, camera, starPos, { minFraction, maxBoost });
}

/** Catalog stars: brighter magnitudes get a higher floor and slightly more zoom boost. */
export function catalogBaseSize(renderSize: number, apparentMag: number): number {
  let size = Math.max(renderSize, CATALOG_MIN_RENDER);
  if (apparentMag < 2) size = Math.max(size, 14);
  else if (apparentMag < 4) size = Math.max(size, 10);
  else if (apparentMag < 6.5) size = Math.max(size, 8);
  return size;
}

export const CATALOG_MIN_RENDER = 6;

export function catalogDisplayScale(
  baseSize: number,
  apparentMag: number,
  camera: Vec3Like,
  starPos: [number, number, number],
): number {
  const minFraction = apparentMag < 4 ? 0.009 : apparentMag < 6.5 ? 0.007 : 0.005;
  const maxBoost = apparentMag < 4 ? 14 : 10;
  return stellarDisplayScale(baseSize, camera, starPos, { minFraction, maxBoost });
}