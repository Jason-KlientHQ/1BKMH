/**
 * Annual proper motion (mas/yr) for named stars — Gaia DR3 / Hipparcos values.
 * Keys match NEARBY_STARS and high-PM catalog names.
 */
export interface ProperMotion {
  /** RA component (mas/yr), corrected for cos(dec) when applied. */
  ra: number;
  /** Dec component (mas/yr). */
  dec: number;
}

export const PROPER_MOTION_BY_NAME: Record<string, ProperMotion> = {
  "Proxima Centauri": { ra: -3781, dec: 769 },
  "Alpha Centauri": { ra: -3679, dec: 473 },
  "Barnard's Star": { ra: -798.71, dec: 10328.12 },
  "Wolf 359": { ra: -3841, dec: -2725 },
  "Lalande 21185": { ra: 580, dec: -1197 },
  Sirius: { ra: -546.01, dec: -1223.07 },
  "Luyten 726-8": { ra: 2783, dec: -1147 },
  "Ross 154": { ra: -46, dec: -418 },
  "Ross 248": { ra: -88, dec: -154 },
  "Epsilon Eridani": { ra: 976.07, dec: 19.49 },
  "Lacaille 9352": { ra: 650, dec: 410 },
  "Ross 128": { ra: -603.36, dec: -1882.99 },
  "61 Cygni": { ra: 4153.15, dec: 3258.39 },
  Procyon: { ra: -714.59, dec: -1036.80 },
  "Tau Ceti": { ra: -1721.05, dec: 854.16 },
  "Luyten's Star": { ra: 5711, dec: -1464 },
  "Teegarden's Star": { ra: 2309, dec: -1645 },
  "Kapteyn's Star": { ra: 6500, dec: -5733 },
  "Wolf 1061": { ra: -94, dec: -593 },
  "Gliese 876": { ra: 649.36, dec: -1141.05 },
  "40 Eridani": { ra: 4658, dec: -370 },
  Altair: { ra: 536.82, dec: 385.29 },
  "Gliese 581": { ra: -94.52, dec: -684.67 },
  Vega: { ra: 200.94, dec: 286.23 },
  Fomalhaut: { ra: 328.95, dec: -164.67 },
  Pollux: { ra: -626.55, dec: -45.80 },
  Arcturus: { ra: -1093.45, dec: -1999.40 },
  "Zeta Reticuli": { ra: -1629, dec: 647 },
  Capella: { ra: 75.25, dec: -426.88 },
  Aldebaran: { ra: 63.45, dec: -188.94 },
  "TRAPPIST-1": { ra: 922, dec: -471 },
  "Epsilon Indi": { ra: 3964, dec: -2537 },
  "LHS 1140": { ra: 603, dec: -576 },
  "55 Cancri": { ra: -485, dec: -234 },
  Castor: { ra: -206.33, dec: -148.18 },
  Regulus: { ra: -248.73, dec: 5.59 },
  Spica: { ra: -42.35, dec: -31.66 },
  Bellatrix: { ra: -8.11, dec: -12.88 },
  Mintaka: { ra: 0.64, dec: -0.39 },
  Alnilam: { ra: 1.44, dec: -0.64 },
  Alnitak: { ra: 2.63, dec: -1.20 },
  Canopus: { ra: 24.17, dec: 23.92 },
  Polaris: { ra: 44.22, dec: -11.85 },
  Betelgeuse: { ra: 27.33, dec: 10.86 },
  Antares: { ra: -12.11, dec: -23.30 },
  Rigel: { ra: 1.87, dec: -9.28 },
  Deneb: { ra: 1.99, dec: 1.95 },
};

export function resolveProperMotion(name: string): ProperMotion | null {
  return PROPER_MOTION_BY_NAME[name] ?? null;
}