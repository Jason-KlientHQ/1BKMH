/**
 * Stellar mass & luminosity estimates for catalog stars that lack direct
 * measurements. Featured nearby stars use curated values where known.
 */

export type StellarLifeStage =
  | "Main sequence"
  | "Subgiant"
  | "Red giant"
  | "Blue giant"
  | "Red supergiant"
  | "Blue supergiant"
  | "White dwarf";

/** Curated masses (M☉) for featured nearby stars. */
export const FEATURED_STAR_MASS: Record<string, number> = {
  "Proxima Centauri": 0.12,
  "Alpha Centauri": 1.1,
  "Barnard's Star": 0.16,
  "Wolf 359": 0.09,
  "Lalande 21185": 0.39,
  Sirius: 2.06,
  "Luyten 726-8": 0.1,
  "Ross 154": 0.17,
  "Ross 248": 0.14,
  "Epsilon Eridani": 0.82,
  "Lacaille 9352": 0.48,
  "Ross 128": 0.17,
  "61 Cygni": 0.7,
  Procyon: 1.5,
  "Tau Ceti": 0.78,
  "Luyten's Star": 0.29,
  "Teegarden's Star": 0.09,
  "Kapteyn's Star": 0.28,
  "Wolf 1061": 0.29,
  "Gliese 876": 0.37,
  "40 Eridani": 0.78,
  Altair: 1.79,
  "Gliese 581": 0.31,
  Vega: 2.14,
  Fomalhaut: 1.92,
  Pollux: 1.91,
  Arcturus: 1.08,
  "Zeta Reticuli": 0.99,
  Capella: 2.57,
  Aldebaran: 1.16,
  Betelgeuse: 16,
  Antares: 12,
  Rigel: 21,
  Deneb: 19,
  Canopus: 8,
  Polaris: 5,
  Bellatrix: 8.6,
  Alnitak: 33,
  Alnilam: 32,
  Mintaka: 24,
  "TRAPPIST-1": 0.09,
  "Epsilon Indi": 0.76,
  "LHS 1140": 0.15,
  "55 Cancri": 0.91,
  Castor: 2.76,
  Regulus: 3.8,
  Spica: 11,
};

const GIANT_RE = /I[ab]?|II|III|IV/i;
const SUPERGIANT_RE = /Ia|Iab|Ib/i;
const WHITE_DWARF_RE = /^D[ABCOZ]/i;

export function isGiantSpectral(spectral: string): boolean {
  return GIANT_RE.test(spectral);
}

export function isWhiteDwarfSpectral(spectral: string): boolean {
  return WHITE_DWARF_RE.test(spectral);
}

/** Annual parallax (mas) from distance in light-years: π ≈ 3261.56 / d_ly. */
export function parallaxMas(distanceLy: number): number {
  if (distanceLy <= 0) return 0;
  return 3261.56 / distanceLy;
}

/** Human-readable parallax explainer for detail panels. */
export function parallaxExplainer(distanceLy: number): string {
  const mas = parallaxMas(distanceLy);
  return `Parallax ${mas.toFixed(2)} mas — the tiny angle shift astronomers measure from opposite sides of Earth's orbit to estimate distance.`;
}

const spectralClass = (spectral: string) => spectral.trim().charAt(0).toUpperCase();

/**
 * Classify a star's evolutionary stage from spectral type and radius.
 * Used for education labels — not a full stellar-evolution model.
 */
export function stellarLifeStage(spectral: string, radiusSolar: number): StellarLifeStage {
  if (isWhiteDwarfSpectral(spectral)) return "White dwarf";

  const r = Math.max(radiusSolar, 0.01);
  const cls = spectralClass(spectral);
  const isSuper =
    SUPERGIANT_RE.test(spectral) || (GIANT_RE.test(spectral) && r >= 50);

  if (isSuper) {
    if (cls === "O" || cls === "B" || cls === "A" || cls === "F") return "Blue supergiant";
    return "Red supergiant";
  }

  if (GIANT_RE.test(spectral) || r >= 10) {
    if (cls === "O" || cls === "B") return "Blue giant";
    return "Red giant";
  }

  if (/IV/i.test(spectral)) return "Subgiant";
  return "Main sequence";
}

/** One-line consequence of a life stage for detail panels. */
export function lifeStageNote(stage: StellarLifeStage, radiusSolar: number): string | null {
  switch (stage) {
    case "Red supergiant":
      return radiusSolar >= 100
        ? "A bloated, dying star likely to end in a supernova."
        : "An aging giant nearing the end of its life.";
    case "Blue supergiant":
      return "A massive, short-lived star burning fuel at a furious rate.";
    case "Red giant":
      return "A swollen, cooler star fusing helium in its core.";
    case "Blue giant":
      return "A hot, luminous star much larger and brighter than the Sun.";
    case "Subgiant":
      return "A star leaving the main sequence, beginning to expand.";
    case "White dwarf":
      return "The dense remnant core of a dead Sun-like star.";
    default:
      return null;
  }
}

/**
 * Estimate stellar mass (M☉) from radius and spectral type when no direct
 * measurement exists. Giants use a flatter mass–radius relation than dwarfs.
 */
export function estimateMassSolar(radiusSolar: number, spectral: string): number {
  const r = Math.max(radiusSolar, 0.01);

  if (isWhiteDwarfSpectral(spectral)) return 0.6;
  if (isGiantSpectral(spectral)) {
    if (r > 20) return Math.min(3.0, 0.6 + r * 0.035);
    return Math.max(0.8, r * 0.12);
  }

  // Main-sequence: M ∝ R^2.5 (approximate)
  return Math.pow(r, 2.5);
}

/** Resolve mass: curated value for featured stars, else estimate. */
export function resolveMassSolar(
  name: string,
  radiusSolar: number,
  spectral: string,
): number {
  return FEATURED_STAR_MASS[name] ?? estimateMassSolar(radiusSolar, spectral);
}

/**
 * Estimate bolometric luminosity (L☉). Giants scale with surface area; main-
 * sequence stars use the mass–luminosity relation L ∝ M^3.5.
 */
export function estimateLuminositySolar(
  radiusSolar: number,
  massSolar: number,
  spectral: string,
): number {
  if (isWhiteDwarfSpectral(spectral)) return 0.01;
  if (isGiantSpectral(spectral)) {
    return Math.max(0.05, Math.pow(Math.max(radiusSolar, 0.5), 2) * 0.35);
  }
  return Math.max(1e-4, Math.pow(Math.max(massSolar, 0.08), 3.5));
}