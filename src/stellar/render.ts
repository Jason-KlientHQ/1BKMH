/**
 * Map physical stellar properties to scene render size and glow intensity.
 * Sizes are exaggerated for visibility but preserve correct relative ordering.
 */

export interface StellarRenderInput {
  radiusSolar: number;
  massSolar: number;
  luminositySolar: number;
  /** Apparent magnitude — bright stars get a small visual boost. */
  apparentMag?: number;
}

const MIN_RENDER = 3;
/** Red supergiants (Betelgeuse ~268 R☉) need headroom above red giants (~45 R☉). */
const MAX_RENDER = 260;
const SUPERGIANT_RADIUS = 50;

/**
 * Scene sphere radius for a star. Driven primarily by physical radius (what
 * you would see as the photosphere), with mass modulating giant emphasis.
 */
export function stellarRenderRadius(input: StellarRenderInput): number {
  const r = Math.max(input.radiusSolar, 0.01);
  const m = Math.max(input.massSolar, 0.05);

  // Photosphere scale: cube-root compression keeps giants huge without breaking layout
  const radiusTerm = 5 + 9 * Math.cbrt(r);
  const massTerm = 3 * Math.cbrt(m);

  // Luminous giants: Arcturus, Aldebaran read larger than equal-radius dwarfs
  let giantBoost = r > 8 ? 1 + Math.log10(r / 8) * 0.85 : 1;
  // Supergiants (Betelgeuse, Deneb) get extra emphasis before the cap
  if (r >= SUPERGIANT_RADIUS) {
    giantBoost *= 1 + Math.log10(r / SUPERGIANT_RADIUS) * 0.55;
  }

  let size = (radiusTerm + massTerm * 0.45) * giantBoost;

  // Bright naked-eye stars pop slightly (Sirius, Vega)
  if (input.apparentMag != null && input.apparentMag < 2) {
    size += (2 - input.apparentMag) * 1.2;
  }

  return Math.min(MAX_RENDER, Math.max(MIN_RENDER, size));
}

/** Glow shell opacity (0–1) from luminosity. */
export function stellarGlowOpacity(luminositySolar: number, lumWeight = 1): number {
  const norm = Math.log10(Math.max(luminositySolar, 1e-3) + 1);
  return Math.min(0.55, 0.06 + norm * 0.12 * lumWeight);
}

/** Camera framing distance for a focused star. */
export function stellarFrameDistance(renderRadius: number, isFeatured = false): number {
  const mult = isFeatured ? 3.8 : 3.2;
  return Math.max(renderRadius * mult, isFeatured ? 40 : 28);
}